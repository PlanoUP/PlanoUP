import { Activity } from "./types";
import { STAGE_TEMPLATE } from "./stage-template";
import { addDays, diffDays } from "./date-utils";

/**
 * Builds the full activity chain for a tank starting at `startISO`, following
 * the standard stage template. Each activity depends on the previous one.
 * Baseline dates are captured once here and never mutated again — they are
 * the reference used to compute deviation.
 */
export function buildActivitiesFromTemplate(tankId: string, startISO: string): Activity[] {
  const activities: Activity[] = [];
  let cursor = startISO;

  for (const stage of STAGE_TEMPLATE) {
    const start = cursor;
    const end = addDays(start, stage.durationDays - 1);
    activities.push({
      id: `${tankId}__${stage.key}`,
      tankId,
      order: stage.order,
      stageKey: stage.key,
      name: stage.name,
      durationDays: stage.durationDays,
      dependsOn: activities.length ? [activities[activities.length - 1].id] : [],
      isMilestone: stage.isMilestone,
      baselineStart: start,
      baselineEnd: end,
      plannedStart: start,
      plannedEnd: end,
      progress: 0,
      status: "FUTURO",
    });
    cursor = addDays(end, 1);
  }

  return activities;
}

/**
 * Recalculates the forward schedule of a chain of activities after an edit —
 * changing a start date or a duration shifts every dependent activity while
 * preserving each activity's own duration. Generic over `dependsOn`, so it
 * still works if the chain ever grows real branches, not just a straight line.
 *
 * `edit` may change plannedStart and/or durationDays of a single activity;
 * everything downstream is recomputed from there.
 */
export function recalculateSchedule(
  activities: Activity[],
  activityId: string,
  edit: { plannedStart?: string; durationDays?: number }
): Activity[] {
  const byId = new Map(activities.map((a) => [a.id, { ...a }]));
  const target = byId.get(activityId);
  if (!target) return activities;

  if (edit.durationDays !== undefined) target.durationDays = Math.max(1, edit.durationDays);
  if (edit.plannedStart !== undefined) target.plannedStart = edit.plannedStart;
  target.plannedEnd = addDays(target.plannedStart, target.durationDays - 1);
  byId.set(activityId, target);

  const ordered = [...byId.values()].sort((a, b) => a.order - b.order);

  for (const activity of ordered) {
    if (activity.id === activityId) continue;
    if (activity.dependsOn.length === 0) continue;

    const depEnds = activity.dependsOn
      .map((depId) => byId.get(depId))
      .filter((d): d is Activity => Boolean(d))
      .map((d) => d.plannedEnd);

    if (depEnds.length === 0) continue;

    const requiredStart = addDays(depEnds.sort().reverse()[0], 1);
    if (requiredStart !== activity.plannedStart) {
      activity.plannedStart = requiredStart;
      activity.plannedEnd = addDays(requiredStart, activity.durationDays - 1);
      byId.set(activity.id, activity);
    }
  }

  return ordered;
}

/**
 * Fast-forwards a freshly generated activity chain to reflect real progress:
 * everything before `currentOrder` is marked done (using an optionally
 * delayed actual start), the activity at `currentOrder` is in progress, and
 * the plan for everything after it is re-anchored to the real timeline via
 * `recalculateSchedule` — the same engine a manual edit would trigger.
 */
export function applyExecutionState(
  activities: Activity[],
  opts: { currentOrder: number; currentProgress: number; startOffsetDays?: number }
): Activity[] {
  const offset = opts.startOffsetDays ?? 0;
  const byId = new Map(activities.map((a) => [a.id, { ...a }]));
  const ordered = [...byId.values()].sort((a, b) => a.order - b.order);

  let actualCursor: string | null = null;

  for (const activity of ordered) {
    if (activity.order < opts.currentOrder) {
      const actualStart = actualCursor ?? addDays(activity.baselineStart, offset);
      const actualEnd = addDays(actualStart, activity.durationDays - 1);
      activity.actualStart = actualStart;
      activity.actualEnd = actualEnd;
      activity.progress = 100;
      activity.status = "CONCLUIDO";
      activity.plannedStart = actualStart;
      activity.plannedEnd = actualEnd;
      actualCursor = addDays(actualEnd, 1);
      byId.set(activity.id, activity);
    } else if (activity.order === opts.currentOrder) {
      const actualStart = actualCursor ?? addDays(activity.baselineStart, offset);
      activity.actualStart = actualStart;
      activity.progress = opts.currentProgress;
      activity.status = "ATUAL";
      byId.set(activity.id, activity);
    }
  }

  let result = [...byId.values()].sort((a, b) => a.order - b.order);
  const current = result.find((a) => a.order === opts.currentOrder);
  if (current) {
    result = recalculateSchedule(result, current.id, { plannedStart: current.actualStart });
  }

  return result.map((a) => (a.order > opts.currentOrder ? { ...a, status: "FUTURO" as const } : a));
}

/**
 * Stretches a completed activity chain across a known real execution window —
 * used to seed historical tanks whose actual start/end dates are known but
 * whose per-stage breakdown isn't. Keeps stage proportions from the template.
 */
export function markFullyConcluded(
  activities: Activity[],
  actualStartISO: string,
  actualEndISO: string
): Activity[] {
  const ordered = [...activities].sort((a, b) => a.order - b.order);
  const totalBaselineDays = ordered.reduce((sum, a) => sum + a.durationDays, 0);
  const totalActualDays = diffDays(actualStartISO, actualEndISO) + 1;

  let cursor = actualStartISO;
  return ordered.map((activity, index) => {
    const isLast = index === ordered.length - 1;
    const scaledDuration = isLast
      ? diffDays(cursor, actualEndISO) + 1
      : Math.max(1, Math.round((activity.durationDays / totalBaselineDays) * totalActualDays));
    const start = cursor;
    const end = addDays(start, scaledDuration - 1);
    cursor = addDays(end, 1);
    return {
      ...activity,
      actualStart: start,
      actualEnd: end,
      plannedStart: start,
      plannedEnd: end,
      progress: 100,
      status: "CONCLUIDO" as const,
    };
  });
}

export function weightedProgress(activities: Activity[]): number {
  const totalDuration = activities.reduce((sum, a) => sum + a.durationDays, 0);
  if (totalDuration === 0) return 0;
  const done = activities.reduce((sum, a) => sum + (a.progress / 100) * a.durationDays, 0);
  return Math.round((done / totalDuration) * 100);
}

export function overallDeviationDays(activities: Activity[]): number {
  if (activities.length === 0) return 0;
  const baselineEnd = activities[activities.length - 1].baselineEnd;
  const plannedEnd = activities[activities.length - 1].plannedEnd;
  return diffDays(baselineEnd, plannedEnd);
}

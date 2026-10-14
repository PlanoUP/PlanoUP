// Lays out every in-maintenance progress callout for one map in a single
// pass, instead of each hotspot picking its own position independently.
// Two tanks that sit close together (common — e.g. adjacent lavagem-a-frio
// tanks) would otherwise get pushed in the same direction and their boxes
// would land on top of each other. This runs a small pairwise separation
// pass in the map's native image-pixel space so crowded clusters fan out
// instead of colliding.

export interface CalloutPoint {
  tag: string;
  xPct: number;
  yPct: number;
}

export interface CalloutOffset {
  dx: number;
  dy: number;
}

const BOX_WIDTH = 126;
const BOX_HEIGHT = 50;
const BOX_MARGIN = 14; // minimum gap enforced between two boxes
const BASE_DX = 60;
const BASE_DY = 46;
const LANE_STEP_X = 14;
const LANE_STEP_Y = 11;
const RELAX_ITERATIONS = 48;
const MAX_OFFSET = 260; // clamp so a dense cluster can't fling a box far off-image

function hashTag(tag: string): number {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return h;
}

function clamp(value: number, max: number): number {
  return Math.max(-max, Math.min(max, value));
}

export function computeCalloutLayout(
  points: CalloutPoint[],
  imageWidth: number,
  imageHeight: number
): Record<string, CalloutOffset> {
  const nodes = points.map((p) => {
    const signX = p.xPct > 62 ? -1 : 1;
    const signY = p.yPct < 20 ? 1 : -1;
    const lane = hashTag(p.tag) % 3;
    return {
      tag: p.tag,
      dotX: (p.xPct / 100) * imageWidth,
      dotY: (p.yPct / 100) * imageHeight,
      dx: signX * (BASE_DX + lane * LANE_STEP_X),
      dy: signY * (BASE_DY + lane * LANE_STEP_Y),
    };
  });

  for (let iter = 0; iter < RELAX_ITERATIONS; iter++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const ax = a.dotX + a.dx;
        const ay = a.dotY + a.dy;
        const bx = b.dotX + b.dx;
        const by = b.dotY + b.dy;
        const overlapX = BOX_WIDTH + BOX_MARGIN - Math.abs(ax - bx);
        const overlapY = BOX_HEIGHT + BOX_MARGIN - Math.abs(ay - by);
        if (overlapX <= 0 || overlapY <= 0) continue;

        moved = true;
        if (overlapX < overlapY) {
          const push = overlapX / 2 + 1;
          const sign = Math.sign(ax - bx) || 1;
          a.dx = clamp(a.dx + sign * push, MAX_OFFSET);
          b.dx = clamp(b.dx - sign * push, MAX_OFFSET);
        } else {
          const push = overlapY / 2 + 1;
          const sign = Math.sign(ay - by) || 1;
          a.dy = clamp(a.dy + sign * push, MAX_OFFSET);
          b.dy = clamp(b.dy - sign * push, MAX_OFFSET);
        }
      }
    }
    if (!moved) break;
  }

  return Object.fromEntries(nodes.map((n) => [n.tag, { dx: n.dx, dy: n.dy }]));
}

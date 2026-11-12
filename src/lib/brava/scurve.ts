// Physical-progress S-curve — Previsto x Realizado acumulado ao longo do
// cronograma, reaproveitando os mesmos tanques/atividades já cadastrados
// (nenhum cronograma novo precisa ser enviado). Sempre recomputado a partir
// de `tanks` ao vivo, então atualiza sozinho conforme o avanço é registrado.
import { TankWithDerived, Activity } from "./types";
import { diffDays, addDays, todayISO, parseISO } from "./date-utils";

export interface SCurvePoint {
  dateISO: string;
  label: string;
  previsto: number; // 0-100, acumulado
  /** null para datas futuras — ainda não existe avanço real para elas. */
  realizado: number | null;
}

/** Tanques "com cronograma" — os únicos que entram no cálculo, como pedido. */
function inScope(tanks: TankWithDerived[]): TankWithDerived[] {
  return tanks.filter((t) => t.status !== "SEM_PROJETO");
}

function plannedProgressAt(a: Activity, d: string): number {
  if (d < a.plannedStart) return 0;
  if (d >= a.plannedEnd) return 100;
  const span = diffDays(a.plannedStart, a.plannedEnd);
  if (span <= 0) return 100;
  return (diffDays(a.plannedStart, d) / span) * 100;
}

/**
 * O sistema só guarda o progresso ATUAL de cada atividade, não um histórico
 * semanal — então o trecho "Realizado" antes de hoje é uma reconstrução, não
 * um dado registrado: assume progresso linear entre o início real
 * (actualStart, 0%) e hoje (o progresso real conhecido), exata nas duas
 * pontas e estimada no meio. Uma etapa concluída (actualEnd) vale 100% a
 * partir do fim real; uma que não começou vale 0%. Nunca estima o futuro.
 */
function actualProgressAt(a: Activity, d: string, today: string): number {
  if (!a.actualStart || d < a.actualStart) return 0;
  if (a.actualEnd && d >= a.actualEnd) return 100;
  if (d >= today) return a.progress;
  const span = diffDays(a.actualStart, today);
  if (span <= 0) return a.progress;
  const frac = diffDays(a.actualStart, d) / span;
  return Math.max(0, Math.min(a.progress, frac * a.progress));
}

function formatAxisLabel(iso: string): string {
  const d = parseISO(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Amostra a cada `intervalDays` do início ao fim do cronograma pooled de
 * todos os tanques em escopo, garantindo os pontos exatos de início, fim e
 * hoje. Cada ponto é o mesmo peso por duração (weightedProgress) já usado em
 * Avanço Físico, só que avaliado em várias datas em vez de uma só.
 */
export function buildPhysicalSCurve(tanks: TankWithDerived[], intervalDays = 7): SCurvePoint[] {
  const scoped = inScope(tanks);
  const activities = scoped.flatMap((t) => t.activities);
  const totalDuration = activities.reduce((s, a) => s + a.durationDays, 0);
  if (activities.length === 0 || totalDuration === 0) return [];

  let start = activities[0].plannedStart;
  let end = activities[0].plannedEnd;
  for (const a of activities) {
    if (a.plannedStart < start) start = a.plannedStart;
    if (a.plannedEnd > end) end = a.plannedEnd;
  }

  const today = todayISO();
  const dateSet = new Set<string>();
  for (let d = start; d <= end; d = addDays(d, intervalDays)) dateSet.add(d);
  dateSet.add(start);
  dateSet.add(end);
  if (today >= start && today <= end) dateSet.add(today);
  const dates = Array.from(dateSet).sort();

  return dates.map((d) => {
    const previstoSum = activities.reduce((s, a) => s + (plannedProgressAt(a, d) / 100) * a.durationDays, 0);
    const previsto = Math.round((previstoSum / totalDuration) * 100);

    let realizado: number | null = null;
    if (d <= today) {
      const realizadoSum = activities.reduce((s, a) => s + (actualProgressAt(a, d, today) / 100) * a.durationDays, 0);
      realizado = Math.round((realizadoSum / totalDuration) * 100);
    }

    return { dateISO: d, label: formatAxisLabel(d), previsto, realizado };
  });
}

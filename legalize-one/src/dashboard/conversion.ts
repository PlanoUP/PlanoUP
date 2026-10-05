/**
 * POTENCIAL DE CONVERSÃO — regra explícita (sem "IA"), exibida no painel como está aqui.
 *
 * Para cada imóvel, no período:
 * - Taxa de contato  = visitantes que chamaram no WhatsApp/pediram visita (+ contatos registrados) ÷ visitantes do imóvel.
 *   Referência: 8% vale nota máxima.
 * - Taxa de imersão  = visitantes que abriram o 3D ou o tour ÷ visitantes do imóvel. Referência: 35%.
 * - Nota (0–100) = 70% contato + 30% imersão. Sem 3D/tour, a nota é só a de contato.
 * - Com menos de 10 visitantes no período não há dados suficientes para avaliar.
 */
export const CONVERSION_RULE = {
  minViewers: 10,
  contactTarget: 0.08,
  immersiveTarget: 0.35,
  contactWeight: 0.7,
  immersiveWeight: 0.3,
} as const

export type ConversionLevel = 'high' | 'medium' | 'low' | 'insufficient'

export interface PropertyMetrics {
  viewers: number
  intent_sessions: number
  immersive_sessions: number
  leads: number
  has3d: boolean
  has_tour: boolean
}

export interface ConversionPotential {
  level: ConversionLevel
  score: number | null
  contactRate: number
  immersiveRate: number
  tip: string
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export function conversionPotential(m: PropertyMetrics): ConversionPotential {
  const r = CONVERSION_RULE
  const viewers = Math.max(0, m.viewers)
  const contactRate = viewers ? clamp01((m.intent_sessions + m.leads) / viewers) : 0
  const immersiveRate = viewers ? clamp01(m.immersive_sessions / viewers) : 0
  const immersive = m.has3d || m.has_tour

  if (viewers < r.minViewers) {
    return { level: 'insufficient', score: null, contactRate, immersiveRate, tip: `Avaliação a partir de ${r.minViewers} visitantes no período.` }
  }

  const contactScore = clamp01(contactRate / r.contactTarget)
  const immersiveScore = clamp01(immersiveRate / r.immersiveTarget)
  const score = Math.round(100 * (immersive ? r.contactWeight * contactScore + r.immersiveWeight * immersiveScore : contactScore))
  const level: ConversionLevel = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  let tip: string
  if (level === 'high') tip = 'Muitos visitantes chamam: responda rápido e priorize as visitas.'
  else if (contactScore < 0.5 && immersive && immersiveScore >= 0.5) tip = 'Visitantes exploram o 3D/tour, mas pouco chamam: reforce o convite para agendar visita.'
  else if (contactScore < 0.5) tip = 'Muita visita e pouco contato: revise preço, fotos e descrição.'
  else if (!immersive) tip = 'Um tour 360° ou modelo 3D tende a aumentar o interesse.'
  else tip = 'Bom interesse: acompanhe os contatos para converter.'

  return { level, score, contactRate, immersiveRate, tip }
}

export const CONVERSION_LABELS: Record<ConversionLevel, string> = {
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
  insufficient: 'Poucos dados',
}

import { describe, expect, it } from 'vitest'
import { conversionPotential } from '@/dashboard/conversion'

const base = { viewers: 100, intent_sessions: 0, immersive_sessions: 0, leads: 0, has3d: true, has_tour: false }

describe('Potencial de Conversão', () => {
  it('poucos visitantes: não avalia', () => {
    const r = conversionPotential({ ...base, viewers: 9, intent_sessions: 5 })
    expect(r.level).toBe('insufficient')
    expect(r.score).toBeNull()
  })

  it('metas atingidas = 100; 70% contato + 30% imersão', () => {
    expect(conversionPotential({ ...base, intent_sessions: 8, immersive_sessions: 35 }).score).toBe(100)
    expect(conversionPotential({ ...base, intent_sessions: 8 }).score).toBe(70)
    expect(conversionPotential({ ...base, immersive_sessions: 35 }).score).toBe(30)
    expect(conversionPotential({ ...base, intent_sessions: 4, immersive_sessions: 35 }).score).toBe(65)
  })

  it('sem 3D/tour a nota é só a de contato', () => {
    const r = conversionPotential({ ...base, has3d: false, intent_sessions: 4 })
    expect(r.score).toBe(50)
    expect(r.level).toBe('medium')
  })

  it('contatos registrados contam como interesse; taxas limitadas a 100%', () => {
    expect(conversionPotential({ ...base, viewers: 10, leads: 50, has3d: false }).contactRate).toBe(1)
    expect(conversionPotential({ ...base, leads: 8, has3d: false }).level).toBe('high')
  })

  it('dica coerente com o diagnóstico', () => {
    expect(conversionPotential({ ...base, immersive_sessions: 40 }).tip).toMatch(/exploram o 3D/)
    expect(conversionPotential({ ...base, has3d: false }).tip).toMatch(/revise preço/)
  })
})

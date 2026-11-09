import { describe, expect, it } from 'vitest'
import { docProgress, formatCpf, isValidCpf, maskCpf, missingDocsMessage, requiredDocs } from '@/dashboard/clientsApi'

describe('clientes: CPF', () => {
  it('valida dígitos verificadores', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('11144477735')).toBe(true)
    expect(isValidCpf('123.456.789-00')).toBe(false)
    expect(isValidCpf('111.111.111-11')).toBe(false)
    expect(isValidCpf('5299822472')).toBe(false)
  })
  it('formata e oculta', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25')
    expect(formatCpf('5299')).toBe('529.9')
    expect(maskCpf('52998224725')).toBe('529.***.***-25')
  })
})

describe('clientes: documentos exigidos', () => {
  const keys = (c: Parameters<typeof requiredDocs>[0]) => requiredDocs(c).map((d) => d.key)
  it('renda formal, solteiro, sem dependentes', () => {
    expect(keys({ income_type: 'formal', marital_status: 'single', dependents: 0 })).toEqual([
      'identidade', 'residencia', 'estado_civil', 'contracheque', 'carteira_trabalho', 'fgts',
    ])
  })
  it('renda mista, casado, com dependentes', () => {
    const k = keys({ income_type: 'mixed', marital_status: 'married', dependents: 2 })
    expect(k).toContain('extrato_bancario')
    expect(k).toContain('contracheque')
    expect(k).toContain('conjuge')
    expect(k).toContain('dependentes')
  })
  it('progresso ignora recusados e a mensagem lista o que falta', () => {
    const c = { income_type: 'informal' as const, marital_status: null, dependents: 0 }
    const p = docProgress(c, [
      { kind: 'identidade', status: 'accepted' },
      { kind: 'residencia', status: 'rejected' },
      { kind: 'outro', status: 'received' },
    ])
    expect(p.total).toBe(5)
    expect(p.done).toBe(1)
    expect(p.missing.map((d) => d.key)).toEqual(['residencia', 'estado_civil', 'extrato_bancario', 'declaracao_renda'])
    const msg = missingDocsMessage('Ana', p.missing, 'Lucas')
    expect(msg).toContain('Olá, Ana! Aqui é Lucas.')
    expect(msg).toContain('• Comprovante de residência')
    expect(missingDocsMessage('Ana', [])).toContain('todos os seus documentos')
  })
})

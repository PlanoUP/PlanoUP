import { describe, expect, it } from 'vitest'
import { loginUrl, siteUrl, suggestSlug } from '@/dashboard/platformApi'
import { previewSlug } from '@/tenant/preview'

describe('painel da plataforma', () => {
  it('sugere endereço curto a partir do nome', () => {
    expect(suggestSlug('Imobiliária São João & Filhos')).toBe('imobiliaria-sao-joao-filhos')
    expect(suggestSlug('  --Casa 10--  ')).toBe('casa-10')
    expect(suggestSlug('a'.repeat(60)).length).toBe(48)
  })

  it('site e login: domínio próprio ou pré-visualização', () => {
    const origin = 'https://app.exemplo.com'
    expect(siteUrl({ slug: 'nova', domains: [] }, origin)).toBe('https://app.exemplo.com/?previa=nova')
    expect(loginUrl({ slug: 'nova', domains: [] }, origin)).toBe('https://app.exemplo.com/entrar?previa=nova')
    expect(siteUrl({ slug: 'nova', domains: ['www.nova.com.br'] }, origin)).toBe('https://www.nova.com.br')
    expect(loginUrl({ slug: 'nova', domains: ['www.nova.com.br'] }, origin)).toBe('https://www.nova.com.br/entrar')
  })

  it('pré-visualização aceita só endereço curto válido', () => {
    expect(previewSlug('?previa=Imob-Nova')).toBe('imob-nova')
    expect(previewSlug('?previa=sair')).toBeNull()
    expect(previewSlug('?previa=../x')).toBeNull()
  })
})

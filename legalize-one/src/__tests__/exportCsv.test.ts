import { describe, expect, it } from 'vitest'
import { toCsv } from '@/dashboard/exportCsv'

describe('exportação CSV', () => {
  it('formato do Excel em português, com escape e proteção contra fórmulas', () => {
    const csv = toCsv(
      [{ nome: 'Maria; "Mia"', preco: 650000.5, ok: true, nota: '=SOMA(A1)' }],
      [
        { header: 'Nome', value: (r) => r.nome },
        { header: 'Preço', value: (r) => r.preco },
        { header: 'Verificado', value: (r) => r.ok },
        { header: 'Nota', value: (r) => r.nota },
      ],
    )
    expect(csv.startsWith('﻿Nome;Preço;Verificado;Nota\r\n')).toBe(true)
    expect(csv.split('\r\n')[1]).toBe(`"Maria; ""Mia""";650000,5;sim;'=SOMA(A1)`)
  })
})

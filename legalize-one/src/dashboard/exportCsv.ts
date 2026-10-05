/**
 * Exportação em planilha (CSV) — os dados são da imobiliária e servem de cópia de segurança.
 * Formato para o Excel em português: separador ";", BOM UTF-8 e quebras de linha CRLF.
 */
export interface CsvColumn<T> {
  header: string
  value: (row: T) => string | number | boolean | null | undefined
}

function cell(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return ''
  let s = typeof v === 'number' ? v.toLocaleString('pt-BR', { useGrouping: false }) : typeof v === 'boolean' ? (v ? 'sim' : 'não') : v
  // Evita que a planilha interprete texto como fórmula.
  if (/^[=+\-@]/.test(s)) s = `'${s}`
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines = [columns.map((c) => cell(c.header)).join(';'), ...rows.map((r) => columns.map((c) => cell(c.value(r))).join(';'))]
  return '﻿' + lines.join('\r\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

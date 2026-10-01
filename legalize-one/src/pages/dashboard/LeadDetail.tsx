import { ArrowLeft, ExternalLink, Loader2, Mail, Phone, Save, Send, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '@/auth/context'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { Button } from '@/components/ui/Button'
import { Field, inputClass, Section } from '@/dashboard/FormParts'
import { LeadStatusBadge } from '@/dashboard/LeadStatusBadge'
import {
  addNote,
  createLead,
  deleteLead,
  deleteNote,
  formatWhen,
  getLead,
  LEAD_CHANNEL_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
  listNotes,
  sourceLabel,
  teamNames,
  updateLead,
  whatsappNumber,
  type Lead,
  type LeadChannel,
  type LeadStatus,
} from '@/dashboard/leadsApi'
import { listBrokers, listProperties } from '@/dashboard/propertiesApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'
import { formatPhoneBR } from '@/utils/format'

const digits = (s: string) => s.replace(/\D/g, '')

function validateContact(name: string, phone: string, email: string): string | null {
  if (name.trim().length < 2) return 'Informe o nome do contato.'
  const d = digits(phone)
  if (d && (d.length < 10 || d.length > 13)) return 'Telefone inválido: use DDD + número.'
  if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return 'E-mail inválido.'
  if (!d && !email.trim()) return 'Informe telefone ou e-mail.'
  return null
}

/** Dados auxiliares do formulário: imóveis e corretores da imobiliária. */
function useOptions(tenantId: string, isManager: boolean) {
  return useAsyncData(
    async () => {
      const [properties, brokers] = await Promise.all([
        listProperties(tenantId),
        isManager ? listBrokers(tenantId) : Promise.resolve([]),
      ])
      return { properties, brokers }
    },
    `${tenantId}:${isManager}`,
  ).data
}

function NewLead() {
  const ws = useWorkspace()
  const navigate = useNavigate()
  const isManager = ws.can('leads.view_all')
  const options = useOptions(ws.tenantId, isManager)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [channel, setChannel] = useState<LeadChannel>('whatsapp')
  const [propertyId, setPropertyId] = useState('')
  const [brokerId, setBrokerId] = useState(isManager ? '' : (ws.brokerId ?? ''))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const blocked = !isManager && !ws.brokerId

  async function submit(e: FormEvent) {
    e.preventDefault()
    const problem = validateContact(name, phone, email)
    if (problem) return setError(problem)
    setSaving(true)
    setError('')
    try {
      const id = await createLead(ws.tenantId, {
        name: name.trim(),
        phone: digits(phone) || null,
        email: email.trim().toLowerCase() || null,
        channel,
        property_id: propertyId || null,
        broker_id: isManager ? brokerId || null : ws.brokerId,
        message: message.trim() || null,
      })
      navigate(`/dashboard/contatos/${id}`, { replace: true })
    } catch (err) {
      setSaving(false)
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Link to="/dashboard/contatos" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Contatos
      </Link>
      <div>
        <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] text-navy-950 sm:text-[28px]">Registrar contato</h1>
        <p className="mt-1 text-[14.5px] text-slate">Para contatos que chegaram por WhatsApp, telefone ou pessoalmente.</p>
      </div>
      {blocked ? (
        <p className="rounded-2xl bg-white p-4 text-[14.5px] text-navy-950 shadow-card">
          Seu cadastro de corretor ainda não está ativo. Peça ao gerente para ativá-lo.
        </p>
      ) : (
        <Section title="Contato">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" className="sm:col-span-2">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="off" className={inputClass} />
            </Field>
            <Field label="Telefone / WhatsApp">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="(84) 99999-9999" className={inputClass} />
            </Field>
            <Field label="E-mail">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" className={inputClass} />
            </Field>
            <Field label="Como chegou">
              <select value={channel} onChange={(e) => setChannel(e.target.value as LeadChannel)} className={inputClass}>
                {(['whatsapp', 'call', 'visit_request', 'info_request'] as LeadChannel[]).map((c) => (
                  <option key={c} value={c}>
                    {LEAD_CHANNEL_LABELS[c]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Imóvel de interesse">
              <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputClass}>
                <option value="">Nenhum específico</option>
                {(options?.properties ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code ? `${p.code} — ` : ''}
                    {p.title}
                  </option>
                ))}
              </select>
            </Field>
            {isManager && (
              <Field label="Corretor responsável">
                <select value={brokerId} onChange={(e) => setBrokerId(e.target.value)} className={inputClass}>
                  <option value="">Imobiliária (sem corretor)</option>
                  {(options?.brokers ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Observação" className="sm:col-span-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={2000}
                className={cn(inputClass, 'h-auto py-3')}
              />
            </Field>
          </div>
          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-800">
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              Salvar contato
            </Button>
          </div>
        </Section>
      )}
    </form>
  )
}

function LeadView({ initial }: { initial: Lead }) {
  const ws = useWorkspace()
  const auth = useAuth()
  const navigate = useNavigate()
  const isManager = ws.can('leads.view_all')
  const options = useOptions(ws.tenantId, isManager)
  const [lead, setLead] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [editing, setEditing] = useState(false)
  const [contact, setContact] = useState({ name: lead.name ?? '', phone: lead.phone ?? '', email: lead.email ?? '' })
  const [noteVersion, setNoteVersion] = useState(0)
  const [note, setNote] = useState('')
  const { data: notes } = useAsyncData(async () => {
    const list = await listNotes(lead.id)
    const names = await teamNames(list.flatMap((n) => (n.author_id ? [n.author_id] : [])))
    return list.map((n) => ({ ...n, author: n.author_id === auth.userId ? 'Você' : (names[n.author_id ?? ''] ?? 'Equipe') }))
  }, `${lead.id}:${noteVersion}`)

  const property = options?.properties.find((p) => p.id === lead.property_id)
  const wa = whatsappNumber(lead.phone)
  const firstName = (lead.name ?? '').trim().split(/\s+/)[0]
  const greeting = `Olá${firstName ? `, ${firstName}` : ''}! Aqui é da ${ws.tenantName}${property ? `, sobre o imóvel ${property.title}${property.code ? ` (${property.code})` : ''}` : ''}.`

  async function patch(change: Parameters<typeof updateLead>[2], ok?: string) {
    setBusy(true)
    setFeedback(null)
    try {
      setLead(await updateLead(ws.tenantId, lead.id, change))
      if (ok) setFeedback({ tone: 'ok', text: ok })
      return true
    } catch (e) {
      setFeedback({ tone: 'error', text: e instanceof Error ? e.message : 'Não foi possível salvar.' })
      return false
    } finally {
      setBusy(false)
    }
  }

  // Ao chamar um contato novo, ele passa para "Em atendimento".
  const startService = () => {
    if (lead.status === 'new') void patch({ status: 'contacted' })
  }

  async function saveContact() {
    const problem = validateContact(contact.name, contact.phone, contact.email)
    if (problem) return setFeedback({ tone: 'error', text: problem })
    const done = await patch(
      { name: contact.name.trim(), phone: digits(contact.phone) || null, email: contact.email.trim().toLowerCase() || null },
      'Dados do contato salvos.',
    )
    if (done) setEditing(false)
  }

  async function submitNote(e: FormEvent) {
    e.preventDefault()
    const body = note.trim()
    if (!body || !auth.userId) return
    setBusy(true)
    try {
      await addNote(ws.tenantId, lead.id, auth.userId, body.slice(0, 4000))
      setNote('')
      setNoteVersion((v) => v + 1)
    } catch (err) {
      setFeedback({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível anotar.' })
    } finally {
      setBusy(false)
    }
  }

  async function removeNote(id: string) {
    if (!window.confirm('Excluir esta anotação?')) return
    try {
      await deleteNote(id)
      setNoteVersion((v) => v + 1)
    } catch (err) {
      setFeedback({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível excluir.' })
    }
  }

  async function removeLead() {
    if (!window.confirm('Excluir este contato e as anotações? Esta ação não pode ser desfeita.')) return
    try {
      await deleteLead(ws.tenantId, lead.id)
      navigate('/dashboard/contatos', { replace: true })
    } catch (err) {
      setFeedback({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível excluir.' })
    }
  }

  const utm = [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ')
  const origin: [string, string | null][] = [
    ['Recebido em', formatWhen(lead.created_at)],
    ['Canal', LEAD_CHANNEL_LABELS[lead.channel]],
    ['Origem', sourceLabel(lead.source)],
    ['Página', lead.page_path],
    ['Campanha', utm || null],
    ['Veio de', lead.referrer],
  ]

  return (
    <div className="space-y-5">
      <Link to="/dashboard/contatos" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Contatos
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 font-display text-[26px] font-bold tracking-[-0.02em] text-navy-950 sm:text-[28px]">
          {lead.name || 'Contato sem nome'}
        </h1>
        <LeadStatusBadge status={lead.status} />
      </div>

      {feedback && (
        <p
          role={feedback.tone === 'error' ? 'alert' : 'status'}
          className={cn('rounded-xl px-4 py-3 text-[14px] font-medium', feedback.tone === 'error' ? 'bg-red-50 text-red-800' : 'bg-tour/10 text-tour')}
        >
          {feedback.text}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Section title="Atender">
            <div className="flex flex-wrap gap-2">
              {wa && (
                <a
                  href={`https://wa.me/${wa}?text=${encodeURIComponent(greeting)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={startService}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1f9d55] px-5 text-sm font-semibold text-white hover:bg-[#1a8a4a]"
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:+${whatsappNumber(lead.phone)}`}
                  onClick={startService}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-navy-950/15 bg-white px-5 text-sm font-semibold text-navy-800 hover:bg-sand"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  Ligar
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  onClick={startService}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-navy-950/15 bg-white px-5 text-sm font-semibold text-navy-800 hover:bg-sand"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  E-mail
                </a>
              )}
              {!lead.phone && !lead.email && <p className="text-[14px] text-slate">Sem telefone ou e-mail cadastrado.</p>}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Situação">
                <select
                  value={lead.status}
                  disabled={busy}
                  onChange={(e) => void patch({ status: e.target.value as LeadStatus }, 'Situação atualizada.')}
                  className={inputClass}
                >
                  {LEAD_STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>
              {isManager && (
                <Field label="Corretor responsável">
                  <select
                    value={lead.broker_id ?? ''}
                    disabled={busy}
                    onChange={(e) => void patch({ broker_id: e.target.value || null }, 'Responsável atualizado.')}
                    className={inputClass}
                  >
                    <option value="">Imobiliária (sem corretor)</option>
                    {(options?.brokers ?? []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          </Section>

          {lead.message && (
            <Section title="Mensagem">
              <p className="text-[15px] leading-relaxed whitespace-pre-line text-navy-950">{lead.message}</p>
            </Section>
          )}

          <Section title="Anotações" description="Histórico do atendimento, visível para a equipe.">
            <form onSubmit={submitNote} className="flex gap-2">
              <label className="sr-only" htmlFor="note">
                Nova anotação
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={4000}
                placeholder="Ex.: Ligou às 15h, quer visitar no sábado."
                className={cn(inputClass, 'mt-0 h-auto py-3')}
              />
              <Button type="submit" disabled={busy || !note.trim()} className="h-12 self-end" aria-label="Salvar anotação">
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>
            {notes && notes.length > 0 ? (
              <ol className="mt-5 space-y-4">
                {notes.map((n) => (
                  <li key={n.id} className="border-l-2 border-gold-500 pl-4">
                    <p className="text-[12.5px] text-slate">
                      <strong className="font-semibold text-navy-950">{n.author}</strong> · {formatWhen(n.created_at)}
                      {(n.author_id === auth.userId || isManager) && (
                        <button
                          type="button"
                          onClick={() => void removeNote(n.id)}
                          aria-label="Excluir anotação"
                          className="ml-2 text-[12.5px] font-semibold text-red-700 hover:underline"
                        >
                          excluir
                        </button>
                      )}
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-navy-950">{n.body}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-[14px] text-slate">Nenhuma anotação ainda.</p>
            )}
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Dados do contato">
            {editing ? (
              <div className="space-y-3">
                <Field label="Nome">
                  <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} maxLength={120} className={inputClass} />
                </Field>
                <Field label="Telefone / WhatsApp">
                  <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} inputMode="tel" className={inputClass} />
                </Field>
                <Field label="E-mail">
                  <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} type="email" className={inputClass} />
                </Field>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" disabled={busy} onClick={() => void saveContact()}>
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="space-y-2 text-[15px]">
                <div>
                  <dt className="text-[12.5px] text-slate">Telefone</dt>
                  <dd className="font-semibold text-navy-950">{lead.phone ? formatPhoneBR(lead.phone) : '—'}</dd>
                </div>
                <div>
                  <dt className="text-[12.5px] text-slate">E-mail</dt>
                  <dd className="font-semibold break-all text-navy-950">{lead.email ?? '—'}</dd>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setContact({ name: lead.name ?? '', phone: lead.phone ?? '', email: lead.email ?? '' })
                    setEditing(true)
                  }}
                  className="pt-1 text-[14px] font-semibold text-navy-800 hover:underline"
                >
                  Editar dados
                </button>
              </dl>
            )}
          </Section>

          {property && (
            <Section title="Imóvel de interesse">
              <p className="text-[15px] font-semibold text-navy-950">
                {property.code ? `${property.code} — ` : ''}
                {property.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px] font-semibold">
                <Link to={`/dashboard/imoveis/${property.id}`} className="text-navy-800 hover:underline">
                  Abrir no painel
                </Link>
                {property.status === 'published' && (
                  <a href={`/imovel/${property.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-navy-800 hover:underline">
                    Ver no site <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </Section>
          )}

          <Section title="Origem">
            <dl className="space-y-2 text-[14px]">
              {origin
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[12.5px] text-slate">{k}</dt>
                    <dd className="break-words text-navy-950">{v}</dd>
                  </div>
                ))}
            </dl>
          </Section>

          {isManager && (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => void removeLead()} className="text-red-700 hover:bg-red-50">
                <Trash2 className="size-4" aria-hidden="true" />
                Excluir contato
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LeadDetail() {
  const { id } = useParams()
  const ws = useWorkspace()
  usePageTitle(id ? 'Contato · Painel' : 'Registrar contato · Painel')
  const { data, loading, error } = useAsyncData(
    () => (id ? getLead(ws.tenantId, id) : Promise.resolve(null)),
    `${ws.tenantId}:${id ?? 'new'}`,
  )
  if (!id) return <NewLead />
  if (loading) return <div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy="true" />
  if (error) {
    return (
      <p role="alert" className="rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
        {error.message}
      </p>
    )
  }
  if (!data) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">Contato não encontrado (ou sob responsabilidade de outro corretor).</p>
        <Link to="/dashboard/contatos" className="mt-3 inline-block font-semibold text-navy-800">
          Voltar para Contatos
        </Link>
      </div>
    )
  }
  return <LeadView key={data.id} initial={data} />
}

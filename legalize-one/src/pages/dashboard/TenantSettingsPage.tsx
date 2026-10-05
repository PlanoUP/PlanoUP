import { ExternalLink, ImagePlus, Loader2, Save, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass, Section } from '@/dashboard/FormParts'
import { getSettings, saveSettings, uploadLogo, type TenantSettings } from '@/dashboard/settingsApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'
import { formatPhoneBR } from '@/utils/format'

type Form = Record<keyof TenantSettings, string>
type Errors = Partial<Record<keyof TenantSettings, string>>

const HEX = /^#[0-9a-f]{6}$/i
const digits = (s: string) => s.replace(/\D/g, '')
const toForm = (s: TenantSettings): Form =>
  Object.fromEntries(
    Object.entries(s).map(([k, v]) => [k, k === 'phone' || k === 'whatsapp' ? formatPhoneBR((v as string | null) ?? '') : ((v as string | null) ?? '')]),
  ) as Form

/** Valida e converte para o banco (as mesmas regras do banco, com mensagens claras). */
function fromForm(f: Form): { settings?: TenantSettings; errors: Errors } {
  const e: Errors = {}
  const t = (k: keyof Form) => f[k].trim() || null
  if (f.display_name.trim().length < 2) e.display_name = 'Informe o nome da imobiliária.'
  const phone = digits(f.phone)
  if (phone && (phone.length < 10 || phone.length > 13)) e.phone = 'Telefone com DDD.'
  let wa = digits(f.whatsapp)
  if (wa && (wa.length === 10 || wa.length === 11)) wa = `55${wa}`
  if (wa && (wa.length < 12 || wa.length > 13)) e.whatsapp = 'WhatsApp com DDD (ex.: (84) 99999-9999).'
  if (f.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) e.email = 'E-mail inválido.'
  const state = f.state.trim().toUpperCase()
  if (state && !/^[A-Z]{2}$/.test(state)) e.state = 'Sigla com 2 letras (ex.: RN).'
  for (const k of ['primary_color', 'secondary_color'] as const) if (f[k] && !HEX.test(f[k])) e[k] = 'Cor no formato #RRGGBB.'
  for (const k of ['instagram_url', 'facebook_url'] as const) if (f[k].trim() && !/^https:\/\//.test(f[k].trim())) e[k] = 'Cole o endereço completo (https://…).'
  if (Object.keys(e).length) return { errors: e }
  return {
    errors: e,
    settings: {
      display_name: f.display_name.trim(),
      legal_name: t('legal_name'),
      tagline: t('tagline'),
      creci: t('creci'),
      phone: phone || null,
      whatsapp: wa || null,
      whatsapp_message: t('whatsapp_message'),
      email: f.email.trim().toLowerCase() || null,
      address_line: t('address_line'),
      city: t('city'),
      state: state || null,
      logo_url: t('logo_url'),
      primary_color: f.primary_color ? f.primary_color.toLowerCase() : null,
      secondary_color: f.secondary_color ? f.secondary_color.toLowerCase() : null,
      instagram_url: t('instagram_url'),
      facebook_url: t('facebook_url'),
      business_hours: t('business_hours'),
    },
  }
}

function Editor({ initial }: { initial: TenantSettings }) {
  const ws = useWorkspace()
  const [form, setForm] = useState<Form>(() => toForm(initial))
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState<'save' | 'logo' | null>(null)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }
  const text = (k: keyof Form, extra: Record<string, unknown> = {}) => ({ value: form[k], onChange: set(k), className: inputClass, ...extra })

  async function submit(e: FormEvent) {
    e.preventDefault()
    const r = fromForm(form)
    if (!r.settings) {
      setErrors(r.errors)
      setMsg({ tone: 'error', text: 'Revise os campos destacados.' })
      return
    }
    setBusy('save')
    setMsg(null)
    try {
      await saveSettings(ws.tenantId, r.settings)
      setMsg({ tone: 'ok', text: 'Salvo. O site já mostra os novos dados (atualize a página do site para ver).' })
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível salvar.' })
    } finally {
      setBusy(null)
    }
  }

  async function onLogo(file: File | undefined) {
    if (!file) return
    setBusy('logo')
    setMsg(null)
    try {
      const url = await uploadLogo(ws.tenantId, file)
      setForm((f) => ({ ...f, logo_url: url }))
      setMsg({ tone: 'ok', text: 'Logo enviado. Clique em "Salvar" para aplicar no site.' })
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível enviar o logo.' })
    } finally {
      setBusy(null)
    }
  }

  const primary = HEX.test(form.primary_color) ? form.primary_color : '#071b2e'
  const secondary = HEX.test(form.secondary_color) ? form.secondary_color : '#d9b47a'
  const err = (k: keyof Form) => errors[k]

  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="space-y-5 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Minha imobiliária</h1>
          <p className="mt-1 text-[14.5px] text-slate">Marca e contatos exibidos no site e nas mensagens de WhatsApp.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800">
          Ver o site <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>

      <Section title="Identidade">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome da imobiliária" error={err('display_name')}>
            <input {...text('display_name', { maxLength: 120 })} />
          </Field>
          <Field label="Razão social" hint="Aparece no rodapé e na política de privacidade.">
            <input {...text('legal_name', { maxLength: 160 })} />
          </Field>
          <Field label="Frase da marca" hint="Ex.: Do documento à chave." className="sm:col-span-2">
            <input {...text('tagline', { maxLength: 160 })} />
          </Field>
          <Field label="CRECI">
            <input {...text('creci', { maxLength: 40, placeholder: 'CRECI-RN 0000-J' })} />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-[14px] font-semibold text-navy-950">Logo</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="flex h-16 w-40 items-center justify-center rounded-xl border border-navy-950/10 bg-white p-2">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo atual" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[12.5px] text-slate">Sem logo (usa o nome)</span>
                )}
              </span>
              <label
                className={cn(
                  'inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-navy-950/15 bg-white px-4 text-[13.5px] font-semibold text-navy-800 hover:bg-sand',
                  busy && 'pointer-events-none opacity-60',
                )}
              >
                {busy === 'logo' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
                Enviar logo
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => void onLogo(e.target.files?.[0])} />
              </label>
              {form.logo_url && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, logo_url: '' }))} aria-label="Remover logo">
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
            <p className="mt-1.5 text-[12.5px] text-slate">PNG com fundo transparente, até 2 MB.</p>
          </div>

          <div>
            <p className="text-[14px] font-semibold text-navy-950">Cores</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(
                [
                  ['primary_color', 'Principal'],
                  ['secondary_color', 'Destaque'],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="block text-[13px] font-semibold text-navy-950">
                  {label}
                  <span className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={HEX.test(form[k]) ? form[k] : k === 'primary_color' ? '#071b2e' : '#d9b47a'}
                      onChange={set(k)}
                      className="h-11 w-12 cursor-pointer rounded-lg border border-navy-950/15 bg-white p-1"
                      aria-label={`Cor ${label.toLowerCase()}`}
                    />
                    <input value={form[k]} onChange={set(k)} placeholder="#071b2e" className={cn(inputClass, 'mt-0 font-mono')} aria-label={`Código da cor ${label.toLowerCase()}`} />
                  </span>
                  {err(k) && <span className="mt-1 block text-[12.5px] font-medium text-red-700">{err(k)}</span>}
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-xl p-3" style={{ background: primary }} aria-hidden="true">
              <span className="text-[14px] font-semibold text-white">{form.display_name || 'Sua imobiliária'}</span>
              <span className="ml-auto rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-black/80" style={{ background: secondary }}>
                Botão de destaque
              </span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Contato" description="Os botões de WhatsApp do site enviam mensagens para este número.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp" error={err('whatsapp')}>
            <input {...text('whatsapp', { inputMode: 'tel', placeholder: '(84) 99999-9999' })} />
          </Field>
          <Field label="Telefone" error={err('phone')}>
            <input {...text('phone', { inputMode: 'tel' })} />
          </Field>
          <Field label="Mensagem inicial do WhatsApp" hint="Texto que o visitante envia ao clicar no botão geral de WhatsApp." className="sm:col-span-2">
            <input {...text('whatsapp_message', { maxLength: 500 })} />
          </Field>
          <Field label="E-mail" error={err('email')}>
            <input {...text('email', { type: 'email', inputMode: 'email' })} />
          </Field>
          <Field label="Horário de atendimento">
            <input {...text('business_hours', { maxLength: 120, placeholder: 'Seg. a sáb., 8h às 18h' })} />
          </Field>
          <Field label="Endereço" className="sm:col-span-2">
            <input {...text('address_line', { maxLength: 200 })} />
          </Field>
          <Field label="Cidade">
            <input {...text('city', { maxLength: 80 })} />
          </Field>
          <Field label="UF" error={err('state')}>
            <input {...text('state', { maxLength: 2 })} />
          </Field>
        </div>
      </Section>

      <Section title="Redes sociais">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram" error={err('instagram_url')}>
            <input {...text('instagram_url', { placeholder: 'https://instagram.com/suaimobiliaria' })} />
          </Field>
          <Field label="Facebook" error={err('facebook_url')}>
            <input {...text('facebook_url', { placeholder: 'https://facebook.com/suaimobiliaria' })} />
          </Field>
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-navy-950/10 bg-white/95 backdrop-blur lg:bottom-0">
        <div className="mx-auto flex max-w-[1280px] items-center justify-end gap-3 px-4 py-3 sm:px-6">
          {msg && (
            <p role={msg.tone === 'error' ? 'alert' : 'status'} className={cn('mr-auto text-[14px] font-medium', msg.tone === 'error' ? 'text-red-700' : 'text-tour')}>
              {msg.text}
            </p>
          )}
          <Button type="submit" disabled={busy !== null}>
            {busy === 'save' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
            Salvar
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function TenantSettingsPage() {
  usePageTitle('Minha imobiliária · Painel')
  const ws = useWorkspace()
  const allowed = ws.can('tenant.settings.edit')
  const { data, error, loading } = useAsyncData(() => (allowed ? getSettings(ws.tenantId) : Promise.resolve(null)), `${ws.tenantId}:${allowed}`)
  if (!allowed) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">Os dados da imobiliária são editados pelos gerentes.</p>
      </div>
    )
  }
  if (error) {
    return (
      <p role="alert" className="rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
        {error.message}
      </p>
    )
  }
  if (loading || !data) return <div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy="true" />
  return <Editor key={ws.tenantId} initial={data} />
}

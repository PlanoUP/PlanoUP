import { Check, ExternalLink, Globe, ImagePlus, Loader2, Save, Trash2 } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { ACCENT_COLORS } from '@/broker/profile'
import type { BrokerAccent } from '@/broker/types'
import { Button } from '@/components/ui/Button'
import { getMySite, saveMySite, uploadSiteImage, type MySite as MySiteData } from '@/dashboard/brokerSiteApi'
import {
  SOCIAL_KEYS,
  SOCIAL_LABELS,
  fromSiteForm,
  toSiteForm,
  type SiteErrors,
  type SiteForm,
} from '@/dashboard/brokerSiteForm'
import { Field, inputClass, Section } from '@/dashboard/FormParts'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'

type TextKey = Exclude<keyof SiteForm, 'public_profile' | 'social' | 'accent_color'>

/** "Meu site": o corretor edita a própria página pública (`/corretor/:endereço`) sem mexer em código. */
function Editor({ initial }: { initial: MySiteData }) {
  const ws = useWorkspace()
  const [form, setForm] = useState<SiteForm>(() => toSiteForm(initial.site))
  const [saved, setSaved] = useState({ slug: initial.site.profile_slug, published: initial.site.public_profile })
  const [errors, setErrors] = useState<SiteErrors>({})
  const [busy, setBusy] = useState<'save' | 'photo' | 'cover' | null>(null)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const update = (patch: Partial<SiteForm>, clear: (keyof SiteErrors)[] = []) => {
    setForm((f) => ({ ...f, ...patch }))
    if (clear.some((k) => errors[k])) setErrors((x) => Object.fromEntries(Object.entries(x).filter(([k]) => !clear.includes(k as keyof SiteErrors))))
  }
  const text = (k: TextKey, extra: Record<string, unknown> = {}) => ({
    value: form[k],
    onChange: (e: { target: { value: string } }) => update({ [k]: e.target.value }, [k]),
    className: inputClass,
    ...extra,
  })

  async function submit(e: FormEvent) {
    e.preventDefault()
    const r = fromSiteForm(form, initial.extended)
    if (!r.patch) {
      setErrors(r.errors)
      setMsg({ tone: 'error', text: 'Revise os campos destacados.' })
      return
    }
    setBusy('save')
    setMsg(null)
    try {
      await saveMySite(ws.tenantId, initial.site.id, r.patch)
      setSaved({ slug: r.patch.profile_slug, published: r.patch.public_profile })
      setMsg({ tone: 'ok', text: r.patch.public_profile ? 'Salvo. Sua página já mostra as mudanças.' : 'Salvo. A página continua fora do ar até você publicar.' })
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível salvar.' })
    } finally {
      setBusy(null)
    }
  }

  async function onImage(kind: 'photo' | 'cover', file: File | undefined) {
    if (!file) return
    setBusy(kind)
    setMsg(null)
    try {
      const url = await uploadSiteImage(ws.tenantId, initial.site.id, kind, file)
      update(kind === 'photo' ? { photo_url: url } : { cover_url: url })
      setMsg({ tone: 'ok', text: 'Imagem enviada. Clique em "Salvar" para aplicar na página.' })
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível enviar a imagem.' })
    } finally {
      setBusy(null)
    }
  }

  const accentHex = form.accent_color ? ACCENT_COLORS[form.accent_color].hex : ACCENT_COLORS.navy.hex
  const pageUrl = saved.slug ? `/corretor/${saved.slug}` : null
  const pending = initial.accountStatus === 'pending'
  const err = (k: keyof SiteErrors) => errors[k]

  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="space-y-5 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Meu site</h1>
          <p className="mt-1 text-[14.5px] text-slate">Sua página profissional: apresentação, imóveis e contato pelo WhatsApp.</p>
        </div>
        {pageUrl && saved.published && !pending && (
          <a href={pageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800">
            Ver minha página <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        )}
      </div>

      {pending && (
        <p role="status" className="rounded-2xl bg-gold-400/25 p-4 text-[14.5px] text-navy-950">
          Sua conta está aguardando aprovação. Você já pode preencher tudo; a página vai ao ar assim que a conta for aprovada.
        </p>
      )}

      <Section title="Publicação" description="O endereço vai nos seus cartões, placas e no link do Instagram.">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <Field label="Endereço da página" error={err('profile_slug')} hint="Letras minúsculas, números e hífens.">
              <span className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-navy-950/15 bg-white focus-within:border-navy-800 focus-within:ring-2 focus-within:ring-navy-800/15">
                <span className="shrink-0 border-r border-navy-950/10 bg-sand px-3 py-3 text-[14px] text-slate">/corretor/</span>
                <input
                  value={form.profile_slug}
                  onChange={(e) => update({ profile_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }, ['profile_slug'])}
                  maxLength={48}
                  autoCapitalize="none"
                  spellCheck={false}
                  className="h-12 min-w-0 flex-1 bg-transparent px-3 text-[16px] text-navy-950 outline-none"
                />
              </span>
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-navy-950/10 p-4">
              <input
                type="checkbox"
                checked={form.public_profile}
                onChange={(e) => update({ public_profile: e.target.checked }, ['whatsapp'])}
                className="mt-0.5 size-5 accent-navy-950"
              />
              <span>
                <span className="block text-[15px] font-semibold text-navy-950">Página publicada</span>
                <span className="block text-[13px] text-slate">Desmarque para tirar a página do ar sem perder nada do que foi preenchido.</span>
              </span>
            </label>
          </div>
          <Preview form={form} accentHex={accentHex} />
        </div>
      </Section>

      <Section title="Apresentação">
        <div className="grid gap-5 sm:grid-cols-2">
          <ImagePicker
            label="Foto profissional"
            hint="Rosto bem iluminado, fundo neutro."
            url={form.photo_url}
            round
            busy={busy === 'photo'}
            disabled={busy !== null}
            onPick={(f) => void onImage('photo', f)}
            onClear={() => update({ photo_url: '' })}
          />
          <ImagePicker
            label="Imagem de capa"
            hint="Horizontal (ex.: 1600 × 600). Opcional."
            url={form.cover_url}
            busy={busy === 'cover'}
            disabled={busy !== null}
            onPick={(f) => void onImage('cover', f)}
            onClear={() => update({ cover_url: '' })}
          />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nome" error={err('name')}>
            <input {...text('name', { maxLength: 120, autoComplete: 'name' })} />
          </Field>
          <Field label="Título profissional" error={err('professional_title')} hint="Ex.: Corretora de imóveis">
            <input {...text('professional_title', { maxLength: 40 })} />
          </Field>
          <Field label="CRECI" hint="Exibido na página, como pedem as regras de publicidade do CRECI.">
            <input {...text('creci', { maxLength: 40, placeholder: 'CRECI-RN 00000-F' })} />
          </Field>
          <Field label="Anos de experiência" error={err('years_experience')}>
            <input {...text('years_experience', { inputMode: 'numeric', maxLength: 2 })} />
          </Field>
          <Field label="Frase de abertura" error={err('tagline')} hint="Ex.: Me chama que eu te ajudo a encontrar o imóvel ideal!" className="sm:col-span-2">
            <input {...text('tagline', { maxLength: 120 })} />
          </Field>
          <Field label="Especialidade em uma linha" error={err('headline')} hint="Ex.: Especialista em apartamentos na Zona Sul de Natal" className="sm:col-span-2">
            <input {...text('headline', { maxLength: 140 })} />
          </Field>
          <Field label="Sobre mim" error={err('bio')} className="sm:col-span-2">
            <textarea {...text('bio', { maxLength: 1500, rows: 5 })} className={cn(inputClass, 'h-auto py-3 leading-relaxed')} />
          </Field>
        </div>
      </Section>

      <Section title="Atuação" description="Separe os itens por vírgula.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cidade">
            <input {...text('city', { maxLength: 80 })} />
          </Field>
          <Field label="UF" error={err('state')}>
            <input {...text('state', { maxLength: 2 })} />
          </Field>
          <Field label="Regiões e bairros" error={err('regions')} hint="Ex.: Ponta Negra, Capim Macio, Parnamirim">
            <input {...text('regions')} />
          </Field>
          <Field label="Especialidades" error={err('specialties')} hint="Ex.: Lançamentos, Financiamento, Alto padrão">
            <input {...text('specialties')} />
          </Field>
          <Field label="Idiomas" error={err('languages')}>
            <input {...text('languages', { placeholder: 'Português, Inglês' })} />
          </Field>
          <Field label="Destaques" error={err('highlights')} hint="Um por linha. Só o que você pode comprovar.">
            <textarea {...text('highlights', { rows: 3 })} className={cn(inputClass, 'h-auto py-3 leading-relaxed')} />
          </Field>
        </div>
      </Section>

      <Section title="Contato" description="O botão de WhatsApp da página e dos imóveis abre conversa com este número.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="WhatsApp" error={err('whatsapp')}>
            <input {...text('whatsapp', { inputMode: 'tel', placeholder: '(84) 99999-9999' })} />
          </Field>
          <Field label="Telefone" error={err('phone')}>
            <input {...text('phone', { inputMode: 'tel' })} />
          </Field>
          <Field label="E-mail" error={err('email')}>
            <input {...text('email', { type: 'email', inputMode: 'email' })} />
          </Field>
        </div>
      </Section>

      <Section title="Redes sociais e buscadores">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram" error={err('instagram_url')}>
            <input {...text('instagram_url', { placeholder: 'https://instagram.com/seuperfil' })} />
          </Field>
          {initial.extended &&
            SOCIAL_KEYS.map((k) => (
              <Field key={k} label={SOCIAL_LABELS[k]} error={err(`social.${k}`)}>
                <input
                  value={form.social[k]}
                  onChange={(e) => update({ social: { ...form.social, [k]: e.target.value } }, [`social.${k}`])}
                  placeholder="https://…"
                  className={inputClass}
                />
              </Field>
            ))}
          {initial.extended && (
            <Field
              label="Descrição para o Google"
              error={err('seo_description')}
              hint={`${form.seo_description.trim().length}/160 · Aparece abaixo do seu nome nos resultados de busca.`}
              className="sm:col-span-2"
            >
              <input {...text('seo_description', { maxLength: 160 })} />
            </Field>
          )}
        </div>
      </Section>

      <Section title="Cor da página" description="Tons sóbrios, sempre legíveis com texto branco.">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor da página">
          {(Object.keys(ACCENT_COLORS) as BrokerAccent[]).map((c) => {
            const selected = (form.accent_color || 'navy') === c
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update({ accent_color: c })}
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-full border bg-white pr-4 pl-1.5 text-[13.5px] font-semibold text-navy-950',
                  selected ? 'border-navy-950 ring-2 ring-navy-950/15' : 'border-navy-950/12 hover:border-navy-950/30',
                )}
              >
                <span className="flex size-8 items-center justify-center rounded-full" style={{ background: ACCENT_COLORS[c].hex }}>
                  {selected && <Check className="size-4 text-white" aria-hidden="true" />}
                </span>
                {ACCENT_COLORS[c].label}
              </button>
            )
          })}
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

/** Miniatura do topo da página pública, atualizada enquanto o corretor digita. */
function Preview({ form, accentHex }: { form: SiteForm; accentHex: string }) {
  const initials = form.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-2xl border border-navy-950/10 bg-white">
      <div
        className="h-20 bg-cover bg-center"
        style={{ backgroundColor: accentHex, backgroundImage: form.cover_url ? `url("${form.cover_url}")` : undefined }}
      />
      <div className="-mt-9 px-4 pb-4">
        <span className="flex size-[72px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-navy-950 font-display text-[22px] font-bold text-gold-400">
          {form.photo_url ? <img src={form.photo_url} alt="" className="size-full object-cover" /> : initials || '?'}
        </span>
        <p className="mt-2 truncate font-display text-[17px] font-bold text-navy-950">{form.name || 'Seu nome'}</p>
        <p className="truncate text-[12.5px] text-slate">
          {[form.professional_title || 'Corretor de imóveis', form.creci].filter(Boolean).join(' · ')}
        </p>
        {form.tagline && <p className="mt-2 line-clamp-2 text-[13px] text-navy-950/80">{form.tagline}</p>}
        <span className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-semibold text-white" style={{ background: accentHex }}>
          <Globe className="size-3.5" />
          Falar no WhatsApp
        </span>
      </div>
    </div>
  )
}

function ImagePicker({
  label,
  hint,
  url,
  round,
  busy,
  disabled,
  onPick,
  onClear,
}: {
  label: string
  hint: string
  url: string
  round?: boolean
  busy: boolean
  disabled: boolean
  onPick: (file: File | undefined) => void
  onClear: () => void
}): ReactNode {
  return (
    <div>
      <p className="text-[14px] font-semibold text-navy-950">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden border border-navy-950/10 bg-sand',
            round ? 'size-20 rounded-full' : 'h-20 w-36 rounded-xl',
          )}
        >
          {url ? <img src={url} alt="" className="size-full object-cover" /> : <ImagePlus className="size-5 text-slate" aria-hidden="true" />}
        </span>
        <label
          className={cn(
            'inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-navy-950/15 bg-white px-4 text-[13.5px] font-semibold text-navy-800 hover:bg-sand',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
          {url ? 'Trocar' : 'Enviar'}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
        </label>
        {url && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear} aria-label={`Remover ${label.toLowerCase()}`}>
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <p className="mt-1.5 text-[12.5px] text-slate">{hint}</p>
    </div>
  )
}

export default function MySite() {
  usePageTitle('Meu site · Painel')
  const ws = useWorkspace()
  const brokerId = ws.brokerId
  const { data, error, loading } = useAsyncData(
    () => (brokerId ? getMySite(ws.tenantId, brokerId) : Promise.resolve(null)),
    `${ws.tenantId}:${brokerId}`,
  )
  if (!brokerId) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">Seu acesso não tem um cadastro de corretor nesta conta. Peça ao gerente para criar o seu em Equipe.</p>
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
  return <Editor key={`${ws.tenantId}:${brokerId}`} initial={data} />
}

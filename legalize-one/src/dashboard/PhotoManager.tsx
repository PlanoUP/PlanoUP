import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { cn } from '@/utils/cn'
import { deletePhoto, listPhotos, reorderPhotos, setCover, uploadPhoto, type PanelPhoto } from './mediaApi'

interface PhotoManagerProps {
  tenantId: string
  propertyId: string
  title: string
  editable: boolean
}

/** Fotos do imóvel: enviar (do celular ou computador), ordenar, escolher a capa e excluir. */
export function PhotoManager({ tenantId, propertyId, title, editable }: PhotoManagerProps) {
  const [version, setVersion] = useState(0)
  const { data: photos, loading } = useAsyncData(() => listPhotos(propertyId), `${propertyId}:${version}`)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const list = photos ?? []
  const refresh = () => setVersion((v) => v + 1)

  async function run(label: string, task: () => Promise<void>) {
    setBusy(label)
    setError('')
    try {
      await task()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado. Tente novamente.')
    } finally {
      setBusy(null)
      refresh()
    }
  }

  function upload(files: FileList | null) {
    const selected = [...(files ?? [])]
    if (!selected.length) return
    void run('upload', async () => {
      const failures: string[] = []
      let position = list.length
      const hasCover = list.some((p) => p.isCover)
      for (const [i, file] of selected.entries()) {
        setBusy(`upload:${i + 1}/${selected.length}`)
        try {
          await uploadPhoto(tenantId, propertyId, file, { position, isCover: false, alt: `${title} — foto ${position + 1}` })
          position += 1
        } catch (e) {
          failures.push(e instanceof Error ? e.message : file.name)
        }
      }
      // Sem capa ainda: a primeira foto vira capa (e aparece nos cards do site).
      if (!hasCover && position > 0) {
        const fresh = await listPhotos(propertyId)
        if (fresh[0]) await setCover(tenantId, propertyId, fresh[0])
      }
      if (failures.length) throw new Error(failures.join(' '))
    })
    if (input.current) input.current.value = ''
  }

  function move(index: number, delta: number) {
    const next = [...list]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    void run('order', () => reorderPhotos(next))
  }

  function remove(photo: PanelPhoto) {
    if (!window.confirm('Excluir esta foto? Esta ação não pode ser desfeita.')) return
    void run('delete', async () => {
      await deletePhoto(photo)
      if (photo.isCover) {
        const rest = list.filter((p) => p.id !== photo.id)
        await setCover(tenantId, propertyId, rest[0] ?? null)
      }
    })
  }

  const uploading = busy?.startsWith('upload')

  return (
    <div>
      {editable && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            id="photo-upload"
            onChange={(e) => upload(e.target.files)}
            disabled={Boolean(busy)}
          />
          <label
            htmlFor="photo-upload"
            className={cn(
              'inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-navy-800 px-5 text-sm font-semibold text-white hover:bg-navy-700',
              busy && 'pointer-events-none opacity-60',
            )}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
            {uploading ? `Enviando ${busy?.split(':')[1] ?? ''}…` : 'Adicionar fotos'}
          </label>
          <p className="text-[13px] text-slate">JPG, PNG ou WebP. As fotos são otimizadas automaticamente.</p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </p>
      )}

      {loading && !photos ? (
        <div className="mt-4 h-32 animate-pulse rounded-2xl bg-sand" aria-busy="true" />
      ) : list.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-navy-950/15 p-6 text-center text-[14px] text-slate">
          Nenhuma foto ainda.{editable ? ' A primeira foto enviada vira a capa.' : ''}
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-busy={Boolean(busy)}>
          {list.map((photo, i) => (
            <li key={photo.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-navy-950/8">
              <div className="relative aspect-[4/3] bg-sand-200">
                <img src={photo.url} alt={photo.alt ?? ''} loading="lazy" className="absolute inset-0 size-full object-cover" />
                {photo.isCover && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-navy-950/90 px-2.5 py-1 text-[11.5px] font-semibold text-gold-400">
                    <Star className="size-3" fill="currentColor" aria-hidden="true" />
                    Capa
                  </span>
                )}
                <span className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2 py-0.5 text-[11.5px] font-semibold text-navy-950 tabular-nums">
                  {i + 1}
                </span>
              </div>
              {editable && (
                <div className="flex items-center justify-between gap-1 p-1.5">
                  <div className="flex">
                    <IconButton label="Mover para a esquerda" disabled={Boolean(busy) || i === 0} onClick={() => move(i, -1)}>
                      <ArrowLeft className="size-4" />
                    </IconButton>
                    <IconButton label="Mover para a direita" disabled={Boolean(busy) || i === list.length - 1} onClick={() => move(i, 1)}>
                      <ArrowRight className="size-4" />
                    </IconButton>
                  </div>
                  <div className="flex">
                    <IconButton
                      label={photo.isCover ? 'Esta é a capa' : 'Usar como capa'}
                      disabled={Boolean(busy) || photo.isCover}
                      onClick={() => void run('cover', () => setCover(tenantId, propertyId, photo))}
                    >
                      <Star className="size-4" fill={photo.isCover ? 'currentColor' : 'none'} />
                    </IconButton>
                    <IconButton label="Excluir foto" disabled={Boolean(busy)} onClick={() => remove(photo)} danger>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex size-10 items-center justify-center rounded-full transition-colors disabled:opacity-35',
        danger ? 'text-red-700 hover:bg-red-50' : 'text-navy-950 hover:bg-sand',
      )}
    >
      {children}
    </button>
  )
}

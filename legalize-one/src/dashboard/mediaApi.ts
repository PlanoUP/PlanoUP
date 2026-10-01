import { storagePublicUrl } from '@/lib/images'
import { requireSupabase } from '@/lib/supabase'
import { PanelError, friendlyDbError } from './propertiesApi'

/** Fotos do imóvel: arquivo no Storage (`<tenant>/<imóvel>/<id>.webp`) + linha em property_media. */

const BUCKET = 'property-media'
/** Lado maior da foto enviada: nítida em tela cheia, leve no celular. */
const MAX_SIDE = 2000
const MAX_INPUT_BYTES = 25 * 1024 * 1024

export interface PanelPhoto {
  id: string
  url: string
  storagePath: string | null
  alt: string | null
  position: number
  isCover: boolean
}

function fail(error: { code?: string; message?: string }): never {
  throw new PanelError(friendlyDbError(error))
}

export async function listPhotos(propertyId: string): Promise<PanelPhoto[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('property_media')
    .select('id, url, storage_path, alt, position, is_cover')
    .eq('property_id', propertyId)
    .eq('kind', 'photo')
    .order('position')
  if (error) fail(error)
  return (data ?? []).map((m) => ({
    id: m.id as string,
    url: (m.url as string | null) || storagePublicUrl((m.storage_path as string | null) ?? ''),
    storagePath: (m.storage_path as string | null) ?? null,
    alt: (m.alt as string | null) ?? null,
    position: m.position as number,
    isCover: Boolean(m.is_cover),
  }))
}

/** Reduz e converte a foto no navegador (WebP; JPEG onde o navegador não gera WebP). */
export async function prepareImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new PanelError(`"${file.name}" não é uma imagem.`)
  if (file.size > MAX_INPUT_BYTES) throw new PanelError(`"${file.name}" é muito grande (máx. 25 MB).`)
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new PanelError(`Não foi possível ler "${file.name}". Envie em JPG, PNG ou WebP.`)
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
  const webp = await encode('image/webp', 0.82)
  if (webp && webp.type === 'image/webp') return webp
  const jpeg = await encode('image/jpeg', 0.85)
  if (!jpeg) throw new PanelError(`Não foi possível processar "${file.name}".`)
  return jpeg
}

export async function uploadPhoto(
  tenantId: string,
  propertyId: string,
  file: File,
  opts: { position: number; isCover: boolean; alt: string },
): Promise<void> {
  const blob = await prepareImage(file)
  const supabase = await requireSupabase()
  const id = crypto.randomUUID()
  const path = `${tenantId}/${propertyId}/${id}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false })
  if (uploadError) fail(uploadError)
  const { error } = await supabase.from('property_media').insert({
    id,
    tenant_id: tenantId,
    property_id: propertyId,
    kind: 'photo',
    url: storagePublicUrl(path, BUCKET),
    storage_path: path,
    alt: opts.alt,
    position: opts.position,
    is_cover: opts.isCover,
  })
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    fail(error)
  }
}

export async function deletePhoto(photo: PanelPhoto): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('property_media').delete().eq('id', photo.id)
  if (error) fail(error)
  if (photo.storagePath) await supabase.storage.from(BUCKET).remove([photo.storagePath])
}

/** Grava a nova ordem (posição = índice na lista). */
export async function reorderPhotos(photos: PanelPhoto[]): Promise<void> {
  const supabase = await requireSupabase()
  const changed = photos.map((p, i) => ({ p, i })).filter(({ p, i }) => p.position !== i)
  const results = await Promise.all(
    changed.map(({ p, i }) => supabase.from('property_media').update({ position: i }).eq('id', p.id)),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) fail(failed.error)
}

/**
 * Define a capa (uma por imóvel) e espelha a URL em `properties.cover_image_url`,
 * que é a imagem dos cards do site.
 */
export async function setCover(tenantId: string, propertyId: string, photo: PanelPhoto | null): Promise<void> {
  const supabase = await requireSupabase()
  const { error: clearError } = await supabase
    .from('property_media')
    .update({ is_cover: false })
    .eq('property_id', propertyId)
    .eq('is_cover', true)
  if (clearError) fail(clearError)
  if (photo) {
    const { error } = await supabase.from('property_media').update({ is_cover: true }).eq('id', photo.id)
    if (error) fail(error)
  }
  const { error } = await supabase
    .from('properties')
    .update({ cover_image_url: photo?.url ?? null })
    .eq('tenant_id', tenantId)
    .eq('id', propertyId)
  if (error) fail(error)
}

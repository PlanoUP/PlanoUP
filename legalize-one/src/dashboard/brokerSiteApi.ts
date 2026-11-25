import { requireSupabase } from '@/lib/supabase'
import type { BrokerSite, SitePatch } from './brokerSiteForm'
import { prepareImage } from './mediaApi'
import { PanelError, friendlyDbError } from './propertiesApi'
import { hasCorretorSchema } from './schema'

/** "Meu site": perfil público do corretor (tabela `brokers`; o corretor edita o próprio, o gerente qualquer um). */

const BASE_COLUMNS =
  'id, name, professional_title, tagline, headline, bio, creci, city, state, years_experience, specialties, regions, languages, highlights, whatsapp, phone, email, instagram_url, photo_url, cover_url, accent_color, profile_slug, public_profile'
const EXTENDED_COLUMNS = `${BASE_COLUMNS}, social_links, seo_description`

export interface MySite {
  site: BrokerSite
  /** O banco tem as colunas novas (outras redes, descrição para buscadores). */
  extended: boolean
  /** Situação da conta: `pending` = aguardando aprovação; a página só vai ao ar quando `active`. */
  accountStatus: string
}

function siteError(error: { code?: string; message?: string }): PanelError {
  if (error.code === '23505' && /profile_slug/.test(error.message ?? ''))
    return new PanelError('Este endereço já é usado por outro corretor. Escolha outro.')
  return new PanelError(friendlyDbError(error))
}

export async function getMySite(tenantId: string, brokerId: string): Promise<MySite> {
  const [supabase, extended] = await Promise.all([requireSupabase(), hasCorretorSchema()])
  const [broker, tenant] = await Promise.all([
    supabase
      .from('brokers')
      .select(extended ? EXTENDED_COLUMNS : BASE_COLUMNS)
      .eq('tenant_id', tenantId)
      .eq('id', brokerId)
      .single(),
    supabase.from('tenants').select('status').eq('id', tenantId).single(),
  ])
  if (broker.error) throw siteError(broker.error)
  return {
    site: broker.data as unknown as BrokerSite,
    extended,
    accountStatus: (tenant.data?.status as string | undefined) ?? 'active',
  }
}

export async function saveMySite(tenantId: string, brokerId: string, patch: SitePatch): Promise<void> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('brokers').update(patch).eq('tenant_id', tenantId).eq('id', brokerId).select('id')
  if (error) throw siteError(error)
  if (!data?.length) throw new PanelError('Você não tem permissão para alterar esta página.')
}

/** Foto de perfil ou capa: reduzida e convertida no navegador, enviada para a pasta da conta. */
export async function uploadSiteImage(tenantId: string, brokerId: string, kind: 'photo' | 'cover', file: File): Promise<string> {
  const blob = await prepareImage(file)
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const supabase = await requireSupabase()
  const path = `${tenantId}/broker-${brokerId}-${kind}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('tenant-assets').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' })
  if (error) {
    throw new PanelError(
      /row-level security|unauthorized|403/i.test(error.message)
        ? 'Só o gerente da conta pode enviar imagens. Peça a ele ou cole o endereço da imagem.'
        : 'Não foi possível enviar a imagem. Tente novamente.',
    )
  }
  return supabase.storage.from('tenant-assets').getPublicUrl(path).data.publicUrl
}

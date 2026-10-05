import { requireSupabase } from '@/lib/supabase'
import { PanelError, friendlyDbError } from './propertiesApi'

/** "Minha imobiliária": marca e contatos exibidos no site (tabela tenant_settings; só gerentes alteram). */

export interface TenantSettings {
  display_name: string
  legal_name: string | null
  tagline: string | null
  creci: string | null
  phone: string | null
  whatsapp: string | null
  whatsapp_message: string | null
  email: string | null
  address_line: string | null
  city: string | null
  state: string | null
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  instagram_url: string | null
  facebook_url: string | null
  business_hours: string | null
}

const COLUMNS =
  'display_name, legal_name, tagline, creci, phone, whatsapp, whatsapp_message, email, address_line, city, state, logo_url, primary_color, secondary_color, instagram_url, facebook_url, business_hours'

export async function getSettings(tenantId: string): Promise<TenantSettings> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('tenant_settings').select(COLUMNS).eq('tenant_id', tenantId).single()
  if (error) throw new PanelError(friendlyDbError(error))
  return data as TenantSettings
}

export async function saveSettings(tenantId: string, settings: TenantSettings): Promise<void> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('tenant_settings').update(settings).eq('tenant_id', tenantId).select('tenant_id')
  if (error) throw new PanelError(friendlyDbError(error))
  if (!data?.length) throw new PanelError('Você não tem permissão para alterar os dados da imobiliária.')
}

/** Envia o logo (PNG, JPG ou WebP, até 2 MB) para a pasta da imobiliária e devolve a URL pública. */
export async function uploadLogo(tenantId: string, file: File): Promise<string> {
  const types: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }
  const ext = types[file.type]
  if (!ext) throw new PanelError('Envie o logo em PNG, JPG ou WebP (PNG com fundo transparente fica melhor).')
  if (file.size > 2 * 1024 * 1024) throw new PanelError('Logo muito grande: o limite é 2 MB.')
  const supabase = await requireSupabase()
  const path = `${tenantId}/logo-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('tenant-assets').upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (error) throw new PanelError('Não foi possível enviar o logo. Tente novamente.')
  return supabase.storage.from('tenant-assets').getPublicUrl(path).data.publicUrl
}

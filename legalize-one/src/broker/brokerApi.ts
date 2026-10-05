import { requireSupabase } from '@/lib/supabase'
import type { BrokerTestimonial } from './types'

/** Depoimentos publicados do corretor (lista vazia = a seção não aparece). */
export async function listTestimonials(slug: string): Promise<BrokerTestimonial[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('get_broker_testimonials', { p_slug: slug })
  if (error) throw error
  return (data ?? []) as BrokerTestimonial[]
}

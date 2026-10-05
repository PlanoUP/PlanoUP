// Mantém o projeto Supabase ativo no plano gratuito (pausa após ~7 dias sem uso).
// Chamado 1x por dia pelo Vercel Cron (vercel.json). Faz uma leitura pública e leve:
// a mesma que o site faz ao abrir (identificar a imobiliária).
export default async function handler(_req, res) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return res.status(200).json({ ok: false, reason: 'backend_not_configured' })
  try {
    const r = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/rpc/resolve_tenant`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_hostname: null, p_slug: process.env.VITE_DEFAULT_TENANT || 'legalize' }),
    })
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, at: new Date().toISOString() })
  } catch (error) {
    return res.status(502).json({ ok: false, error: String(error) })
  }
}

-- =====================================================================================
-- Seed da plataforma: planos provisórios + tenant Legalize (marca e contato atuais do site).
-- Idempotente. O catálogo de imóveis atual será importado na etapa 2 (projeto Supabase real).
-- =====================================================================================

-- Planos PROVISÓRIOS (valores a validar comercialmente). null = ilimitado.
insert into public.plans (code, name, position, limits, features) values
  ('start', 'Start', 1,
    '{"max_properties": 30, "max_users": 2, "max_brokers": 3}',
    '{"model3d": false, "virtual_tour": true, "analytics_advanced": false, "reports": false, "premium_listings": false, "custom_domain": false, "support": "email"}'),
  ('pro', 'Pro', 2,
    '{"max_properties": 150, "max_users": 5, "max_brokers": 15}',
    '{"model3d": true, "virtual_tour": true, "analytics_advanced": true, "reports": true, "premium_listings": false, "custom_domain": true, "support": "whatsapp"}'),
  ('premium', 'Premium', 3,
    '{"max_properties": null, "max_users": 15, "max_brokers": null}',
    '{"model3d": true, "virtual_tour": true, "analytics_advanced": true, "reports": true, "premium_listings": true, "custom_domain": true, "support": "priority"}')
on conflict (code) do update set name = excluded.name, position = excluded.position,
  limits = excluded.limits, features = excluded.features;

-- Tenant Legalize (id fixo para referência em ambientes).
insert into public.tenants (id, slug, name, status, plan_code) values
  ('00000000-0000-4000-8000-000000000001', 'legalize', 'Legalize Soluções Imobiliárias', 'active', 'premium')
on conflict (id) do nothing;

insert into public.subscriptions (tenant_id, plan_code, status) values
  ('00000000-0000-4000-8000-000000000001', 'premium', 'active')
on conflict (tenant_id) do nothing;

insert into public.tenant_settings (tenant_id, display_name, legal_name, tagline, creci, phone, whatsapp,
  whatsapp_message, email, address_line, city, state, primary_color, secondary_color, business_hours,
  onboarding_completed_at) values
  ('00000000-0000-4000-8000-000000000001', 'Legalize', 'Legalize Soluções Imobiliárias', 'Do documento à chave.',
   'CRECI-RN 0000-J', '84999999999', '5584999999999',
   'Olá! Vim pelo site da Legalize e gostaria de falar com um especialista.',
   'contato@legalizeimoveis.com.br', 'Parnamirim · Natal', 'Natal', 'RN', '#071b2e', '#d9b47a',
   'Seg. a sáb., 8h às 18h', now())
on conflict (tenant_id) do nothing;

-- Domínios atuais do site da Legalize.
insert into public.tenant_domains (hostname, tenant_id, kind, is_primary, verified_at) values
  ('legalize-one.vercel.app', '00000000-0000-4000-8000-000000000001', 'custom', true, now()),
  ('legalize-one-plano-up.vercel.app', '00000000-0000-4000-8000-000000000001', 'custom', false, now())
on conflict (hostname) do nothing;

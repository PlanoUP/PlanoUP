-- Corretor de demonstração (/corretor/demo): conta "solo" fictícia, sem WhatsApp, com 6 imóveis copiados do
-- catálogo de exemplo e 3 depoimentos marcados como demonstração (source = 'demo').
-- Rodar uma vez, depois de 0009_broker_profiles.sql e de seed_catalog.sql.
insert into public.tenants (id, slug, name, plan_code, status, kind) values ('00000000-0000-4000-8000-0000000000c1', 'corretor-demo', 'Corretor de demonstração', 'premium', 'active', 'solo');
insert into public.tenant_settings (tenant_id, display_name, legal_name, city, state) values ('00000000-0000-4000-8000-0000000000c1', 'Lucas Andrade (demonstração)', 'Corretor de demonstração', 'Natal', 'RN');
insert into public.subscriptions (tenant_id, plan_code, status) values ('00000000-0000-4000-8000-0000000000c1', 'premium', 'active');
insert into public.brokers (id, tenant_id, name, creci, profile_slug, public_profile, is_demo, headline, bio, city, state, years_experience, specialties, regions, languages, highlights, photo_url, cover_url, accent_color)
values ('00000000-0000-4000-8000-0000000000c2', '00000000-0000-4000-8000-0000000000c1', 'Lucas Andrade', 'CRECI 00000-F (demonstração)', 'demo', true, true,
  'Especialista em imóveis residenciais e condomínios em Natal/RN',
  'Ajudo famílias e investidores a encontrarem imóveis que realmente façam sentido para seus objetivos. Acompanho cada etapa, da primeira visita à entrega das chaves, com atenção especial à documentação.',
  'Natal', 'RN', 8,
  array['Casas em condomínio', 'Apartamentos', 'Primeiro imóvel', 'Investimento'],
  array['Ponta Negra', 'Capim Macio', 'Nova Parnamirim', 'Tirol', 'Lagoa Nova'],
  array['Português', 'Espanhol'],
  array['Acompanho a documentação até a chave', 'Visitas presenciais e por vídeo', 'Atendimento também aos sábados'],
  '/demo/corretor-demo.svg',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=70',
  'navy');
insert into public.properties (tenant_id, broker_id, code, slug, title, type, purpose, status, price, condo_fee, iptu, description, zip_code, street, street_number, complement, neighborhood, city, state, latitude, longitude, hide_exact_address, bedrooms, suites, bathrooms, parking, built_area, total_area, floor, furnished, amenities, characteristics, featured, documentation_verified, cover_image_url, model3d, virtual_tour, published_at)
select '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000c2', replace(code, 'LG-', 'LA-'), slug, title, type, purpose, 'published', price, condo_fee, iptu, description, zip_code, street, street_number, complement, neighborhood, city, state, latitude, longitude, true, bedrooms, suites, bathrooms, parking, built_area, total_area, floor, furnished, amenities, characteristics, featured, documentation_verified, cover_image_url, model3d, virtual_tour, now()
from public.properties where tenant_id = '00000000-0000-4000-8000-000000000001' and code in ('LG-001','LG-002','LG-003','LG-005','LG-006','LG-008');
insert into public.property_media (tenant_id, property_id, kind, url, alt, position, is_cover, metadata)
select '00000000-0000-4000-8000-0000000000c1', d.id, m.kind, m.url, m.alt, m.position, m.is_cover, m.metadata
from public.property_media m
join public.properties l on l.id = m.property_id and l.tenant_id = '00000000-0000-4000-8000-000000000001'
join public.properties d on d.tenant_id = '00000000-0000-4000-8000-0000000000c1' and d.slug = l.slug;
insert into public.broker_testimonials (tenant_id, broker_id, author_name, rating, comment, testimonial_date, source, position) values
  ('00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000c2', 'Cliente de demonstração · Ana P.', 5, 'Depoimento de demonstração: o Lucas entendeu exatamente o que a nossa família precisava e encontrou a casa em poucas semanas.', '2026-08-12', 'demo', 0),
  ('00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000c2', 'Cliente de demonstração · Ricardo M.', 5, 'Depoimento de demonstração: atendimento atencioso, visitas bem organizadas e toda a documentação acompanhada de perto.', '2026-07-03', 'demo', 1),
  ('00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000c2', 'Cliente de demonstração · Juliana S.', 4, 'Depoimento de demonstração: comprei meu primeiro apartamento com muita segurança. Recomendo.', '2026-05-21', 'demo', 2);

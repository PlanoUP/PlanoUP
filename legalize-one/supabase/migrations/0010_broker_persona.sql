-- =====================================================================================
-- Persona do corretor no topo da página: título profissional ("Corretora de imóveis") e frase pessoal
-- ("Me chama e eu te ajudo a encontrar o imóvel ideal!"). Opcionais; só acréscimos.
-- =====================================================================================
alter table public.brokers
  add column professional_title text check (char_length(professional_title) between 3 and 40),
  add column tagline text check (char_length(tagline) <= 120);

create or replace function public.get_broker_profile(p_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'brokerId', b.id, 'tenantId', b.tenant_id, 'slug', b.profile_slug, 'isDemo', b.is_demo,
    'name', b.name, 'creci', b.creci, 'photoUrl', b.photo_url, 'coverUrl', b.cover_url, 'logoUrl', b.logo_url,
    'professionalTitle', b.professional_title, 'tagline', b.tagline,
    'headline', b.headline, 'bio', b.bio, 'city', b.city, 'state', b.state, 'yearsExperience', b.years_experience,
    'specialties', b.specialties, 'regions', b.regions, 'languages', b.languages, 'highlights', b.highlights,
    'whatsapp', b.whatsapp, 'phone', b.phone, 'email', b.email, 'instagramUrl', b.instagram_url,
    'accentColor', b.accent_color,
    'account', jsonb_build_object('kind', t.kind, 'slug', t.slug, 'name', s.display_name, 'logoUrl', s.logo_url,
                                  'primaryColor', s.primary_color, 'secondaryColor', s.secondary_color)
  )
  from private.public_broker(p_slug) b
  join public.tenants t on t.id = b.tenant_id
  join public.tenant_settings s on s.tenant_id = b.tenant_id
$$;

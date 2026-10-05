-- =====================================================================================
-- Painel — Resultados
--
-- `tenant_metrics(tenant, dias)`: resumo do período (e do período anterior, para comparação)
-- calculado no banco, sem expor eventos brutos ao navegador. Só gerente da imobiliária ou
-- admin da plataforma. Datas por dia no fuso de São Paulo.
-- O "Potencial de Conversão" é calculado no painel (src/dashboard/conversion.ts) a partir
-- destes números, com a regra explicada na tela.
-- =====================================================================================

create function public.tenant_metrics(p_tenant_id uuid, p_days integer default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_days integer := least(greatest(coalesce(p_days, 30), 1), 366);
  v_to timestamptz := now();
  v_from timestamptz := now() - make_interval(days => v_days);
  v_prev timestamptz := now() - make_interval(days => v_days * 2);
  v_result jsonb;
begin
  if not (private.is_tenant_manager(p_tenant_id) or private.is_platform_admin()) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  with ev as (
    select e.event_type, e.session_id, e.property_id, e.occurred_at, e.utm_source, e.referrer
    from public.analytics_events e
    where e.tenant_id = p_tenant_id and e.occurred_at >= v_prev
  ),
  ld as (
    select l.property_id, l.channel, l.created_at
    from public.leads l
    where l.tenant_id = p_tenant_id and l.created_at >= v_prev
  ),
  periods as (
    select 'current' as k, v_from as a, v_to as b
    union all select 'previous', v_prev, v_from
  ),
  totals as (
    select p.k, jsonb_build_object(
      'visitors', count(distinct ev.session_id) filter (where ev.event_type = 'page_view'),
      'page_views', count(ev.*) filter (where ev.event_type = 'page_view'),
      'property_views', count(ev.*) filter (where ev.event_type = 'property_view'),
      'property_viewers', count(distinct ev.session_id) filter (where ev.event_type = 'property_view'),
      'model3d_opens', count(ev.*) filter (where ev.event_type = '3d_open'),
      'model3d_interactions', count(ev.*) filter (where ev.event_type = '3d_interaction'),
      'tour_opens', count(ev.*) filter (where ev.event_type = 'tour_open'),
      'immersive_sessions', count(distinct ev.session_id) filter (where ev.event_type in ('3d_open', 'tour_open')),
      'whatsapp_clicks', count(ev.*) filter (where ev.event_type = 'whatsapp_click'),
      'visit_requests', count(ev.*) filter (where ev.event_type = 'visit_request'),
      'intent_sessions', count(distinct ev.session_id) filter (where ev.event_type in ('whatsapp_click', 'visit_request')),
      'searches', count(ev.*) filter (where ev.event_type = 'search'),
      'leads', (select count(*) from ld where ld.created_at >= p.a and ld.created_at < p.b)
    ) as data
    from periods p
    left join ev on ev.occurred_at >= p.a and ev.occurred_at < p.b
    group by p.k, p.a, p.b
  ),
  days as (
    select d::date as day
    from generate_series(
      (v_from at time zone 'America/Sao_Paulo')::date,
      (v_to at time zone 'America/Sao_Paulo')::date,
      interval '1 day'
    ) d
  ),
  daily as (
    select d.day,
      (select count(distinct ev.session_id) from ev
        where ev.event_type = 'page_view' and (ev.occurred_at at time zone 'America/Sao_Paulo')::date = d.day) as visitors,
      (select count(*) from ev
        where ev.event_type in ('whatsapp_click', 'visit_request')
          and (ev.occurred_at at time zone 'America/Sao_Paulo')::date = d.day) as contacts,
      (select count(*) from ld where (ld.created_at at time zone 'America/Sao_Paulo')::date = d.day) as leads
    from days d
  ),
  props as (
    select p.id, p.title, p.code, p.slug, p.status,
      coalesce((p.model3d ->> 'enabled')::boolean, false) as has3d,
      p.virtual_tour is not null as has_tour,
      count(ev.*) filter (where ev.event_type = 'property_view') as views,
      count(distinct ev.session_id) filter (where ev.event_type = 'property_view') as viewers,
      count(ev.*) filter (where ev.event_type = '3d_open') as model3d_opens,
      count(ev.*) filter (where ev.event_type = 'tour_open') as tour_opens,
      count(distinct ev.session_id) filter (where ev.event_type in ('3d_open', 'tour_open')) as immersive_sessions,
      count(ev.*) filter (where ev.event_type = 'whatsapp_click') as whatsapp_clicks,
      count(ev.*) filter (where ev.event_type = 'visit_request') as visit_requests,
      count(distinct ev.session_id) filter (where ev.event_type in ('whatsapp_click', 'visit_request')) as intent_sessions,
      (select count(*) from ld where ld.property_id = p.id and ld.created_at >= v_from) as leads
    from public.properties p
    left join ev on ev.property_id = p.id and ev.occurred_at >= v_from
    where p.tenant_id = p_tenant_id and p.status <> 'archived'
    group by p.id
  ),
  sources as (
    select coalesce(
             nullif(lower(s.utm_source), ''),
             nullif(regexp_replace(substring(s.referrer from '^https?://([^/:]+)'), '^www\.', ''), ''),
             'direto'
           ) as source,
           count(distinct s.session_id) as visitors
    from ev s
    where s.event_type = 'page_view' and s.occurred_at >= v_from
    group by 1
    order by 2 desc
    limit 8
  )
  select jsonb_build_object(
    'period', jsonb_build_object('days', v_days, 'from', v_from, 'to', v_to),
    'totals', (select data from totals where k = 'current'),
    'previous', (select data from totals where k = 'previous'),
    'daily', coalesce((select jsonb_agg(to_jsonb(daily) order by daily.day) from daily), '[]'::jsonb),
    'properties', coalesce((select jsonb_agg(to_jsonb(props) order by props.views desc, props.title) from props), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(to_jsonb(sources) order by sources.visitors desc) from sources), '[]'::jsonb)
  ) into v_result;

  return v_result;
end $$;

revoke execute on function public.tenant_metrics(uuid, integer) from public, anon;
grant execute on function public.tenant_metrics(uuid, integer) to authenticated;

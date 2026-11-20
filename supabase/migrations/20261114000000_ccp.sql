-- Landing de Cero Consultas Perdidas: lista de espera y conteo propio de eventos.
-- Fuente: Transfers/nocturna-medicion/EVENTOS-LANDING.md (secciones 1, 3, 4 y 6).
-- Se puede pegar entera en el SQL Editor de Supabase y volver a correr sin romper nada.
-- RLS activado y SIN políticas: solo la clave service_role (desde el servidor de la landing) lee y escribe.

-- 1. Inscriptos de la lista de espera (sección 4).
create table if not exists public.ccp_waitlist (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  nombre            text not null check (char_length(nombre) between 1 and 120),
  inmobiliaria      text not null check (char_length(inmobiliaria) between 1 and 120),
  whatsapp          text not null unique check (whatsapp ~ '^\+549[0-9]{10}$'),
  -- Las 5 respuestas del diagnóstico (consultas ya pasadas a mes) y la moneda de la comisión.
  consultas_mes     bigint not null check (consultas_mes > 0),
  visitas_mes       bigint not null check (visitas_mes >= 0),
  operaciones_mes   bigint not null check (operaciones_mes >= 0),
  comision          bigint not null check (comision > 0),
  moneda            text not null check (moneda in ('ARS', 'USD')),
  responde_a_tiempo smallint not null check (responde_a_tiempo between 0 and 10),
  -- El resultado que se le mostró (redondeado).
  valor_consulta    bigint not null,
  expuestas         bigint not null,
  escala            bigint not null,
  -- Primer toque (30 días).
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  fbclid            boolean not null default false,
  referrer          text,
  interno           boolean not null default false,
  -- true cuando salió el aviso por Telegram.
  notificado        boolean not null default false
);

create index if not exists ccp_waitlist_created_at_idx on public.ccp_waitlist (created_at desc);

-- 2. Eventos del embudo, uno por sesión del navegador (sección 1).
create table if not exists public.ccp_events (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  event        text not null check (event in ('funnel_visit', 'diagnostic_start', 'diagnostic_complete', 'waitlist_signup')),
  session_id   uuid not null,
  entry_page   text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  fbclid       boolean not null default false,
  referrer     text,
  interno      boolean not null default false,
  -- Id del inscripto en waitlist_signup (el mismo eventID que va al píxel).
  event_id     uuid,
  constraint ccp_events_session_event_key unique (session_id, event)
);

create index if not exists ccp_events_created_at_idx on public.ccp_events (created_at);

-- 3. Nadie más que la service_role.
alter table public.ccp_waitlist enable row level security;
alter table public.ccp_events enable row level security;
revoke all on public.ccp_waitlist from anon, authenticated;
revoke all on public.ccp_events from anon, authenticated;

-- 4. Conteo por día (hora de Buenos Aires), utm_content y evento, sin las visitas internas.
-- security_invoker: la vista respeta el RLS de ccp_events (solo la service_role la lee).
create or replace view public.ccp_daily_counts with (security_invoker = true) as
select
  (created_at at time zone 'America/Argentina/Buenos_Aires')::date as day,
  utm_content,
  event,
  count(*)::int as count
from public.ccp_events
where not interno
group by 1, 2, 3;

revoke all on public.ccp_daily_counts from anon, authenticated;

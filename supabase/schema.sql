-- Ruang Senja schema. Run once in Supabase: Dashboard → SQL Editor → paste → Run.
-- Safe to re-run (idempotent where it matters).

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  product          text not null check (product in ('tarot', 'palm', 'aura')),
  status           text not null default 'unused' check (status in ('unused', 'submitted', 'ready', 'expired')),

  -- where the code came from
  source           text not null default 'manual' check (source in ('manual', 'lynk')),
  buyer_email      text,
  lynk_key         text unique,          -- "<lynk ref>:<item index>:<unit>:<product>", makes webhook retries idempotent
  lynk_ref         text,
  note             text,

  -- intake
  nickname         text,
  wa_number        text,                 -- wa.me format, 628…
  focus            text,
  question         text,
  hand             text check (hand in ('kanan', 'kiri')),
  photo_path       text,
  photo_delete_at  timestamptz,
  photo_deleted_at timestamptz,
  submitted_at     timestamptz,

  -- result
  result_token     text unique,
  result_draft     jsonb,
  result           jsonb,
  delivered_at     timestamptz,
  wa_sent_at       timestamptz,
  expires_at       timestamptz,

  created_at       timestamptz not null default now()
);

create index if not exists orders_buyer_email_idx on public.orders (lower(buyer_email));
create index if not exists orders_status_idx on public.orders (status, submitted_at);

create table if not exists public.webhook_events (
  id          bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  status      text not null,             -- issued | duplicate | unmatched | ignored | error
  lynk_ref    text,
  email       text,
  detail      text,
  payload     jsonb
);

-- Lock everything down. The app talks to the database only from the server with the secret key,
-- which bypasses RLS. With RLS on and no policies, the public (publishable/anon) key can read nothing.
alter table public.orders enable row level security;
alter table public.webhook_events enable row level security;

-- Private bucket for palm/face photos. 10 MB cap, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Hourly cleanup (photos older than 24 h, readings older than 30 days).
-- Vercel Hobby only allows a daily cron, so Supabase calls the endpoint every hour instead.
-- 1. Database → Extensions: enable pg_cron and pg_net.
-- 2. Replace YOUR_SITE and YOUR_CRON_SECRET below, then run this block.
-- ---------------------------------------------------------------------------
-- select cron.schedule(
--   'ruang-senja-cleanup',
--   '7 * * * *',
--   $$ select net.http_get(
--        url := 'https://YOUR_SITE/api/cron/cleanup',
--        headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET')
--      ); $$
-- );

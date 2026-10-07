-- Ruang Senja schema. Run once in Supabase: Dashboard → SQL Editor → paste → Run.
-- Safe to re-run.

create extension if not exists pgcrypto;

-- One row per access code. Codes are pre-generated into stock, then assigned to a buyer.
--   stock   → generated, not sold yet
--   sold    → assigned to a buyer, waiting for their data on WhatsApp
--   reading → data received, reading in progress
--   ready   → reading published
--   expired → past the viewing window, personal data scrubbed
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  product          text not null check (product in ('tarot', 'palm', 'aura')),
  status           text not null default 'stock' check (status in ('stock', 'sold', 'reading', 'ready', 'expired')),

  -- sale
  source           text check (source in ('lynk', 'manual')),
  buyer_name       text,
  buyer_email      text,
  buyer_phone      text,                 -- wa.me format, 628…
  lynk_ref         text,
  lynk_key         text unique,          -- "<refId>:<item index>:<unit>:<product>", makes webhook retries idempotent
  lynk_answers     jsonb,                -- answers to Lynk "Additional Questions", if any
  note             text,
  sold_at          timestamptz,
  code_sent_at     timestamptz,
  data_received_at timestamptz,

  -- reading
  nickname         text,
  focus            text,
  hand             text check (hand in ('kanan', 'kiri')),
  result_token     text unique,
  result_draft     jsonb,
  result           jsonb,
  delivered_at     timestamptz,
  wa_sent_at       timestamptz,
  expires_at       timestamptz,

  created_at       timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status, product, created_at);

create table if not exists public.webhook_events (
  id          bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  status      text not null,             -- assigned | duplicate | unmatched | ignored | rejected | error
  lynk_ref    text,
  detail      text,
  payload     jsonb
);

-- Lock everything down. The app only talks to the database from the server with the secret key,
-- which bypasses RLS. With RLS on and no policies, the public keys can read nothing.
alter table public.orders enable row level security;
alter table public.webhook_events enable row level security;

-- Random code like RS7K-29QM. No I, O, 0 or 1.
create or replace function public.rs_new_code() returns text
language plpgsql as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  s text := 'RS';
  i int;
begin
  for i in 1..6 loop
    s := s || substr(alphabet, 1 + floor(random() * 32)::int, 1);
    if i = 2 then s := s || '-'; end if;
  end loop;
  return s;
end $$;

-- Assign one stock code to a buyer. Idempotent on p_lynk_key. If stock for the product is empty,
-- a fresh code is created so a paid order never fails.
create or replace function public.assign_code(
  p_product text, p_source text, p_lynk_key text, p_lynk_ref text,
  p_name text, p_email text, p_phone text, p_answers jsonb, p_note text
) returns public.orders
language plpgsql as $$
declare
  r public.orders;
begin
  if p_lynk_key is not null then
    select * into r from public.orders where lynk_key = p_lynk_key;
    if found then return r; end if;
  end if;

  select * into r from public.orders
   where status = 'stock' and product = p_product
   order by created_at
   limit 1
   for update skip locked;

  if not found then
    loop
      begin
        insert into public.orders (code, product) values (public.rs_new_code(), p_product) returning * into r;
        exit;
      exception when unique_violation then
        -- code collision, try again
      end;
    end loop;
  end if;

  update public.orders set
    status = 'sold', source = p_source, lynk_key = p_lynk_key, lynk_ref = p_lynk_ref,
    buyer_name = p_name, buyer_email = lower(p_email), buyer_phone = p_phone,
    lynk_answers = p_answers, note = p_note, sold_at = now()
  where id = r.id
  returning * into r;
  return r;
end $$;

revoke all on function public.assign_code(text, text, text, text, text, text, text, jsonb, text) from public, anon, authenticated;
revoke all on function public.rs_new_code() from public, anon, authenticated;
grant execute on function public.assign_code(text, text, text, text, text, text, text, jsonb, text) to service_role;
grant execute on function public.rs_new_code() to service_role;

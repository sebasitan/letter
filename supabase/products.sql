-- ============================================================
-- Akshar Studio — Product catalog tables
-- Run in Supabase: SQL Editor → New query → paste → Run
-- Replace the admin email below if different.
-- ============================================================

create table if not exists public.letter_types (
  slug           text primary key,
  name           text not null,
  description    text,
  price          integer not null default 0,
  image          text,
  emoji          text,
  is_bestseller  boolean default false,
  tagline        text,
  recipient_label text,
  prompt         text,
  placeholder    text,
  occasions      jsonb default '[]'::jsonb,
  tones          jsonb default '[]'::jsonb,
  accent         jsonb,
  is_active      boolean default true,
  sort_order     integer default 0
);

create table if not exists public.gifts (
  id           text primary key,
  name         text not null,
  description  text,
  price        integer not null default 0,
  emoji        text,
  image        text,
  personalised boolean default false,
  is_active    boolean default true,
  sort_order   integer default 0
);

create table if not exists public.paper_types (
  id          text primary key,
  name        text not null,
  description text,
  price       integer not null default 0,
  bg          text,
  is_active   boolean default true,
  sort_order  integer default 0
);

create table if not exists public.ink_colors (
  id          text primary key,
  name        text not null,
  hex         text,
  price       integer not null default 0,
  is_active   boolean default true,
  sort_order  integer default 0
);

create table if not exists public.gift_tiers (
  id          text primary key,
  name        text not null,
  description text,
  price       integer not null default 0,
  is_active   boolean default true,
  sort_order  integer default 0
);

-- RLS: anyone can READ active rows (public catalog);
--      only the admin email can read-all + write (manage).
do $$
declare t text;
begin
  foreach t in array array['letter_types','gifts','paper_types','ink_colors','gift_tiers'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s_public_read" on public.%I', t, t);
    execute format('create policy "%s_public_read" on public.%I for select using (is_active = true)', t, t);
    execute format('drop policy if exists "%s_admin_all" on public.%I', t, t);
    execute format($f$create policy "%s_admin_all" on public.%I for all to authenticated using ((auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com') with check ((auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com')$f$, t, t);
  end loop;
end $$;

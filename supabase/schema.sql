-- ============================================================
-- Akshar Studio — orders table
-- Run this in Supabase: SQL Editor → New query → paste → Run
-- ============================================================

create table if not exists public.orders (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  customer_name     text        not null,
  customer_phone    text        not null,
  customer_email    text,
  letter_type       text        not null,
  occasion          text,
  recipient_name    text        not null,
  relationship      text,
  message_to_write  text        not null,
  tone              text,
  mystery_tier      text        default 'none',
  delivery_address  text        not null,
  city              text,
  pincode           text,
  special_instructions text,
  total_price       integer     not null,
  status            text        not null default 'pending'
);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Allow anyone (anon key) to INSERT a new order from the website.
-- Reading orders is NOT allowed publicly — only via the Supabase
-- dashboard or the service_role key (admin), keeping customer data private.
create policy "Public can place orders"
  on public.orders
  for insert
  to anon
  with check (true);

-- Helpful index for sorting newest-first in the dashboard
create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

-- ============================================================
-- Corporate / bulk enquiries (quote requests)
-- ============================================================
create table if not exists public.corporate_enquiries (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  company_name      text not null,
  contact_person    text not null,
  work_email        text,
  phone             text not null,
  occasion          text,
  quantity_range    text,
  frequency         text,
  gift_tier         text,
  delivery_timeline text,
  cities            text,
  budget            text,
  requirements      text,
  status            text not null default 'new'
);

alter table public.corporate_enquiries enable row level security;

-- Public can submit an enquiry; nobody can read them publicly (admin only)
drop policy if exists "Public can submit corporate enquiry" on public.corporate_enquiries;
create policy "Public can submit corporate enquiry"
  on public.corporate_enquiries for insert
  to public
  with check (true);

create index if not exists corporate_enquiries_created_at_idx
  on public.corporate_enquiries (created_at desc);

-- ============================================================
-- Admin access — locked to the admin email only (most secure).
-- Replace the email below with your real admin account email.
-- ============================================================
drop policy if exists "Admin read orders" on public.orders;
create policy "Admin read orders" on public.orders for select to authenticated
  using ( (auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com' );

drop policy if exists "Admin update orders" on public.orders;
create policy "Admin update orders" on public.orders for update to authenticated
  using ( (auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com' )
  with check ( (auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com' );

drop policy if exists "Admin read enquiries" on public.corporate_enquiries;
create policy "Admin read enquiries" on public.corporate_enquiries for select to authenticated
  using ( (auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com' );

drop policy if exists "Admin update enquiries" on public.corporate_enquiries;
create policy "Admin update enquiries" on public.corporate_enquiries for update to authenticated
  using ( (auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com' )
  with check ( (auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com' );

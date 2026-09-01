-- ============================================================
-- Ever Yours — private admin notes on orders
-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- One column. `special_instructions` is what the CUSTOMER told us and
-- is written by place_order(); `admin_notes` is what YOU jot down about
-- the order (courier ref, what the draft still needs, who to call).
-- It is never exposed publicly — orders are admin-read-only already.
-- ============================================================

alter table public.orders
  add column if not exists admin_notes text;

-- No new policies needed: "Admin update orders" already covers every
-- column for the admin account, and there is no public SELECT on orders.

-- ============================================================
-- VERIFY (optional)
-- ============================================================
-- select column_name, data_type from information_schema.columns
--  where table_schema = 'public' and table_name = 'orders'
--    and column_name = 'admin_notes';

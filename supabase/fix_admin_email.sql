-- ============================================================
-- Ever Yours — point every admin policy at the admin account
-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- The admin account is sebas.stllioni@gmail.com. That spelling looks
-- like a typo and isn't — it is the real address the Supabase Auth user
-- was created with, so every RLS policy must match it exactly.
--
-- Getting this wrong fails SILENTLY: sign-in still succeeds, but every
-- admin list (orders, enquiries, catalog, reviews, FAQs, leads) comes
-- back empty because no row ever matches the policy.
--
-- Safe to re-run, and safe to run even if the policies are already
-- correct. If the admin account ever moves, change admin_email below
-- and re-run — that is the only edit needed.
-- ============================================================

do $$
declare
  admin_email constant text := 'sebas.stllioni@gmail.com';
  t text;
begin
  -- ── Orders ───────────────────────────────────────────────
  execute format($p$
    drop policy if exists "Admin read orders" on public.orders;
    create policy "Admin read orders" on public.orders for select to authenticated
      using ((auth.jwt() ->> 'email') = %L);
    drop policy if exists "Admin update orders" on public.orders;
    create policy "Admin update orders" on public.orders for update to authenticated
      using ((auth.jwt() ->> 'email') = %L) with check ((auth.jwt() ->> 'email') = %L);
  $p$, admin_email, admin_email, admin_email);

  -- ── Corporate enquiries ──────────────────────────────────
  execute format($p$
    drop policy if exists "Admin read enquiries" on public.corporate_enquiries;
    create policy "Admin read enquiries" on public.corporate_enquiries for select to authenticated
      using ((auth.jwt() ->> 'email') = %L);
    drop policy if exists "Admin update enquiries" on public.corporate_enquiries;
    create policy "Admin update enquiries" on public.corporate_enquiries for update to authenticated
      using ((auth.jwt() ->> 'email') = %L) with check ((auth.jwt() ->> 'email') = %L);
  $p$, admin_email, admin_email, admin_email);

  -- ── Catalog, reviews, FAQs ───────────────────────────────
  -- Skips any table that doesn't exist yet, so this runs cleanly
  -- whether or not products.sql / reviews.sql / faqs.sql have been run.
  foreach t in array array['letter_types','gifts','paper_types','ink_colors',
                           'gift_tiers','reviews','faqs'] loop
    if to_regclass('public.' || t) is null then
      raise notice 'skipping %, table not created yet', t;
      continue;
    end if;
    execute format('drop policy if exists "%s_admin_all" on public.%I', t, t);
    execute format(
      'create policy "%s_admin_all" on public.%I for all to authenticated '
      'using ((auth.jwt() ->> ''email'') = %L) with check ((auth.jwt() ->> ''email'') = %L)',
      t, t, admin_email, admin_email);
  end loop;
end $$;


-- ============================================================
-- VERIFY — every row should say OK
-- ============================================================
select tablename || ' / ' || policyname as policy,
       case when qual like '%sebas.stllioni@gmail.com%' then 'OK'
            else 'FAIL — points at the wrong address' end as result
from pg_policies
where schemaname = 'public'
  and qual like '%auth.jwt%email%'
order by tablename, policyname;

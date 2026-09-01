-- ============================================================
-- Ever Yours — repoint every admin policy at the correct email
-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- WHY: the policies were created comparing the JWT email against
-- 'sebas.stllioni@gmail.com' — missing the 'a'. Signing in worked, but
-- every admin list came back empty because no row ever matched. This
-- drops and recreates them against the real address.
--
-- Safe to re-run. Change ADMIN_EMAIL below if the account ever moves.
-- ============================================================

do $$
declare
  admin_email constant text := 'sebas.stallioni@gmail.com';
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
       case when qual like '%sebas.stallioni@gmail.com%' then 'OK'
            else 'FAIL — still points elsewhere' end as result
from pg_policies
where schemaname = 'public'
  and qual like '%auth.jwt%email%'
order by tablename, policyname;

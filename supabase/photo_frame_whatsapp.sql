-- ============================================================
-- Ever Yours - Photo Frame: say how the photo is collected
-- Run in Supabase: SQL Editor -> New query -> paste -> Run
--
-- WHY: Photo Frame carries a PERSONALISED badge and a 3-4 day estimate,
-- but asks for nothing - because a photo needs an upload we have not
-- built. Sitting next to a keychain that DOES ask for a name, that reads
-- as a bug, and the customer is left wondering where to send the photo.
--
-- Until Supabase Storage is wired up, we say it plainly on the card: the
-- photo is collected on WhatsApp, along with the draft we already send
-- within 24 hours. No new plumbing, no unanswered question.
--
-- 'whatsapp' means: show the note, ask for nothing, never block the order.
-- Safe to re-run.
-- ============================================================

-- ============================================================
-- STEP 1 - allow the new type
-- ============================================================
alter table public.gifts drop constraint if exists gifts_personalisation_type_chk;
alter table public.gifts add constraint gifts_personalisation_type_chk
  check (personalisation_type in ('none', 'name', 'date', 'whatsapp', 'photo', 'link'));


-- ============================================================
-- STEP 2 - Photo Frame collects its photo on WhatsApp
-- Only touches the row while it is still unconfigured, so your own
-- wording survives a re-run.
-- ============================================================
update public.gifts set
  personalisation_type  = 'whatsapp',
  personalisation_label = 'We''ll ask for your photo on WhatsApp'
where id = 'photo-frame' and personalisation_type = 'none';


-- ============================================================
-- STEP 3 - place_order() must not reject these
-- The previous version demanded text for anything not 'none', which
-- would now refuse every Photo Frame order. Only 'name' and 'date' are
-- answered in the form; 'whatsapp' is collected later by a human.
-- ============================================================
create or replace function public.place_order(
  p_customer_name        text,
  p_customer_phone       text,
  p_customer_email       text,
  p_letter_slug          text,
  p_recipient_name       text,
  p_relationship         text,
  p_occasion             text,
  p_message              text,
  p_tone                 text,
  p_letter_lang          text,
  p_paper_id             text,
  p_ink_id               text,
  p_gift_mode            text,     -- 'surprise' | 'choose'
  p_tier_id              text,
  p_gift_items           jsonb,    -- [{"id":"...","qty":2}, ...]
  p_delivery_address     text,
  p_area                 text,
  p_city                 text,
  p_state                text,
  p_pincode              text,
  p_delivery_phone       text,
  p_surprise             boolean,
  p_special_instructions text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  MAX_PER_IP  constant integer := 5;
  MAX_GLOBAL  constant integer := 100;
  IP_SALT     constant text    := 'akshar-0683dae2489fa67229e82f3f1329f2d3';

  v_headers      text;
  v_ip           text;
  v_hash         text;
  v_hits         integer;

  v_digits       text;
  v_pin          text;

  v_letter_name  text;
  v_letter_price integer;
  v_paper_name   text;
  v_paper_price  integer := 0;
  v_ink_name     text;
  v_ink_price    integer := 0;
  v_tier_name    text;
  v_gift_total   integer := 0;
  v_gift_names   text;
  v_missing      text;
  v_gift_summary text;
  v_total        integer;

  v_dphone       text;
  v_instructions text;
  v_order_id     bigint;
begin
  -- ══ 1. Validate what the customer sent ══════════════════════
  if coalesce(btrim(p_customer_name), '') = '' then
    raise exception 'Please enter your name.' using errcode = 'check_violation';
  end if;

  v_digits := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g');
  if length(v_digits) < 10 or length(v_digits) > 15 or v_digits ~ '^(.)\1+$' then
    raise exception 'Please enter a valid WhatsApp number.' using errcode = 'check_violation';
  end if;

  if coalesce(btrim(p_recipient_name), '') = '' then
    raise exception 'Please tell us who the letter is for.' using errcode = 'check_violation';
  end if;

  if coalesce(btrim(p_message), '') = '' then
    raise exception 'Please tell us what the letter should say.' using errcode = 'check_violation';
  end if;

  if length(p_message) > 5000 then
    raise exception 'That message is too long — please keep it under 5000 characters.' using errcode = 'check_violation';
  end if;

  if coalesce(btrim(p_delivery_address), '') = '' then
    raise exception 'Please enter a delivery address.' using errcode = 'check_violation';
  end if;

  v_pin := regexp_replace(coalesce(p_pincode, ''), '[^0-9]', '', 'g');
  if length(v_pin) <> 6 then
    raise exception 'Please enter a valid 6-digit pincode.' using errcode = 'check_violation';
  end if;

  if jsonb_typeof(coalesce(p_gift_items, '[]'::jsonb)) <> 'array' then
    raise exception 'Invalid gift selection.' using errcode = 'check_violation';
  end if;
  if jsonb_array_length(coalesce(p_gift_items, '[]'::jsonb)) > 20 then
    raise exception 'Too many gift items in one order.' using errcode = 'check_violation';
  end if;

  -- ══ 2. Rate limit — orders fail LOUDLY, never silently ══════
  v_headers := current_setting('request.headers', true);
  if v_headers is not null and v_headers <> '' then
    v_ip := btrim(split_part(coalesce(v_headers::json ->> 'x-forwarded-for', ''), ',', 1));
  end if;

  if coalesce(v_ip, '') <> '' then
    v_hash := md5(v_ip || IP_SALT);

    insert into public.request_throttle as t (bucket, ip_hash, window_start, hits)
    values ('order', v_hash, now(), 1)
    on conflict (bucket, ip_hash) do update set
      window_start = case when t.window_start < now() - interval '1 hour'
                          then now() else t.window_start end,
      hits         = case when t.window_start < now() - interval '1 hour'
                          then 1 else t.hits + 1 end
    returning t.hits into v_hits;

    if v_hits > MAX_PER_IP then
      raise exception 'Too many orders from this connection in the last hour. Please message us on WhatsApp and we will place it for you.'
        using errcode = 'check_violation';
    end if;

    if random() < 0.01 then
      delete from public.request_throttle where window_start < now() - interval '1 day';
    end if;
  end if;

  if (select count(*) from public.orders
       where created_at > now() - interval '1 hour') >= MAX_GLOBAL then
    raise exception 'We are receiving an unusual number of orders right now. Please message us on WhatsApp.'
      using errcode = 'check_violation';
  end if;

  -- ══ 3. Price the order from the catalog — NOT from the client ══
  select name, price into v_letter_name, v_letter_price
    from public.letter_types
   where slug = p_letter_slug and is_active;

  if v_letter_name is null then
    raise exception 'That letter type is not available. (If you are the site owner: seed the catalog via Products → Import current defaults.)'
      using errcode = 'check_violation';
  end if;

  select name, price into v_paper_name, v_paper_price
    from public.paper_types where id = p_paper_id and is_active;
  v_paper_price := coalesce(v_paper_price, 0);

  select name, price into v_ink_name, v_ink_price
    from public.ink_colors where id = p_ink_id and is_active;
  v_ink_price := coalesce(v_ink_price, 0);

  if p_letter_slug = 'mystery' then
    -- The mystery box price already includes the gift the studio picks.
    v_gift_total   := 0;
    v_gift_summary := 'Mystery Box (gift curated by studio)';

  elsif p_gift_mode = 'choose' then
    with items as (
      select it ->> 'id' as gid,
             case when (it ->> 'qty') ~ '^[0-9]{1,3}$'
                  then least(greatest((it ->> 'qty')::int, 1), 10)
                  else 1 end as qty,
             -- What to engrave / print. Trimmed and capped here: the client
             -- limit is a convenience, this is the one that counts.
             left(btrim(coalesce(it ->> 'custom', '')), 60) as custom
        from jsonb_array_elements(coalesce(p_gift_items, '[]'::jsonb)) it
    )
    select coalesce(sum(g.price * i.qty), 0),
           -- The engraving text rides along in the order summary, so whoever
           -- packs the parcel reads it in the same line as the gift name.
           string_agg(g.name
                      || case when i.qty > 1 then ' x' || i.qty else '' end
                      || case when i.custom <> '' then ' [' || i.custom || ']' else '' end,
                      ', ' order by g.sort_order),
           -- Anything personalised that arrived with nothing to engrave.
           string_agg(g.name, ', ') filter (
             where coalesce(g.personalisation_type, 'none') in ('name', 'date')
               and i.custom = '')
      into v_gift_total, v_gift_names, v_missing
      from items i
      join public.gifts g on g.id = i.gid and g.is_active;

    -- Refuse rather than guess. A blank engraving is a ruined gift and a
    -- refund, and the customer has already left the page by the time we find out.
    if v_missing is not null then
      raise exception 'Tell us what to engrave on: %', v_missing
        using errcode = 'check_violation';
    end if;

    v_gift_total   := coalesce(v_gift_total, 0);
    v_gift_summary := case when v_gift_names is null
                           then 'No gift'
                           else 'Chosen gifts: ' || v_gift_names end;

  else
    select name, price into v_tier_name, v_gift_total
      from public.gift_tiers where id = p_tier_id and is_active;
    v_gift_total   := coalesce(v_gift_total, 0);
    v_gift_summary := 'Surprise gift: ' || coalesce(v_tier_name, 'No Gift');
  end if;

  v_total := v_letter_price + v_paper_price + v_ink_price + v_gift_total;

  -- ══ 4. Build the studio-facing notes from what was actually priced ══
  v_dphone := case when coalesce(p_surprise, false)
                   then btrim(p_customer_phone)
                   else btrim(coalesce(p_delivery_phone, p_customer_phone)) end;

  v_instructions := concat_ws(' | ',
    'Letter language: ' || left(coalesce(nullif(btrim(p_letter_lang), ''), 'English'), 30),
    'Paper: ' || coalesce(v_paper_name, 'Classic Parchment'),
    'Ink: '   || coalesce(v_ink_name,   'Classic Black'),
    'Delivery contact: ' || v_dphone ||
      case when coalesce(p_surprise, false) then ' (surprise — contact buyer)' else '' end,
    v_gift_summary,
    nullif(left(btrim(coalesce(p_special_instructions, '')), 1000), '')
  );

  -- ══ 5. Store it ═════════════════════════════════════════════
  insert into public.orders (
    customer_name, customer_phone, customer_email,
    letter_type, occasion, recipient_name, relationship,
    message_to_write, tone, mystery_tier,
    delivery_address, city, pincode,
    special_instructions, total_price, status
  ) values (
    left(btrim(p_customer_name), 120),
    left(btrim(p_customer_phone), 20),
    nullif(left(btrim(coalesce(p_customer_email, '')), 160), ''),
    v_letter_name,
    nullif(left(btrim(coalesce(p_occasion, '')), 80), ''),
    left(btrim(p_recipient_name), 120),
    nullif(left(btrim(coalesce(p_relationship, '')), 80), ''),
    left(p_message, 5000),
    nullif(left(btrim(coalesce(p_tone, '')), 60), ''),
    left(coalesce(v_gift_names, v_tier_name, 'No Gift'), 300),
    left(concat_ws(', ',
      nullif(btrim(p_delivery_address), ''),
      nullif(btrim(coalesce(p_area, '')), ''),
      nullif(btrim(coalesce(p_state, '')), '')), 600),
    nullif(left(btrim(coalesce(p_city, '')), 80), ''),
    v_pin,
    v_instructions,
    v_total,
    'pending'
  )
  returning id into v_order_id;

  -- The caller shows this total on the confirmation screen, so the
  -- customer always sees the price the server actually charged.
  return jsonb_build_object('id', v_order_id, 'total', v_total);
end;
$fn$;

revoke all on function public.place_order(text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,text,boolean,text) from public;
grant execute on function public.place_order(text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,text,boolean,text) to anon, authenticated;


-- ============================================================
-- VERIFY - every row should say OK
-- ============================================================
select 'photo frame configured' as check,
       case when exists (select 1 from public.gifts
                          where id='photo-frame' and personalisation_type='whatsapp')
            then 'OK' else 'FAIL' end as result
union all
select 'place_order allows whatsapp gifts',
       case when (select prosrc from pg_proc where proname='place_order')
                 like '%in (''name'', ''date'')%'
            then 'OK' else 'FAIL - step 3 did not run' end;

-- ============================================================
-- Ever Yours — COMPLETE SETUP.  Run this ONE file.
--
-- HOW: Supabase dashboard → SQL Editor → New query → paste all of
--      this → Run.  It is safe to run more than once.
--
-- ORDER MATTERS and is handled for you:
--   1. Seed the product catalog  (server-side pricing reads from it)
--   2. admin_notes column        (private notes in the admin)
--   3. order_leads               (abandoned-order capture)
--   4. place_order()             (server-side pricing + orders lockdown)
--
-- PREREQUISITE: schema.sql and products.sql must already have been run
-- (they create the orders / corporate_enquiries / catalog tables).
-- If you are unsure, run those two first — both are safe to re-run.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- STEP 1 — Seed the product catalog
-- Prices live here now. The order form sends ids; the server reads
-- these rows to work out what to charge. Existing rows are left
-- alone (on conflict do nothing), so editing prices in the admin
-- later is safe and re-running this will not overwrite your changes.
-- ════════════════════════════════════════════════════════════
-- ── Letter types ──
insert into public.letter_types (slug,name,description,price,image,emoji,is_bestseller,tagline,recipient_label,prompt,placeholder,occasions,tones,accent,is_active,sort_order)
  values ('love','Love Letter','Confession, anniversary, distance, or a proposal worth remembering forever.',499,'/images/love.png','❤️',false,'Pour your heart out — we''ll turn it into words they''ll keep forever.','Who''s your special someone?','How did you meet? What do you love most about them? A moment you both treasure?','Tell us your story — how you met, what you adore about them, the little inside jokes, a memory that defines you two...','["Anniversary","Proposal","Confession","Long distance","Just because"]'::jsonb,'["Warm & Loving","Poetic & Romantic","Playful & Fun","Deep & Heartfelt"]'::jsonb,'{"tint":"#FBE3DB","icon":"#B5593A","border":"#E2A18E","glow":"rgba(181,89,58,0.25)"}'::jsonb,true,1)
  on conflict (slug) do nothing;
insert into public.letter_types (slug,name,description,price,image,emoji,is_bestseller,tagline,recipient_label,prompt,placeholder,occasions,tones,accent,is_active,sort_order)
  values ('healing','Healing / Breakup Letter','Goodbye, closure, forgiveness, moving on — the words you need to say.',599,'/images/healing.png','🩹',false,'Say what''s been weighing on you. We''ll help you find the words for closure.','Who is this letter for?','What do you need to say or release? What would closure feel like for you?','Share what''s on your heart — what you need to let go of, forgive, or finally say. There''s no wrong way to feel.','["Goodbye","Closure","Forgiveness","Moving on","Letting go"]'::jsonb,'["Gentle & Kind","Honest & Raw","Calm & Reflective","Forgiving"]'::jsonb,'{"tint":"#E0ECE2","icon":"#5E7E66","border":"#A6C1AD","glow":"rgba(94,126,102,0.25)"}'::jsonb,true,2)
  on conflict (slug) do nothing;
insert into public.letter_types (slug,name,description,price,image,emoji,is_bestseller,tagline,recipient_label,prompt,placeholder,occasions,tones,accent,is_active,sort_order)
  values ('birthday','Birthday Letter','Parents to child, best friend, or a milestone birthday made unforgettable.',399,'/images/birthday-letter.png','🎂',false,'Make their day unforgettable with words written just for them.','Whose birthday is it?','What makes them special? A favourite memory, an inside joke, your wish for them?','Tell us about them — what you admire, a memory that makes you smile, what you wish for them this year...','["Milestone birthday","For a parent","For a child","For a best friend","Surprise"]'::jsonb,'["Joyful & Celebratory","Warm & Heartfelt","Funny & Playful","Sentimental"]'::jsonb,'{"tint":"#FAE7C6","icon":"#B98A1E","border":"#E0C275","glow":"rgba(196,154,46,0.28)"}'::jsonb,true,3)
  on conflict (slug) do nothing;
insert into public.letter_types (slug,name,description,price,image,emoji,is_bestseller,tagline,recipient_label,prompt,placeholder,occasions,tones,accent,is_active,sort_order)
  values ('apology','Apology Letter','Sorry to a partner, family, or an old friend — sincerity, beautifully written.',499,'/images/apology.png','💬',false,'Some things are hard to say. Let us help you say sorry, sincerely.','Who do you want to apologise to?','What happened? What do you wish you could take back? How do you want to make it right?','Tell us honestly — what you''re sorry for, what they mean to you, and how you hope to make things right.','["To a partner","To family","To a friend","Rebuilding trust","Making amends"]'::jsonb,'["Sincere & Humble","Heartfelt & Honest","Gentle","Earnest"]'::jsonb,'{"tint":"#E1E8F0","icon":"#51708C","border":"#A6BCD0","glow":"rgba(81,112,140,0.25)"}'::jsonb,true,4)
  on conflict (slug) do nothing;
insert into public.letter_types (slug,name,description,price,image,emoji,is_bestseller,tagline,recipient_label,prompt,placeholder,occasions,tones,accent,is_active,sort_order)
  values ('family','Family Letter','Newborn, leaving home, Mother''s Day, Father''s Day — for the people who raised you.',599,'/images/family.png','👨‍👩‍👧',false,'For the people who raised you, or the ones you''re raising — words that last generations.','Who is this letter for?','What do they mean to you? A lesson they taught you, a memory, a hope for the future?','Share what''s in your heart — the lessons, the memories, the gratitude you''ve never quite put into words.','["Newborn / Time capsule","Leaving home","Mother''s Day","Father''s Day","Gratitude"]'::jsonb,'["Warm & Grateful","Nostalgic","Loving & Tender","Heartfelt"]'::jsonb,'{"tint":"#FBE4D2","icon":"#BE7048","border":"#E3B493","glow":"rgba(190,112,72,0.25)"}'::jsonb,true,5)
  on conflict (slug) do nothing;
insert into public.letter_types (slug,name,description,price,image,emoji,is_bestseller,tagline,recipient_label,prompt,placeholder,occasions,tones,accent,is_active,sort_order)
  values ('mystery','Mystery Box','We write the letter AND choose the gift. A total surprise, curated for them.',1099,'/images/mystery.png','🎁',true,'Tell us about them — we''ll write the letter AND choose the perfect gift.','Who is the surprise for?','Tell us about them so we can curate the perfect gift — their personality, interests, what makes them light up.','Describe them — what they love, their style, hobbies, favourite things, and the feeling you want to give them.','["Surprise","Celebration","Thinking of you","Special occasion","Just because"]'::jsonb,'["Warm & Loving","Playful & Fun","Elegant & Thoughtful","Surprise me"]'::jsonb,null,true,6)
  on conflict (slug) do nothing;

-- ── Gifts ──
insert into public.gifts (id,name,description,price,emoji,image,personalised,is_active,sort_order)
  values ('dried-flowers','Dried Flower Bouquet','Preserved blooms',399,'🌸','/images/gifts/dried-flowers.png',false,true,1) on conflict (id) do nothing;
insert into public.gifts (id,name,description,price,emoji,image,personalised,is_active,sort_order)
  values ('candle','Scented Soy Candle','Warm vanilla glow',349,'🕯️','/images/gifts/candle.png',false,true,2) on conflict (id) do nothing;
insert into public.gifts (id,name,description,price,emoji,image,personalised,is_active,sort_order)
  values ('chocolates','Premium Chocolates','Handpicked box',299,'🍫','/images/gifts/chocolates.png',false,true,3) on conflict (id) do nothing;
insert into public.gifts (id,name,description,price,emoji,image,personalised,is_active,sort_order)
  values ('succulent','Mini Succulent','A living keepsake',249,'🪴','/images/gifts/succulent.png',false,true,4) on conflict (id) do nothing;
insert into public.gifts (id,name,description,price,emoji,image,personalised,is_active,sort_order)
  values ('photo-frame','Photo Frame','Personalised • your photo framed',499,'🖼️','/images/gifts/photo-frame.png',true,true,5) on conflict (id) do nothing;
insert into public.gifts (id,name,description,price,emoji,image,personalised,is_active,sort_order)
  values ('keychain','Name Keychain','Personalised • engraved name',199,'🔑','/images/gifts/keychain.png',true,true,6) on conflict (id) do nothing;
insert into public.gifts (id,name,description,price,emoji,image,personalised,is_active,sort_order)
  values ('bracelet','Minimalist Bracelet','Dainty & elegant',399,'📿','/images/gifts/bracelet.png',false,true,7) on conflict (id) do nothing;
insert into public.gifts (id,name,description,price,emoji,image,personalised,is_active,sort_order)
  values ('song-plaque','Song Plaque','Personalised • scan to play',449,'🎵','/images/gifts/song-plaque.png',true,true,8) on conflict (id) do nothing;

-- ── Paper types ──
insert into public.paper_types (id,name,description,price,bg,is_active,sort_order)
  values ('parchment','Classic Parchment','Warm aged tone',0,'#F4E6CE',true,1) on conflict (id) do nothing;
insert into public.paper_types (id,name,description,price,bg,is_active,sort_order)
  values ('ivory','Ivory Cotton','Smooth & premium',49,'#FBF6EC',true,2) on conflict (id) do nothing;
insert into public.paper_types (id,name,description,price,bg,is_active,sort_order)
  values ('textured','Handmade Textured','Artisan deckle edge',99,'#EFE3CE',true,3) on conflict (id) do nothing;
insert into public.paper_types (id,name,description,price,bg,is_active,sort_order)
  values ('vintage','Aged Vintage','Tea-stained look',99,'#E7D3AE',true,4) on conflict (id) do nothing;

-- ── Ink colours ──
insert into public.ink_colors (id,name,hex,price,is_active,sort_order)
  values ('black','Classic Black','#2B2B2B',0,true,1) on conflict (id) do nothing;
insert into public.ink_colors (id,name,hex,price,is_active,sort_order)
  values ('sepia','Sepia Brown','#5C3A2E',0,true,2) on conflict (id) do nothing;
insert into public.ink_colors (id,name,hex,price,is_active,sort_order)
  values ('blue','Royal Blue','#1E3A8A',0,true,3) on conflict (id) do nothing;
insert into public.ink_colors (id,name,hex,price,is_active,sort_order)
  values ('burgundy','Burgundy','#7A1F2B',0,true,4) on conflict (id) do nothing;
insert into public.ink_colors (id,name,hex,price,is_active,sort_order)
  values ('emerald','Emerald','#1F5C46',0,true,5) on conflict (id) do nothing;
insert into public.ink_colors (id,name,hex,price,is_active,sort_order)
  values ('gold','Gold (metallic)','#B8860B',49,true,6) on conflict (id) do nothing;

-- ── Surprise gift tiers ──
insert into public.gift_tiers (id,name,description,price,is_active,sort_order)
  values ('gentle','Gentle','Warm words of comfort',249,true,1) on conflict (id) do nothing;
insert into public.gift_tiers (id,name,description,price,is_active,sort_order)
  values ('warm','Warm','Emotional & heartfelt',499,true,2) on conflict (id) do nothing;
insert into public.gift_tiers (id,name,description,price,is_active,sort_order)
  values ('luxe','Luxe','Premium paper & ink',999,true,3) on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════
-- STEP 2 — Private admin notes
-- ════════════════════════════════════════════════════════════
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


-- ════════════════════════════════════════════════════════════
-- STEP 3 — Abandoned-order capture
-- ════════════════════════════════════════════════════════════
-- ============================================================
-- Ever Yours — abandoned-order capture (order_leads)
-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- WHY: the order form is 3 steps. People who fill step 1 and drop at
-- the address step are warm leads we can chase on WhatsApp — but only
-- if we saved their name + number. This table holds those partials.
--
-- SECURITY MODEL: anon has NO direct access to these tables. The site
-- writes only through the security-definer functions below, which cap
-- field lengths, validate the phone, rate-limit by IP, and never let a
-- row move backwards or re-open after it converted. Reads are admin-only.
-- ============================================================

-- ── Leads ────────────────────────────────────────────────────
create table if not exists public.order_leads (
  id               bigint generated by default as identity primary key,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- Client-generated UUID kept in sessionStorage; lets one visitor keep
  -- updating their own row as they move through the steps.
  session_id       uuid        not null unique,
  customer_name    text,
  customer_phone   text,
  customer_email   text,
  letter_type      text,
  recipient_name   text,
  occasion         text,
  reached_step     integer     not null default 1,
  estimated_total  integer,
  converted        boolean     not null default false,
  status           text        not null default 'new'   -- new | contacted | recovered | dropped
);

alter table public.order_leads enable row level security;

-- No anon policies at all -> the anon key cannot select, insert or update
-- this table directly. All writes go through the functions below.

drop policy if exists "Admin read leads" on public.order_leads;
create policy "Admin read leads" on public.order_leads for select to authenticated
  using ( (auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com' );

drop policy if exists "Admin update leads" on public.order_leads;
create policy "Admin update leads" on public.order_leads for update to authenticated
  using ( (auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com' )
  with check ( (auth.jwt() ->> 'email') = 'sebas.stllioni@gmail.com' );

create index if not exists order_leads_open_idx
  on public.order_leads (converted, created_at desc);
create index if not exists order_leads_created_idx
  on public.order_leads (created_at desc);

-- ── Abuse throttle ───────────────────────────────────────────
-- Deliberately a SEPARATE table with no link to order_leads, so a
-- visitor's network identity is never stored alongside their letter.
-- We keep a salted hash, never the raw IP.
create table if not exists public.lead_throttle (
  ip_hash       text primary key,
  window_start  timestamptz not null default now(),
  new_leads     integer     not null default 0,   -- rows created this window
  calls         integer     not null default 0    -- total RPC hits this window
);

alter table public.lead_throttle enable row level security;
-- No policies for anyone. Only the security-definer functions touch it.

-- ── Insert-or-update a partial order, with abuse limits ───────
-- Tunables live at the top of the function body:
--   MAX_NEW_PER_IP    new leads from one IP per hour
--   MAX_CALLS_PER_IP  total RPC calls from one IP per hour
--   MAX_NEW_GLOBAL    new leads site-wide per hour (circuit breaker)
--   IP_SALT           already generated for you; keep it private
-- Raise them if you ever see a legitimate customer throttled.
create or replace function public.upsert_order_lead(
  p_session_id      uuid,
  p_customer_name   text,
  p_customer_phone  text,
  p_customer_email  text,
  p_letter_type     text,
  p_recipient_name  text,
  p_occasion        text,
  p_reached_step    integer,
  p_estimated_total integer
) returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  MAX_NEW_PER_IP   constant integer := 10;
  MAX_CALLS_PER_IP constant integer := 60;
  MAX_NEW_GLOBAL   constant integer := 200;
  IP_SALT          constant text    := 'akshar-0683dae2489fa67229e82f3f1329f2d3';

  v_headers text;
  v_ip      text;
  v_hash    text;
  v_new     integer;
  v_calls   integer;
  v_digits  text;
  v_exists  boolean;
begin
  -- ── Validate the phone: it is the whole point of a lead ──
  v_digits := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g');
  if length(v_digits) < 10 or length(v_digits) > 15 then
    return;
  end if;
  -- reject 0000000000, 9999999999 and friends
  if v_digits ~ '^(.)\1+$' then
    return;
  end if;

  v_exists := exists (select 1 from public.order_leads where session_id = p_session_id);

  -- ── Rate limit by caller IP ──────────────────────────────
  -- PostgREST exposes the request headers; they are absent when the
  -- function is called from the SQL editor. If we cannot identify the
  -- caller we fail OPEN on the per-IP check (so a header change can
  -- never lock out real customers) and rely on the global cap below.
  v_headers := current_setting('request.headers', true);
  if v_headers is not null and v_headers <> '' then
    v_ip := btrim(split_part(coalesce(v_headers::json ->> 'x-forwarded-for', ''), ',', 1));
  end if;

  if coalesce(v_ip, '') <> '' then
    v_hash := md5(v_ip || IP_SALT);

    insert into public.lead_throttle as t (ip_hash, window_start, new_leads, calls)
    values (v_hash, now(), case when v_exists then 0 else 1 end, 1)
    on conflict (ip_hash) do update set
      window_start = case when t.window_start < now() - interval '1 hour'
                          then now() else t.window_start end,
      new_leads    = case when t.window_start < now() - interval '1 hour'
                          then (case when v_exists then 0 else 1 end)
                          else t.new_leads + (case when v_exists then 0 else 1 end) end,
      calls        = case when t.window_start < now() - interval '1 hour'
                          then 1 else t.calls + 1 end
    returning t.new_leads, t.calls into v_new, v_calls;

    if v_calls > MAX_CALLS_PER_IP then return; end if;
    if not v_exists and v_new > MAX_NEW_PER_IP then return; end if;

    -- Opportunistic cleanup so this table stays tiny.
    if random() < 0.01 then
      delete from public.lead_throttle where window_start < now() - interval '1 day';
    end if;
  end if;

  -- ── Global circuit breaker ───────────────────────────────
  if not v_exists then
    if (select count(*) from public.order_leads
         where created_at > now() - interval '1 hour') >= MAX_NEW_GLOBAL then
      return;
    end if;
  end if;

  -- ── Insert or advance the partial order ──────────────────
  insert into public.order_leads as l (
    session_id, customer_name, customer_phone, customer_email,
    letter_type, recipient_name, occasion, reached_step, estimated_total
  ) values (
    p_session_id,
    left(btrim(p_customer_name),  120),
    left(btrim(p_customer_phone),  20),
    left(btrim(p_customer_email), 160),
    left(p_letter_type,            80),
    left(btrim(p_recipient_name), 120),
    left(p_occasion,               80),
    greatest(1, least(3, coalesce(p_reached_step, 1))),
    greatest(0, least(1000000, coalesce(p_estimated_total, 0)))
  )
  on conflict (session_id) do update set
    customer_name   = excluded.customer_name,
    customer_phone  = excluded.customer_phone,
    customer_email  = excluded.customer_email,
    letter_type     = excluded.letter_type,
    recipient_name  = excluded.recipient_name,
    occasion        = excluded.occasion,
    -- progress only ever moves forward
    reached_step    = greatest(l.reached_step, excluded.reached_step),
    estimated_total = excluded.estimated_total,
    updated_at      = now()
  where l.converted = false;   -- a placed order is never re-opened
end;
$fn$;

-- ── Mark a lead converted once the real order lands ────────────
create or replace function public.mark_lead_converted(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  update public.order_leads
     set converted = true, status = 'recovered', updated_at = now()
   where session_id = p_session_id;
end;
$fn$;

-- The website (anon key) may only call these two functions.
revoke all on function public.upsert_order_lead(uuid,text,text,text,text,text,text,integer,integer) from public;
revoke all on function public.mark_lead_converted(uuid) from public;
grant execute on function public.upsert_order_lead(uuid,text,text,text,text,text,text,integer,integer) to anon, authenticated;
grant execute on function public.mark_lead_converted(uuid) to anon, authenticated;


-- ════════════════════════════════════════════════════════════
-- STEP 4 — Server-side pricing + lock anon out of orders
-- ════════════════════════════════════════════════════════════
-- ============================================================
-- Ever Yours — lock down the orders table
-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- ⚠️ PREREQUISITE: your product catalog must be seeded first, or every
--    order will be rejected. In the admin: Products → "Import current
--    defaults". Verify with:  select count(*) from public.letter_types;
--
-- THE PROBLEM THIS FIXES
--   Until now anon could INSERT straight into public.orders with any
--   total_price it liked — including 0 — and as many times as it liked.
--   Prices were decided in the browser, which means they were decided by
--   whoever was using the browser.
--
-- THE FIX
--   1. Anon loses INSERT on public.orders entirely.
--   2. Orders arrive through place_order() below, which prices the order
--      SERVER-SIDE from the catalog tables and ignores any price the
--      client sends. The client sends ids; the server decides money.
--   3. Per-IP and global rate limits.
--
--   Unlike lead capture, a throttled or invalid order RAISES — the
--   customer must never think an order went through when it did not.
-- ============================================================

-- ── Generic request throttle (separate buckets per action) ────
-- Salted hash of the caller IP, never the raw address, and no link to
-- the orders table — network identity is not stored beside someone's letter.
create table if not exists public.request_throttle (
  bucket        text        not null,
  ip_hash       text        not null,
  window_start  timestamptz not null default now(),
  hits          integer     not null default 0,
  primary key (bucket, ip_hash)
);

alter table public.request_throttle enable row level security;
-- No policies for anyone. Only security-definer functions touch it.

-- ── Place an order, priced by the server ─────────────────────
-- Tunables at the top of the body:
--   MAX_PER_IP      orders from one IP per hour
--   MAX_GLOBAL      orders site-wide per hour (circuit breaker)
--   IP_SALT         already generated for you; keep it private
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
                  else 1 end as qty
        from jsonb_array_elements(coalesce(p_gift_items, '[]'::jsonb)) it
    )
    select coalesce(sum(g.price * i.qty), 0),
           string_agg(g.name || case when i.qty > 1 then ' x' || i.qty else '' end,
                      ', ' order by g.sort_order)
      into v_gift_total, v_gift_names
      from items i
      join public.gifts g on g.id = i.gid and g.is_active;

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

-- ── Close the front door ─────────────────────────────────────
-- Anon can no longer write to orders directly; place_order() is the
-- only way in, and it decides the price.
drop policy if exists "Public can place orders" on public.orders;

revoke all on function public.place_order(text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,text,boolean,text) from public;
grant execute on function public.place_order(text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,text,boolean,text) to anon, authenticated;


-- ============================================================
-- DONE.  Paste this second query to confirm everything worked.
-- Every row should say OK.
-- ============================================================
--
-- select 'catalog seeded'      as check,
--        case when (select count(*) from public.letter_types) >= 6 then 'OK' else 'FAIL — step 1 did not run' end as result
-- union all
-- select 'admin_notes column',
--        case when exists (select 1 from information_schema.columns
--              where table_name='orders' and column_name='admin_notes') then 'OK' else 'FAIL' end
-- union all
-- select 'order_leads table',
--        case when to_regclass('public.order_leads') is not null then 'OK' else 'FAIL' end
-- union all
-- select 'place_order function',
--        case when exists (select 1 from pg_proc where proname='place_order') then 'OK' else 'FAIL' end
-- union all
-- select 'anon can no longer insert orders directly',
--        case when not exists (select 1 from pg_policies
--              where tablename='orders' and cmd='INSERT' and 'anon' = any(roles)) then 'OK' else 'FAIL — still open' end;

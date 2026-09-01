# Ever Yours

Premium handwritten calligraphy letters & curated gifting — Bangalore.

**Stack:** React + Vite · Tailwind CSS · Supabase · (deploy on Vercel)

## Setup
```bash
npm install
cp .env.example .env   # fill in your Supabase URL + publishable key
npm run dev
```

## Environment variables (`.env`)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

## Database

Run in the Supabase SQL Editor, in this order:

1. `schema.sql` — orders, corporate enquiries, RLS + admin policies
2. `products.sql` — catalog tables (letters, gifts, paper, ink, tiers)
3. **`RUN_ME_ALL.sql`** — everything else, in one paste

`RUN_ME_ALL.sql` seeds the catalog, adds private admin notes, creates
abandoned-order capture, and moves order pricing server-side. It is safe
to run more than once, and it ends with a copy-paste check that reports
OK/FAIL for each step.

It bundles these files, which are also kept separately for reference:
- `admin_notes.sql` — private `admin_notes` column on orders
- `leads.sql` — `order_leads` + rate-limited capture RPCs
- `orders_secure.sql` — `place_order()` server-side pricing; removes anon INSERT on orders

> **Pricing is server-side.** The order form sends ids (`love`, `parchment`,
> `gold`), never a price. `place_order()` reads the catalog tables to work out
> the total, so the catalog must be seeded or orders are rejected.

## Business details

`src/lib/business.js` holds the name, service area, contact email and social
links used by the policy pages.

The studio runs from home with no walk-in address and no GST registration, so
`address` and `gst` are intentionally blank — the pages say "serving Bangalore,
Karnataka" and never publish a home address. Fill either field in later and the
policy pages pick it up automatically (a GST number appears in the identity line,
and the "not GST-registered" note disappears).

## Key features
- Storefront (Home, Shop, About, Corporate, Contact)
- Order form: paper/ink, gifts w/ quantities, voice + phonetic (Indian languages) typing, pincode auto-fill, letter preview, sticky summary
- Orders + corporate enquiries saved to Supabase (WhatsApp-based updates)
- Admin panel (`/admin`): orders, statuses, enquiries, full product/price management

## Routes
`/` · `/shop` · `/order` · `/about` · `/corporate` · `/contact` · `/admin`

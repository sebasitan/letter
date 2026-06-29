# Akshar Studio

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
SQL lives in `supabase/`:
- `schema.sql` — orders, corporate enquiries, RLS policies, admin policies
- `products.sql` — product catalog tables (letters, gifts, paper, ink, tiers)

Run these in the Supabase SQL Editor. Then in the admin (`/admin`), use **Products → Import current defaults** to seed the catalog.

## Key features
- Storefront (Home, Shop, About, Corporate, Contact)
- Order form: paper/ink, gifts w/ quantities, voice + phonetic (Indian languages) typing, pincode auto-fill, letter preview, sticky summary
- Orders + corporate enquiries saved to Supabase (WhatsApp-based updates)
- Admin panel (`/admin`): orders, statuses, enquiries, full product/price management

## Routes
`/` · `/shop` · `/order` · `/about` · `/corporate` · `/contact` · `/admin`

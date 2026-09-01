// ============================================================
// Business details used across the policy and contact pages.
//
// Ever Yours runs from a home studio with no walk-in address and no
// GST registration yet — which is normal and perfectly legal for a new
// small business in India. The site is written for that, not around it:
// customers see a service area and a real phone number, never a home
// address. Publishing a home address would be a safety risk, not a
// trust signal.
//
// When you register a business address or GST later, fill them in below
// and every policy page picks them up automatically.
// ============================================================

export const BUSINESS = {
  // The name you trade under. Use the registered name here if/when you register.
  legalName: 'Ever Yours',

  // Where you serve. This is what customers see — no street address needed.
  serviceArea: 'Bangalore, Karnataka, India',

  // Optional, for later. Leave blank while you work from home:
  // the pages simply don't mention a premises address.
  address: '',

  // Optional. Leave blank until you cross the GST threshold and register.
  // (Services in Karnataka: ₹20 lakh turnover. Below that, registration
  // is not required and you should not display a GST number.)
  gst: '',

  email: 'hello@everyours.in',

  // Used for canonical URLs, OG tags and the sitemap.
  // Connect this domain in Vercel before deploying, or these point nowhere.
  siteUrl: 'https://everyours.in',

  // Last time you reviewed the policy text.
  policiesUpdated: '28 August 2026',
}

// Social profiles. Leave a value empty and its icon simply won't render —
// a dead social link costs more trust than a missing one.
export const SOCIAL = {
  instagram: '',   // TODO e.g. 'https://instagram.com/everyours'
  facebook: '',    // TODO e.g. 'https://facebook.com/everyours'
}

/** True when an optional detail hasn't been filled in yet. */
export const isMissing = (v) => !v || !String(v).trim()

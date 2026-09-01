// ── Single source of truth for how customers reach us ──────────────
// Never hardcode the WhatsApp number in a page again — import from here.

export const WHATSAPP_NUMBER = '919843245279'

// Pretty version for display, e.g. "+91 98432 45279"
export const WHATSAPP_DISPLAY = '+91 98432 45279'

/** Build a wa.me link, optionally with a prefilled message. */
export function waLink(message) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

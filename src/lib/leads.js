import { supabase } from './supabase'

// ── Abandoned-order capture ─────────────────────────────────────
// Someone who fills step 1 and drops at the address step is a warm
// lead — but only if we kept their number. We save a partial row on
// each step advance and mark it converted when the order lands.
//
// Writes go through security-definer RPCs (see supabase/leads.sql);
// the anon key has no direct access to the order_leads table.

const KEY = 'everyours_lead_session'

/** crypto.randomUUID() needs a secure context — fall back on plain http (LAN testing). */
function uuid() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID()
  } catch { /* fall through */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/** Stable per-visit id so one visitor keeps updating one row. */
export function getLeadSessionId() {
  try {
    let id = sessionStorage.getItem(KEY)
    if (!id) {
      id = uuid()
      sessionStorage.setItem(KEY, id)
    }
    return id
  } catch {
    // Private mode / storage blocked — fall back to a throwaway id.
    return uuid()
  }
}

/** Start a fresh lead row (called after an order is placed). */
export function resetLeadSession() {
  try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
}

/**
 * Save or update the partial order. Fire-and-forget: this must never
 * block or break the customer's progress through the form.
 */
export async function saveLead({ name, phone, email, letterType, recipientName, occasion, step, total }) {
  if (!phone || !phone.trim()) return   // nothing to chase
  try {
    await supabase.rpc('upsert_order_lead', {
      p_session_id: getLeadSessionId(),
      p_customer_name: name || '',
      p_customer_phone: phone || '',
      p_customer_email: email || '',
      p_letter_type: letterType || '',
      p_recipient_name: recipientName || '',
      p_occasion: occasion || '',
      p_reached_step: step || 1,
      p_estimated_total: Math.round(total || 0),
    })
  } catch { /* never surface lead-capture failures to the customer */ }
}

/** The order went through — stop treating this as abandoned. */
export async function markLeadConverted() {
  try {
    await supabase.rpc('mark_lead_converted', { p_session_id: getLeadSessionId() })
  } catch { /* ignore */ }
  resetLeadSession()
}

// ── Admin ───────────────────────────────────────────────────────
export async function getLeads() {
  const { data, error } = await supabase
    .from('order_leads')
    .select('*')
    .eq('converted', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateLeadStatus(id, status) {
  const { error } = await supabase.from('order_leads').update({ status }).eq('id', id)
  if (error) throw error
  return true
}

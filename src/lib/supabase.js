import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Order functions
// Orders go through the place_order() RPC, never a direct insert. The
// server prices the order from the catalog tables — the client sends ids,
// not money — and rate-limits by IP. See supabase/orders_secure.sql.
export async function createOrder(order) {
  const { data, error } = await supabase.rpc('place_order', {
    p_customer_name:        order.customerName,
    p_customer_phone:       order.customerPhone,
    p_customer_email:       order.customerEmail || '',
    p_letter_slug:          order.letterSlug,
    p_recipient_name:       order.recipientName,
    p_relationship:         order.relationship || '',
    p_occasion:             order.occasion || '',
    p_message:              order.message,
    p_tone:                 order.tone || '',
    p_letter_lang:          order.letterLang || 'English',
    p_paper_id:             order.paperId || '',
    p_ink_id:               order.inkId || '',
    p_gift_mode:            order.giftMode || 'surprise',
    p_tier_id:              order.tierId || 'none',
    p_gift_items:           order.giftItems || [],
    p_delivery_address:     order.deliveryAddress,
    p_area:                 order.area || '',
    p_city:                 order.city || '',
    p_state:                order.state || '',
    p_pincode:              order.pincode || '',
    p_delivery_phone:       order.deliveryPhone || '',
    p_surprise:             !!order.surprise,
    p_special_instructions: order.specialInstructions || '',
  })

  if (error) throw error
  return data   // the new order id
}

// Corporate / bulk enquiry (quote request — no instant payment)
export async function createCorporateEnquiry(data) {
  const { error } = await supabase
    .from('corporate_enquiries')
    .insert([data])

  if (error) throw error
  return true
}

// ── Admin: auth ──────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
  return data.subscription
}

// ── Admin: data (requires authenticated session + RLS read policy) ──
export async function getCorporateEnquiries() {
  const { data, error } = await supabase
    .from('corporate_enquiries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
  return true
}

export async function updateOrderNotes(id, admin_notes) {
  const { error } = await supabase.from('orders').update({ admin_notes }).eq('id', id)
  if (error) throw error
  return true
}

// Bulk status change from the admin's selection checkboxes.
export async function updateOrderStatusBulk(ids, status) {
  if (!ids?.length) return true
  const { error } = await supabase.from('orders').update({ status }).in('id', ids)
  if (error) throw error
  return true
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ── Admin: account ───────────────────────────────────────────
/** The signed-in admin, straight from the auth server (not the cached session). */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

/**
 * Change the admin password.
 *
 * Supabase lets an active session set a new password without proving the
 * old one — which means an unattended logged-in laptop is enough to lock
 * the owner out of their own store. So we re-authenticate first and treat
 * a failed sign-in as "wrong current password".
 */
export async function changePassword(email, currentPassword, newPassword) {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email, password: currentPassword,
  })
  if (authError) throw new Error('Current password is incorrect.')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return true
}

/** Sign out of every device, not just this browser. */
export async function signOutEverywhere() {
  const { error } = await supabase.auth.signOut({ scope: 'global' })
  if (error) throw error
  return true
}

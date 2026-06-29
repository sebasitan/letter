import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Order functions
// Note: no .select() after insert — reading back the row would require a
// public SELECT policy, which we intentionally don't have (keeps customer
// orders private). The form only needs the insert to succeed.
export async function createOrder(orderData) {
  const { error } = await supabase
    .from('orders')
    .insert([orderData])

  if (error) throw error
  return true
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

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

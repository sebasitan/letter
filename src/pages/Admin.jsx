import { useState, useEffect } from 'react'
import {
  signIn, signOut, getSession, onAuthChange,
  getOrders, updateOrderStatus, updateOrderStatusBulk, updateOrderNotes,
  getCorporateEnquiries,
  getUser, changePassword, signOutEverywhere,
} from '../lib/supabase'
import ProductsManager from '../components/ProductsManager'
import { getLeads, updateLeadStatus } from '../lib/leads'

const STATUSES = ['pending', 'drafting', 'writing', 'packed', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS = {
  pending: '#A8968C', drafting: '#C49A2E', writing: '#9D4433',
  packed: '#51708C', shipped: '#5E7E66', delivered: '#2E7D52', cancelled: '#B03030',
}

function inr(n) { return `₹${Number(n || 0).toLocaleString()}` }

const LEAD_STATUSES = ['new', 'contacted', 'recovered', 'dropped']
const LEAD_STATUS_COLORS = { new: '#C49A2E', contacted: '#51708C', recovered: '#2E7D52', dropped: '#A8968C' }
const STEP_LABELS = { 1: 'Wrote the letter, stopped', 2: 'Picked paper & gift, stopped', 3: 'Reached delivery, stopped' }

function waHref(phone) {
  return `https://wa.me/91${String(phone || '').replace(/\D/g, '').slice(-10)}`
}
function when(ts) {
  try { return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) }
  catch { return ts }
}

// An order still in the pipeline. Delivered and cancelled need nothing from us.
const ACTIVE_STATUSES = ['pending', 'drafting', 'writing', 'packed', 'shipped']
const isActive = (o) => ACTIVE_STATUSES.includes(o.status || 'pending')

function startOfToday() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d
}

/**
 * How long an order has been waiting. There is no promised-delivery
 * column, so "due today" means an active order placed today — the
 * same-day Bangalore ones — and anything older is ageing.
 */
function ageOf(ts) {
  try {
    // Compare CALENDAR days, not elapsed hours — an order placed at 10pm
    // yesterday is one day old, not zero.
    const created = new Date(ts)
    created.setHours(0, 0, 0, 0)
    const days = Math.round((startOfToday() - created) / 86400000)
    if (days <= 0) return { days: 0, badge: 'today', bg: '#FDF5E6', fg: '#9D6A1E' }
    if (days === 1) return { days, badge: 'yesterday', bg: '#FBE9E4', fg: '#9D4433' }
    return { days, badge: `${days} days old`, bg: '#FBE9E4', fg: '#B03030' }
  } catch { return { days: 0, badge: '', bg: '', fg: '' } }
}

const DATE_RANGES = [
  ['all', 'All time'],
  ['today', 'Today'],
  ['7d', 'Last 7 days'],
  ['30d', 'Last 30 days'],
  ['month', 'This month'],
]

function inRange(ts, range) {
  if (range === 'all') return true
  const d = new Date(ts)
  const now = new Date()
  if (range === 'today') return d >= startOfToday()
  if (range === '7d') return d >= new Date(now - 7 * 86400000)
  if (range === '30d') return d >= new Date(now - 30 * 86400000)
  if (range === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  return true
}

/** Spreadsheets execute cells starting with = + - @, so neutralise them. */
function csvCell(v) {
  const s = String(v ?? '')
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

function downloadOrdersCsv(rows) {
  const cols = [
    ['id', 'Order #'], ['created_at', 'Placed'], ['status', 'Status'],
    ['customer_name', 'Customer'], ['customer_phone', 'Phone'], ['customer_email', 'Email'],
    ['letter_type', 'Letter'], ['recipient_name', 'For'], ['occasion', 'Occasion'],
    ['relationship', 'Relationship'], ['tone', 'Tone'], ['mystery_tier', 'Gift'],
    ['total_price', 'Total'], ['delivery_address', 'Address'], ['city', 'City'],
    ['pincode', 'Pincode'], ['special_instructions', 'Customer notes'],
    ['admin_notes', 'Private notes'], ['message_to_write', 'Message'],
  ]
  const csv = [
    cols.map(c => csvCell(c[1])).join(','),
    ...rows.map(r => cols.map(c => csvCell(r[c[0]])).join(',')),
  ].join('\r\n')

  // BOM so Excel opens ₹ and Indian-language messages correctly
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `everyours-orders-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Login form ──
function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await signIn(email, password)
      onLoggedIn()
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const inputStyle = { border: '1px solid #E3D5C8', color: '#3D1A1A' }
  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-3xl p-8 w-full max-w-sm" style={{ boxShadow: '0 20px 50px rgba(140,90,60,0.15)' }}>
        <div className="text-center mb-6">
          <span className="font-playfair text-2xl font-bold" style={{ color: '#3D1A1A' }}>Ever Yours</span>
          <p className="text-sm" style={{ color: '#A8968C' }}>Admin sign in</p>
        </div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full px-4 py-3 rounded-xl bg-white outline-none mb-4" style={inputStyle} placeholder="you@email.com" />
        <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full px-4 py-3 rounded-xl bg-white outline-none mb-4" style={inputStyle} placeholder="••••••••" />
        {error && <p className="text-sm mb-4" style={{ color: '#9D4433' }}>{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 text-sm font-semibold rounded-full disabled:opacity-60"
          style={{ backgroundColor: '#9D4433', color: 'white' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

// ── Order card ──
function OrderRow({ order, onStatus, onNotes, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(order.admin_notes || '')
  const [noteState, setNoteState] = useState('idle')   // idle | saving | saved | error

  // Resync if the row is reloaded from the server.
  useEffect(() => { setNotes(order.admin_notes || ''); setNoteState('idle') }, [order.admin_notes])

  const changeStatus = async (status) => {
    setSaving(true)
    try { await onStatus(order.id, status) } finally { setSaving(false) }
  }

  const saveNotes = async () => {
    setNoteState('saving')
    try {
      await onNotes(order.id, notes)
      setNoteState('saved')
      setTimeout(() => setNoteState('idle'), 2000)
    } catch { setNoteState('error') }
  }

  const age = ageOf(order.created_at)
  const showAge = isActive(order) && age.badge

  return (
    <div className="bg-white rounded-2xl p-5 mb-3" style={{
      border: selected ? '1px solid #C49A2E' : '1px solid #F0E6DC',
      boxShadow: selected ? '0 0 0 3px rgba(196,154,46,0.15)' : 'none',
    }}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(order.id)}
          className="mt-1.5 w-4 h-4 rounded flex-shrink-0"
          style={{ accentColor: '#9D4433' }}
          aria-label={`Select order ${order.id}`}
        />

        <div className="flex-1 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-playfair font-bold text-lg" style={{ color: '#3D1A1A' }}>#{order.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5EDE4', color: '#7A6258' }}>{order.letter_type}</span>
              {showAge && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: age.bg, color: age.fg }}>
                  {age.badge}
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: '#5C3A2E' }}>
              {order.customer_name} · <a href={waHref(order.customer_phone)} target="_blank" rel="noopener noreferrer" style={{ color: '#1FA855' }}>{order.customer_phone}</a>
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#A8968C' }}>{when(order.created_at)} · For: {order.recipient_name || '—'}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg" style={{ color: '#3D1A1A' }}>{inr(order.total_price)}</p>
            <select
              value={order.status || 'pending'}
              onChange={(e) => changeStatus(e.target.value)}
              disabled={saving}
              className="mt-1 text-xs font-semibold rounded-full px-3 py-1.5 outline-none cursor-pointer"
              style={{ color: 'white', backgroundColor: STATUS_COLORS[order.status] || '#A8968C', border: 'none' }}
            >
              {STATUSES.map(s => <option key={s} value={s} style={{ color: '#000' }}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <button onClick={() => setOpen(!open)} className="text-xs underline" style={{ color: '#9D4433' }}>
          {open ? 'Hide details' : 'View details'}
        </button>
        {order.admin_notes && !open && (
          <span className="text-xs" style={{ color: '#A8968C' }}>🔒 has a private note</span>
        )}
      </div>

      {open && (
        <div className="mt-3 pt-3 text-sm space-y-1.5" style={{ borderTop: '1px solid #F0E6DC', color: '#5C3A2E' }}>
          {order.occasion && <p><strong>Occasion:</strong> {order.occasion}</p>}
          {order.relationship && <p><strong>Relationship:</strong> {order.relationship}</p>}
          {order.tone && <p><strong>Tone:</strong> {order.tone}</p>}
          <p><strong>Message:</strong> {order.message_to_write}</p>
          {order.mystery_tier && order.mystery_tier !== 'No Gift' && <p><strong>Gift:</strong> {order.mystery_tier}</p>}
          <p><strong>Deliver to:</strong> {order.delivery_address}{order.city ? `, ${order.city}` : ''}{order.pincode ? ` - ${order.pincode}` : ''}</p>
          {order.special_instructions && <p><strong>Customer notes:</strong> {order.special_instructions}</p>}
          {order.customer_email && <p><strong>Email:</strong> {order.customer_email}</p>}

          {/* Private working notes — never shown to the customer */}
          <div className="pt-3 mt-3" style={{ borderTop: '1px dashed #F0E6DC' }}>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#A8968C' }}>
              🔒 Your private notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setNoteState('idle') }}
              rows={2}
              placeholder="Courier ref, what the draft still needs, who to call back…"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ border: '1px solid #E3D5C8', color: '#3D1A1A' }}
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={saveNotes}
                disabled={noteState === 'saving' || notes === (order.admin_notes || '')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#9D4433', color: 'white' }}
              >
                {noteState === 'saving' ? 'Saving…' : 'Save note'}
              </button>
              {noteState === 'saved' && <span className="text-xs" style={{ color: '#2E7D52' }}>✓ Saved</span>}
              {noteState === 'error' && (
                <span className="text-xs" style={{ color: '#B03030' }}>
                  Could not save — have you run supabase/admin_notes.sql?
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Corporate enquiry card ──
function EnquiryRow({ e }) {
  return (
    <div className="bg-white rounded-2xl p-5 mb-3" style={{ border: '1px solid #F0E6DC' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-playfair font-bold text-lg" style={{ color: '#3D1A1A' }}>{e.company_name}</p>
          <p className="text-sm" style={{ color: '#5C3A2E' }}>
            {e.contact_person} · <a href={`https://wa.me/91${(e.phone || '').replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1FA855' }}>{e.phone}</a>
            {e.work_email && <> · {e.work_email}</>}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#A8968C' }}>{when(e.created_at)}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#451A1C', color: '#E0A93C' }}>{e.status || 'new'}</span>
      </div>
      <div className="mt-3 pt-3 text-sm space-y-1.5" style={{ borderTop: '1px solid #F0E6DC', color: '#5C3A2E' }}>
        {e.occasion && <p><strong>Occasion:</strong> {e.occasion}</p>}
        {e.quantity_range && <p><strong>Quantity:</strong> {e.quantity_range}</p>}
        {e.frequency && <p><strong>Frequency:</strong> {e.frequency}</p>}
        {e.gift_tier && <p><strong>Gifts:</strong> {e.gift_tier}</p>}
        {e.delivery_timeline && <p><strong>Timeline:</strong> {e.delivery_timeline}</p>}
        {e.cities && <p><strong>Cities:</strong> {e.cities}</p>}
        {e.budget && <p><strong>Budget:</strong> {e.budget}</p>}
        {e.requirements && <p><strong>Requirements:</strong> {e.requirements}</p>}
      </div>
    </div>
  )
}

// ── Abandoned-order lead card ──
function LeadRow({ lead, onStatus }) {
  const [saving, setSaving] = useState(false)

  const changeStatus = async (status) => {
    setSaving(true)
    try { await onStatus(lead.id, status) } finally { setSaving(false) }
  }

  const chase = `Hi ${lead.customer_name || 'there'}! 🌸 This is Ever Yours. You started ` +
    `a ${lead.letter_type || 'letter'}${lead.recipient_name ? ` for ${lead.recipient_name}` : ''} ` +
    `but didn't finish — can I help you complete it? Nothing is charged until you approve the draft.`

  return (
    <div className="bg-white rounded-2xl p-5 mb-3" style={{ border: '1px solid #F0E6DC' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-playfair font-bold text-lg" style={{ color: '#3D1A1A' }}>
              {lead.customer_name || 'Unnamed'}
            </span>
            {lead.letter_type && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5EDE4', color: '#7A6258' }}>
                {lead.letter_type}
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: '#5C3A2E' }}>
            <a href={waHref(lead.customer_phone)} target="_blank" rel="noopener noreferrer" style={{ color: '#1FA855' }}>
              {lead.customer_phone}
            </a>
            {lead.customer_email && <span style={{ color: '#A8968C' }}> · {lead.customer_email}</span>}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#A8968C' }}>
            {when(lead.created_at)}
            {lead.recipient_name && ` · For: ${lead.recipient_name}`}
            {lead.occasion && ` · ${lead.occasion}`}
          </p>
          <p className="text-xs mt-1 font-medium" style={{ color: '#9D4433' }}>
            {STEP_LABELS[lead.reached_step] || `Stopped at step ${lead.reached_step}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg" style={{ color: '#3D1A1A' }}>{inr(lead.estimated_total)}</p>
          <select
            value={lead.status || 'new'}
            onChange={(e) => changeStatus(e.target.value)}
            disabled={saving}
            className="mt-1 text-xs font-semibold rounded-full px-3 py-1.5 outline-none cursor-pointer"
            style={{ color: 'white', backgroundColor: LEAD_STATUS_COLORS[lead.status] || '#A8968C', border: 'none' }}
          >
            {LEAD_STATUSES.map(st => <option key={st} value={st} style={{ color: '#000' }}>{st}</option>)}
          </select>
        </div>
      </div>

      <a
        href={`${waHref(lead.customer_phone)}?text=${encodeURIComponent(chase)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-xs font-semibold rounded-full"
        style={{ backgroundColor: '#25D366', color: 'white' }}
      >
        💬 Chase on WhatsApp
      </a>
    </div>
  )
}

// ── Dashboard ──
// ── Account ──
// Everything about the signed-in admin lives here: who you are, changing
// the password, and getting signed out of a device you no longer have.
function AccountPanel({ onSignOut }) {
  const [user, setUser] = useState(null)
  const [loadErr, setLoadErr] = useState('')

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [pwState, setPwState] = useState('idle')   // idle | saving | saved
  const [pwError, setPwError] = useState('')

  const [globalState, setGlobalState] = useState('idle')

  useEffect(() => {
    getUser().then(setUser).catch((e) => setLoadErr(e?.message || 'Could not load your account.'))
  }, [])

  const submitPassword = async (e) => {
    e.preventDefault()
    setPwError('')

    if (next.length < 8) return setPwError('Use at least 8 characters.')
    if (next !== confirm) return setPwError("The two new passwords don't match.")
    if (next === current) return setPwError('That is your current password.')

    setPwState('saving')
    try {
      await changePassword(user.email, current, next)
      setPwState('saved')
      setCurrent(''); setNext(''); setConfirm('')
      setTimeout(() => setPwState('idle'), 4000)
    } catch (err) {
      setPwError(err?.message || 'Could not change the password.')
      setPwState('idle')
    }
  }

  const signOutAll = async () => {
    if (!window.confirm('Sign out of every device, including this one?\n\nYou will need your password to get back in.')) return
    setGlobalState('saving')
    try {
      await signOutEverywhere()
      onSignOut()
    } catch {
      setGlobalState('idle')
      alert('Could not sign out everywhere. Check your connection and try again.')
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white outline-none'
  const inputStyle = { border: '1px solid #E3D5C8', color: '#3D1A1A' }
  const card = 'bg-white rounded-2xl p-5 md:p-6 mb-4'
  const cardStyle = { border: '1px solid #F0E6DC' }

  if (loadErr) return <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#FBE9E4', color: '#9D4433' }}>{loadErr}</div>
  if (!user) return <p style={{ color: '#A8968C' }}>Loading…</p>

  return (
    <div>
      {/* Who you are */}
      <div className={card} style={cardStyle}>
        <h3 className="font-playfair text-lg font-bold mb-4" style={{ color: '#3D1A1A' }}>Your account</h3>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[
            ['Email', user.email],
            ['Signed in since', when(user.last_sign_in_at)],
            ['Account created', when(user.created_at)],
            ['User ID', user.id],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wide mb-0.5" style={{ color: '#A8968C' }}>{k}</dt>
              <dd className={k === 'User ID' ? 'font-mono text-xs break-all' : ''} style={{ color: '#3D1A1A' }}>{v || '—'}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs mt-4 pt-4" style={{ color: '#A8968C', borderTop: '1px solid #F0E6DC' }}>
          This is the only account that can read orders. Its email is written into
          the database access rules, so changing the email here would lock you out
          of your own data — do that in Supabase, and update the SQL policies to match.
        </p>
      </div>

      {/* Change password */}
      <div className={card} style={cardStyle}>
        <h3 className="font-playfair text-lg font-bold mb-1" style={{ color: '#3D1A1A' }}>Change password</h3>
        <p className="text-sm mb-4" style={{ color: '#A8968C' }}>
          You'll stay signed in on this device. Other devices keep their session until you sign them out below.
        </p>
        <form onSubmit={submitPassword} className="max-w-sm">
          <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Current password</label>
          <input type={show ? 'text' : 'password'} value={current} onChange={(e) => setCurrent(e.target.value)}
            required autoComplete="current-password" className={`${inputCls} mb-4`} style={inputStyle} />

          <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>New password</label>
          <input type={show ? 'text' : 'password'} value={next} onChange={(e) => setNext(e.target.value)}
            required autoComplete="new-password" className={`${inputCls} mb-1`} style={inputStyle} />
          <p className="text-xs mb-4" style={{ color: '#A8968C' }}>At least 8 characters.</p>

          <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Confirm new password</label>
          <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
            required autoComplete="new-password" className={`${inputCls} mb-3`} style={inputStyle} />

          <label className="flex items-center gap-2 text-sm mb-4" style={{ color: '#5C3A2E' }}>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
            Show passwords
          </label>

          {pwError && <p className="text-sm mb-3" style={{ color: '#9D4433' }}>{pwError}</p>}
          {pwState === 'saved' && <p className="text-sm mb-3" style={{ color: '#2E7D52' }}>Password changed.</p>}

          <button type="submit" disabled={pwState === 'saving'}
            className="px-6 py-3 text-sm font-semibold rounded-full disabled:opacity-60"
            style={{ backgroundColor: '#9D4433', color: 'white' }}>
            {pwState === 'saving' ? 'Changing…' : 'Change password'}
          </button>
        </form>
      </div>

      {/* Sessions */}
      <div className={card} style={cardStyle}>
        <h3 className="font-playfair text-lg font-bold mb-1" style={{ color: '#3D1A1A' }}>Signed-in devices</h3>
        <p className="text-sm mb-4" style={{ color: '#A8968C' }}>
          Left yourself logged in on a shared or lost device? This ends every session
          everywhere, including this one.
        </p>
        <button onClick={signOutAll} disabled={globalState === 'saving'}
          className="px-6 py-3 text-sm font-semibold rounded-full disabled:opacity-60"
          style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}>
          {globalState === 'saving' ? 'Signing out…' : 'Sign out everywhere'}
        </button>
      </div>

      {/* Closing the account */}
      <div className={card} style={{ border: '1px solid #E8C4B8', backgroundColor: '#FDF7F4' }}>
        <h3 className="font-playfair text-lg font-bold mb-1" style={{ color: '#9D4433' }}>Closing this account</h3>
        <p className="text-sm mb-3" style={{ color: '#5C3A2E' }}>
          There's deliberately no button for this. Deleting the admin account doesn't
          close the shop — it leaves the site running with every order, lead and
          enquiry still in the database, and no way for you to read them. There is no
          second admin to let you back in.
        </p>
        <p className="text-sm" style={{ color: '#5C3A2E' }}>
          If you're winding the business down, do it in this order: take the site
          offline, export your orders from the Orders tab, honour anything outstanding,
          then delete the project from the Supabase dashboard. If you just want to hand
          the shop to someone else, create their account in Supabase and update the
          access-rule email instead — ask before doing that, it touches every table.
        </p>
      </div>
    </div>
  )
}

function Dashboard({ onSignOut }) {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [me, setMe] = useState(null)

  useEffect(() => { getUser().then(setMe).catch(() => setMe(null)) }, [])

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [o, e] = await Promise.all([getOrders(), getCorporateEnquiries()])
      setOrders(o); setEnquiries(e)
      // Leads are optional — the table only exists once supabase/leads.sql
      // has been run. Never let a missing table break the whole dashboard.
      try { setLeads(await getLeads()) } catch { setLeads([]) }
    } catch (err) {
      setError(err?.message || 'Could not load data. Check the admin read policies.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const handleNotes = async (id, admin_notes) => {
    await updateOrderNotes(id, admin_notes)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, admin_notes } : o))
  }

  const handleLeadStatus = async (id, status) => {
    await updateLeadStatus(id, status)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  // Leads still worth a WhatsApp nudge
  const openLeads = leads.filter(l => l.status === 'new' || l.status === 'contacted')

  // ── Order search / filter / selection ──────────────────────
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [needsActionOnly, setNeedsActionOnly] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const [bulkStatus, setBulkStatus] = useState('drafting')
  const [bulkBusy, setBulkBusy] = useState(false)

  const needle = q.trim().toLowerCase()
  const digits = needle.replace(/\D/g, '')

  const visibleOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && (o.status || 'pending') !== statusFilter) return false
    if (!inRange(o.created_at, dateFilter)) return false
    if (needsActionOnly && !isActive(o)) return false
    if (!needle) return true
    // "#47" / "47" matches the order number; digits match the phone
    if (String(o.id) === needle.replace(/^#/, '')) return true
    if (digits.length >= 4 && String(o.customer_phone || '').replace(/\D/g, '').includes(digits)) return true
    return [o.customer_name, o.recipient_name, o.letter_type, o.city, o.pincode, o.admin_notes]
      .some(v => String(v || '').toLowerCase().includes(needle))
  })

  const dueToday = orders.filter(o => isActive(o) && ageOf(o.created_at).days === 0).length
  const overdue = orders.filter(o => isActive(o) && ageOf(o.created_at).days >= 1).length

  const toggleSelect = (id) => setSelected((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const allVisibleSelected = visibleOrders.length > 0 && visibleOrders.every(o => selected.has(o.id))
  const toggleSelectAll = () => setSelected(() =>
    allVisibleSelected ? new Set() : new Set(visibleOrders.map(o => o.id)))

  const applyBulk = async () => {
    const ids = visibleOrders.filter(o => selected.has(o.id)).map(o => o.id)
    if (!ids.length) return
    setBulkBusy(true)
    try {
      await updateOrderStatusBulk(ids, bulkStatus)
      setOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, status: bulkStatus } : o))
      setSelected(new Set())
    } catch (err) {
      setError(err?.message || 'Bulk update failed.')
    } finally { setBulkBusy(false) }
  }

  const resetFilters = () => {
    setQ(''); setStatusFilter('all'); setDateFilter('all'); setNeedsActionOnly(false)
  }
  const filtersActive = needle || statusFilter !== 'all' || dateFilter !== 'all' || needsActionOnly

  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_price || 0), 0)

  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen">
      {/* Top bar */}
      <header style={{ backgroundColor: '#451A1C' }} className="px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-playfair text-xl font-bold" style={{ color: '#FBF6F0' }}>Ever Yours</span>
          <span className="text-xs ml-2" style={{ color: 'rgba(251,246,240,0.6)' }}>Admin</span>
        </div>
        <div className="flex items-center gap-3">
          {me && (
            <button onClick={() => setTab('account')} title="Account settings"
              className="hidden sm:block text-sm max-w-[16rem] truncate hover:underline"
              style={{ color: 'rgba(251,246,240,0.7)' }}>
              {me.email}
            </button>
          )}
          <button onClick={onSignOut} className="text-sm px-4 py-2 rounded-full" style={{ border: '1px solid rgba(251,246,240,0.3)', color: '#FBF6F0' }}>
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Orders', value: orders.length },
            { label: 'Needs action', value: dueToday + overdue, hot: overdue > 0 },
            { label: 'To chase', value: openLeads.length },
            { label: 'Revenue', value: inr(revenue) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center"
              style={{ border: s.hot ? '1px solid #E8C4B8' : '1px solid #F0E6DC' }}>
              <p className="text-2xl font-bold" style={{ color: s.hot ? '#B03030' : '#3D1A1A' }}>{s.value}</p>
              <p className="text-xs uppercase tracking-wide" style={{ color: '#A8968C' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[['orders', `Orders (${orders.length})`], ['leads', `Unfinished (${openLeads.length})`], ['corporate', `Corporate (${enquiries.length})`], ['products', 'Products'], ['reviews', 'Reviews'], ['faqs', 'FAQs'], ['account', 'Account']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={tab === id ? { backgroundColor: '#9D4433', color: 'white' } : { backgroundColor: '#F0E6DC', color: '#5C3A2E' }}>
              {label}
            </button>
          ))}
          {tab !== 'products' && tab !== 'reviews' && tab !== 'faqs' && tab !== 'account' && (
            <button onClick={load} className="ml-auto px-4 py-2 rounded-full text-sm" style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}>
              ↻ Refresh
            </button>
          )}
        </div>

        {error && <div className="rounded-xl p-4 mb-4 text-sm" style={{ backgroundColor: '#FBE9E4', color: '#9D4433', border: '1px solid #E8C4B8' }}>{error}</div>}
        {loading && <p style={{ color: '#A8968C' }}>Loading…</p>}

        {!loading && tab === 'orders' && (
          orders.length ? (
            <>
              {/* ── Needs-action banner ── */}
              {(dueToday + overdue) > 0 && (
                <button
                  onClick={() => { setNeedsActionOnly(!needsActionOnly); setStatusFilter('all'); setDateFilter('all') }}
                  className="w-full text-left rounded-2xl p-4 mb-4 transition-all"
                  style={needsActionOnly
                    ? { backgroundColor: '#451A1C', border: '1px solid #451A1C' }
                    : { backgroundColor: '#FDF5E6', border: '1px solid #E8DCC4' }}
                >
                  <p className="text-sm font-semibold" style={{ color: needsActionOnly ? '#E0A93C' : '#9D6A1E' }}>
                    {needsActionOnly ? '✓ Showing only orders that need work' : '⚠ Still in the pipeline'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: needsActionOnly ? 'rgba(251,246,240,0.7)' : '#7A6258' }}>
                    {dueToday} placed today{overdue > 0 && ` · ${overdue} waiting since before today`}
                    {' — '}{needsActionOnly ? 'tap to show all orders' : 'tap to focus on just these'}
                  </p>
                </button>
              )}

              {/* ── Search + filters ── */}
              <div className="bg-white rounded-2xl p-4 mb-4" style={{ border: '1px solid #F0E6DC' }}>
                <div className="flex gap-3 flex-wrap items-center">
                  <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, phone, #47, city…"
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ border: '1px solid #E3D5C8', color: '#3D1A1A' }}
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
                    style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}
                  >
                    <option value="all">All statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
                    style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}
                  >
                    {DATE_RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <button
                    onClick={() => downloadOrdersCsv(visibleOrders)}
                    disabled={!visibleOrders.length}
                    className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                    style={{ backgroundColor: '#F5EDE4', color: '#5C3A2E' }}
                    title="Download the orders shown below as a spreadsheet"
                  >
                    ⬇ CSV ({visibleOrders.length})
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#9D4433' }}
                    />
                    <span className="text-xs" style={{ color: '#7A6258' }}>Select all shown</span>
                  </label>
                  <span className="text-xs" style={{ color: '#A8968C' }}>
                    Showing {visibleOrders.length} of {orders.length}
                  </span>
                  {filtersActive && (
                    <button onClick={resetFilters} className="text-xs underline" style={{ color: '#9D4433' }}>
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* ── Bulk action bar ── */}
              {selected.size > 0 && (
                <div className="rounded-2xl p-4 mb-4 flex items-center gap-3 flex-wrap"
                  style={{ backgroundColor: '#451A1C' }}>
                  <span className="text-sm font-semibold" style={{ color: '#E0A93C' }}>
                    {selected.size} selected
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(251,246,240,0.7)' }}>Mark as</span>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-full text-sm outline-none cursor-pointer"
                    style={{ backgroundColor: '#FBF6F0', color: '#3D1A1A', border: 'none' }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={applyBulk}
                    disabled={bulkBusy}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold disabled:opacity-60"
                    style={{ backgroundColor: '#E0A93C', color: '#451A1C' }}
                  >
                    {bulkBusy ? 'Updating…' : 'Apply'}
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-sm underline ml-auto"
                    style={{ color: 'rgba(251,246,240,0.6)' }}
                  >
                    Clear
                  </button>
                </div>
              )}

              {visibleOrders.length ? visibleOrders.map(o => (
                <OrderRow
                  key={o.id}
                  order={o}
                  onStatus={handleStatus}
                  onNotes={handleNotes}
                  selected={selected.has(o.id)}
                  onSelect={toggleSelect}
                />
              )) : (
                <p style={{ color: '#A8968C' }}>
                  No orders match that. <button onClick={resetFilters} className="underline" style={{ color: '#9D4433' }}>Clear filters</button>
                </p>
              )}
            </>
          ) : <p style={{ color: '#A8968C' }}>No orders yet.</p>
        )}
        {!loading && tab === 'leads' && (
          leads.length ? (
            <>
              <p className="text-sm mb-4" style={{ color: '#7A6258' }}>
                People who started an order but didn't finish. They already gave you a
                number — a short WhatsApp nudge recovers more of these than anything else.
              </p>
              {leads.map(l => <LeadRow key={l.id} lead={l} onStatus={handleLeadStatus} />)}
            </>
          ) : <p style={{ color: '#A8968C' }}>No unfinished orders — everyone who started, finished. 🎉</p>
        )}
        {!loading && tab === 'corporate' && (
          enquiries.length ? enquiries.map(e => <EnquiryRow key={e.id} e={e} />)
            : <p style={{ color: '#A8968C' }}>No corporate enquiries yet.</p>
        )}
        {tab === 'products' && <ProductsManager />}
        {tab === 'reviews' && <ProductsManager only="reviews" />}
        {tab === 'faqs' && <ProductsManager only="faqs" />}
        {tab === 'account' && <AccountPanel onSignOut={onSignOut} />}
      </div>
    </div>
  )
}

// ── Admin entry ──
export default function Admin() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    getSession().then((s) => { setSession(s); setChecking(false) })
    const sub = onAuthChange((s) => setSession(s))
    return () => sub?.unsubscribe?.()
  }, [])

  if (checking) {
    return <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen flex items-center justify-center" />
  }

  if (!session) return <Login onLoggedIn={() => getSession().then(setSession)} />
  return <Dashboard onSignOut={async () => { await signOut(); setSession(null) }} />
}

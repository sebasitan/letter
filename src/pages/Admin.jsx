import { useState, useEffect } from 'react'
import {
  signIn, signOut, getSession, onAuthChange,
  getOrders, updateOrderStatus, getCorporateEnquiries,
} from '../lib/supabase'
import ProductsManager from '../components/ProductsManager'

const STATUSES = ['pending', 'drafting', 'writing', 'packed', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS = {
  pending: '#A8968C', drafting: '#C49A2E', writing: '#9D4433',
  packed: '#51708C', shipped: '#5E7E66', delivered: '#2E7D52', cancelled: '#B03030',
}

function inr(n) { return `₹${Number(n || 0).toLocaleString()}` }
function when(ts) {
  try { return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) }
  catch { return ts }
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
          <span className="font-playfair text-2xl font-bold" style={{ color: '#3D1A1A' }}>Akshar Studio</span>
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
function OrderRow({ order, onStatus }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const changeStatus = async (status) => {
    setSaving(true)
    try { await onStatus(order.id, status) } finally { setSaving(false) }
  }

  return (
    <div className="bg-white rounded-2xl p-5 mb-3" style={{ border: '1px solid #F0E6DC' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-playfair font-bold text-lg" style={{ color: '#3D1A1A' }}>#{order.id}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5EDE4', color: '#7A6258' }}>{order.letter_type}</span>
          </div>
          <p className="text-sm" style={{ color: '#5C3A2E' }}>
            {order.customer_name} · <a href={`https://wa.me/91${(order.customer_phone || '').replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1FA855' }}>{order.customer_phone}</a>
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

      <button onClick={() => setOpen(!open)} className="text-xs mt-3 underline" style={{ color: '#9D4433' }}>
        {open ? 'Hide details' : 'View details'}
      </button>

      {open && (
        <div className="mt-3 pt-3 text-sm space-y-1.5" style={{ borderTop: '1px solid #F0E6DC', color: '#5C3A2E' }}>
          {order.occasion && <p><strong>Occasion:</strong> {order.occasion}</p>}
          {order.relationship && <p><strong>Relationship:</strong> {order.relationship}</p>}
          {order.tone && <p><strong>Tone:</strong> {order.tone}</p>}
          <p><strong>Message:</strong> {order.message_to_write}</p>
          {order.mystery_tier && order.mystery_tier !== 'No Gift' && <p><strong>Gift:</strong> {order.mystery_tier}</p>}
          <p><strong>Deliver to:</strong> {order.delivery_address}{order.city ? `, ${order.city}` : ''}{order.pincode ? ` - ${order.pincode}` : ''}</p>
          {order.special_instructions && <p><strong>Notes:</strong> {order.special_instructions}</p>}
          {order.customer_email && <p><strong>Email:</strong> {order.customer_email}</p>}
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

// ── Dashboard ──
function Dashboard({ onSignOut }) {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [o, e] = await Promise.all([getOrders(), getCorporateEnquiries()])
      setOrders(o); setEnquiries(e)
    } catch (err) {
      setError(err?.message || 'Could not load data. Check the admin read policies.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_price || 0), 0)

  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen">
      {/* Top bar */}
      <header style={{ backgroundColor: '#451A1C' }} className="px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-playfair text-xl font-bold" style={{ color: '#FBF6F0' }}>Akshar Studio</span>
          <span className="text-xs ml-2" style={{ color: 'rgba(251,246,240,0.6)' }}>Admin</span>
        </div>
        <button onClick={onSignOut} className="text-sm px-4 py-2 rounded-full" style={{ border: '1px solid rgba(251,246,240,0.3)', color: '#FBF6F0' }}>
          Sign out
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Orders', value: orders.length },
            { label: 'Enquiries', value: enquiries.length },
            { label: 'Revenue', value: inr(revenue) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center" style={{ border: '1px solid #F0E6DC' }}>
              <p className="text-2xl font-bold" style={{ color: '#3D1A1A' }}>{s.value}</p>
              <p className="text-xs uppercase tracking-wide" style={{ color: '#A8968C' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[['orders', `Orders (${orders.length})`], ['corporate', `Corporate (${enquiries.length})`], ['products', 'Products'], ['reviews', 'Reviews']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={tab === id ? { backgroundColor: '#9D4433', color: 'white' } : { backgroundColor: '#F0E6DC', color: '#5C3A2E' }}>
              {label}
            </button>
          ))}
          {tab !== 'products' && tab !== 'reviews' && (
            <button onClick={load} className="ml-auto px-4 py-2 rounded-full text-sm" style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}>
              ↻ Refresh
            </button>
          )}
        </div>

        {error && <div className="rounded-xl p-4 mb-4 text-sm" style={{ backgroundColor: '#FBE9E4', color: '#9D4433', border: '1px solid #E8C4B8' }}>{error}</div>}
        {loading && <p style={{ color: '#A8968C' }}>Loading…</p>}

        {!loading && tab === 'orders' && (
          orders.length ? orders.map(o => <OrderRow key={o.id} order={o} onStatus={handleStatus} />)
            : <p style={{ color: '#A8968C' }}>No orders yet.</p>
        )}
        {!loading && tab === 'corporate' && (
          enquiries.length ? enquiries.map(e => <EnquiryRow key={e.id} e={e} />)
            : <p style={{ color: '#A8968C' }}>No corporate enquiries yet.</p>
        )}
        {tab === 'products' && <ProductsManager />}
        {tab === 'reviews' && <ProductsManager only="reviews" />}
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

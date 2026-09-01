import { useState, useEffect } from 'react'
import { adminFetch, adminUpsert, adminDelete, seedTable, adminCounts } from '../lib/products'

// Field schema per product table
const SCHEMAS = {
  letter_types: {
    label: 'Letters', idKey: 'slug',
    fields: [
      { k: 'slug', label: 'Slug / ID', type: 'text', addOnly: true },
      { k: 'name', label: 'Name', type: 'text' },
      { k: 'price', label: 'Price (₹)', type: 'number' },
      { k: 'description', label: 'Description (card)', type: 'textarea' },
      { k: 'image', label: 'Image URL', type: 'text' },
      { k: 'emoji', label: 'Emoji', type: 'text' },
      { k: 'is_bestseller', label: 'Bestseller (dark card)', type: 'bool' },
      { k: 'tagline', label: 'Tagline (order header)', type: 'text' },
      { k: 'recipient_label', label: 'Recipient question', type: 'text' },
      { k: 'prompt', label: 'Writing prompt', type: 'textarea' },
      { k: 'placeholder', label: 'Textarea placeholder', type: 'textarea' },
      { k: 'occasions', label: 'Occasions (one per line)', type: 'list' },
      { k: 'tones', label: 'Tones (one per line)', type: 'list' },
      { k: 'accent', label: 'Accent colours', type: 'accent' },
      { k: 'sort_order', label: 'Sort order', type: 'number' },
      { k: 'is_active', label: 'Active', type: 'bool' },
    ],
  },
  gifts: {
    label: 'Gifts', idKey: 'id',
    fields: [
      { k: 'id', label: 'Slug / ID', type: 'text', addOnly: true },
      { k: 'name', label: 'Name', type: 'text' },
      { k: 'description', label: 'Description', type: 'text' },
      { k: 'price', label: 'Selling price (₹)', type: 'number' },
      { k: 'emoji', label: 'Emoji', type: 'text' },
      { k: 'image', label: 'Image URL', type: 'text' },
      { k: 'personalised', label: 'Personalised', type: 'bool' },
      { k: 'cost_price', label: '🔒 Cost price (₹) — admin only', type: 'number' },
      { k: 'supplier', label: '🔒 Supplier — admin only', type: 'text' },
      { k: 'source_url', label: '🔒 Buy link / source URL — admin only', type: 'text' },
      { k: 'sort_order', label: 'Sort order', type: 'number' },
      { k: 'is_active', label: 'Active', type: 'bool' },
    ],
  },
  paper_types: {
    label: 'Paper', idKey: 'id',
    fields: [
      { k: 'id', label: 'Slug / ID', type: 'text', addOnly: true },
      { k: 'name', label: 'Name', type: 'text' },
      { k: 'description', label: 'Description', type: 'text' },
      { k: 'price', label: 'Price (₹)', type: 'number' },
      { k: 'bg', label: 'Paper colour', type: 'color' },
      { k: 'sort_order', label: 'Sort order', type: 'number' },
      { k: 'is_active', label: 'Active', type: 'bool' },
    ],
  },
  ink_colors: {
    label: 'Ink', idKey: 'id',
    fields: [
      { k: 'id', label: 'Slug / ID', type: 'text', addOnly: true },
      { k: 'name', label: 'Name', type: 'text' },
      { k: 'hex', label: 'Ink colour', type: 'color' },
      { k: 'price', label: 'Price (₹)', type: 'number' },
      { k: 'sort_order', label: 'Sort order', type: 'number' },
      { k: 'is_active', label: 'Active', type: 'bool' },
    ],
  },
  gift_tiers: {
    label: 'Mystery Tiers', idKey: 'id',
    fields: [
      { k: 'id', label: 'Slug / ID', type: 'text', addOnly: true },
      { k: 'name', label: 'Name', type: 'text' },
      { k: 'description', label: 'Description', type: 'text' },
      { k: 'price', label: 'Price (₹)', type: 'number' },
      { k: 'sort_order', label: 'Sort order', type: 'number' },
      { k: 'is_active', label: 'Active', type: 'bool' },
    ],
  },
  reviews: {
    label: 'Reviews', idKey: 'id', autoId: true,
    fields: [
      { k: 'name', label: 'Customer name', type: 'text' },
      { k: 'location', label: 'Location', type: 'text' },
      { k: 'rating', label: 'Rating (1–5)', type: 'number' },
      { k: 'letter_type', label: 'Letter type (label)', type: 'text' },
      { k: 'quote', label: 'Review text', type: 'textarea' },
      { k: 'sort_order', label: 'Sort order', type: 'number' },
      { k: 'is_active', label: 'Show on site', type: 'bool' },
    ],
  },
  faqs: {
    label: 'FAQs', idKey: 'id', autoId: true,
    fields: [
      { k: 'question', label: 'Question', type: 'textarea' },
      { k: 'answer', label: 'Answer', type: 'textarea' },
      { k: 'category', label: 'Category (e.g. Ordering, Delivery)', type: 'text' },
      { k: 'sort_order', label: 'Sort order', type: 'number' },
      { k: 'is_active', label: 'Show on site', type: 'bool' },
    ],
  },
}

const PRODUCT_TABLES = ['letter_types', 'gifts', 'paper_types', 'ink_colors', 'gift_tiers']
const inputStyle = { border: '1px solid #E3D5C8', color: '#3D1A1A' }
const inputCls = 'w-full px-3 py-2 rounded-lg bg-white outline-none text-sm'

// Build an empty row for "add new"
function emptyRow(table) {
  const r = {}
  for (const f of SCHEMAS[table].fields) {
    r[f.k] = f.type === 'bool' ? (f.k === 'is_active')
      : f.type === 'number' ? (f.k === 'rating' ? 5 : 0)
      : f.type === 'list' ? []
      : f.type === 'accent' ? { tint: '#FBE3DB', icon: '#B5593A', border: '#E2A18E', glow: 'rgba(0,0,0,0.2)' }
      : ''
  }
  return r
}

function EditForm({ table, row, onSave, onCancel, isNew }) {
  const [draft, setDraft] = useState(() => ({ ...row }))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  const save = async () => {
    setSaving(true); setErr('')
    try {
      await onSave(draft)
    } catch (e) { setErr(e?.message || 'Save failed'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(46,20,21,0.6)' }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-8">
        <h3 className="font-playfair text-xl font-bold mb-4" style={{ color: '#3D1A1A' }}>{isNew ? 'Add' : 'Edit'} {SCHEMAS[table].label}</h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {SCHEMAS[table].fields.map((f) => {
            if (f.addOnly && !isNew) return (
              <div key={f.k}><label className="block text-xs font-medium mb-1" style={{ color: '#A8968C' }}>{f.label}</label><div className="text-sm font-semibold" style={{ color: '#3D1A1A' }}>{draft[f.k]}</div></div>
            )
            return (
              <div key={f.k}>
                <label className="block text-xs font-medium mb-1" style={{ color: '#5C3A2E' }}>{f.label}</label>
                {f.type === 'textarea' && <textarea rows={2} value={draft[f.k] || ''} onChange={(e) => set(f.k, e.target.value)} className={inputCls + ' resize-none'} style={inputStyle} />}
                {f.type === 'text' && <input value={draft[f.k] || ''} onChange={(e) => set(f.k, e.target.value)} className={inputCls} style={inputStyle} />}
                {f.type === 'number' && <input type="number" value={draft[f.k] ?? 0} onChange={(e) => set(f.k, Number(e.target.value))} className={inputCls} style={inputStyle} />}
                {f.type === 'bool' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!draft[f.k]} onChange={(e) => set(f.k, e.target.checked)} style={{ accentColor: '#9D4433' }} />
                    <span className="text-sm" style={{ color: '#5C3A2E' }}>{draft[f.k] ? 'Yes' : 'No'}</span>
                  </label>
                )}
                {f.type === 'color' && (
                  <div className="flex items-center gap-2">
                    <input type="color" value={draft[f.k] || '#000000'} onChange={(e) => set(f.k, e.target.value)} className="w-10 h-9 rounded cursor-pointer" />
                    <input value={draft[f.k] || ''} onChange={(e) => set(f.k, e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                )}
                {f.type === 'list' && (
                  <textarea rows={3} value={(draft[f.k] || []).join('\n')} onChange={(e) => set(f.k, e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} className={inputCls + ' resize-none'} style={inputStyle} />
                )}
                {f.type === 'accent' && (
                  <div className="flex flex-wrap gap-3">
                    {['tint', 'icon', 'border'].map((key) => (
                      <label key={key} className="flex items-center gap-1.5 text-xs" style={{ color: '#7A6258' }}>
                        {key}
                        <input type="color" value={(draft.accent || {})[key] || '#cccccc'}
                          onChange={(e) => set('accent', { ...(draft.accent || {}), [key]: e.target.value, glow: 'rgba(0,0,0,0.2)' })}
                          className="w-8 h-8 rounded cursor-pointer" />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {err && <p className="text-sm mt-3" style={{ color: '#9D4433' }}>{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={save} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold rounded-full disabled:opacity-60" style={{ backgroundColor: '#9D4433', color: 'white' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onCancel} className="px-5 py-2.5 text-sm rounded-full" style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// A thumbnail that works for every table: the real image where there is one,
// the actual colour for paper and ink, emoji otherwise. A products screen
// without pictures is just a spreadsheet.
function Thumb({ table, row }) {
  const base = 'w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden'
  if (row.image) {
    return (
      <div className={base} style={{ backgroundColor: '#F5EDE4' }}>
        <img src={row.image} alt="" loading="lazy" className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }} />
      </div>
    )
  }
  if (table === 'paper_types' || table === 'ink_colors') {
    return <div className={base} style={{ backgroundColor: row.bg || row.hex || '#F5EDE4', border: '1px solid #E3D5C8' }} />
  }
  return (
    <div className={base} style={{ backgroundColor: '#F5EDE4', fontSize: '1.5rem' }}>
      {row.emoji || (row.rating ? '★' : row.question ? '?' : '•')}
    </div>
  )
}

function Badge({ bg, fg, children }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color: fg }}>{children}</span>
  )
}

/** The one-line summary under a row's name — different per table. */
function summarise(table, row, schema) {
  const bits = []
  if (table === 'reviews') {
    bits.push((row.rating || 0) + '★')
    if (row.location) bits.push(row.location)
    if (row.letter_type) bits.push(row.letter_type)
  } else if (table === 'faqs') {
    if (row.category) bits.push(row.category)
  } else {
    if (row.price != null) bits.push('₹' + row.price)
    if (row.cost_price != null && row.cost_price > 0) {
      bits.push('cost ₹' + row.cost_price)
      if (row.price != null) {
        const margin = row.price - row.cost_price
        const pct = row.price > 0 ? Math.round((margin / row.price) * 100) : 0
        bits.push('margin ₹' + margin + ' (' + pct + '%)')
      }
    }
  }
  bits.push(String(row[schema.idKey]))
  return bits.filter(Boolean).join('  ·  ')
}

export default function ProductsManager({ only }) {
  const tables = only ? [only] : PRODUCT_TABLES
  const [table, setTable] = useState(tables[0])
  const [rows, setRows] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // row or 'new'

  // Toolbar
  const [q, setQ] = useState('')
  const [vis, setVis] = useState('all')   // all | active | hidden

  const schema = SCHEMAS[table]

  const load = async () => {
    setLoading(true); setError('')
    try { setRows(await adminFetch(table)) }
    catch (e) { setError(e?.message || 'Could not load'); setRows([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load(); setQ(''); setVis('all') }, [table])

  // Tab badges. A failed count must never block the screen.
  const refreshCounts = () => {
    if (tables.length > 1) adminCounts(tables).then(setCounts).catch(() => {})
  }
  useEffect(refreshCounts, [])

  const after = () => { load(); refreshCounts() }

  const onSave = async (draft) => {
    await adminUpsert(table, draft)
    setEditing(null)
    after()
  }

  const onDelete = async (row) => {
    const name = row.name || row.question || row[schema.idKey]
    if (!confirm('Delete "' + name + '"? This cannot be undone.\n\nTo take it off the site without losing it, use Hide instead.')) return
    await adminDelete(table, schema.idKey, row[schema.idKey])
    after()
  }

  const onToggle = async (row) => {
    await adminUpsert(table, { ...row, is_active: !row.is_active })
    after()
  }

  const onSeed = async () => {
    if (!confirm('Import the current default products into this table?')) return
    await seedTable(table); after()
  }

  // Reorder by renumbering the whole list — immune to the duplicate or
  // missing sort_order values that seeded and hand-edited rows end up with.
  const move = async (row, dir) => {
    const i = rows.findIndex((r) => r[schema.idKey] === row[schema.idKey])
    const j = i + dir
    if (i < 0 || j < 0 || j >= rows.length) return
    const next = [...rows]
    const tmp = next[i]; next[i] = next[j]; next[j] = tmp
    setRows(next.map((r, idx) => ({ ...r, sort_order: idx + 1 })))   // optimistic
    setBusy(true)
    try {
      await Promise.all(next.map((r, idx) => adminUpsert(table, { ...r, sort_order: idx + 1 })))
    } catch (e) {
      setError(e?.message || 'Could not save the new order')
    } finally {
      setBusy(false); load()
    }
  }

  // ── Filtering ──────────────────────────────────────────────
  const needle = q.trim().toLowerCase()
  const shown = rows.filter((r) => {
    if (vis === 'active' && !r.is_active) return false
    if (vis === 'hidden' && r.is_active) return false
    if (!needle) return true
    return [r.name, r.question, r.answer, r.description, r.quote, r.supplier,
            r.category, r.location, r[schema.idKey]]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(needle))
  })

  // Arrows only make sense against the full, unfiltered list.
  const canReorder = !needle && vis === 'all' && rows.length > 1
  const hiddenCount = rows.filter((r) => !r.is_active).length

  return (
    <div>
      {/* Sub-tabs (hidden when managing a single table) */}
      {tables.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tables.map((t) => (
            <button key={t} onClick={() => setTable(t)}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={table === t ? { backgroundColor: '#451A1C', color: '#E0A93C' } : { backgroundColor: '#F0E6DC', color: '#5C3A2E' }}>
              {SCHEMAS[t].label}
              {counts[t] != null && <span className="ml-1.5 opacity-60">{counts[t]}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-3 mb-3" style={{ border: '1px solid #F0E6DC' }}>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={'Search ' + schema.label.toLowerCase() + '…'}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white outline-none text-sm" style={inputStyle} />
          <select value={vis} onChange={(e) => setVis(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white outline-none text-sm" style={inputStyle}>
            <option value="all">All ({rows.length})</option>
            <option value="active">Live ({rows.length - hiddenCount})</option>
            <option value="hidden">Hidden ({hiddenCount})</option>
          </select>
          <button onClick={() => setEditing('new')}
            className="px-5 py-2.5 text-sm font-semibold rounded-full whitespace-nowrap"
            style={{ backgroundColor: '#9D4433', color: 'white' }}>+ Add</button>
        </div>
        <p className="text-xs mt-2" style={{ color: '#A8968C' }}>
          Showing {shown.length} of {rows.length}
          {canReorder
            ? ' · reorder with ↑ ↓ — this is the order customers see'
            : rows.length > 1 ? ' · clear the search to reorder' : ''}
          {busy && ' · saving…'}
        </p>
      </div>

      {error && <div className="rounded-xl p-3 mb-3 text-sm" style={{ backgroundColor: '#FBE9E4', color: '#9D4433' }}>{error}</div>}
      {loading && <p style={{ color: '#A8968C' }}>Loading…</p>}

      {/* Empty — nothing in the table at all */}
      {!loading && rows.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #F0E6DC' }}>
          <p className="font-semibold mb-1" style={{ color: '#3D1A1A' }}>Nothing here yet</p>
          <p className="text-sm mb-5" style={{ color: '#A8968C' }}>
            {PRODUCT_TABLES.includes(table)
              ? 'Orders are priced from this table — the order form rejects orders until it has rows.'
              : 'Add your first entry, or import the defaults to start from.'}
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button onClick={onSeed} className="px-5 py-2.5 text-sm font-semibold rounded-full" style={{ backgroundColor: '#C49A2E', color: '#451A1C' }}>
              ↓ Import current defaults
            </button>
            <button onClick={() => setEditing('new')} className="px-5 py-2.5 text-sm font-semibold rounded-full" style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}>
              + Add manually
            </button>
          </div>
        </div>
      )}

      {/* Empty — filters hid everything */}
      {!loading && rows.length > 0 && shown.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #F0E6DC' }}>
          <p className="text-sm" style={{ color: '#A8968C' }}>Nothing matches that.</p>
          <button onClick={() => { setQ(''); setVis('all') }} className="text-sm mt-2 underline" style={{ color: '#9D4433' }}>Clear filters</button>
        </div>
      )}

      {/* Rows */}
      {!loading && shown.map((row, idx) => (
        <div key={row[schema.idKey]} className="bg-white rounded-2xl p-4 mb-2"
          style={{ border: '1px solid #F0E6DC', opacity: row.is_active ? 1 : 0.6 }}>
          <div className="flex gap-3">
            <Thumb table={table} row={row} />

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2 flex-wrap">
                <p className="font-semibold text-sm" style={{ color: '#3D1A1A' }}>
                  {row.name || row.question || row[schema.idKey]}
                </p>
                {row.is_bestseller && <Badge bg="#FBEFD6" fg="#8A6A16">Bestseller</Badge>}
                {row.personalised && <Badge bg="#EDE7F5" fg="#5B4A87">Personalised</Badge>}
                {!row.is_active && <Badge bg="#F0E6DC" fg="#8A7A70">Hidden</Badge>}
              </div>

              <p className="text-xs mt-1" style={{ color: '#A8968C' }}>{summarise(table, row, schema)}</p>

              {(row.description || row.answer || row.quote) && (
                <p className="text-xs mt-1.5" style={{ color: '#5C3A2E', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {row.description || row.answer || row.quote}
                </p>
              )}

              {row.supplier && <p className="text-xs mt-1.5" style={{ color: '#A8968C' }}>🔒 {row.supplier}</p>}
            </div>

            {canReorder && (
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => move(row, -1)} disabled={idx === 0 || busy}
                  aria-label="Move up" className="w-7 h-7 rounded-lg text-xs disabled:opacity-25"
                  style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}>↑</button>
                <button onClick={() => move(row, 1)} disabled={idx === shown.length - 1 || busy}
                  aria-label="Move down" className="w-7 h-7 rounded-lg text-xs disabled:opacity-25"
                  style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}>↓</button>
              </div>
            )}
          </div>

          {/* Actions on their own row, so they never squash the name on a phone */}
          <div className="flex items-center gap-2 flex-wrap mt-3 pt-3" style={{ borderTop: '1px solid #F7F1EA' }}>
            <button onClick={() => onToggle(row)} className="text-xs px-3 py-1.5 rounded-full"
              style={row.is_active ? { backgroundColor: '#E5F0E8', color: '#2E7D52' } : { backgroundColor: '#F0E6DC', color: '#8A7A70' }}>
              {row.is_active ? '● Live' : '○ Hidden'}
            </button>
            <button onClick={() => setEditing(row)} className="text-xs px-4 py-1.5 rounded-full" style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}>Edit</button>
            {row.source_url && (
              <a href={row.source_url} target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: '#EAF1EC', color: '#2E7D52' }}>Buy ↗</a>
            )}
            <button onClick={() => onDelete(row)} className="text-xs px-4 py-1.5 rounded-full ml-auto" style={{ border: '1px solid #E8C4B8', color: '#9D4433' }}>Delete</button>
          </div>
        </div>
      ))}

      {/* Seeding stays reachable once there are rows, for a partly-filled table */}
      {!loading && rows.length > 0 && PRODUCT_TABLES.includes(table) && (
        <button onClick={onSeed} className="text-xs mt-2 underline" style={{ color: '#A8968C' }}>
          Import any missing defaults
        </button>
      )}

      {editing && (
        <EditForm
          table={table}
          row={editing === 'new' ? { ...emptyRow(table), sort_order: rows.length + 1 } : editing}
          isNew={editing === 'new'}
          onSave={onSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}

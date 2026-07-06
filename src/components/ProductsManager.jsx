import { useState, useEffect } from 'react'
import { adminFetch, adminUpsert, adminDelete, seedTable } from '../lib/products'

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
      { k: 'price', label: 'Price (₹)', type: 'number' },
      { k: 'emoji', label: 'Emoji', type: 'text' },
      { k: 'image', label: 'Image URL', type: 'text' },
      { k: 'personalised', label: 'Personalised', type: 'bool' },
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

export default function ProductsManager({ only }) {
  const tables = only ? [only] : PRODUCT_TABLES
  const [table, setTable] = useState(tables[0])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // row or 'new'

  const schema = SCHEMAS[table]

  const load = async () => {
    setLoading(true); setError('')
    try { setRows(await adminFetch(table)) }
    catch (e) { setError(e?.message || 'Could not load'); setRows([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [table])

  const onSave = async (draft) => {
    await adminUpsert(table, draft)
    setEditing(null)
    load()
  }
  const onDelete = async (row) => {
    if (!confirm(`Delete "${row.name || row.question}"? This cannot be undone.`)) return
    await adminDelete(table, schema.idKey, row[schema.idKey])
    load()
  }
  const onToggle = async (row) => {
    await adminUpsert(table, { ...row, is_active: !row.is_active })
    load()
  }
  const onSeed = async () => {
    if (!confirm('Import the current default products into this table?')) return
    await seedTable(table); load()
  }

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
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ color: '#A8968C' }}>{rows.length} item{rows.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          {rows.length === 0 && !loading && (
            <button onClick={onSeed} className="px-4 py-2 text-sm font-semibold rounded-full" style={{ backgroundColor: '#C49A2E', color: '#451A1C' }}>
              ↓ Import current defaults
            </button>
          )}
          <button onClick={() => setEditing('new')} className="px-4 py-2 text-sm font-semibold rounded-full" style={{ backgroundColor: '#9D4433', color: 'white' }}>+ Add</button>
        </div>
      </div>

      {error && <div className="rounded-xl p-3 mb-3 text-sm" style={{ backgroundColor: '#FBE9E4', color: '#9D4433' }}>{error}</div>}
      {loading && <p style={{ color: '#A8968C' }}>Loading…</p>}

      {!loading && rows.map((row) => (
        <div key={row[schema.idKey]} className="bg-white rounded-xl p-4 mb-2 flex items-center justify-between gap-3" style={{ border: '1px solid #F0E6DC', opacity: row.is_active ? 1 : 0.55 }}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg">{row.emoji || (row.rating ? '★' : '•')}</span>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: '#3D1A1A' }}>{row.name || row.question}</p>
              <p className="text-xs truncate" style={{ color: '#A8968C' }}>
                {[
                  row.price != null && `₹${row.price}`,
                  row.rating != null && `${row.rating}★`,
                  row.letter_type || row.location,
                ].filter(Boolean).join(' · ') || row[schema.idKey]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onToggle(row)} className="text-xs px-2.5 py-1 rounded-full"
              style={row.is_active ? { backgroundColor: '#E5F0E8', color: '#2E7D52' } : { backgroundColor: '#F0E6DC', color: '#A8968C' }}>
              {row.is_active ? 'Active' : 'Hidden'}
            </button>
            <button onClick={() => setEditing(row)} className="text-xs px-3 py-1 rounded-full" style={{ border: '1px solid #E3D5C8', color: '#5C3A2E' }}>Edit</button>
            <button onClick={() => onDelete(row)} className="text-xs px-3 py-1 rounded-full" style={{ border: '1px solid #E8C4B8', color: '#9D4433' }}>Delete</button>
          </div>
        </div>
      ))}

      {editing && (
        <EditForm
          table={table}
          row={editing === 'new' ? emptyRow(table) : editing}
          isNew={editing === 'new'}
          onSave={onSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchFaqs, DEFAULT_FAQS } from '../lib/products'

function AccordionItem({ q, a, open, onToggle }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'white', border: '1px solid #F0E6DC' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-sm md:text-base" style={{ color: '#3D1A1A' }}>{q}</span>
        <svg
          className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
          style={{ color: '#9D4433', transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1 text-sm leading-relaxed" style={{ color: '#7A6258' }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function Faq() {
  const [faqs, setFaqs] = useState(DEFAULT_FAQS)
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    fetchFaqs().then(setFaqs).catch(() => {})
  }, [])

  // SEO: FAQPage structured data (rich results in Google)
  useEffect(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    }
    const tag = document.createElement('script')
    tag.type = 'application/ld+json'
    tag.text = JSON.stringify(data)
    document.head.appendChild(tag)
    return () => { document.head.removeChild(tag) }
  }, [faqs])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return faqs
    return faqs.filter((f) => (f.question + ' ' + f.answer).toLowerCase().includes(q))
  }, [faqs, query])

  // group by category, preserving sort order
  const grouped = useMemo(() => {
    const map = {}
    for (const f of filtered) {
      const c = f.category || 'General'
      ;(map[c] = map[c] || []).push(f)
    }
    return map
  }, [filtered])

  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen">
      {/* Hero */}
      <section style={{ backgroundColor: '#451A1C' }} className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#C49A2E' }}>Help Centre</span>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mt-4 mb-5 leading-tight" style={{ color: '#FBF6F0' }}>
            Frequently asked <span className="italic" style={{ color: '#E0A93C' }}>questions</span>
          </h1>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-11 pr-4 py-3 rounded-full outline-none text-sm"
              style={{ backgroundColor: '#FBF6F0', color: '#3D1A1A' }}
            />
            <svg className="w-5 h-5 absolute left-4 top-3.5" style={{ color: '#A8968C' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>
      </section>

      {/* FAQ list */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-center" style={{ color: '#A8968C' }}>No questions match "{query}". Try another search.</p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-10">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#C49A2E' }}>{category}</h2>
                <div className="space-y-3">
                  {items.map((f) => (
                    <AccordionItem
                      key={f.id}
                      q={f.question}
                      a={f.answer}
                      open={openId === f.id}
                      onToggle={() => setOpenId(openId === f.id ? null : f.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Still have questions */}
          <div className="rounded-2xl p-8 text-center mt-6" style={{ backgroundColor: '#451A1C' }}>
            <h3 className="font-playfair text-xl font-bold mb-2" style={{ color: '#FBF6F0' }}>Still have a question?</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(251,246,240,0.7)' }}>We're happy to help — reach us on WhatsApp or send a message.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-full" style={{ backgroundColor: '#25D366', color: 'white' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.121 1.522 5.855L.058 23.568a.5.5 0 00.612.612l5.713-1.464A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
                Chat on WhatsApp
              </a>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-full" style={{ border: '1px solid rgba(251,246,240,0.3)', color: '#FBF6F0' }}>
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

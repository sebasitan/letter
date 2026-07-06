import { useState } from 'react'
import { createCorporateEnquiry } from '../lib/supabase'
import Seo from '../components/Seo'

const useCases = [
  { icon: '🎂', title: 'Birthdays & Anniversaries', desc: 'Celebrate every employee’s special day with a handwritten note.' },
  { icon: '🪔', title: 'Festival Gifting', desc: 'Diwali, New Year & seasonal wishes for teams and clients.' },
  { icon: '🤝', title: 'Client Appreciation', desc: 'Thank-you letters that strengthen business relationships.' },
  { icon: '👋', title: 'Onboarding & Farewell', desc: 'Warm welcomes and heartfelt goodbyes for your people.' },
]

const steps = [
  { n: '01', t: 'Tell us', d: 'Share your occasion, quantity and timeline.' },
  { n: '02', t: 'We quote', d: 'Get a custom quote with volume pricing within 24 hours.' },
  { n: '03', t: 'You approve', d: 'Approve the quote and share your recipient list.' },
  { n: '04', t: 'We deliver', d: 'Hand-written, packed and delivered in bulk.' },
]

const occasions = ['Employee birthdays', 'Work anniversaries', 'Festival gifting', 'Client appreciation', 'Onboarding / Farewell', 'Other']
const quantityRanges = ['10–50', '50–100', '100–250', '250+']
const frequencies = ['One-time', 'Recurring (monthly / quarterly)']
const giftTiers = ['No gift', 'Gentle (₹249)', 'Warm (₹499)', 'Luxe (₹999)', 'Custom hamper']

export default function Corporate() {
  const [form, setForm] = useState({
    companyName: '', contactPerson: '', workEmail: '', phone: '',
    occasion: '', quantityRange: '', frequency: '', giftTier: '',
    timeline: '', cities: '', budget: '', requirements: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const handleChange = (e) => set(e.target.name, e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await createCorporateEnquiry({
        company_name: form.companyName,
        contact_person: form.contactPerson,
        work_email: form.workEmail || null,
        phone: form.phone,
        occasion: form.occasion || null,
        quantity_range: form.quantityRange || null,
        frequency: form.frequency || null,
        gift_tier: form.giftTier || null,
        delivery_timeline: form.timeline || null,
        cities: form.cities || null,
        budget: form.budget || null,
        requirements: form.requirements || null,
        status: 'new',
      })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Corporate enquiry failed:', err)
      setError(`Could not send your enquiry: ${err?.message || 'Unknown error'}. Please try again or reach us on WhatsApp.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white outline-none transition-all'
  const inputStyle = { border: '1px solid #E3D5C8', color: '#3D1A1A' }

  if (submitted) {
    const wa = `https://wa.me/919876543210?text=${encodeURIComponent(`Hi Akshar Studio! I just sent a corporate enquiry for ${form.companyName} (${form.quantityRange || ''} ${form.occasion || 'letters'}). Looking forward to the quote.`)}`
    return (
      <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 max-w-lg text-center" style={{ boxShadow: '0 20px 50px rgba(140,90,60,0.15)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#FDF5E6' }}>
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="font-playfair text-3xl font-bold mb-3" style={{ color: '#3D1A1A' }}>Enquiry received!</h1>
          <p className="mb-6" style={{ color: '#7A6258' }}>
            Thank you, {form.contactPerson.split(' ')[0] || 'there'}. Our team will send a custom quote for <strong>{form.companyName}</strong> within 24 hours.
          </p>
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full w-full mb-3"
            style={{ backgroundColor: '#25D366', color: 'white' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.121 1.522 5.855L.058 23.568a.5.5 0 00.612.612l5.713-1.464A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
            Fast-track on WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen">
      <Seo
        title="Corporate & Bulk Gifting"
        description="Handwritten letters & curated gifts for teams — employee birthdays, festivals, client appreciation, onboarding. Custom volume pricing. Request a quote."
        path="/corporate"
      />
      {/* Hero */}
      <section style={{ backgroundColor: '#451A1C' }} className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#C49A2E' }}>For Businesses</span>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mt-4 mb-5 leading-tight" style={{ color: '#FBF6F0' }}>
            Corporate & bulk <span className="italic" style={{ color: '#E0A93C' }}>gifting</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'rgba(251,246,240,0.75)' }}>
            Hand-written letters and curated gifts for your team and clients — birthdays, anniversaries, festivals and more. Custom pricing with volume discounts.
          </p>
          <a href="#enquiry" className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 text-sm font-semibold rounded-full" style={{ backgroundColor: '#E0A93C', color: '#451A1C' }}>
            Get a custom quote
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </a>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#3D1A1A' }}>
            Perfect for every <span className="italic" style={{ color: '#C49A2E' }}>occasion</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'white', border: '1px solid #F0E6DC', boxShadow: '0 10px 30px rgba(140,90,60,0.06)' }}>
                <span className="text-4xl mb-4 block">{u.icon}</span>
                <h3 className="font-playfair text-lg font-bold mb-2" style={{ color: '#3D1A1A' }}>{u.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7A6258' }}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: '#F5EDE4' }} className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#3D1A1A' }}>
            How it <span className="italic" style={{ color: '#C49A2E' }}>works</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold" style={{ backgroundColor: '#451A1C', color: '#E0A93C' }}>{s.n}</div>
                <h3 className="font-playfair text-lg font-bold mb-1" style={{ color: '#3D1A1A' }}>{s.t}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#7A6258' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquiry" className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-3" style={{ color: '#3D1A1A' }}>
              Request a <span className="italic" style={{ color: '#C49A2E' }}>quote</span>
            </h2>
            <p style={{ color: '#7A6258' }}>Tell us a bit about your needs — we'll reply within 24 hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 space-y-5" style={{ border: '1px solid #F0E6DC' }}>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Company name *</label>
                <input name="companyName" value={form.companyName} onChange={handleChange} required className={inputCls} style={inputStyle} placeholder="Your company" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Contact person *</label>
                <input name="contactPerson" value={form.contactPerson} onChange={handleChange} required className={inputCls} style={inputStyle} placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Work email *</label>
                <input type="email" name="workEmail" value={form.workEmail} onChange={handleChange} required className={inputCls} style={inputStyle} placeholder="you@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Phone (WhatsApp) *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required className={inputCls} style={inputStyle} placeholder="+91 98765 43210" />
              </div>
            </div>

            {/* Occasion chips */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Occasion</label>
              <div className="flex flex-wrap gap-2">
                {occasions.map((o) => (
                  <button type="button" key={o} onClick={() => set('occasion', o)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={form.occasion === o ? { backgroundColor: '#9D4433', color: 'white' } : { backgroundColor: '#F5EDE4', color: '#5C3A2E' }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Estimated quantity</label>
                <select name="quantityRange" value={form.quantityRange} onChange={handleChange} className={inputCls} style={inputStyle}>
                  <option value="">Select…</option>
                  {quantityRanges.map(q => <option key={q} value={q}>{q} letters</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Frequency</label>
                <select name="frequency" value={form.frequency} onChange={handleChange} className={inputCls} style={inputStyle}>
                  <option value="">Select…</option>
                  {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Add gifts?</label>
                <select name="giftTier" value={form.giftTier} onChange={handleChange} className={inputCls} style={inputStyle}>
                  <option value="">Select…</option>
                  {giftTiers.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Delivery timeline</label>
                <input name="timeline" value={form.timeline} onChange={handleChange} className={inputCls} style={inputStyle} placeholder="e.g. within 2 weeks" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Delivery cities</label>
                <input name="cities" value={form.cities} onChange={handleChange} className={inputCls} style={inputStyle} placeholder="e.g. Bangalore, PAN-India" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Budget (optional)</label>
                <input name="budget" value={form.budget} onChange={handleChange} className={inputCls} style={inputStyle} placeholder="e.g. ₹500/piece or total" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Requirements</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3} className={inputCls + ' resize-none'} style={inputStyle} placeholder="Tell us anything specific — branding, message style, GST invoice, etc." />
              <p className="text-xs mt-2" style={{ color: '#A8968C' }}>No need to share the recipient list now — we'll send you a simple template once you approve the quote.</p>
            </div>

            {error && (
              <div className="rounded-xl p-3 text-sm text-center" style={{ backgroundColor: '#FBE9E4', color: '#9D4433', border: '1px solid #E8C4B8' }}>{error}</div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 text-sm font-semibold rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#9D4433', color: 'white' }}>
              {isSubmitting ? 'Sending…' : 'Request my quote'}
              {!isSubmitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

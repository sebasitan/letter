import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { createOrder } from '../lib/supabase'
import { fetchCatalog, DEFAULT_LETTERS, DEFAULT_GIFTS, DEFAULT_PAPERS, DEFAULT_INKS, DEFAULT_TIERS } from '../lib/products'
import Seo from '../components/Seo'

// ── Per-letter-type content so the form feels tailored ──────────────
// Product data (letter types, tiers, paper, ink, gifts) is loaded from
// the catalog (Supabase, with code defaults as fallback) inside the component.

// Languages the customer can write their letter in (also drives voice input)
const letterLanguages = [
  { code: 'en', label: 'English', native: 'English', speech: 'en-IN', itc: null },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', speech: 'ta-IN', itc: 'ta-t-i0-und' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', speech: 'kn-IN', itc: 'kn-t-i0-und' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', speech: 'hi-IN', itc: 'hi-t-i0-und' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', speech: 'te-IN', itc: 'te-t-i0-und' },
]

// Phonetic transliteration via Google Input Tools (type "vanakkam" -> வணக்கம்)
async function fetchTransliteration(word, itc) {
  const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=${itc}&num=6&cp=0&cs=1&ie=utf-8&oe=utf-8`
  const res = await fetch(url)
  const data = await res.json()
  if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]) return data[1][0][1]
  return []
}

// Measure the pixel position of the caret inside a textarea (mirror-div technique)
function getCaretCoordinates(el, position) {
  const div = document.createElement('div')
  const computed = window.getComputedStyle(el)
  const props = [
    'boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'lineHeight',
    'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'letterSpacing',
    'wordSpacing', 'whiteSpace', 'wordWrap',
  ]
  div.style.position = 'absolute'
  div.style.visibility = 'hidden'
  div.style.whiteSpace = 'pre-wrap'
  div.style.wordWrap = 'break-word'
  props.forEach((p) => { div.style[p] = computed[p] })
  div.textContent = el.value.substring(0, position)
  const span = document.createElement('span')
  span.textContent = el.value.substring(position) || '.'
  div.appendChild(span)
  document.body.appendChild(div)
  const coords = { top: span.offsetTop, left: span.offsetLeft }
  document.body.removeChild(div)
  return coords
}

const featherMask = {
  WebkitMaskImage: 'radial-gradient(120% 120% at 80% 30%, #000 50%, transparent 82%)',
  maskImage: 'radial-gradient(120% 120% at 80% 30%, #000 50%, transparent 82%)',
}

export default function OrderForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preselectedType = searchParams.get('type') || ''

  // ── Product catalog (Supabase, with code defaults as fallback) ──
  const [letters, setLetters] = useState(DEFAULT_LETTERS)
  const [tiers, setTiers] = useState(DEFAULT_TIERS)
  const [gifts, setGifts] = useState(DEFAULT_GIFTS)
  const [papers, setPapers] = useState(DEFAULT_PAPERS)
  const [inks, setInks] = useState(DEFAULT_INKS)
  useEffect(() => {
    fetchCatalog().then((c) => {
      setLetters(c.letters); setTiers(c.tiers); setGifts(c.gifts); setPapers(c.papers); setInks(c.inks)
    }).catch(() => {})
  }, [])

  // Derived structures the form uses
  const letterConfig = {}
  for (const l of letters) {
    letterConfig[l.slug || l.id] = {
      label: l.name, price: l.price, image: l.image, emoji: l.emoji,
      tagline: l.tagline, recipientLabel: l.recipient_label || l.recipientLabel,
      prompt: l.prompt, placeholder: l.placeholder,
      occasions: l.occasions || [], tones: l.tones || [],
    }
  }
  const orderedTypes = letters.map((l) => l.slug || l.id)
  const mysteryTiers = [{ id: 'none', label: 'No Gift', price: 0 }, ...tiers.map((t) => ({ id: t.id, label: t.name, price: t.price, desc: t.description }))]
  const giftCatalog = gifts.map((g) => ({ ...g, desc: g.description ?? g.desc }))
  const paperTypes = papers.map((p) => ({ ...p, desc: p.description ?? p.desc }))
  const inkColors = inks

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    letterType: orderedTypes.includes(preselectedType) ? preselectedType : '',
    recipientName: '',
    occasion: '',
    relationship: '',
    messageToWrite: '',
    letterLang: 'en',
    tone: '',
    paperType: 'parchment',
    inkColor: 'black',
    giftMode: 'surprise', // 'surprise' | 'choose'
    mysteryTier: 'none',
    giftQty: {}, // { giftId: quantity } when giftMode === 'choose'
    deliveryAddress: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    deliveryPhone: '',
    surpriseDelivery: false,
    specialInstructions: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Voice-to-type (Web Speech API)
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)

  // Phonetic transliteration
  const messageRef = useRef(null)
  const debounceRef = useRef(null)
  const wordInfoRef = useRef({ start: 0, end: 0 })
  const [suggestions, setSuggestions] = useState([])
  const [caretPos, setCaretPos] = useState({ top: 0, left: 0 })

  // Letter preview modal
  const [showPreview, setShowPreview] = useState(false)

  // Pincode auto-lookup (India Post API)
  const [pinStatus, setPinStatus] = useState({ loading: false, error: '', areas: [] })

  const cfg = letterConfig[formData.letterType] || null
  const selectedTier = mysteryTiers.find(t => t.id === formData.mysteryTier)
  // selected gifts with their quantities
  const selectedGifts = giftCatalog
    .filter(g => (formData.giftQty[g.id] || 0) > 0)
    .map(g => ({ ...g, qty: formData.giftQty[g.id] }))
  const giftCount = selectedGifts.reduce((sum, g) => sum + g.qty, 0)
  const giftTotal = formData.letterType === 'mystery'
    ? 0
    : formData.giftMode === 'choose'
      ? selectedGifts.reduce((sum, g) => sum + g.price * g.qty, 0)
      : (selectedTier?.price || 0)

  const selectedPaper = paperTypes.find(p => p.id === formData.paperType)
  const selectedInk = inkColors.find(i => i.id === formData.inkColor)
  const extrasTotal = (selectedPaper?.price || 0) + (selectedInk?.price || 0)

  const totalPrice = (cfg?.price || 0) + giftTotal + extrasTotal

  const changeGiftQty = (id, delta) => setFormData(prev => {
    const current = prev.giftQty[id] || 0
    const next = Math.max(0, current + delta)
    const giftQty = { ...prev.giftQty }
    if (next === 0) delete giftQty[id]
    else giftQty[id] = next
    return { ...prev, giftQty }
  })

  // ── Pincode → auto-fill city & state (India Post API) ──
  const handlePincodeChange = async (e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6)
    setField('pincode', pin)
    setPinStatus({ loading: false, error: '', areas: [] })

    if (pin.length !== 6) return

    setPinStatus({ loading: true, error: '', areas: [] })
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      const entry = data?.[0]
      if (entry?.Status === 'Success' && entry.PostOffice?.length) {
        const offices = entry.PostOffice
        setFormData(prev => ({
          ...prev,
          city: offices[0].District || prev.city,
          state: offices[0].State || prev.state,
        }))
        setPinStatus({ loading: false, error: '', areas: offices.map(o => o.Name) })
      } else {
        setPinStatus({ loading: false, error: 'Pincode not found — please check.', areas: [] })
      }
    } catch {
      setPinStatus({ loading: false, error: 'Could not look up pincode. Enter city/state manually.', areas: [] })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const setField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }))

  // ── Set up speech recognition once ──
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setVoiceSupported(false); return }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-IN'
    rec.onresult = (e) => {
      let finalText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript
      }
      if (finalText) {
        setFormData(prev => ({
          ...prev,
          messageToWrite: (prev.messageToWrite + ' ' + finalText.trim()).trim(),
        }))
      }
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)
    recognitionRef.current = rec
    return () => { try { rec.stop() } catch { /* ignore */ } }
  }, [])

  const toggleVoice = () => {
    const rec = recognitionRef.current
    if (!rec) return
    if (isListening) {
      rec.stop()
      setIsListening(false)
    } else {
      // set recognition language to the chosen letter language
      const sel = letterLanguages.find(l => l.code === formData.letterLang)
      rec.lang = sel?.speech || 'en-IN'
      try { rec.start(); setIsListening(true) } catch { /* already started */ }
    }
  }

  // ── Phonetic transliteration as you type ──
  const langCfg = letterLanguages.find(l => l.code === formData.letterLang)

  const handleMessageChange = (e) => {
    const value = e.target.value
    const caret = e.target.selectionStart ?? value.length
    setField('messageToWrite', value)

    if (!langCfg?.itc) { setSuggestions([]); return }

    // current latin word immediately before the caret
    const before = value.slice(0, caret)
    const match = before.match(/([A-Za-z]+)$/)
    if (!match) { setSuggestions([]); return }

    const word = match[1]
    wordInfoRef.current = { start: caret - word.length, end: caret }

    // position the popup at the start of the current word
    const coords = getCaretCoordinates(e.target, caret - word.length)
    setCaretPos({ top: coords.top - e.target.scrollTop, left: coords.left })

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const list = await fetchTransliteration(word, langCfg.itc)
        setSuggestions(list)
      } catch { setSuggestions([]) }
    }, 250)
  }

  const acceptSuggestion = (sugg) => {
    const { start, end } = wordInfoRef.current
    const val = formData.messageToWrite
    const next = val.slice(0, start) + sugg + ' ' + val.slice(end)
    setField('messageToWrite', next)
    setSuggestions([])
    // restore focus + caret after the inserted word
    requestAnimationFrame(() => {
      const el = messageRef.current
      if (el) {
        const pos = start + sugg.length + 1
        el.focus()
        el.setSelectionRange(pos, pos)
      }
    })
  }

  const handleMessageKeyDown = (e) => {
    if (suggestions.length && (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab')) {
      e.preventDefault()
      acceptSuggestion(suggestions[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const langLabel = letterLanguages.find(l => l.code === formData.letterLang)?.label || 'English'
      const giftSummary = formData.letterType === 'mystery'
        ? 'Mystery Box (gift curated by studio)'
        : formData.giftMode === 'choose'
          ? (selectedGifts.length ? `Chosen gifts: ${selectedGifts.map(g => `${g.name}${g.qty > 1 ? ` x${g.qty}` : ''}`).join(', ')}` : 'No gift')
          : `Surprise gift: ${selectedTier?.label || 'No Gift'}`
      const deliveryPhone = formData.surpriseDelivery ? formData.customerPhone : formData.deliveryPhone
      const instructions = [
        `Letter language: ${langLabel}`,
        `Paper: ${selectedPaper?.name || 'Classic Parchment'}`,
        `Ink: ${selectedInk?.name || 'Classic Black'}`,
        `Delivery contact: ${deliveryPhone}${formData.surpriseDelivery ? ' (surprise — contact buyer)' : ''}`,
        giftSummary,
        formData.specialInstructions,
      ].filter(Boolean).join(' | ')

      await createOrder({
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail || null,
        letter_type: cfg?.label || formData.letterType,
        occasion: formData.occasion || null,
        recipient_name: formData.recipientName,
        relationship: formData.relationship || null,
        message_to_write: formData.messageToWrite,
        tone: formData.tone || null,
        mystery_tier: formData.giftMode === 'choose'
          ? (selectedGifts.map(g => `${g.name}${g.qty > 1 ? ` x${g.qty}` : ''}`).join(', ') || 'No Gift')
          : (selectedTier?.label || 'No Gift'),
        delivery_address: [formData.deliveryAddress, formData.area, formData.state]
          .filter(Boolean).join(', '),
        city: formData.city || null,
        pincode: formData.pincode || null,
        special_instructions: instructions,
        total_price: totalPrice,
        status: 'pending',
      })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Order submission failed:', err)
      const detail = err?.message || err?.error_description || 'Unknown error'
      setError(`Could not save your order: ${detail}. Please check your details or reach us on WhatsApp.`)
      // bring the error into view
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────
  if (submitted) {
    const waMessage = encodeURIComponent(
      `Hi Akshar Studio! 🌸 I just placed an order:\n` +
      `• ${cfg?.label || 'Letter'}\n` +
      (formData.recipientName ? `• For: ${formData.recipientName}\n` : '') +
      `• Total: ₹${totalPrice.toLocaleString()}\n` +
      `• Name: ${formData.customerName}\n` +
      `Looking forward to the draft!`
    )
    const waLink = `https://wa.me/919876543210?text=${waMessage}`

    return (
      <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 max-w-lg text-center" style={{ boxShadow: '0 20px 50px rgba(140,90,60,0.15)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#FDF5E6' }}>
            <span className="text-3xl">✉️</span>
          </div>
          <h1 className="font-playfair text-3xl font-bold mb-3" style={{ color: '#3D1A1A' }}>
            Order received!
          </h1>
          <p className="mb-6" style={{ color: '#7A6258' }}>
            Thank you, {formData.customerName.split(' ')[0] || 'friend'}. We'll share your draft and all updates on <strong>WhatsApp</strong> — tap below so we can reach you. 💛
          </p>
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#F5EDE4' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#A8968C' }}>Order Total</p>
            <p className="text-2xl font-bold" style={{ color: '#3D1A1A' }}>₹{totalPrice.toLocaleString()}</p>
          </div>

          {/* Primary: connect on WhatsApp for updates */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full w-full mb-3"
            style={{ backgroundColor: '#25D366', color: 'white' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Message us on WhatsApp
          </a>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold rounded-full w-full"
            style={{ backgroundColor: 'transparent', color: '#9D4433', border: '1.5px solid #E3C98A' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const inputCls = "w-full px-4 py-3 rounded-xl bg-white outline-none transition-all"
  const inputStyle = { border: '1px solid #E3D5C8', color: '#3D1A1A' }

  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen">
      <Seo
        title="Order a Handwritten Letter"
        description="Create your personalised handwritten letter — choose paper & ink, add a gift, write in your language. Free draft approval before we write. Same-day delivery in Bangalore."
        path="/order"
      />
      <section className="py-12 md:py-16 pb-28 lg:pb-16">
        <div className="max-w-6xl mx-auto px-4">

          {/* Plain header — only before a letter type is chosen */}
          {!cfg && (
            <div className="text-center mb-10">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-3" style={{ color: '#3D1A1A' }}>
                Order Your <span className="italic" style={{ color: '#C49A2E' }}>Letter</span>
              </h1>
              <p className="text-lg" style={{ color: '#7A6258' }}>
                First, choose the kind of letter you'd like us to write.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Letter type picker (only when none chosen) ── */}
            {!cfg && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {orderedTypes.map((id) => {
                  const t = letterConfig[id]
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setField('letterType', id)}
                      className="p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                      style={{ backgroundColor: 'white', border: '1px solid #E3D5C8' }}
                    >
                      <span className="text-2xl block mb-2">{t.emoji}</span>
                      <span className="font-playfair font-bold block" style={{ color: '#3D1A1A' }}>{t.label}</span>
                      <span className="text-xs" style={{ color: '#A8968C' }}>From ₹{t.price}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {cfg && (
              <>
                <div className="grid lg:grid-cols-3 gap-8">
                {/* ── LEFT COLUMN: header + form sections ── */}
                <div className="lg:col-span-2 space-y-6">

                {/* Contextual header */}
                <div className="relative rounded-3xl overflow-hidden p-6 md:p-8" style={{ backgroundColor: '#451A1C' }}>
                  <div className="absolute top-0 right-0 w-1/2 h-full opacity-90">
                    <img src={cfg.image} alt="" className="w-full h-full object-cover" style={featherMask} />
                  </div>
                  <div className="relative z-10 max-w-sm">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ backgroundColor: 'rgba(196,154,46,0.15)', color: '#E0A93C' }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    <h1 className="font-playfair text-2xl md:text-3xl font-bold mb-2" style={{ color: '#FBF6F0' }}>
                      Let's write your <span className="italic" style={{ color: '#E0A93C' }}>letter.</span>
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(251,246,240,0.7)' }}>{cfg.tagline}</p>
                    <button type="button" onClick={() => setField('letterType', '')} className="mt-4 text-xs underline underline-offset-2" style={{ color: 'rgba(251,246,240,0.6)' }}>
                      Change letter type
                    </button>
                  </div>
                </div>

                {/* Phase: Your Letter */}
                <div className="flex items-center gap-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#C49A2E' }}>✍️ Your Letter</span>
                  <span className="flex-1 h-px" style={{ backgroundColor: '#E3D5C8' }} />
                </div>

                {/* ── About the recipient ── */}
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #F0E6DC' }}>
                  <h2 className="font-playfair text-lg font-bold mb-1" style={{ color: '#3D1A1A' }}>1. Who is this letter for?</h2>
                  <p className="text-sm mb-5" style={{ color: '#A8968C' }}>{cfg.recipientLabel}</p>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Recipient's name *</label>
                      <input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} required className={inputCls} style={inputStyle} placeholder="Their name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Your relationship</label>
                      <input type="text" name="relationship" value={formData.relationship} onChange={handleChange} className={inputCls} style={inputStyle} placeholder="e.g. Partner, Mother, Best friend" />
                    </div>
                  </div>

                  {/* Occasion chips */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Occasion</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cfg.occasions.map((o) => (
                        <button
                          type="button"
                          key={o}
                          onClick={() => setField('occasion', o)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                          style={formData.occasion === o
                            ? { backgroundColor: '#9D4433', color: 'white' }
                            : { backgroundColor: '#F5EDE4', color: '#5C3A2E' }}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                    <input type="text" name="occasion" value={formData.occasion} onChange={handleChange} className={inputCls} style={inputStyle} placeholder="…or type your own occasion" />
                  </div>
                </div>

                {/* ── What to say ── */}
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #F0E6DC' }}>
                  <h2 className="font-playfair text-lg font-bold mb-1" style={{ color: '#3D1A1A' }}>2. What do you want to say?</h2>
                  <p className="text-sm mb-4" style={{ color: '#A8968C' }}>{cfg.prompt}</p>

                  {/* Letter language selector */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#A8968C' }}>
                      Write in which language?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {letterLanguages.map((l) => (
                        <button
                          type="button"
                          key={l.code}
                          onClick={() => setField('letterLang', l.code)}
                          className="px-3.5 py-1.5 rounded-full text-sm transition-colors"
                          style={formData.letterLang === l.code
                            ? { backgroundColor: '#9D4433', color: 'white' }
                            : { backgroundColor: '#F5EDE4', color: '#5C3A2E' }}
                        >
                          {l.native}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      ref={messageRef}
                      name="messageToWrite"
                      value={formData.messageToWrite}
                      onChange={handleMessageChange}
                      onKeyDown={handleMessageKeyDown}
                      required
                      rows={6}
                      className={inputCls + ' resize-none pr-14'}
                      style={inputStyle}
                      placeholder={cfg.placeholder}
                    />
                    {/* Voice-to-type mic button */}
                    {voiceSupported && (
                      <button
                        type="button"
                        onClick={toggleVoice}
                        title={isListening ? 'Stop recording' : 'Speak your message'}
                        className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                        style={isListening
                          ? { backgroundColor: '#9D4433', color: 'white', animation: 'pulse 1.2s infinite' }
                          : { backgroundColor: '#F5EDE4', color: '#9D4433' }}
                      >
                        {isListening ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Transliteration popup — appears at the cursor */}
                    {langCfg?.itc && suggestions.length > 0 && (
                      <div
                        className="absolute z-30 rounded-lg overflow-hidden bg-white"
                        style={{
                          top: `${caretPos.top + 28}px`,
                          left: `${Math.min(caretPos.left, 240)}px`,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                          border: '1px solid #E3D5C8',
                          minWidth: '120px',
                        }}
                      >
                        {suggestions.map((s, i) => (
                          <button
                            type="button"
                            key={s + i}
                            onMouseDown={(e) => { e.preventDefault(); acceptSuggestion(s) }}
                            className="block w-full text-left px-3 py-1.5 text-sm transition-colors"
                            style={i === 0
                              ? { backgroundColor: '#9D4433', color: 'white' }
                              : { backgroundColor: 'white', color: '#3D1A1A' }}
                          >
                            <span className="opacity-50 text-xs mr-2">{i + 1}</span>{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isListening && (
                    <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#9D4433' }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#9D4433', animation: 'pulse 1.2s infinite' }} />
                      Listening… speak naturally, then tap the mic to stop.
                    </p>
                  )}
                  <p className="text-xs mt-2" style={{ color: '#A8968C' }}>
                    {langCfg?.itc
                      ? `Type in English letters (e.g. "vanakkam") and pick the ${langCfg.label} suggestion — or tap 🎤 to speak.`
                      : `Don't worry about grammar — just pour it out${voiceSupported ? ', or tap the 🎤 mic to speak it' : ''}. The more you share, the more personal we can make it.`}
                  </p>

                  {/* Tone */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Preferred tone</label>
                    <div className="flex flex-wrap gap-2">
                      {cfg.tones.map((tone) => (
                        <button
                          type="button"
                          key={tone}
                          onClick={() => setField('tone', tone)}
                          className="px-4 py-2 rounded-full text-sm transition-colors"
                          style={formData.tone === tone
                            ? { backgroundColor: '#9D4433', color: 'white' }
                            : { backgroundColor: '#F5EDE4', color: '#5C3A2E' }}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview button */}
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    disabled={!formData.messageToWrite.trim()}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ border: '1.5px solid #C49A2E', color: '#9D4433' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preview your letter
                  </button>
                </div>

                {/* Phase: Make it Special */}
                <div className="flex items-center gap-3 px-1 pt-2">
                  <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#C49A2E' }}>🎁 Make it Special</span>
                  <span className="flex-1 h-px" style={{ backgroundColor: '#E3D5C8' }} />
                </div>

                {/* ── Paper & ink ── */}
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #F0E6DC' }}>
                  <h2 className="font-playfair text-lg font-bold mb-1" style={{ color: '#3D1A1A' }}>3. Paper & ink</h2>
                  <p className="text-sm mb-4" style={{ color: '#A8968C' }}>The finishing touch for your handwritten letter.</p>

                  {/* Paper */}
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Paper</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {paperTypes.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setField('paperType', p.id)}
                        className="p-2 rounded-xl text-center transition-all"
                        style={formData.paperType === p.id
                          ? { border: '2px solid #C49A2E', backgroundColor: '#FDF5E6' }
                          : { border: '2px solid #F0E6DC', backgroundColor: 'white' }}
                      >
                        <span className="block h-10 rounded-lg mb-2" style={{ backgroundColor: p.bg, border: '1px solid rgba(0,0,0,0.06)' }} />
                        <span className="font-semibold text-xs block leading-tight" style={{ color: '#3D1A1A' }}>{p.name}</span>
                        <span className="text-[10px] block leading-tight" style={{ color: '#A8968C' }}>{p.desc}</span>
                        <span className="text-xs font-bold mt-1 block" style={{ color: '#C49A2E' }}>{p.price === 0 ? 'Included' : `+₹${p.price}`}</span>
                      </button>
                    ))}
                  </div>

                  {/* Ink */}
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Ink colour</label>
                  <div className="flex flex-wrap gap-3">
                    {inkColors.map((ink) => (
                      <button
                        type="button"
                        key={ink.id}
                        onClick={() => setField('inkColor', ink.id)}
                        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all"
                        style={formData.inkColor === ink.id
                          ? { border: '2px solid #C49A2E', backgroundColor: '#FDF5E6' }
                          : { border: '2px solid #F0E6DC', backgroundColor: 'white' }}
                      >
                        <span className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: ink.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                        <span className="text-xs font-medium" style={{ color: '#3D1A1A' }}>
                          {ink.name}{ink.price > 0 && <span style={{ color: '#C49A2E' }}> +₹{ink.price}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Gift add-on (hidden for mystery box) ── */}
                {formData.letterType !== 'mystery' && (
                  <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #F0E6DC' }}>
                    <h2 className="font-playfair text-lg font-bold mb-1" style={{ color: '#3D1A1A' }}>4. Add a gift?</h2>
                    <p className="text-sm mb-4" style={{ color: '#A8968C' }}>Pair your letter with a keepsake. Optional.</p>

                    {/* Mode toggle */}
                    <div className="inline-flex rounded-full p-1 mb-5" style={{ backgroundColor: '#F5EDE4' }}>
                      <button
                        type="button"
                        onClick={() => setField('giftMode', 'surprise')}
                        className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={formData.giftMode === 'surprise' ? { backgroundColor: '#9D4433', color: 'white' } : { color: '#5C3A2E' }}
                      >
                        ✨ Surprise me
                      </button>
                      <button
                        type="button"
                        onClick={() => setField('giftMode', 'choose')}
                        className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={formData.giftMode === 'choose' ? { backgroundColor: '#9D4433', color: 'white' } : { color: '#5C3A2E' }}
                      >
                        🎁 I'll choose
                      </button>
                    </div>

                    {/* Surprise tiers */}
                    {formData.giftMode === 'surprise' && (
                      <>
                        <p className="text-xs mb-3" style={{ color: '#A8968C' }}>We curate a surprise gift and include a handwritten card explaining why we chose it.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {mysteryTiers.map((tier) => (
                            <button
                              type="button"
                              key={tier.id}
                              onClick={() => setField('mysteryTier', tier.id)}
                              className="p-3 rounded-xl text-center transition-all"
                              style={formData.mysteryTier === tier.id
                                ? { border: '2px solid #C49A2E', backgroundColor: '#FDF5E6' }
                                : { border: '2px solid #F0E6DC', backgroundColor: 'white' }}
                            >
                              {tier.id !== 'none' && <span className="text-xl block mb-1">🎁</span>}
                              <span className="font-semibold text-sm block" style={{ color: '#3D1A1A' }}>{tier.label}</span>
                              {tier.desc && <span className="text-[10px] block leading-tight" style={{ color: '#A8968C' }}>{tier.desc}</span>}
                              <span className="text-sm font-bold mt-1 block" style={{ color: '#C49A2E' }}>{tier.price === 0 ? 'Free' : `+₹${tier.price}`}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Choose gifts catalogue */}
                    {formData.giftMode === 'choose' && (
                      <>
                        <p className="text-xs mb-3" style={{ color: '#A8968C' }}>Pick one or more — tap + to add, including multiples of the same gift.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {giftCatalog.map((gift) => {
                            const qty = formData.giftQty[gift.id] || 0
                            const active = qty > 0
                            return (
                              <div
                                key={gift.id}
                                className="relative p-2 rounded-xl text-center transition-all"
                                style={active
                                  ? { border: '2px solid #C49A2E', backgroundColor: '#FDF5E6' }
                                  : { border: '2px solid #F0E6DC', backgroundColor: 'white' }}
                              >
                                {gift.personalised && (
                                  <span className="absolute top-1.5 left-1.5 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#9D4433', color: 'white' }}>PERSONALISED</span>
                                )}
                                <div className="aspect-square rounded-lg overflow-hidden mb-2 flex items-center justify-center" style={{ backgroundColor: '#F5EDE4' }}>
                                  <img
                                    src={gift.image}
                                    alt={gift.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                                  />
                                  <span className="text-3xl" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{gift.emoji}</span>
                                </div>
                                <span className="font-semibold text-xs block leading-tight" style={{ color: '#3D1A1A' }}>{gift.name}</span>
                                <span className="text-[10px] block leading-tight mb-1" style={{ color: '#A8968C' }}>{gift.desc}</span>
                                <span className="text-sm font-bold block mb-2" style={{ color: '#C49A2E' }}>+₹{gift.price}</span>

                                {/* Add button / quantity stepper */}
                                {active ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => changeGiftQty(gift.id, -1)}
                                      className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold"
                                      style={{ backgroundColor: '#F0E6DC', color: '#9D4433' }}
                                    >−</button>
                                    <span className="text-sm font-bold w-5 text-center" style={{ color: '#3D1A1A' }}>{qty}</span>
                                    <button
                                      type="button"
                                      onClick={() => changeGiftQty(gift.id, 1)}
                                      className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold"
                                      style={{ backgroundColor: '#9D4433', color: 'white' }}
                                    >+</button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => changeGiftQty(gift.id, 1)}
                                    className="w-full py-1.5 rounded-full text-xs font-semibold"
                                    style={{ backgroundColor: '#F5EDE4', color: '#9D4433' }}
                                  >+ Add</button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Phase: Delivery & Contact */}
                <div className="flex items-center gap-3 px-1 pt-2">
                  <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#C49A2E' }}>📦 Delivery & Contact</span>
                  <span className="flex-1 h-px" style={{ backgroundColor: '#E3D5C8' }} />
                </div>

                {/* ── Your details ── */}
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #F0E6DC' }}>
                  <h2 className="font-playfair text-lg font-bold mb-5" style={{ color: '#3D1A1A' }}>
                    {formData.letterType !== 'mystery' ? '5' : '4'}. Your details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Your name *</label>
                      <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className={inputCls} style={inputStyle} placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Phone (WhatsApp) *</label>
                      <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required className={inputCls} style={inputStyle} placeholder="+91 98765 43210" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Email (optional)</label>
                      <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className={inputCls} style={inputStyle} placeholder="your@email.com" />
                    </div>
                  </div>
                </div>

                {/* ── Delivery ── */}
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #F0E6DC' }}>
                  <h2 className="font-playfair text-lg font-bold mb-5" style={{ color: '#3D1A1A' }}>
                    {formData.letterType !== 'mystery' ? '6' : '5'}. Where should we deliver?
                  </h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Pincode first — drives auto-fill */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Pincode *</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handlePincodeChange}
                          required
                          maxLength={6}
                          className={inputCls}
                          style={inputStyle}
                          placeholder="560001"
                        />
                        {pinStatus.loading && (
                          <svg className="animate-spin w-5 h-5 absolute right-3 top-3.5" style={{ color: '#C49A2E' }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                      </div>
                      {pinStatus.error && <p className="text-xs mt-1" style={{ color: '#9D4433' }}>{pinStatus.error}</p>}
                      {!pinStatus.error && formData.state && formData.pincode.length === 6 && (
                        <p className="text-xs mt-1" style={{ color: '#2E7D52' }}>✓ {formData.city}, {formData.state}</p>
                      )}
                    </div>

                    {/* City — auto-filled, editable */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>City *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required className={inputCls} style={inputStyle} placeholder="Bangalore" />
                    </div>

                    {/* Area / locality picker from pincode */}
                    {pinStatus.areas.length > 0 && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Area / locality</label>
                        <div className="flex flex-wrap gap-2">
                          {pinStatus.areas.slice(0, 8).map((a) => (
                            <button
                              type="button"
                              key={a}
                              onClick={() => setField('area', a)}
                              className="px-3 py-1.5 rounded-full text-xs transition-colors"
                              style={formData.area === a
                                ? { backgroundColor: '#9D4433', color: 'white' }
                                : { backgroundColor: '#F5EDE4', color: '#5C3A2E' }}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* State — auto-filled */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>State *</label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange} required className={inputCls} style={inputStyle} placeholder="Karnataka" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Full address *</label>
                      <textarea name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required rows={2} className={inputCls + ' resize-none'} style={inputStyle} placeholder="Flat / house no., street, building, landmark…" />
                    </div>

                    {/* Delivery contact number */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>
                        Delivery contact number {!formData.surpriseDelivery && '*'}
                      </label>
                      <input
                        type="tel"
                        name="deliveryPhone"
                        value={formData.surpriseDelivery ? formData.customerPhone : formData.deliveryPhone}
                        onChange={handleChange}
                        required={!formData.surpriseDelivery}
                        disabled={formData.surpriseDelivery}
                        className={inputCls}
                        style={{ ...inputStyle, opacity: formData.surpriseDelivery ? 0.55 : 1 }}
                        placeholder="Recipient's phone (for the courier)"
                      />
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.surpriseDelivery}
                          onChange={(e) => setField('surpriseDelivery', e.target.checked)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: '#9D4433' }}
                        />
                        <span className="text-xs" style={{ color: '#7A6258' }}>
                          🤫 It's a surprise — contact <strong>me</strong>, not the recipient
                        </span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C3A2E' }}>Special instructions</label>
                      <textarea name="specialInstructions" value={formData.specialInstructions} onChange={handleChange} rows={2} className={inputCls + ' resize-none'} style={inputStyle} placeholder="Preferred delivery date, gift wrapping notes, etc." />
                    </div>
                  </div>
                </div>

                </div>{/* ── END LEFT COLUMN ── */}

                {/* ── RIGHT COLUMN: sticky order summary ── */}
                <aside className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-4">
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#451A1C' }}>
                  <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'rgba(251,246,240,0.5)' }}>Order summary</p>

                  {/* Itemised breakdown */}
                  <div className="space-y-2 mb-3">
                    {/* Letter base */}
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'rgba(251,246,240,0.85)' }}>{cfg.label}</span>
                      <span style={{ color: '#FBF6F0' }}>₹{cfg.price.toLocaleString()}</span>
                    </div>

                    {/* Paper upgrade line */}
                    {selectedPaper?.price > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'rgba(251,246,240,0.85)' }}>📜 {selectedPaper.name} paper</span>
                        <span style={{ color: '#FBF6F0' }}>₹{selectedPaper.price.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Ink upgrade line */}
                    {selectedInk?.price > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'rgba(251,246,240,0.85)' }}>🖋️ {selectedInk.name} ink</span>
                        <span style={{ color: '#FBF6F0' }}>₹{selectedInk.price.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Surprise tier line (removable) */}
                    {formData.giftMode === 'surprise' && selectedTier?.price > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2" style={{ color: 'rgba(251,246,240,0.85)' }}>
                          🎁 Surprise gift · {selectedTier.label}
                          <button
                            type="button"
                            onClick={() => setField('mysteryTier', 'none')}
                            title="Remove surprise gift"
                            className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(251,246,240,0.8)' }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                        <span style={{ color: '#FBF6F0' }}>₹{selectedTier.price.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Chosen gift lines (removable, with quantity) */}
                    {formData.giftMode === 'choose' && selectedGifts.map((g) => (
                      <div key={g.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2" style={{ color: 'rgba(251,246,240,0.85)' }}>
                          {g.emoji} {g.name}{g.qty > 1 && <span style={{ color: '#E0A93C' }}> ×{g.qty}</span>}
                          <button
                            type="button"
                            onClick={() => changeGiftQty(g.id, -g.qty)}
                            title={`Remove ${g.name}`}
                            className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(251,246,240,0.8)' }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                        <span style={{ color: '#FBF6F0' }}>₹{(g.price * g.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 mb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                    <span className="font-playfair text-lg" style={{ color: '#FBF6F0' }}>Total</span>
                    <span className="text-2xl font-bold" style={{ color: '#E0A93C' }}>₹{totalPrice.toLocaleString()}</span>
                  </div>

                  {error && (
                    <div className="rounded-xl p-3 text-sm text-center" style={{ backgroundColor: 'rgba(157,68,51,0.25)', color: '#FBD5C9' }}>
                      {error}
                    </div>
                  )}

                  {/* Place Order — desktop (inside sticky summary) */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="hidden lg:flex w-full items-center justify-center gap-2 mt-4 py-3.5 text-sm font-semibold rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#E0A93C', color: '#451A1C' }}
                  >
                    {isSubmitting ? 'Placing…' : 'Place Order →'}
                  </button>

                  <p className="text-center text-xs mt-3" style={{ color: 'rgba(251,246,240,0.55)' }}>
                    We'll send a draft for approval before writing. One free revision included.
                  </p>
                </div>

                {/* Trust + help panel — fills the column & reassures at checkout */}
                <div className="rounded-2xl p-5" style={{ backgroundColor: 'white', border: '1px solid #F0E6DC' }}>
                  <ul className="space-y-3">
                    {[
                      { icon: '✍️', text: '100% hand-written on premium paper' },
                      { icon: '🔒', text: 'Private & personal — your words stay yours' },
                      { icon: '🔁', text: 'One free revision included' },
                      { icon: '🚚', text: 'Same-day delivery across Bangalore' },
                    ].map((item) => (
                      <li key={item.text} className="flex items-start gap-3 text-sm" style={{ color: '#5C3A2E' }}>
                        <span className="text-base leading-none">{item.icon}</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-4 pt-4 text-sm font-medium"
                    style={{ borderTop: '1px solid #F0E6DC', color: '#1FA855' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.121 1.522 5.855L.058 23.568a.5.5 0 00.612.612l5.713-1.464A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                    </svg>
                    Questions? Chat with us on WhatsApp
                  </a>
                </div>

                </div>{/* close sticky wrapper */}
                </aside>
                </div>{/* ── END GRID ── */}

                {/* ── Sticky total bar — mobile only ── */}
                <div
                  className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
                  style={{ backgroundColor: '#451A1C', boxShadow: '0 -8px 30px rgba(0,0,0,0.25)' }}
                >
                  <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="leading-tight">
                      <span className="text-[10px] uppercase tracking-wide block" style={{ color: 'rgba(251,246,240,0.5)' }}>
                        Total{(formData.giftMode === 'choose' && giftCount > 0) ? ` · ${giftCount} gift${giftCount > 1 ? 's' : ''}` : ''}
                      </span>
                      <span className="text-xl font-bold" style={{ color: '#E0A93C' }}>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#E0A93C', color: '#451A1C' }}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Placing…
                        </>
                      ) : (
                        <>Place Order →</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </section>

      {/* ── Letter Preview Modal ── */}
      {showPreview && cfg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(46,20,21,0.7)' }}
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: 'white' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Parchment letter — paper tone + ink colour from selection */}
            <div
              className="p-8 md:p-10"
              style={{
                background: `linear-gradient(135deg, ${selectedPaper?.bg || '#F4E6CE'} 0%, ${selectedPaper?.bg || '#F4E6CE'} 100%)`,
                boxShadow: 'inset 0 0 80px rgba(150,110,60,0.15)',
              }}
            >
              {/* Decorative top line */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="block w-10 h-px" style={{ backgroundColor: '#C9A24B' }} />
                <span style={{ color: '#C9A24B' }}>✦</span>
                <span className="block w-10 h-px" style={{ backgroundColor: '#C9A24B' }} />
              </div>

              <p
                className="mb-4 text-2xl"
                style={{ fontFamily: "'Dancing Script', cursive", color: selectedInk?.hex || '#5A3A22' }}
              >
                Dear {formData.recipientName.trim() || '...'},
              </p>

              <p
                className="whitespace-pre-wrap leading-relaxed text-xl"
                style={{ fontFamily: "'Dancing Script', cursive", color: selectedInk?.hex || '#5A3A22', lineHeight: 1.7 }}
              >
                {formData.messageToWrite.trim() || 'Your heartfelt words will appear here...'}
              </p>

              <p
                className="mt-8 text-right text-xl"
                style={{ fontFamily: "'Dancing Script', cursive", color: selectedInk?.hex || '#5A3A22' }}
              >
                With love,<br />
                {formData.customerName.trim() || 'You'}
              </p>

              {/* Wax-seal style dot */}
              <div className="flex justify-end mt-4">
                <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9D4433', color: '#F4E6CE' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </span>
              </div>
            </div>

            {/* Footer note */}
            <div className="px-6 py-4 text-center" style={{ backgroundColor: '#451A1C' }}>
              <p className="text-xs" style={{ color: 'rgba(251,246,240,0.7)' }}>
                ✨ This is a preview of <em>your words</em>. Your final letter will be hand-written in calligraphy on {selectedPaper?.name || 'premium'} paper with {selectedInk?.name || 'classic'} ink{formData.tone ? `, in a ${formData.tone.toLowerCase()} tone` : ''}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

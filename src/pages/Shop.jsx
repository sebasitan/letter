import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchCatalog, DEFAULT_LETTERS, DEFAULT_TIERS } from '../lib/products'
import Seo from '../components/Seo'

const icons = {
  love: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  healing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  ),
  birthday: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25V6m0 2.25c-3 0-5.25 1.5-5.25 4.5V18a1.5 1.5 0 001.5 1.5h7.5a1.5 1.5 0 001.5-1.5v-5.25c0-3-2.25-4.5-5.25-4.5zM4.5 19.5h15M12 4.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
    </svg>
  ),
  apology: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  family: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  mystery: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
}

const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'letters', label: 'Letters' },
  { id: 'boxes', label: 'Mystery Boxes' },
]

const featherMask = {
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 45%), linear-gradient(to top, transparent 0%, #000 42%)',
  WebkitMaskComposite: 'source-in',
  maskImage: 'linear-gradient(to right, transparent 0%, #000 45%), linear-gradient(to top, transparent 0%, #000 42%)',
  maskComposite: 'intersect',
}

// Emotion-based accent per letter type (visible tint + defined border)
const accents = {
  love:     { tint: '#FBE3DB', icon: '#B5593A', border: '#E2A18E', glow: 'rgba(181,89,58,0.25)' },
  healing:  { tint: '#E0ECE2', icon: '#5E7E66', border: '#A6C1AD', glow: 'rgba(94,126,102,0.25)' },
  birthday: { tint: '#FAE7C6', icon: '#B98A1E', border: '#E0C275', glow: 'rgba(196,154,46,0.28)' },
  apology:  { tint: '#E1E8F0', icon: '#51708C', border: '#A6BCD0', glow: 'rgba(81,112,140,0.25)' },
  family:   { tint: '#FBE4D2', icon: '#BE7048', border: '#E3B493', glow: 'rgba(190,112,72,0.25)' },
}

function ProductCard({ product }) {
  const id = product.slug || product.id
  const dark = product.is_bestseller || product.isBestseller
  const a = product.accent || accents[id]
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: dark
          ? '#4A1D1F'
          : `linear-gradient(160deg, ${a?.tint || '#FFFFFF'} 0%, #FFFFFF 62%)`,
        border: dark ? 'none' : `1.5px solid ${hover ? (a?.icon || '#C49A2E') : (a?.border || '#E3C98A')}`,
        minHeight: '300px',
        transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: dark
          ? '0 12px 30px rgba(74,29,31,0.25)'
          : hover
            ? `0 20px 40px ${a?.glow || 'rgba(140,90,60,0.18)'}`
            : '0 6px 18px rgba(140,90,60,0.06)',
      }}
    >
      {dark && (
        <div className="absolute top-4 right-4 z-20">
          <span className="text-[10px] font-bold tracking-wide px-2.5 py-1 rounded" style={{ backgroundColor: '#C49A2E', color: '#4A1D1F' }}>
            BESTSELLER
          </span>
        </div>
      )}

      <div className="absolute top-0 right-0 w-[62%] h-56 z-0">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform duration-500"
          style={{ ...featherMask, transform: hover ? 'scale(1.06)' : 'scale(1)' }}
        />
      </div>

      <div className="p-5 relative z-10">
        <span
          className="w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-300"
          style={{
            border: `1.5px solid ${dark ? 'rgba(196,154,46,0.6)' : (a?.border || '#E3C98A')}`,
            color: dark ? '#C49A2E' : (a?.icon || '#C49A2E'),
            backgroundColor: dark ? 'rgba(196,154,46,0.08)' : 'rgba(255,255,255,0.7)',
          }}
        >
          {icons[id] || <span className="text-lg">{product.emoji}</span>}
        </span>
      </div>

      <div className="px-5 pb-5 pt-16 relative z-10">
        <h3 className="font-playfair text-xl font-bold mb-2" style={{ color: dark ? '#FBF6F0' : '#3D1A1A' }}>{product.name || product.title}</h3>
        <p className="text-[13px] leading-relaxed mb-6 max-w-[210px]" style={{ color: dark ? 'rgba(251,246,240,0.72)' : '#7A6258' }}>{product.description}</p>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest block mb-0.5" style={{ color: dark ? 'rgba(251,246,240,0.5)' : '#A8968C' }}>From</span>
            <span className="text-xl font-bold" style={{ color: dark ? '#FBF6F0' : '#3D1A1A' }}>₹{Number(product.price).toLocaleString()}</span>
          </div>
          <Link
            to={`/order?type=${id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: dark ? '#C49A2E' : '#9D4433', color: dark ? '#4A1D1F' : 'white' }}
          >
            Order Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [letters, setLetters] = useState(DEFAULT_LETTERS)
  const [tiers, setTiers] = useState(DEFAULT_TIERS)

  useEffect(() => {
    fetchCatalog().then(({ letters, tiers }) => { setLetters(letters); setTiers(tiers) }).catch(() => {})
  }, [])

  const catOf = (p) => ((p.slug || p.id) === 'mystery' || p.is_bestseller || p.isBestseller ? 'boxes' : 'letters')
  const filtered = activeCategory === 'all' ? letters : letters.filter(p => catOf(p) === activeCategory)
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    return 0
  })

  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen">
      <Seo
        title="Our Letters — Love, Healing, Birthday & More"
        description="Browse handwritten letter types — love, breakup/healing, birthday, apology, family & mystery boxes. Personalised, wax-sealed, delivered across India."
        path="/shop"
      />
      {/* Header */}
      <section className="pt-14 pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3D1A1A' }}>
            Our <span className="italic" style={{ color: '#C49A2E' }}>Letters</span>
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: '#7A6258' }}>
            Every letter is handwritten with care, sealed with wax, and delivered with love. Choose the one that speaks to your heart.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 sticky top-16 md:top-20 z-40" style={{ backgroundColor: '#FBF6F0', borderTop: '1px solid #F0E6DC', borderBottom: '1px solid #F0E6DC' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                  style={activeCategory === cat.id
                    ? { backgroundColor: '#9D4433', color: 'white' }
                    : { backgroundColor: '#F0E6DC', color: '#5C3A2E' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-full text-sm border-none outline-none"
              style={{ backgroundColor: '#F0E6DC', color: '#5C3A2E' }}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((product) => <ProductCard key={product.slug || product.id} product={product} />)}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section style={{ backgroundColor: '#451A1C' }} className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-playfair text-3xl font-bold mb-3 text-center" style={{ color: '#FBF6F0' }}>
            Add a <span className="italic" style={{ color: '#E0A93C' }}>Mystery Gift</span>
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: 'rgba(251,246,240,0.6)' }}>
            A curated keepsake with a handwritten card explaining why it was chosen.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.id || tier.name}
                className="rounded-xl p-6 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,154,46,0.25)' }}
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4" style={{ border: '1.5px solid rgba(196,154,46,0.5)', color: '#C49A2E' }}>
                  {icons.mystery}
                </span>
                <h3 className="font-playfair text-lg font-bold mb-1" style={{ color: '#FBF6F0' }}>{tier.name}</h3>
                <p className="text-xs mb-3" style={{ color: 'rgba(251,246,240,0.55)' }}>{tier.description || tier.desc}</p>
                <span className="font-bold" style={{ color: '#E0A93C' }}>+₹{tier.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

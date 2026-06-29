import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchCatalog, DEFAULT_LETTERS } from '../lib/products'

// Emotion-based accent per letter type (visible tint + defined border)
const letterAccents = {
  love:     { tint: '#FBE3DB', icon: '#B5593A', border: '#E2A18E', glow: 'rgba(181,89,58,0.25)' },
  healing:  { tint: '#E0ECE2', icon: '#5E7E66', border: '#A6C1AD', glow: 'rgba(94,126,102,0.25)' },
  birthday: { tint: '#FAE7C6', icon: '#B98A1E', border: '#E0C275', glow: 'rgba(196,154,46,0.28)' },
  apology:  { tint: '#E1E8F0', icon: '#51708C', border: '#A6BCD0', glow: 'rgba(81,112,140,0.25)' },
  family:   { tint: '#FBE4D2', icon: '#BE7048', border: '#E3B493', glow: 'rgba(190,112,72,0.25)' },
}

const cardFeatherMask = {
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 45%), linear-gradient(to top, transparent 0%, #000 42%)',
  WebkitMaskComposite: 'source-in',
  maskImage: 'linear-gradient(to right, transparent 0%, #000 45%), linear-gradient(to top, transparent 0%, #000 42%)',
  maskComposite: 'intersect',
}

// Letter card with emotion accent + lift-and-glow hover
function LetterCard({ letter, icon }) {
  const id = letter.slug || letter.id
  const dark = letter.is_bestseller || letter.isBestseller
  const a = letter.accent || letterAccents[id]
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: dark ? '#4A1D1F' : `linear-gradient(160deg, ${a?.tint || '#FFFFFF'} 0%, #FFFFFF 62%)`,
        border: dark ? 'none' : `1.5px solid ${hover ? (a?.icon || '#C49A2E') : (a?.border || '#E3C98A')}`,
        minHeight: '300px',
        transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: dark
          ? '0 12px 30px rgba(74,29,31,0.25)'
          : hover ? `0 20px 40px ${a?.glow || 'rgba(140,90,60,0.18)'}` : '0 6px 18px rgba(140,90,60,0.06)',
      }}
    >
      {dark && (
        <div className="absolute top-4 right-4 z-20">
          <span className="text-[10px] font-bold tracking-wide px-2.5 py-1 rounded" style={{ backgroundColor: '#C49A2E', color: '#4A1D1F' }}>
            BESTSELLER
          </span>
        </div>
      )}

      {/* Image */}
      <div className="absolute top-0 right-0 w-[62%] h-56 z-0">
        <img
          src={letter.image}
          alt={letter.title}
          className="w-full h-full object-cover object-center transition-transform duration-500"
          style={{ ...cardFeatherMask, transform: hover ? 'scale(1.06)' : 'scale(1)' }}
        />
      </div>

      {/* Icon */}
      <div className="p-5 relative z-10">
        <span
          className="w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-300"
          style={{
            border: `1.5px solid ${dark ? 'rgba(196,154,46,0.6)' : (a?.border || '#E3C98A')}`,
            color: dark ? '#C49A2E' : (a?.icon || '#C49A2E'),
            backgroundColor: dark ? 'rgba(196,154,46,0.08)' : 'rgba(255,255,255,0.7)',
          }}
        >
          {icon || <span className="text-lg">{letter.emoji}</span>}
        </span>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-16 relative z-10">
        <h3 className="font-playfair text-xl font-bold mb-2" style={{ color: dark ? '#FBF6F0' : '#3D1A1A' }}>{letter.name || letter.title}</h3>
        <p className="text-[13px] leading-relaxed mb-6 max-w-[210px]" style={{ color: dark ? 'rgba(251,246,240,0.72)' : '#7A6258' }}>{letter.description}</p>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest block mb-0.5" style={{ color: dark ? 'rgba(251,246,240,0.5)' : '#A8968C' }}>From</span>
            <span className="text-xl font-bold" style={{ color: dark ? '#FBF6F0' : '#3D1A1A' }}>₹{Number(letter.price).toLocaleString()}</span>
          </div>
          <Link
            to={`/order?type=${id}`}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ border: `1.5px solid ${dark ? '#C49A2E' : (a?.icon || '#C49A2E')}` }}
          >
            <svg className="w-4 h-4" style={{ color: dark ? '#C49A2E' : (a?.icon || '#C49A2E') }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Hero Section
function Hero() {
  return (
    <section style={{ backgroundColor: '#FDF8F3' }} className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 overflow-visible">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center overflow-visible">

          {/* Left Content */}
          <div>
            {/* Badge — highlighted "seal of authenticity" */}
            <div
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FDEAE5 0%, #FBF1DA 100%)',
                color: '#9D4433',
                border: '1px solid #E4B98E',
                boxShadow: '0 4px 14px rgba(181,89,58,0.18)',
              }}
            >
              <span className="animate-heartbeat" style={{ color: '#B5593A' }}>❤</span>
              <span className="font-bold tracking-wide" style={{ letterSpacing: '0.04em' }}>100% HANDWRITTEN. ZERO PRINTED.</span>
              {/* shimmer sweep */}
              <span
                className="absolute inset-y-0 w-1/3 animate-shimmer pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)' }}
              />
            </div>

            {/* Heading */}
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-6" style={{ color: '#3D1A1A' }}>
              Say it the way they'll{' '}
              <span className="italic" style={{ color: '#9D4433' }}>never forget.</span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg mb-8 leading-relaxed max-w-md" style={{ color: '#5C3D3D' }}>
              Handwritten calligraphy letters on parchment, paired with a curated keepsake — and if the words won't come, we'll write them for you.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                to="/order"
                className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: '#4A1D1F', color: 'white' }}
              >
                ORDER A LETTER
                <span className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#C49A2E' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full border transition-all hover:bg-gray-50"
                style={{ backgroundColor: 'white', color: '#3D1A1A', borderColor: '#E0D5D0' }}
              >
                <svg className="w-5 h-5" style={{ color: '#3D1A1A' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                CHAT ON WHATSAPP
                <svg className="w-4 h-4" style={{ color: '#3D1A1A' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-3 text-xs" style={{ color: '#6B5050' }}>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Same-day delivery (Bangalore)</span>
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span>Private & Personal</span>
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>UPI Accepted</span>
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span>Secure Payments</span>
              </span>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative overflow-visible">
            {/* Floating Quote Card - positioned to overlap left side */}
            <div
              className="absolute bg-white p-4 rounded-2xl z-30 hidden lg:block"
              style={{
                maxWidth: '160px',
                left: '-60px',
                top: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
              }}
            >
              <p className="font-playfair italic text-sm leading-relaxed mb-2" style={{ color: '#3D1A1A' }}>
                Write straight from the heart. We'll handle the rest.
              </p>
              <span className="text-base" style={{ color: '#C49A2E' }}>❤</span>
            </div>

            {/* Image Frame with rotation effect */}
            <div
              className="relative"
              style={{
                transform: 'rotate(2deg)',
                transformOrigin: 'center center'
              }}
            >
              {/* Outer frame/shadow */}
              <div
                className="rounded-[1.5rem] p-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)'
                }}
              >
                {/* Inner image container */}
                <div
                  className="rounded-[1.2rem] overflow-hidden"
                  style={{ backgroundColor: '#F5EDE6' }}
                >
                  <img
                    src="/images/hero.png"
                    alt="Handwritten letters with wax seal"
                    className="w-full h-auto"
                    style={{ backgroundColor: '#F5EDE6' }}
                  />
                </div>
              </div>

              {/* Bottom Right Badge */}
              <div
                className="absolute bg-white px-4 py-2.5 rounded-xl z-20"
                style={{
                  bottom: '20px',
                  right: '20px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  transform: 'rotate(-2deg)'
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FDF5E6' }}>
                    <svg className="w-4 h-4" style={{ color: '#C49A2E' }} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#3D1A1A' }}>100% Handwritten</p>
                    <p className="text-xs" style={{ color: '#8B7070' }}>Never Printed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Quote Card */}
            <div
              className="absolute top-4 left-4 bg-white p-3 rounded-xl z-10 lg:hidden"
              style={{ maxWidth: '140px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            >
              <p className="font-playfair italic text-xs leading-snug mb-1" style={{ color: '#3D1A1A' }}>
                Write straight from the heart. We'll handle the rest.
              </p>
              <span className="text-sm" style={{ color: '#C49A2E' }}>❤</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// Marquee Section
function Marquee() {
  const categories = [
    { icon: '💬', label: 'Apologies' },
    { icon: '❤️', label: 'Love Letters' },
    { icon: '🌿', label: 'Healing & Closure' },
    { icon: '🎂', label: 'Birthday Notes' },
    { icon: '👨‍👩‍👧', label: 'Family Letters' },
    { icon: '🎁', label: 'Mystery Boxes' },
    { icon: '🏢', label: 'Corporate Gifting' },
    { icon: '💒', label: 'Wedding Stationery' },
  ]

  return (
    <div style={{ backgroundColor: '#4A1D1F' }} className="py-3 overflow-hidden">
      <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap md:flex-nowrap px-4">
        {categories.map((cat, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-xs"
              style={{ backgroundColor: '#C49A2E', color: 'white' }}
            >
              {cat.icon}
            </span>
            <span
              className="text-sm font-medium italic"
              style={{ color: '#E8D5C4' }}
            >
              {cat.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Trust Badges
function TrustBadges() {
  return (
    <section style={{ backgroundColor: '#FDF8F3' }} className="py-6 border-b" style={{ borderColor: '#F0E6DC' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* 100% Handwritten */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FDF5E6' }}>
              <svg className="w-5 h-5" style={{ color: '#C49A2E' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm" style={{ color: '#3D1A1A' }}>100% Handwritten</h4>
              <p className="text-xs" style={{ color: '#8B7070' }}>Never printed. Ever.</p>
            </div>
          </div>

          {/* Private & Personal */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FDF5E6' }}>
              <svg className="w-5 h-5" style={{ color: '#C49A2E' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm" style={{ color: '#3D1A1A' }}>Private & Personal</h4>
              <p className="text-xs" style={{ color: '#8B7070' }}>Your story stays yours.</p>
            </div>
          </div>

          {/* UPI Accepted */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FDF5E6' }}>
              <svg className="w-5 h-5" style={{ color: '#C49A2E' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm" style={{ color: '#3D1A1A' }}>UPI Accepted</h4>
              <p className="text-xs" style={{ color: '#8B7070' }}>Easy & secure payments.</p>
            </div>
          </div>

          {/* Same-day Delivery */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FDF5E6' }}>
              <svg className="w-5 h-5" style={{ color: '#C49A2E' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm" style={{ color: '#3D1A1A' }}>Same-day Delivery</h4>
              <p className="text-xs" style={{ color: '#8B7070' }}>Across Bangalore.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Letters Section
function Letters() {
  // Line-art SVG icons matching the reference
  const icons = {
    love: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    healing: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c-2.5-2-3-5-3-7m3-2c.5 2 1 4 3 6" />
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

  const [letters, setLetters] = useState(DEFAULT_LETTERS)
  useEffect(() => {
    fetchCatalog().then(({ letters }) => setLetters(letters)).catch(() => {})
  }, [])

  // soft feather so image bleeds top + right card edges, fades into card on inner-left/bottom
  const featherMask = {
    WebkitMaskImage:
      'linear-gradient(to right, transparent 0%, #000 45%), linear-gradient(to top, transparent 0%, #000 42%)',
    WebkitMaskComposite: 'source-in',
    maskImage:
      'linear-gradient(to right, transparent 0%, #000 45%), linear-gradient(to top, transparent 0%, #000 42%)',
    maskComposite: 'intersect',
  }

  return (
    <section style={{ backgroundColor: '#FBF6F0' }} className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight" style={{ color: '#3D1A1A' }}>
            Letters for every <span className="italic" style={{ color: '#C49A2E' }}>feeling</span>
            <br />
            you can't quite say.
          </h2>
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="block w-12 h-px" style={{ backgroundColor: '#D9B96A' }} />
            <span style={{ color: '#C49A2E' }}>♥</span>
            <span className="block w-12 h-px" style={{ backgroundColor: '#D9B96A' }} />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.map((letter) => (
            <LetterCard key={letter.slug || letter.id} letter={letter} icon={icons[letter.slug || letter.id]} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Mystery Gift Section
function MysteryGift() {
  const tiers = [
    {
      name: 'Gentle',
      desc: 'Warm words of comfort',
      price: 249,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      name: 'Warm',
      desc: 'Emotional & heartfelt',
      price: 499,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        </svg>
      ),
    },
    {
      name: 'Luxe',
      desc: 'Premium paper & ink',
      price: 999,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
  ]

  return (
    <section style={{ backgroundColor: '#451A1C' }} className="py-10 md:py-14 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <div>
            <span style={{ color: '#C49A2E' }} className="text-xs font-semibold uppercase tracking-[0.2em]">
              The Signature Touch
            </span>
            <h2 className="font-playfair text-3xl md:text-[2.125rem] font-bold mt-4 mb-5 leading-[1.2] md:whitespace-nowrap" style={{ color: '#FBF6F0' }}>
              A gift chosen with <span className="italic" style={{ color: '#E0A93C' }}>intention</span> —<br />
              and a note that says why.
            </h2>
            <p style={{ color: 'rgba(251, 246, 240, 0.65)' }} className="mb-8 leading-relaxed max-w-md text-sm">
              Every mystery gift comes with a small handwritten card explaining exactly why that gift was chosen for them. That's the heart of Akshar Studio.
            </p>

            {/* Tier Cards - row of 3 rectangles */}
            <div className="grid grid-cols-3 gap-3 max-w-xl">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-xl px-3.5 py-3"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(196,154,46,0.25)',
                  }}
                >
                  {/* Top: icon + name/desc */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border: '1.5px solid rgba(196,154,46,0.5)', color: '#C49A2E' }}
                    >
                      {tier.icon}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-playfair font-bold text-base leading-tight" style={{ color: '#FBF6F0' }}>{tier.name}</h4>
                      <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'rgba(251,246,240,0.5)' }}>
                        {tier.desc}
                      </p>
                    </div>
                  </div>
                  {/* Price bottom-right */}
                  <div className="text-right">
                    <span className="font-bold text-sm" style={{ color: '#E0A93C' }}>+₹{tier.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Quote Card */}
          <div className="relative lg:max-w-sm lg:mr-auto">
            <div
              className="relative rounded-3xl px-7 py-6 md:px-8 md:py-7 transition-transform duration-300 hover:rotate-0"
              style={{
                backgroundColor: '#FBF6F0',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                transform: 'rotate(-2deg)',
              }}
            >
              {/* Top quote marks */}
              <div className="flex justify-between items-start mb-1">
                <span className="font-playfair leading-none" style={{ color: '#E3C98A', fontSize: '2.75rem' }}>“</span>
                <span className="font-playfair leading-none" style={{ color: '#E3C98A', fontSize: '2.75rem' }}>”</span>
              </div>

              <p className="font-playfair text-base italic leading-relaxed mb-4 -mt-3" style={{ color: '#5C3A2E' }}>
                I chose your gift because it is the kind of thing that feels like you. Thoughtful. Beautiful. Just like everything you do.
              </p>

              <p className="italic text-sm" style={{ color: '#B8893C' }}>
                — your writers, Akshar Studio
              </p>

              {/* Heart badge bottom-right */}
              <div
                className="absolute -bottom-4 -right-3 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FBF6F0', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#9D4433">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
      title: 'Tell us',
      description: "Fill the form — who it's for, what you feel, key memories, tone and ink colour.",
    },
    {
      number: '02',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
      title: 'We draft',
      description: 'We write the letter and send a typed preview for your approval. One free revision included.',
    },
    {
      number: '03',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      ),
      title: 'We write',
      description: 'Calligraphy on premium parchment, wax sealed, photographed and packed with your gift.',
    },
    {
      number: '04',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.044c0 .568.422 1.048.987 1.106.49.05.984.094 1.48.132M16.5 18.75h-2.25m0-11.177c0-.568.422-1.048.987-1.106a48.554 48.554 0 0110.026 0c.564.058.987.538.987 1.106v.958m-15.018 0v6.069m0 0a48.354 48.354 0 011.48.132" />
        </svg>
      ),
      title: 'We deliver',
      description: 'Same-day across Bangalore via Dunzo / Porter, or India Post for customisation.',
    },
  ]

  return (
    <section style={{ backgroundColor: '#FBF6F0' }} className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: '#3D1A1A' }}>
          How it <span className="italic" style={{ color: '#C49A2E' }}>works.</span>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center text-center px-2">
              {/* Connector with heart - between steps on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-9 left-1/2 w-full items-center justify-center pointer-events-none" style={{ transform: 'translateX(50%)' }}>
                  <span className="block flex-1 h-px" style={{ backgroundColor: '#E3C98A' }} />
                  <span className="mx-2 text-sm" style={{ color: '#C49A2E' }}>♥</span>
                  <span className="block flex-1 h-px" style={{ backgroundColor: '#E3C98A' }} />
                </div>
              )}

              {/* Icon circle with number badge */}
              <div className="relative mb-5 z-10">
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #E3C98A', color: '#C49A2E' }}
                >
                  {step.icon}
                </div>
                <span
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#451A1C', color: '#E0A93C' }}
                >
                  {step.number}
                </span>
              </div>

              <h3 className="font-playfair text-lg font-bold mb-2" style={{ color: '#3D1A1A' }}>
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: '#7A6258' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
function Testimonials() {
  const testimonials = [
    {
      rating: 5,
      quote: "My wife cried when she opened it. She said nobody had ever taken that kind of time to say those things. I just gave him the feelings — they found the words.",
      name: 'Rahul K.',
      location: 'Koramangala, Bangalore',
      type: 'LOVE LETTER',
    },
    {
      rating: 5,
      quote: "The closure letter was the most healing thing I did for myself this year. Reading it made me feel finally understood.",
      name: 'Ananya S.',
      location: 'Indiranagar, Bangalore',
      type: 'HEALING LETTER',
    },
    {
      rating: 5,
      quote: "Their same-day service is a lifesaver. The birthday letter for my sister reached in time and made her day so special!",
      name: 'Meera R.',
      location: 'Whitefield, Bangalore',
      type: 'BIRTHDAY LETTER',
    },
  ]

  return (
    <section id="testimonials" className="section-padding bg-cream-100">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-ink mb-2">
              Words that <span className="italic text-rust">landed.</span>
            </h2>
          </div>
          <p className="text-ink/60 text-sm mt-4 md:mt-0">
            Real letters, real reactions — from people who couldn't find the words until we did.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="card">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <span key={j} className="text-gold">★</span>
                ))}
              </div>
              <p className="font-playfair italic text-ink leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-ink">{testimonial.name}</h4>
                  <p className="text-sm text-ink/60">{testimonial.location}</p>
                </div>
                <span className="text-xs font-medium text-rust uppercase">
                  {testimonial.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTA() {
  return (
    <section className="relative bg-burgundy text-cream-100 py-20 overflow-hidden">
      {/* Background Images */}
      <div className="absolute left-0 bottom-0 w-1/4 opacity-30">
        <img
          src="/images/cta-gift-left.png"
          alt=""
          className="w-full h-auto"
        />
      </div>
      <div className="absolute right-0 bottom-0 w-1/4 opacity-30">
        <img
          src="/images/cta-gift-right.png"
          alt=""
          className="w-full h-auto"
        />
      </div>

      <div className="container-custom px-4 text-center relative z-10">
        <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-6">
          Someone needs to hear<br />
          from <span className="italic text-gold">you</span> today.
        </h2>
        <p className="text-cream-200/80 max-w-xl mx-auto mb-8">
          Give us the feeling. We'll find the words, write them in ink, and deliver them to their door.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/order" className="btn-primary bg-rust hover:bg-rust-dark">
            START YOUR LETTER
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20">
            TALK TO US
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

// Main Home Page
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Letters />
      <MysteryGift />
      <HowItWorks />
      <Testimonials />
    </>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchReviews, DEFAULT_REVIEWS } from '../lib/products'
import Seo from '../components/Seo'

function Stars({ n = 5 }) {
  return <span className="flex gap-0.5">{[...Array(n)].map((_, i) => <span key={i} style={{ color: '#C49A2E' }}>★</span>)}</span>
}

export default function Reviews() {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS)

  useEffect(() => {
    fetchReviews().then(setReviews).catch(() => {})
  }, [])

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0'

  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen">
      <Seo title="Reviews" description="Real reactions from customers who finally found the words they couldn't say. Read Ever Yours handwritten-letter reviews." path="/reviews" />
      {/* Hero */}
      <section style={{ backgroundColor: '#451A1C' }} className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#C49A2E' }}>Reviews</span>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mt-4 mb-4 leading-tight" style={{ color: '#FBF6F0' }}>
            Words that <span className="italic" style={{ color: '#E0A93C' }}>landed.</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: 'rgba(251,246,240,0.75)' }}>
            {reviews.length > 0
              ? "Real letters, real reactions — from people who couldn't find the words until we did."
              : 'Every word on this page will come from a real customer. Nothing invented, nothing borrowed.'}
          </p>
          {reviews.length > 0 && (
            <div className="inline-flex items-center gap-2 text-sm" style={{ color: '#E0A93C' }}>
              <Stars n={5} /> <span style={{ color: '#FBF6F0' }} className="font-bold">{avg}</span>
              <span style={{ color: 'rgba(251,246,240,0.6)' }}>
                · {reviews.length} {reviews.length === 1 ? 'happy customer' : 'happy customers'}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Reviews grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          {reviews.length === 0 ? (
            <div className="max-w-lg mx-auto text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#F5EDE4' }}>
                <span className="text-3xl">✍️</span>
              </div>
              <h2 className="font-playfair text-2xl font-bold mb-3" style={{ color: '#3D1A1A' }}>
                We're just getting started.
              </h2>
              <p className="text-base leading-relaxed" style={{ color: '#7A6258' }}>
                Ever Yours is new, so there's nothing here yet — and we'd rather show
                you an empty page than borrowed words. Every review below will be from a
                real person who let us write something for them.
              </p>
              <p className="text-base leading-relaxed mt-4" style={{ color: '#7A6258' }}>
                Be the first. Your letter is written by hand before you pay a rupee.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl p-6" style={{ backgroundColor: 'white', border: '1px solid #F0E6DC', boxShadow: '0 10px 30px rgba(140,90,60,0.06)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <Stars n={r.rating || 5} />
                    {r.letter_type && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5EDE4', color: '#9D4433' }}>{r.letter_type}</span>
                    )}
                  </div>
                  <p className="font-playfair italic text-base leading-relaxed mb-4" style={{ color: '#5C3A2E' }}>"{r.quote}"</p>
                  <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid #F0E6DC' }}>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#451A1C', color: '#E0A93C' }}>{(r.name || '?')[0]}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#3D1A1A' }}>{r.name}</p>
                      {r.location && <p className="text-xs" style={{ color: '#A8968C' }}>{r.location}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/order" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full" style={{ backgroundColor: '#9D4433', color: 'white' }}>
              Write your own story
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

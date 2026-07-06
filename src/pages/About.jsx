import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    ),
    title: 'Handwritten with Heart',
    description: 'Every letter is written by hand — no printers, no templates. Just ink, paper, and genuine care.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Private & Personal',
    description: 'Your story stays yours. We never share, store, or reuse your messages. Complete confidentiality, always.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    title: 'Thoughtfully Curated',
    description: 'Each mystery gift is chosen specifically for your recipient — not random, but intentional.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Swift Delivery',
    description: "Same-day delivery across Bangalore. Your feelings shouldn't have to wait.",
  },
]

const skills = ['Calligraphy', 'Hand Lettering', 'Wax Sealing', 'Gift Curation', 'Creative Writing', 'Emotional Intelligence']

export default function About() {
  return (
    <div style={{ backgroundColor: '#FBF6F0' }} className="min-h-screen">
      <Seo title="About Us" description="The story of Akshar Studio — handwritten calligraphy letters made with heart in Bangalore. Words, handwriting, emotions." path="/about" />
      {/* Hero */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#C49A2E' }}>
                Our Story
              </span>
              <h1 className="font-playfair text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight" style={{ color: '#3D1A1A' }}>
                Words that stay<br />
                <span className="italic" style={{ color: '#C49A2E' }}>long after</span> the moment.
              </h1>
              <p className="text-lg leading-relaxed mb-5" style={{ color: '#5C3A2E' }}>
                Akshar Studio was born from a simple belief: in a world of instant messages and digital noise, a handwritten letter still has the power to move hearts and heal souls.
              </p>
              <p className="leading-relaxed mb-5" style={{ color: '#7A6258' }}>
                What started as a personal passion for calligraphy turned into a mission — to help people say the things they struggle to express. Whether it's love, gratitude, apology, or goodbye, we believe every feeling deserves to be written beautifully.
              </p>
              <p className="leading-relaxed" style={{ color: '#7A6258' }}>
                Based in Bangalore, we write each letter by hand, seal it with wax, and pair it with a curated gift that speaks as loudly as the words inside.
              </p>
            </div>
            <div className="relative">
              <img
                src="/images/Elegant black and gold fountain pen.png"
                alt="Elegant fountain pen"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg max-w-xs" style={{ transform: 'rotate(-2deg)' }}>
                <p className="font-playfair italic" style={{ color: '#5C3A2E' }}>
                  "In akshar, every letter is a labor of love."
                </p>
                <svg className="w-5 h-5 mt-2" viewBox="0 0 24 24" fill="#9D4433">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Meaning */}
      <section style={{ backgroundColor: '#451A1C' }} className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#C49A2E' }}>
            The Name
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mt-4 mb-6" style={{ color: '#FBF6F0' }}>
            What is <span className="italic" style={{ color: '#E0A93C' }}>"Akshar"</span>?
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(251,246,240,0.8)' }}>
            In Hindi, <span className="font-semibold" style={{ color: '#E0A93C' }}>"Akshar" (अक्षर)</span> means "letter" — not just any letter, but something eternal, something that cannot be destroyed. It's the building block of all words, all stories, all emotions.
          </p>
          <p className="mt-4 leading-relaxed" style={{ color: 'rgba(251,246,240,0.55)' }}>
            We named our studio Akshar because we believe in the permanence of words written with intention. Digital messages disappear. Handwritten letters become keepsakes.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold" style={{ color: '#3D1A1A' }}>
              What We <span className="italic" style={{ color: '#C49A2E' }}>Believe</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0E6DC', boxShadow: '0 10px 30px rgba(140,90,60,0.06)' }}
              >
                <span className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ border: '1.5px solid #E3C98A', color: '#C49A2E' }}>
                  {value.icon}
                </span>
                <h3 className="font-playfair text-lg font-bold mb-2" style={{ color: '#3D1A1A' }}>{value.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7A6258' }}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section style={{ backgroundColor: '#F5EDE4' }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src="/images/Wax seal stamp.png" alt="Wax seal stamp" className="w-full h-auto rounded-2xl shadow-lg" />
            </div>
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6" style={{ color: '#3D1A1A' }}>
                The <span className="italic" style={{ color: '#C49A2E' }}>Craft</span>
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: '#7A6258' }}>
                Every letter that leaves our studio is a work of art. We've spent years honing our craft, learning traditional techniques, and developing our own style that balances elegance with warmth.
              </p>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <span key={skill} className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: '#FFFFFF', color: '#5C3A2E', border: '1px solid #E3C98A' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-5" style={{ color: '#3D1A1A' }}>
            Ready to write your <span className="italic" style={{ color: '#C49A2E' }}>story?</span>
          </h2>
          <p className="max-w-xl mx-auto mb-8" style={{ color: '#7A6258' }}>
            Let us help you say what's in your heart. Every letter is personal, private, and written just for you.
          </p>
          <Link
            to="/order"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: '#9D4433', color: 'white' }}
          >
            START YOUR LETTER
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}

import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, this would send the message
    setSubmitted(true)
  }

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'WhatsApp',
      value: '+91 98765 43210',
      href: 'https://wa.me/919876543210',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email',
      value: 'hello@aksharstudio.in',
      href: 'mailto:hello@aksharstudio.in',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Location',
      value: 'Bangalore, Karnataka, India',
      href: null,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Hours',
      value: 'Mon-Sat: 10am - 7pm',
      href: null,
    },
  ]

  const faqs = [
    {
      q: 'How long does it take to receive my letter?',
      a: 'For Bangalore, we offer same-day delivery. For other cities, expect 3-5 business days via India Post.',
    },
    {
      q: 'Can I see the letter before it\'s sent?',
      a: 'Yes! We send you a typed draft for approval before writing the final calligraphy version. One free revision is included.',
    },
    {
      q: 'What if I don\'t know what to say?',
      a: 'That\'s our specialty! Just tell us the feeling, some memories, and the relationship — we\'ll craft the perfect words.',
    },
    {
      q: 'Is my message kept private?',
      a: 'Absolutely. We never store, share, or reuse your messages. Complete confidentiality is our promise.',
    },
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 md:p-12 max-w-lg text-center shadow-lg">
          <span className="text-6xl mb-6 block">✉️</span>
          <h1 className="font-playfair text-3xl font-bold text-ink mb-4">
            Message Sent!
          </h1>
          <p className="text-ink/70 mb-6">
            Thank you for reaching out. We'll get back to you within 24 hours via WhatsApp or email.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-secondary"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream-100 min-h-screen">
      {/* Header */}
      <section className="section-padding pb-8">
        <div className="container-custom text-center">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-ink mb-4">
            Get in <span className="italic" style={{ color: '#C49A2E' }}>Touch</span>
          </h1>
          <p className="text-ink/70 text-lg max-w-2xl mx-auto">
            Have questions? Want to discuss a custom order? We're here to help you find the perfect words.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="card">
              <h2 className="font-playfair text-2xl font-semibold text-ink mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white focus:border-rust focus:ring-1 focus:ring-rust outline-none transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">
                      Phone (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white focus:border-rust focus:ring-1 focus:ring-rust outline-none transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white focus:border-rust focus:ring-1 focus:ring-rust outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white focus:border-rust focus:ring-1 focus:ring-rust outline-none transition-colors"
                  >
                    <option value="">Select a topic</option>
                    <option value="order">Question about an order</option>
                    <option value="custom">Custom letter request</option>
                    <option value="corporate">Corporate gifting</option>
                    <option value="collaboration">Collaboration inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white focus:border-rust focus:ring-1 focus:ring-rust outline-none transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="card bg-cream-200">
                <h2 className="font-playfair text-2xl font-semibold text-ink mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-rust/10 text-rust flex items-center justify-center flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <span className="text-sm text-ink/60">{info.label}</span>
                        {info.href ? (
                          <a
                            href={info.href}
                            target={info.href.startsWith('http') ? '_blank' : undefined}
                            rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="block font-medium text-ink hover:text-rust transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <span className="block font-medium text-ink">{info.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick WhatsApp */}
              <a
                href="https://wa.me/919876543210?text=Hi!%20I%27d%20like%20to%20know%20more%20about%20Akshar%20Studio."
                target="_blank"
                rel="noopener noreferrer"
                className="card bg-green-50 border-green-200 flex items-center gap-4 hover:bg-green-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-green-800">Chat on WhatsApp</span>
                  <span className="block text-sm text-green-600">Get instant replies</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-cream-200">
        <div className="container-custom">
          <h2 className="font-playfair text-3xl font-bold text-ink text-center mb-12">
            Frequently Asked <span className="italic" style={{ color: '#C49A2E' }}>Questions</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="card">
                <h3 className="font-semibold text-ink mb-2">{faq.q}</h3>
                <p className="text-sm text-ink/60">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

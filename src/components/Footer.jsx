import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1A1726' }} className="relative overflow-hidden">
      {/* ===== CTA Section ===== */}
      <div className="relative">
        {/* Gift box - left */}
        <img
          src="/images/left.png"
          alt=""
          className="absolute left-0 bottom-0 w-52 md:w-72 lg:w-96 object-contain pointer-events-none select-none"
        />
        {/* Gift box - right */}
        <img
          src="/images/right-box.png"
          alt=""
          className="absolute right-0 bottom-0 w-52 md:w-72 lg:w-96 object-contain pointer-events-none select-none"
        />

        <div className="max-w-3xl mx-auto px-6 py-5 md:py-6 text-center relative z-10">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold mb-2" style={{ color: '#FBF6F0' }}>
            Someone needs to hear<br />
            from <span className="italic" style={{ color: '#D9A839' }}>you</span> today.
          </h2>
          <p className="text-xs md:text-sm mb-5 max-w-md mx-auto" style={{ color: 'rgba(251,246,240,0.6)' }}>
            Give us the feeling. We'll find the words, write them in ink, and deliver them to their door.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/order"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: '#D9A839', color: '#1A1726' }}
            >
              START YOUR LETTER
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(251,246,240,0.3)', color: '#FBF6F0' }}
            >
              TALK TO US
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.121 1.522 5.855L.058 23.568a.5.5 0 00.612.612l5.713-1.464A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.29 16.833c-.261.735-1.297 1.347-1.794 1.432-.497.084-1.13.12-3.642-.759-3.034-1.062-4.98-4.148-5.132-4.34-.152-.191-1.235-1.642-1.235-3.133s.78-2.225.98-2.447c.2-.222.435-.278.58-.278.145 0 .29.001.418.008.133.006.313-.051.49.374.177.424.602 1.469.655 1.576.053.107.088.231.017.372-.07.142-.105.23-.21.354-.106.124-.223.277-.318.372-.106.106-.216.22-.093.432.124.211.55.91 1.18 1.473.81.726 1.493.951 1.704 1.058.211.107.335.089.458-.054.124-.142.53-.617.671-.83.142-.211.283-.177.476-.106.194.07 1.227.579 1.438.684.211.106.352.159.405.247.053.088.053.512-.208 1.247z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ===== Footer Links Bar ===== */}
      <div style={{ backgroundColor: '#13101D', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-7">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4">
              <Link to="/" className="flex flex-col">
                <span className="font-playfair text-xl font-bold" style={{ color: '#FBF6F0' }}>Akshar Studio</span>
                <span className="text-xs italic" style={{ color: 'rgba(251,246,240,0.45)' }}>words. handwriting. emotions.</span>
              </Link>
              <div className="flex gap-3 mt-5">
                {[
                  <path key="ig" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>,
                  <path key="fb" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>,
                  <path key="wa" d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.121 1.522 5.855L.058 23.568a.5.5 0 00.612.612l5.713-1.464A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>,
                ].map((p, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#D9A839' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{p}</svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Letters */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#D9A839' }}>Letters</h4>
              <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(251,246,240,0.6)' }}>
                <li><Link to="/shop" className="hover:text-white transition-colors">Mystery Boxes</Link></li>
                <li><Link to="/shop" className="hover:text-white transition-colors">Add-ons</Link></li>
                <li><Link to="/shop" className="hover:text-white transition-colors">Gift Cards</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#D9A839' }}>Company</h4>
              <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(251,246,240,0.6)' }}>
                <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
                <li><Link to="/corporate" className="hover:text-white transition-colors">Corporate Gifting</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#D9A839' }}>Policies</h4>
              <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(251,246,240,0.6)' }}>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Made with heart */}
            <div className="col-span-2 md:col-span-2 md:text-right">
              <p className="text-sm" style={{ color: 'rgba(251,246,240,0.6)' }}>Made with heart in Bangalore, India</p>
              <p className="text-xs mt-2" style={{ color: 'rgba(251,246,240,0.4)' }}>&copy; 2025 Akshar Studio.<br />All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function TopBanner() {
  return (
    <div style={{ backgroundColor: '#451A1C' }} className="text-cream-100 py-2 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-x-5 px-4 whitespace-nowrap overflow-hidden">
        <span className="flex items-center gap-1.5">
          <span style={{ color: '#D9A839' }}>❤</span>
          <span className="font-semibold tracking-wide">VALENTINE'S OFFERS – FLAT 20% OFF</span>
        </span>

        <span className="hidden sm:inline" style={{ color: 'rgba(251,246,240,0.3)' }}>|</span>
        <span className="hidden sm:inline tracking-wide">FREE DELIVERY ACROSS BANGALORE</span>

        <span className="hidden md:inline" style={{ color: 'rgba(251,246,240,0.3)' }}>|</span>
        <span className="hidden md:inline tracking-wide">SAME-DAY DELIVERY AVAILABLE ⚡</span>

        <span className="hidden lg:inline" style={{ color: 'rgba(251,246,240,0.3)' }}>|</span>
        <span className="hidden lg:flex items-center gap-1.5 tracking-wide">
          <span style={{ color: '#D9A839' }}>◎</span> 100% HANDWRITTEN
        </span>

        <span className="hidden lg:inline" style={{ color: 'rgba(251,246,240,0.3)' }}>|</span>
        <span className="hidden lg:flex items-center gap-1.5 tracking-wide">
          <span style={{ color: '#D9A839' }}>◎</span> PRIVATE & PERSONAL
        </span>
      </div>
    </div>
  )
}

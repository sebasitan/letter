import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import TopBanner from './TopBanner'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

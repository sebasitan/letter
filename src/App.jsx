import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Shop from './pages/Shop'
import OrderForm from './pages/OrderForm'
import About from './pages/About'
import Contact from './pages/Contact'
import Corporate from './pages/Corporate'
import Reviews from './pages/Reviews'
import Faq from './pages/Faq'
import Admin from './pages/Admin'
import { Privacy, Terms, Shipping, Refunds } from './pages/Policies'

function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      {/* Admin — standalone, no public navbar/footer */}
      <Route path="/admin" element={<Admin />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="order" element={<OrderForm />} />
        <Route path="about" element={<About />} />
        <Route path="corporate" element={<Corporate />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="faq" element={<Faq />} />
        <Route path="contact" element={<Contact />} />

        {/* Policies */}
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="refunds" element={<Refunds />} />
      </Route>
    </Routes>
    </>
  )
}

export default App

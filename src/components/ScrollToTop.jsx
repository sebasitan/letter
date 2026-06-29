import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Scrolls to the top of the page whenever the route changes —
// without this, clicking a footer/nav link keeps the old scroll position.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

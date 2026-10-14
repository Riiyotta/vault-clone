import { useLayoutEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Pricing from './pages/Pricing.jsx'
import MigrationOffer from './pages/MigrationOffer.jsx'
import NotFound from './pages/NotFound.jsx'
import Partners from './pages/Partners.jsx'
import LegalPage from './pages/LegalPage.jsx'
import { LocaleDocument, useLocale } from './i18n/index.jsx'

// Scroll to top on every pathname change (not on the first load, so the browser's reload restoration
// still works). Hash targets ("/#product" from another page) are then scrolled to by Home's
// useAnchorScroll, which runs zenscroll after the page has rendered.
function ScrollManager() {
  const { pathname } = useLocation()
  const first = useRef(true)
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Every page exists in EN and UA (/ua prefix, CLONE_SPEC_partners_ua_legal.md §C.6). The locale comes from the
// URL (src/i18n); /ru is out of scope. /subprocessors is linked from the DPA (§C.6) and uses the legal template.
const PAGES = [
  ['/', <Home />],
  ['/pricing', <Pricing />],
  ['/migration-offer', <MigrationOffer />],
  ['/partners', <Partners />],
  ['/terms', <LegalPage doc="terms" />],
  ['/privacy', <LegalPage doc="privacy" />],
  ['/dpa', <LegalPage doc="dpa" />],
  ['/subprocessors', <LegalPage doc="subprocessors" />],
]

export default function App() {
  const locale = useLocale()
  return (
    <>
      <ScrollManager />
      <LocaleDocument />
      {/* Keyed by locale: switching EN ↔ UA remounts the page, like the original's full locale navigation. */}
      <Routes key={locale}>
        {PAGES.map(([path, element]) => (
          <Route key={path} path={path} element={element} />
        ))}
        {PAGES.map(([path, element]) => (
          <Route key={`ua${path}`} path={path === '/' ? '/ua' : `/ua${path}`} element={element} />
        ))}

        {/* Clone-only catch-all (the original is a Next.js 404). */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

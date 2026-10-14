import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Anchor smooth-scroll via zenscroll (spec §0): loaded lazily, window.noZensmooth = true,
// setup(1000, 0). #automation/#reports/#security are centered, #product uses
// toY(top - scroll-margin-top), #top scrolls to 0.
const CENTERED = new Set(['automation', 'reports', 'security'])

let zenPromise = null
function loadZenscroll() {
  window.noZensmooth = true
  if (!zenPromise) {
    zenPromise = import('zenscroll').then((mod) => {
      const z = mod.default || mod
      z.setup(1000, 0)
      return z
    })
  }
  return zenPromise
}

function scrollToElement(id, el, zenscroll) {
  const cs = getComputedStyle(el)
  const mt = parseFloat(cs.scrollMarginTop) || 0
  const mb = parseFloat(cs.scrollMarginBottom) || 0
  if (!zenscroll) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - mt)
  else if (CENTERED.has(id)) zenscroll.center(el, undefined, (el.getBoundingClientRect().height - mt + mb) / 2)
  else zenscroll.toY(Math.max(0, zenscroll.getTopOf(el) - mt))
}

export default function useAnchorScroll() {
  const location = useLocation()

  useEffect(() => {
    let zenscroll = null
    let cancelled = false
    loadZenscroll().then((z) => {
      if (!cancelled) zenscroll = z
    })

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest?.('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href').slice(1)
      const el = id === 'top' ? null : document.getElementById(id)
      if (id !== 'top' && !el) return
      e.preventDefault()
      const base = `${window.location.pathname}${window.location.search}`
      // history.state is kept so react-router's history index survives the replaceState.
      const state = window.history.state
      if (id === 'top') {
        // Original: toY(0) and drop the hash via replaceState (no history entry).
        requestAnimationFrame(() => (zenscroll ? zenscroll.toY(0) : window.scrollTo(0, 0)))
        if (window.location.hash) window.history.replaceState(state, '', base)
        return
      }
      // Deferred one frame (as in the original) so a mobile-menu close can release the body scroll lock first.
      requestAnimationFrame(() => {
        scrollToElement(id, el, zenscroll)
        // Original updates the URL hash with replaceState (history length unchanged).
        if (window.location.hash !== `#${id}`) window.history.replaceState(state, '', `${base}#${id}`)
      })
    }
    document.addEventListener('click', onClick)
    return () => {
      cancelled = true
      document.removeEventListener('click', onClick)
    }
  }, [])

  // Arriving on home with a hash (e.g. <Link to="/#product"> from /pricing, or a direct load of /#product):
  // once the page has rendered, run the same zenscroll logic as an in-page click.
  // ScrollManager has already reset the scroll to 0 for the route change.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (!id) return
    let cancelled = false
    let raf = 0
    loadZenscroll().then((z) => {
      if (cancelled) return
      raf = requestAnimationFrame(() => {
        if (id === 'top') return z.toY(0)
        const el = document.getElementById(id)
        if (el) scrollToElement(id, el, z)
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [location.key, location.hash])
}

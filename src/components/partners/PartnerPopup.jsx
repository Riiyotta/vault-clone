import { Suspense, createContext, lazy, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PrimaryCta } from '../Cta.jsx'
import Icon from '../Icon.jsx'
import { useT } from '../../i18n/index.jsx'

// "Become a partner" popup shell (CLONE_SPEC_partners_ua_legal.md §B.9). The form itself is a lazy chunk,
// prefetched on idle and on pointerenter / focus of the CTAs; a spinner shows while it loads.
export const loadLeadForm = () => import('./LeadForm.jsx')
const LeadForm = lazy(loadLeadForm)

const OpenPopupContext = createContext(() => {})

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

function portalTarget() {
  let el = document.getElementById('popupPortal')
  if (!el) {
    el = document.createElement('div')
    el.id = 'popupPortal'
    document.body.appendChild(el)
  }
  return el
}

function Spinner({ label }) {
  // Measured on the original (module 98775 + the popup's Suspense fallback): a 32x32 filled "ring with a gap" glyph,
  // `size-8 animate-spin text-white/60 [&_path]:fill-current` (Tailwind spin: 1s linear infinite) inside
  // `div[role=status].flex.justify-center.py-10`, whose sr-only span carries the #popup-title id until the form mounts.
  return (
    <div role="status" className="flex justify-center py-10">
      <span id="popup-title" className="sr-only">
        {label}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="none"
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="size-8 animate-spin text-white/60 [&_path]:fill-current"
      >
        <path
          fill="#000"
          d="M16 29.334C8.654 29.334 2.667 23.347 2.667 16c0-2.493.693-4.92 2-7.026a1.337 1.337 0 0 1 1.84-.427c.627.387.813 1.213.427 1.84A10.7 10.7 0 0 0 5.334 16c0 5.88 4.786 10.667 10.666 10.667S26.667 21.88 26.667 16 21.88 5.334 16 5.334c-.733 0-1.333-.6-1.333-1.334 0-.733.6-1.333 1.333-1.333 7.347 0 13.334 5.987 13.334 13.333 0 7.347-5.987 13.334-13.334 13.334"
        />
      </svg>
    </div>
  )
}

function Popup({ onClose }) {
  const t = useT()
  const dialogRef = useRef(null)

  // Body scroll lock (§B.9: body{position:fixed;top:0;left:0;right:0;width:100%}). The spec value top:0 was
  // measured with the page at scrollY 0; using -scrollY (as the mobile menu does) keeps the page in place when
  // the popup is opened further down, and the scroll position is restored on close.
  useLayoutEffect(() => {
    const y = window.scrollY
    const s = document.body.style
    Object.assign(s, { position: 'fixed', top: `-${y}px`, left: '0', right: '0', width: '100%' })
    return () => {
      Object.assign(s, { position: '', top: '', left: '', right: '', width: '' })
      window.scrollTo(0, y)
    }
  }, [])

  // Focus moves into the dialog (the form then focuses its first field once loaded) and is restored on close.
  useEffect(() => {
    const previous = document.activeElement
    dialogRef.current?.focus()
    return () => previous?.focus?.({ preventScroll: true })
  }, [])

  // Esc closes; Tab / Shift+Tab cycle inside the dialog (focus trap).
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (!items.length) {
        e.preventDefault()
        dialogRef.current.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const inside = dialogRef.current.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex h-dvh w-screen animate-fade-in items-center justify-center p-4 md:p-6">
      <div aria-hidden="true" className="absolute inset-0 bg-primary-black/60" onClick={onClose} />
      {/* Exit: none. Measured on the original (rAF + MutationObserver, Esc / backdrop / close button): the portal subtree is
          removed in the same frame as the close (`open && <PopupPortal>`), with no fade/scale-out. Matching: instant unmount. */}
      <div className="relative flex max-h-full w-full max-w-[484px] transform-gpu animate-scale-in rounded-[32px] bg-popup-border p-px will-change-transform md:min-h-[400px] md:w-[90%]">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
          tabIndex={-1}
          className="relative flex flex-1 flex-col overflow-y-auto rounded-[32px] bg-surface p-6 outline-none md:p-8"
        >
          <button
            type="button"
            aria-label={t.popup.close}
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full text-white/50 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:right-4 md:top-4"
          >
            <Icon name="partners/popup-close" className="size-5" />
          </button>
          <Suspense fallback={<Spinner label={t.popup.loading} />}>
            <LeadForm />
          </Suspense>
        </div>
      </div>
    </div>,
    portalTarget(),
  )
}

export function PartnerPopupProvider({ children }) {
  const [open, setOpen] = useState(false)
  const openPopup = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])

  // Prefetch the form chunk when the browser is idle.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 1))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(() => loadLeadForm())
    return () => cancel(id)
  }, [])

  return (
    <OpenPopupContext.Provider value={openPopup}>
      {children}
      {open && <Popup onClose={close} />}
    </OpenPopupContext.Provider>
  )
}

/** The three "Become a partner" CTAs (Primary Large in the hero, Primary Small elsewhere). No hover state. */
export function BecomePartnerButton({ size = 'small', children }) {
  const openPopup = useContext(OpenPopupContext)
  return (
    <PrimaryCta as="button" size={size} onClick={openPopup} onPointerEnter={loadLeadForm} onFocus={loadLeadForm}>
      {children}
    </PrimaryCta>
  )
}

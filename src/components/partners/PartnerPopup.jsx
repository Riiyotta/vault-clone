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
  // TODO(animation): unspecified — spinner glyph geometry is not in the spec; only `size-8 animate-spin text-white/60`.
  return (
    <div className="flex justify-center py-10">
      <svg className="size-8 animate-spin text-white/60" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
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
      {/* TODO(animation): unspecified — the close (exit) transition is not specced; the popup unmounts instantly. */}
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

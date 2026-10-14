import { PrimaryCta } from '../Cta.jsx'

// ContactButton (§0.8). The original opens Intercom when it is booted, otherwise falls back to
// mailto:hello@usevault.ai. Intercom and dataLayer tracking are out of scope (§4), so the clone always
// uses the mailto fallback.
export const CONTACT_MAILTO = 'mailto:hello@usevault.ai'
export const openContact = () => {
  window.location.href = CONTACT_MAILTO
}

export const OUTLINE_CLASSES =
  'flex items-center justify-center rounded-full border border-white/20 px-6 py-4 text-lg leading-[22px] font-medium text-white'

/** Primary ContactButton ("Talk to us"): <button>, large or small. */
export function ContactPrimary({ size = 'large', children }) {
  return (
    <PrimaryCta as="button" size={size} onClick={openContact}>
      {children}
    </PrimaryCta>
  )
}

// Inline action inside FAQ answers (§0.8): underline white/40 → #fff on hover, 300ms.
export const INLINE_ACTION =
  'cursor-pointer text-white underline decoration-white/40 underline-offset-4 transition-colors duration-300 hover:decoration-white motion-reduce:transition-none'

export function InlineContact({ children }) {
  return (
    <button type="button" onClick={openContact} className={INLINE_ACTION}>
      {children}
    </button>
  )
}

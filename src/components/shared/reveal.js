import { useReducedMotion } from 'framer-motion'

// §0.11 reveal hook and easing constant.
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1]

/**
 * Framer props for a one-time in-view reveal with variants "hidden" → "shown".
 * Reduced motion: the original returns {initial:"hidden", animate:"shown"} with every transition at duration 0;
 * initial={false} renders the "shown" end state directly (also for child variants), which is equivalent.
 */
export function useReveal({ amount = 0.3 } = {}) {
  const reduced = useReducedMotion()
  if (reduced) return { initial: false, animate: 'shown' }
  return { initial: 'hidden', whileInView: 'shown', viewport: { once: true, amount } }
}

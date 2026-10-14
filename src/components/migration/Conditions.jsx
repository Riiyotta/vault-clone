import { motion } from 'framer-motion'
import SectionHeading from '../shared/SectionHeading.jsx'
import { EASE_OUT_EXPO, useReveal } from '../shared/reveal.js'
import { useT } from '../../i18n/index.jsx'

// §M3 condition icons, inlined from public/assets/svg/condition-*.svg so the accent paths can animate.
// Each animated path starts at delay 0.25 + 0.09 × n.
const delayOf = (n) => 0.25 + 0.09 * n
const KIND = {
  pop: (n) => ({
    hidden: { scale: 0, opacity: 0 },
    shown: { scale: 1, opacity: 1, transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay: delayOf(n) } },
  }),
  fade: (n) => ({
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { duration: 0.26, ease: 'easeOut', delay: delayOf(n) } },
  }),
  rise: (n) => ({
    hidden: { scaleY: 0 },
    shown: { scaleY: 1, transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay: delayOf(n) } },
  }),
  slideY: (n) => ({
    hidden: { y: -5, opacity: 0 },
    shown: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay: delayOf(n) } },
  }),
  draw: (n) => ({
    hidden: { pathLength: 0 },
    shown: { pathLength: 1, transition: { duration: 0.8, ease: EASE_OUT_EXPO, delay: delayOf(n) } },
  }),
}

const LINE = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5 }

function P({ anim, n = 0, className, d, line }) {
  const props = { d, className, ...(line ? LINE : {}) }
  if (!anim) return <path {...props} />
  return (
    <motion.path
      {...props}
      variants={KIND[anim](n)}
      style={{ transformBox: 'fill-box', transformOrigin: anim === 'rise' ? '50% 100%' : '50% 50%' }}
    />
  )
}

// Static fills: body accent, accent-soft, mute accent/50; lines stroke 1.5 round.
const SIX_SEGMENTS = [
  'M12.70 2.02 A10 10 0 0 1 16.38 3.01 L14.63 6.61 A6 6 0 0 0 12.42 6.01Z',
  'M17.59 3.71 A10 10 0 0 1 20.29 6.41 L16.97 8.64 A6 6 0 0 0 15.36 7.03Z',
  'M20.99 7.62 A10 10 0 0 1 21.98 11.30 L17.99 11.58 A6 6 0 0 0 17.39 9.37Z',
  'M21.98 12.70 A10 10 0 0 1 20.99 16.38 L17.39 14.63 A6 6 0 0 0 17.99 12.42Z',
  'M20.29 17.59 A10 10 0 0 1 17.59 20.29 L15.36 16.97 A6 6 0 0 0 16.97 15.36Z',
  'M16.38 20.99 A10 10 0 0 1 12.70 21.98 L12.42 17.99 A6 6 0 0 0 14.63 17.39Z',
  'M11.30 21.98 A10 10 0 0 1 7.62 20.99 L9.37 17.39 A6 6 0 0 0 11.58 17.99Z',
  'M6.41 20.29 A10 10 0 0 1 3.71 17.59 L7.03 15.36 A6 6 0 0 0 8.64 16.97Z',
  'M3.01 16.38 A10 10 0 0 1 2.02 12.70 L6.01 12.42 A6 6 0 0 0 6.61 14.63Z',
  'M2.02 11.30 A10 10 0 0 1 3.01 7.62 L6.61 9.37 A6 6 0 0 0 6.01 11.58Z',
  'M3.71 6.41 A10 10 0 0 1 6.41 3.71 L8.64 7.03 A6 6 0 0 0 7.03 8.64Z',
  'M7.62 3.01 A10 10 0 0 1 11.30 2.02 L11.58 6.01 A6 6 0 0 0 9.37 6.61Z',
]

const GLYPHS = {
  newCustomers: (
    <>
      <P className="fill-accent" d="M10 4.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7Z" />
      <P className="fill-accent" d="M3.5 20.5c.8-4 3.3-6 6.5-6s5.7 2 6.5 6Z" />
      <P anim="pop" className="fill-accent-soft" d="M18.5 1.5l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2Z" />
    </>
  ),
  annualPlan: (
    <>
      <P className="fill-accent" d="M7 2.5h14v13H7Z" />
      <P anim="slideY" className="fill-accent-soft" d="M3 8h14v13.5H3Z" />
      <P line className="stroke-primary-black" d="M6 12.5h5 M6 16h8" />
    </>
  ),
  activeSubscription: (
    <>
      <P className="fill-accent" d="M4.5 3h11v18l-1.8-1.2-1.8 1.2-1.8-1.2-1.8 1.2-1.8-1.2-2 1.2Z" />
      <P line className="stroke-accent-soft" d="M7.5 8h5 M7.5 11h5 M7.5 14h3" />
      <P anim="pop" className="fill-accent-soft" d="M17.5 11.6a4.4 4.4 0 1 1 0 8.8a4.4 4.4 0 1 1 0-8.8Z" />
      <P anim="draw" n={4} line className="stroke-primary-black" d="M15.6 16.1l1.3 1.3 2.5-2.7" />
    </>
  ),
  upToSixMonths: (
    <>
      {SIX_SEGMENTS.map((d, i) =>
        i < 6 ? <P key={d} anim="fade" n={i} className="fill-accent-soft" d={d} /> : <P key={d} className="fill-accent/50" d={d} />,
      )}
    </>
  ),
  deadline: (
    <>
      <P line className="stroke-accent-soft" d="M6.5 3h11 M6.5 21h11" />
      <P className="fill-accent" d="M8 3h8c0 4.5-4 5.5-4 9 0 3.5 4 4.5 4 9H8c0-4.5 4-5.5 4-9 0-3.5-4-4.5-4-9Z" />
      <P anim="rise" className="fill-accent-soft" d="M9.1 20.2c.6-2.4 2.9-3.2 2.9-4.9 0 1.7 2.3 2.5 2.9 4.9Z" />
    </>
  ),
}

function ConditionIcon({ glyph }) {
  const reveal = useReveal({ amount: 0.6 })
  return (
    <motion.svg {...reveal} viewBox="0 0 56 56" fill="none" aria-hidden="true" className="size-11 lg:size-14">
      <rect x="0.5" y="0.5" width="55" height="55" rx="14" className="fill-accent/10 stroke-white/5" />
      <g transform="translate(14.8 14.8) scale(1.1)">{GLYPHS[glyph]}</g>
    </motion.svg>
  )
}

// glyph → migrationOffer.conditions.items[key] (src/i18n)
const ITEMS = [
  { glyph: 'newCustomers', key: 'newCustomer' },
  { glyph: 'annualPlan', key: 'annualPlan' },
  { glyph: 'activeSubscription', key: 'activeSubscription' },
  { glyph: 'upToSixMonths', key: 'upToSixMonths' },
  { glyph: 'deadline', key: 'deadline' },
]

// §M3 "The offer applies if".
export default function Conditions() {
  const t = useT()
  const c = t.migrationOffer.conditions
  return (
    <section aria-labelledby="conditions-heading" className="flex w-full flex-col items-center">
      <SectionHeading id="conditions-heading">{c.heading}</SectionHeading>
      <div className="flex w-full justify-center">
        <div className="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
          <div className="relative overflow-hidden border-x-[1.5px] border-white/5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-[10%] -top-[40%] h-[140%] w-[120%] rounded-full bg-conditions-glow blur-xl lg:w-[70%]"
            />
            <ul className="relative flex flex-col divide-y divide-white/5 py-2 lg:py-6">
              {ITEMS.map((it) => (
                <li
                  key={it.key}
                  className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-4 py-6 md:px-6 lg:grid-cols-[72px_minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-x-6 lg:py-8 xl:px-14"
                >
                  <ConditionIcon glyph={it.glyph} />
                  <h3 className="font-display text-xl font-semibold leading-7 text-white word-spacing-3 lg:text-2xl lg:leading-[120%]">
                    {c.items[it.key].title}
                  </h3>
                  <p className="col-span-2 text-pretty leading-6 text-white/60 lg:col-span-1">{c.items[it.key].description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

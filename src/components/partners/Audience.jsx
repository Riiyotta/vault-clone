import { motion } from 'framer-motion'
import SectionHeading from '../shared/SectionHeading.jsx'
import { EASE_OUT_EXPO, useReveal } from '../shared/reveal.js'
import { useT } from '../../i18n/index.jsx'

// §B.4 "Who it's for". Icons are inlined from public/assets/svg/partners/audience-*.svg so the path marked
// data-animation can animate (whileInView once, amount .6; 0.7s EXPO, delay 0.25s; transform-box fill-box).
const reveal = (from, to) => ({
  hidden: { ...from, opacity: 0 },
  shown: { ...to, opacity: 1, transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.25 } },
})
const KIND = {
  pop: reveal({ scale: 0 }, { scale: 1 }),
  slideX: reveal({ x: -6 }, { x: 0 }),
  slideY: reveal({ y: -5 }, { y: 0 }),
}
const LINE = { fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

function P({ anim, line, className, d }) {
  const props = { d, className, ...(line ? LINE : {}) }
  if (!anim) return <path {...props} />
  return <motion.path {...props} variants={KIND[anim]} style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }} />
}

// Colours: accent (body fills), accent-soft (strokes / accent fills), primary-black ("ink" strokes).
const GLYPHS = {
  accountingFirms: (
    <>
      <P line className="stroke-accent-soft" d="M12 4v16 M7.5 20.5h9 M6 7.6v5.4 M18 7.6v5.4" />
      <P className="fill-accent" d="M3 5.8h18v1.8H3Z" />
      <P anim="slideY" className="fill-accent-soft" d="M2.8 13h6.4a3.2 3.2 0 0 1-6.4 0Z M14.8 13h6.4a3.2 3.2 0 0 1-6.4 0Z" />
    </>
  ),
  freelanceCfos: (
    <>
      <P line className="stroke-accent-soft" d="M12 12L5 5.5 M12 12l7-6.5 M12 12v7.5" />
      <P
        className="fill-accent"
        d="M5 3a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5Z M19 3a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5Z M12 17a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5Z"
      />
      <P anim="pop" className="fill-accent-soft" d="M12 8.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7Z" />
    </>
  ),
  consulting: (
    <>
      <P line className="stroke-accent-soft" d="M3 20.5h18 M5.5 20.5v-5 M9.5 20.5v-8 M13.5 20.5v-6" />
      <P anim="slideX" className="fill-accent-soft" d="M15.5 3.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 1 1 0-9Z" />
      <P line className="stroke-accent-soft" d="M18.8 11.8l3 3" />
    </>
  ),
  saas: (
    <>
      <P className="fill-accent" d="M2.5 4h19v16h-19Z" />
      <P line className="stroke-primary-black" d="M2.5 8.5h19" />
      <P line className="stroke-primary-black" d="M5 6.25h.01 M7 6.25h.01 M9 6.25h.01" />
      <P line className="stroke-primary-black" d="M5.5 12.5h5 M5.5 15.5h3.5" />
      <P anim="pop" className="fill-accent-soft" d="M13 11l7.5 2.8-3.2 1.3-1.3 3.2Z" />
    </>
  ),
  services: (
    <>
      <P className="fill-accent" d="M2.5 9h19v11h-19Z" />
      <P line className="stroke-accent-soft" d="M9 9V6.5h6V9" />
      <P line className="stroke-primary-black" d="M2.5 14h19" />
      <P anim="pop" className="fill-accent-soft" d="M10 12.5h4v3h-4Z" />
    </>
  ),
}

function AudienceIcon({ glyph }) {
  const inView = useReveal({ amount: 0.6 })
  return (
    <motion.svg {...inView} viewBox="0 0 56 56" fill="none" aria-hidden="true" className="size-11 lg:size-14">
      <rect x="0.5" y="0.5" width="55" height="55" rx="14" className="fill-accent/10 stroke-white/5" />
      <g transform="translate(14.8 14.8) scale(1.1)">{GLYPHS[glyph]}</g>
    </motion.svg>
  )
}

const ITEMS = ['accountingFirms', 'freelanceCfos', 'consulting', 'saas', 'services']

export default function Audience() {
  const a = useT().partners.audience
  return (
    <section aria-labelledby="audience-heading" className="flex w-full flex-col items-center">
      <SectionHeading id="audience-heading">{a.heading}</SectionHeading>
      <div className="flex w-full justify-center">
        <div className="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
          <div className="relative overflow-hidden border-x-[1.5px] border-white/5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-[10%] -top-[40%] h-[140%] w-[120%] rounded-full bg-conditions-glow blur-xl lg:w-[70%]"
            />
            <ul className="relative flex flex-col divide-y divide-white/5 py-2 lg:py-6">
              {ITEMS.map((key) => (
                <li
                  key={key}
                  className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-4 py-6 md:px-6 lg:grid-cols-[72px_minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-x-6 lg:py-8 xl:px-14"
                >
                  <AudienceIcon glyph={key} />
                  <h3 className="font-display text-xl font-semibold leading-7 text-white word-spacing-3 lg:text-2xl lg:leading-[120%]">
                    {a.items[key].title}
                  </h3>
                  <p className="col-span-2 text-pretty leading-6 text-white/60 lg:col-span-1">{a.items[key].description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { Frame } from '../GridFrame.jsx'
import SectionHeading from '../shared/SectionHeading.jsx'
import { EASE_OUT_EXPO, useReveal } from '../shared/reveal.js'
import { DOT_GRID_PANEL, MockCard, MockDivider } from './Mock.jsx'
import { useT } from '../../i18n/index.jsx'

// §M2 motion: figure fade/rise, then bars scaleX in sequence, then the dashed divider.
const V = {
  figure: { hidden: { opacity: 0, y: 8 }, shown: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } },
  bar: (delay, duration) => ({
    hidden: { scaleX: 0 },
    shown: { scaleX: 1, transition: { duration, delay, ease: EASE_OUT_EXPO } },
  }),
  dash: { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut', delay: 1.3 } } },
}

const GRID12 = 'grid grid-cols-12 gap-x-1 lg:gap-x-1.5'
const BAR = 'relative h-6 origin-left rounded-md border bg-clip-padding lg:h-7'
const HATCHED = 'border-white/20 bg-hatch'
const DEDUCTED = 'border-accent/75 bg-accent/20'
const PAID = 'border-white/10 bg-white/5'
const VISIBLE_MONTHS_BELOW_LG = new Set([1, 4, 8, 12])

function Chart() {
  const reveal = useReveal({ amount: 0.2 })
  const c = useT().migrationOffer.offer.chart
  return (
    <motion.figure
      {...reveal}
      variants={V.figure}
      aria-label={c.ariaLabel}
      className="w-full max-w-[560px]"
    >
      <MockCard className="lg:p-6">
        <figcaption className="text-sm font-medium leading-5">{c.caption}</figcaption>
        <MockDivider className="mb-[18px] mt-4" />
        <div aria-hidden="true" className="relative">
          <motion.div variants={V.dash} className={`absolute -inset-y-1 inset-x-0 ${GRID12}`}>
            <span className="-mr-0.5 border-r border-dashed border-white/20 [grid-column:1/span_4] lg:-mr-[3px]" />
          </motion.div>
          <div className={`mb-3.5 ${GRID12}`}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <div
                key={m}
                className={`flex flex-col items-center gap-1 text-[11px] leading-[14px] tabular-nums text-white/40 ${
                  VISIBLE_MONTHS_BELOW_LG.has(m) ? '' : 'max-lg:invisible'
                }`}
              >
                <span className="min-h-[14px]">{m}</span>
                <span className="h-1 w-px bg-white/20" />
              </div>
            ))}
          </div>
          <p className="mb-2 text-white/80">{c.currentTool}</p>
          <div className={`mb-[18px] ${GRID12}`}>
            <motion.div variants={V.bar(0.2, 0.7)} className={`${BAR} ${HATCHED} [grid-column:1/span_4]`} />
          </div>
          <p className="mb-2 text-white/80">{c.vaultPlan}</p>
          <div className={GRID12}>
            <motion.div variants={V.bar(0.6, 0.6)} className={`${BAR} ${DEDUCTED} [grid-column:1/span_4]`} />
            <motion.div variants={V.bar(1.0, 0.9)} className={`${BAR} ${PAID} [grid-column:5/-1]`} />
          </div>
        </div>
        <ul className="mt-[18px] flex flex-wrap gap-x-5 gap-y-2 text-white/80">
          {[
            [c.legend.current, HATCHED],
            [c.legend.deducted, DEDUCTED],
            [c.legend.paid, PAID],
          ].map(([label, swatch]) => (
            <li key={label} className="flex items-center gap-2">
              <span className={`h-3 w-6 shrink-0 rounded-[4px] border bg-clip-padding ${swatch}`} />
              {label}
            </li>
          ))}
        </ul>
        <MockDivider className="mb-3.5 mt-[18px]" />
        <p className="leading-5 text-white/60">{c.note}</p>
      </MockCard>
    </motion.figure>
  )
}

// §M2 "You don't pay for two tools at once".
export default function OfferExplanation() {
  const o = useT().migrationOffer.offer
  return (
    <section aria-labelledby="offer-heading" className="flex w-full flex-col items-center">
      <SectionHeading id="offer-heading">
        <span className="lg:block">{o.heading.start}</span> <span className="lg:block">{o.heading.end}</span>
      </SectionHeading>
      <Frame frameClassName="grid lg:grid-cols-2">
        <div className="order-last flex flex-col justify-center gap-4 px-3 pb-12 pt-8 md:px-6 lg:order-first lg:py-12 xl:px-14">
          <p className="max-w-[500px] leading-[26px] text-white/60">{o.paragraphs.overlap}</p>
          <p className="max-w-[500px] leading-[26px] text-white/60">{o.paragraphs.deduction}</p>
        </div>
        <div
          className={`flex items-center justify-center border-b border-white/5 px-3 py-8 md:px-6 lg:min-h-[480px] lg:border-b-0 lg:p-12 ${DOT_GRID_PANEL}`}
        >
          <Chart />
        </div>
      </Frame>
    </section>
  )
}

import { motion } from 'framer-motion'
import Eyebrow from '../shared/Eyebrow.jsx'
import { ContactPrimary } from '../shared/contact.jsx'
import { HERO_H1, HERO_SUB } from '../shared/typography.js'
import { EASE_OUT_EXPO, useReveal } from '../shared/reveal.js'
import Icon from '../Icon.jsx'
import { DOT_GRID_PANEL, IconDisc, MockCard, MockDivider, MockLabel, MockPill, MockRow, VaultProHeader } from './Mock.jsx'
import { useT } from '../../i18n/index.jsx'

// §M1 hero motion table (delays measured from the moment the scene enters view).
const rise = (delay) => ({
  hidden: { opacity: 0, y: 12 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { opacity: { duration: 0.4, ease: 'easeOut', delay }, y: { duration: 0.5, ease: EASE_OUT_EXPO, delay } },
  },
})
const fade = (from, to, delay) => ({
  hidden: { opacity: from },
  shown: { opacity: to, transition: { duration: 0.3, ease: 'easeOut', delay } },
})
const V = {
  card1: rise(0.4),
  line: { hidden: { scaleY: 0 }, shown: { scaleY: 1, transition: { duration: 0.45, ease: EASE_OUT_EXPO, delay: 1.2 } } },
  pill: {
    hidden: { opacity: 0, scale: 0.9 },
    shown: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut', delay: 1.4 } },
  },
  card2: rise(1.6),
  highlight: fade(0, 1, 2.2),
  oldTotal: fade(1, 0, 2.4),
  newTotal: fade(0, 1, 2.4),
}

const DOT = 'absolute left-1/2 size-2 -translate-x-1/2 rounded-full border border-white/40 bg-primary-black'

function Scene() {
  const reveal = useReveal({ amount: 0.3 })
  const m = useT().migrationOffer.mock
  return (
    <motion.div {...reveal} className="relative flex w-full flex-col items-center">
      <motion.div variants={V.card1} className="w-full max-w-[320px]">
        <MockCard>
          <div className="flex items-center gap-2.5">
            <IconDisc>
              <Icon name="receipt" className="size-4 text-white/60" />
            </IconDisc>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-5">{m.currentSubscription}</span>
              <span className="tabular-nums text-white/50">{m.perMonth}</span>
            </div>
          </div>
          <MockDivider className="my-3.5" />
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium">{m.monthsLeft}</span>
            <span className="whitespace-nowrap tabular-nums text-white/60">{m.calculation}</span>
          </div>
        </MockCard>
      </motion.div>

      <div className="relative z-10 flex justify-center">
        <motion.div variants={V.line} className="relative h-[88px] w-px origin-top bg-white/20">
          <span className={`${DOT} -top-1`} />
          <span className={`${DOT} -bottom-1`} />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div variants={V.pill}>
            <MockPill size="lg" tone="surface">
              {m.costDeducted}
            </MockPill>
          </motion.div>
        </div>
      </div>

      <motion.div variants={V.card2} className="w-full max-w-[340px]">
        <MockCard>
          <VaultProHeader />
          <MockLabel className="mt-3.5">{m.firstInvoice}</MockLabel>
          <div className="mt-2 flex flex-col gap-1.5">
            <MockRow label={m.annualPlan} value="$504" />
            <div className="relative">
              <motion.span
                variants={V.highlight}
                className="absolute inset-0 rounded-lg border border-accent/35 bg-accent/10"
              />
              <MockRow
                className="relative text-white"
                label={m.monthsDeducted}
                value={<span className="font-medium text-accent-soft">{'−$180'}</span>}
              />
            </div>
            <MockDivider className="my-1" />
            <div className="flex items-center justify-between gap-3 px-2.5 pb-0.5 pt-1 font-medium">
              <span>{m.totalDue}</span>
              <span className="relative tabular-nums">
                <motion.span variants={V.oldTotal} className="block">
                  $504
                </motion.span>
                <motion.span variants={V.newTotal} className="absolute right-0 top-0">
                  $324
                </motion.span>
              </span>
            </div>
          </div>
        </MockCard>
      </motion.div>
    </motion.div>
  )
}

// §M1 split hero.
export default function MigrationHero() {
  const h = useT().migrationOffer.hero
  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
        <div className="relative flex flex-col overflow-hidden border-x-[1.5px] border-white/5 lg:min-h-[720px] lg:flex-row">
          <div className="relative z-10 flex flex-col items-start gap-8 px-4 pt-24 md:px-6 md:pt-28 lg:w-[62%] lg:shrink-0 lg:pt-[136px] xl:pl-14">
            <div className="flex flex-col items-start gap-4 md:gap-6">
              <Eyebrow icon>{h.eyebrow}</Eyebrow>
              <h1 className={HERO_H1}>
                <span className="lg:block">{h.headline.start}</span> <span className="lg:block">{h.headline.end}</span>
              </h1>
              <p className={HERO_SUB}>
                <span className="block">{h.subheadline.question}</span>
                <span className="block">{h.subheadline.offer}</span>
              </p>
            </div>
            <ContactPrimary>{h.cta}</ContactPrimary>
          </div>

          <div
            aria-hidden="true"
            className="relative flex items-center justify-center px-4 pb-16 pt-12 md:px-6 lg:flex-1 lg:py-16 lg:pl-0 lg:pr-6"
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[660px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-migration-hero-glow blur-xl" />
            <div
              className={`migration-hero-dots pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[520px] -translate-x-1/2 -translate-y-1/2 ${DOT_GRID_PANEL}`}
            />
            <Scene />
          </div>
        </div>
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import Eyebrow from '../shared/Eyebrow.jsx'
import { HERO_H1, HERO_SUB } from '../shared/typography.js'
import { EASE_OUT_EXPO, useReveal } from '../shared/reveal.js'
import { DOT_GRID_PANEL, MockCard, MockLabel, MockPill } from '../migration/Mock.jsx'
import { InviteCard, ListItem } from './PartnerMock.jsx'
import { BecomePartnerButton } from './PartnerPopup.jsx'
import { useT } from '../../i18n/index.jsx'

// §B.3 hero scene timeline (Framer, plays once; delays measured from the scene entering view, amount .3).
const rise = (delay) => ({
  hidden: { opacity: 0, y: 12 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { opacity: { duration: 0.4, ease: 'easeOut', delay }, y: { duration: 0.5, ease: EASE_OUT_EXPO, delay } },
  },
})
const V = {
  invite: rise(0.4),
  copy: { hidden: { opacity: 1 }, shown: { opacity: 0, transition: { duration: 0.2, ease: 'easeOut', delay: 1.1 } } },
  copied: { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut', delay: 1.1 } } },
  line: { hidden: { scaleY: 0 }, shown: { scaleY: 1, transition: { duration: 0.45, ease: EASE_OUT_EXPO, delay: 1.1 } } },
  pill: {
    hidden: { opacity: 0, scale: 0.9 },
    shown: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut', delay: 1.3 } },
  },
  workspaces: rise(1.8),
  newRow: {
    hidden: { opacity: 0, y: -6 },
    shown: {
      opacity: 1,
      y: 0,
      transition: { opacity: { duration: 0.3, ease: 'easeOut', delay: 2.5 }, y: { duration: 0.4, ease: EASE_OUT_EXPO, delay: 2.5 } },
    },
  },
}

const DOT = 'absolute left-1/2 size-2 -translate-x-1/2 rounded-full border border-white/40 bg-primary-black'

function Scene() {
  const reveal = useReveal({ amount: 0.3 })
  const m = useT().partners.mock
  return (
    <div className="relative flex w-full justify-center">
      <motion.div {...reveal} className="flex w-full flex-col items-center">
        <motion.div variants={V.invite} className="w-full max-w-[340px]">
          <InviteCard m={m} copied copyVariants={V.copy} copiedVariants={V.copied} />
        </motion.div>

        <div className="relative z-10 flex justify-center">
          <motion.div variants={V.line} className="relative h-[88px] w-px origin-top bg-white/20">
            <span className={`${DOT} -top-1`} />
            <span className={`${DOT} -bottom-1`} />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div variants={V.pill}>
              <MockPill size="lg" tone="surface">
                {m.viaYourLink}
              </MockPill>
            </motion.div>
          </div>
        </div>

        <motion.div variants={V.workspaces} className="w-full max-w-[320px]">
          <MockCard padding="p-2">
            <MockLabel className="px-2 pb-1.5 pt-2">{m.workspaces}</MockLabel>
            <ListItem avatar="LE" title="Ledgerline" subtitle={m.yourWorkspace} />
            <ListItem avatar="NS" title="Northwind Studio" subtitle={m.accountant} />
            <ListItem avatar="HD" title="Harbor Dental" subtitle={m.admin} />
            <motion.div variants={V.newRow}>
              <ListItem avatar="AL" title="Alder Logistics" subtitle={m.newInvite} highlighted />
            </motion.div>
          </MockCard>
        </motion.div>
      </motion.div>
    </div>
  )
}

// §B.3 split hero (same frame as the migration-offer hero; no planet background, no bottom fade).
export default function PartnersHero() {
  const h = useT().partners.hero
  return (
    <section className="flex w-full flex-col items-center">
      <div className="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
        <div className="relative flex flex-col overflow-hidden border-x-[1.5px] border-white/5 lg:min-h-[720px] lg:flex-row">
          <div className="relative z-10 flex flex-col items-start gap-8 px-4 pt-24 md:px-6 md:pt-28 lg:w-[62%] lg:shrink-0 lg:pt-[136px] xl:pl-14">
            <div className="flex flex-col items-start gap-4 md:gap-6">
              <Eyebrow icon>{h.eyebrow}</Eyebrow>
              <h1 className={HERO_H1}>
                <span className="lg:block">{h.headline.start}</span> <span className="lg:block">{h.headline.end}</span>
              </h1>
              <p className={HERO_SUB}>
                <span className="block">{h.subheadline.audience}</span>
                <span className="block">{h.subheadline.reward}</span>
              </p>
            </div>
            <BecomePartnerButton size="large">{h.cta}</BecomePartnerButton>
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
    </section>
  )
}

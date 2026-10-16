import { MotionConfig } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import Statement from '../components/Statement.jsx'
import { Separator } from '../components/GridFrame.jsx'
import PartnersHero from '../components/partners/PartnersHero.jsx'
import Audience from '../components/partners/Audience.jsx'
import ValueGrid from '../components/partners/ValueGrid.jsx'
import PartnersFaq from '../components/partners/PartnersFaq.jsx'
import PartnerSteps from '../components/partners/PartnerSteps.jsx'
import { PartnerPopupProvider } from '../components/partners/PartnerPopup.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import { useT } from '../i18n/index.jsx'

// CLONE_SPEC_partners_ua_legal.md §B.1 — DOM order: nav, full separator, hero, sep, who it's for, sep, statement
// (bare div), sep, value grid, sep, FAQ, sep, steps (ends with its own sep + spacer + sep), footer.
export default function Partners() {
  usePageMeta('partners')
  const t = useT()
  return (
    <MotionConfig reducedMotion="user">
      <PartnerPopupProvider>
        <Navbar />
        <Separator crosses full />
        <main className="flex w-full flex-col items-center overflow-x-clip text-white">
          <PartnersHero />
          <Separator crosses />
          <Audience />
          <Separator crosses />
          <Statement as="div" text={t.partners.statement} staticWhenReducedMotion />
          <Separator crosses />
          <ValueGrid />
          <Separator crosses />
          <PartnersFaq />
          <Separator crosses />
          <PartnerSteps />
        </main>
        <Footer />
      </PartnerPopupProvider>
    </MotionConfig>
  )
}

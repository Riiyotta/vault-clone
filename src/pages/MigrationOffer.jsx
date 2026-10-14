import { MotionConfig } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Separator } from '../components/GridFrame.jsx'
import MigrationHero from '../components/migration/MigrationHero.jsx'
import OfferExplanation from '../components/migration/OfferExplanation.jsx'
import Conditions from '../components/migration/Conditions.jsx'
import MigrationFaq from '../components/migration/MigrationFaq.jsx'
import VisualSteps from '../components/migration/VisualSteps.jsx'
import usePageMeta from '../hooks/usePageMeta.js'

// CLONE_SPEC_pricing_migration.md §2 — DOM order: nav, full separator, M1, sep, M2, sep, M3, sep, M4, sep,
// M5 (ends with its own separator + spacer + separator), footer.
export default function MigrationOffer() {
  usePageMeta('migration')
  return (
    <MotionConfig reducedMotion="user">
      <Navbar />
      <Separator crosses full />
      <main className="flex w-full flex-col items-center overflow-x-clip text-white">
        <MigrationHero />
        <Separator crosses />
        <OfferExplanation />
        <Separator crosses />
        <Conditions />
        <Separator crosses />
        <MigrationFaq />
        <Separator crosses />
        <VisualSteps />
      </main>
      <Footer />
    </MotionConfig>
  )
}

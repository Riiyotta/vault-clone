import { MotionConfig } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import { Separator } from '../components/GridFrame.jsx'
import PricingHero from '../components/pricing/PricingHero.jsx'
import CompareTable from '../components/pricing/CompareTable.jsx'
import PricingFaq from '../components/pricing/PricingFaq.jsx'
import usePageMeta from '../hooks/usePageMeta.js'

// CLONE_SPEC_pricing_migration.md §1 — DOM order: nav, full separator, P1, sep, P2, sep, P3, sep, P4, sep, footer.
export default function Pricing() {
  usePageMeta('pricing')
  return (
    <MotionConfig reducedMotion="user">
      <Navbar />
      <Separator crosses full />
      <main className="flex w-full flex-col items-center overflow-x-clip text-white">
        <PricingHero />
        <Separator crosses />
        <CompareTable />
        <Separator crosses />
        <PricingFaq />
        <Separator crosses />
        {/* §P4: home §8 without the id="how-it-works" anchor. The w-full wrapper is needed because this <main>
            is a centered flex column (spec §0.1) while home's is not; the home component itself is unchanged. */}
        <div className="w-full">
          <HowItWorks anchorId={null} />
        </div>
        <Separator crosses />
      </main>
      <Footer />
    </MotionConfig>
  )
}

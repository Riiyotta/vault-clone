import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import Statement from '../components/Statement.jsx'
import ProductHighlights from '../components/ProductHighlights.jsx'
import FeatureTabs from '../components/FeatureTabs.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Footer from '../components/Footer.jsx'
import { Separator } from '../components/GridFrame.jsx'
import useAnchorScroll from '../hooks/useAnchorScroll.js'
import usePageMeta from '../hooks/usePageMeta.js'
import { useT } from '../i18n/index.jsx'

// Spec §5–7: section ids + Lottie files; copy in src/i18n (featureShowcase.sections[id]).
const FEATURES = [
  { id: 'automation', lottie: 'automate-financial-tasks' },
  { id: 'reports', lottie: 'understand-your-business-finances' },
  { id: 'security', lottie: 'financial-infrastructure' },
]

export default function Home() {
  usePageMeta('home')
  useAnchorScroll()
  const t = useT()
  return (
    <div id="top">
      <Navbar />
      <Separator crosses full />
      <main className="text-white">
        <Hero />
        <Separator crosses full />
        <Statement />
        <Separator />
        <ProductHighlights />
        {FEATURES.map((f) => (
          <div key={f.id}>
            <Separator />
            <FeatureTabs {...f} {...t.featureShowcase.sections[f.id]} />
          </div>
        ))}
        <Separator />
        <HowItWorks />
        <Separator crosses />
      </main>
      <Footer />
    </div>
  )
}

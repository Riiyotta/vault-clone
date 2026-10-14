import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Frame, Separator } from '../components/GridFrame.jsx'
import Eyebrow from '../components/shared/Eyebrow.jsx'
import { HERO_H1, HERO_SUB } from '../components/shared/typography.js'
import { OUTLINE_CLASSES } from '../components/shared/contact.jsx'
import usePageMeta from '../hooks/usePageMeta.js'

/**
 * CLONE-ONLY PAGE. The original site's 404 was not recorded in any spec; this catch-all is built from the
 * shared page shell (nav, separators, hero typography, outline button, footer) so unknown URLs — including
 * the not-yet-built /partners, /ua, /terms, /privacy, /dpa routes — still render in the site's style.
 */
export default function NotFound() {
  usePageMeta('notFound')
  return (
    <>
      <Navbar />
      <Separator crosses full />
      <main data-clone-only="not-found" className="flex w-full flex-col items-center overflow-x-clip text-white">
        <Frame frameClassName="flex flex-col items-center px-4 pt-24 pb-12 md:pt-28 md:pb-14 lg:pt-[120px] lg:pb-16">
          <div className="flex max-w-[400px] flex-col items-center gap-4 md:max-w-[560px] md:gap-6 lg:max-w-[750px]">
            <Eyebrow>404</Eyebrow>
            <h1 className={`text-center ${HERO_H1}`}>Page not found</h1>
            <p className={`text-balance px-4 text-center ${HERO_SUB}`}>
              The page you are looking for does not exist or has moved.
            </p>
            <Link to="/" className={`${OUTLINE_CLASSES} mt-4`}>
              Back to home
            </Link>
          </div>
        </Frame>
        <Separator crosses />
      </main>
      <Footer />
    </>
  )
}

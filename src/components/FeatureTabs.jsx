import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Separator, Spacer } from './GridFrame.jsx'
import { PrimaryCta } from './Cta.jsx'
import Icon from './Icon.jsx'
import LottieCanvas from './LottieCanvas.jsx'
import { useT } from '../i18n/index.jsx'

// Spec §5–7 — shared feature showcase (Automation / Reports / Security).
// Logic mirrors the original FeatureShowcase source (measured 2026-10-14):
// - IO threshold .35 on the <section>; inView = entry.isIntersecting (Chrome toggles at ratio .35 both ways).
// - Tab resets to 0 only on an inView false→true transition; leaving view keeps the tab and pauses the Lottie.
// - Timer/progress bar are gated on "animation ready" = Lottie loaded AND markers parsed.
// - Tab duration = (b − a) / 30 fps. Measured dwell (automation): 5367 / 6400 / 7035 ms.
// - No document visibilitychange handling in the original (timer + Lottie keep running).
const FPS = 30
const FALLBACK_MS = 5000
const IN_VIEW_THRESHOLD = 0.35

// dotlottie-web 0.71 (original) returns markers as {name,time,duration}; 0.81 (this build) as {name,start,end}.
// The original reads `frame ?? time`; `start` covers the newer runtime.
function markerMap(list) {
  const map = {}
  for (const m of list || []) {
    const v = m.frame ?? m.time ?? m.start
    if (typeof m.name === 'string' && typeof v === 'number') map[m.name] = v
  }
  return map
}

function ProgressBar({ durationMs }) {
  return (
    <motion.span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-px origin-left bg-white"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: durationMs / 1000, ease: 'linear' }}
    />
  )
}

// tabs / title / description: featureShowcase.sections[id] from src/i18n.
export default function FeatureTabs({ id, tabs, title, description, lottie }) {
  const t = useT()
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [active, setActive] = useState(0)
  const [dotLottie, setDotLottie] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [markers, setMarkers] = useState({})

  // IntersectionObserver on the <section>, threshold 0.35.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: IN_VIEW_THRESHOLD,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Entering view resets to the first tab.
  useEffect(() => {
    if (inView) setActive(0)
  }, [inView])

  // Lottie load tracking.
  useEffect(() => {
    if (!dotLottie) {
      setLoaded(false)
      return
    }
    const onLoad = () => setLoaded(true)
    dotLottie.addEventListener('load', onLoad)
    if (dotLottie.isLoaded) setLoaded(true)
    return () => dotLottie.removeEventListener('load', onLoad)
  }, [dotLottie])

  useEffect(() => {
    if (dotLottie && loaded) setMarkers(markerMap(dotLottie.markers()))
  }, [dotLottie, loaded])

  const ready = loaded && Object.keys(markers).length > 0
  const k = active + 1
  const segA = markers[`section${k}_in`]
  const segB = markers[k < tabs.length ? `section${k + 1}_in` : `section${tabs.length}_out`]
  const segment = useMemo(
    () => (typeof segA === 'number' && typeof segB === 'number' ? [segA, segB] : null),
    [segA, segB],
  )
  const durationMs = segment && ready ? Math.max(((segment[1] - segment[0]) / FPS) * 1000, 0) : FALLBACK_MS

  // Auto-advance while in view and ready.
  useEffect(() => {
    if (!tabs.length || !inView || !ready) return
    const t = setTimeout(() => setActive((a) => (a + 1) % tabs.length), durationMs)
    return () => clearTimeout(t)
  }, [durationMs, active, inView, tabs.length, ready])

  // Segment playback for the active tab.
  useEffect(() => {
    if (!dotLottie || !segment || !loaded) return
    dotLottie.setLoop(false)
    dotLottie.setSegment(segment[0], segment[1])
    dotLottie.setFrame(segment[0])
    if (!inView) {
      dotLottie.pause()
      return
    }
    dotLottie.play()
  }, [dotLottie, segment, inView, loaded])

  // Clicking the already-active tab is a no-op (state unchanged), as in the original.
  const go = useCallback((i) => setActive((i + tabs.length) % tabs.length), [tabs.length])

  const showBar = inView && ready

  return (
    <section ref={sectionRef}>
      <Spacer />
      <Separator />
      <div className="flex w-full justify-center">
        <div id={id} className="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
          <div className="border-x-[1.5px] border-white/5">
            {/* Desktop tabs (lg+) */}
            <div className="hidden grid-cols-3 lg:grid" role="tablist">
              {tabs.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => go(i)}
                  className={`relative flex h-[74px] items-center justify-center overflow-hidden text-lg font-medium leading-[22px] transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] xl:justify-start xl:pl-[60px] ${
                    i === 1 ? 'border-x border-white/5' : ''
                  } ${i === active ? 'text-white' : 'text-white/50 hover:text-white'}`}
                >
                  {t}
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/5" />
                  {i === active && showBar && <ProgressBar durationMs={durationMs} />}
                </button>
              ))}
            </div>

            {/* Mobile / tablet header (<lg) */}
            <div className="relative flex items-center justify-between overflow-hidden px-2.5 py-4 md:px-3 lg:hidden">
              <button
                type="button"
                aria-label={t.featureShowcase.previousAriaLabel}
                onClick={() => go(active - 1)}
                className="flex shrink-0 items-center justify-center text-white/50 transition-colors duration-300 hover:text-white"
              >
                <Icon name="chevron-left" className="block size-6" />
              </button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h3
                  key={tabs[active]}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="text-center text-lg font-medium leading-[22px] text-white md:text-xl md:leading-[22px]"
                >
                  {tabs[active]}
                </motion.h3>
              </AnimatePresence>
              <button
                type="button"
                aria-label={t.featureShowcase.nextAriaLabel}
                onClick={() => go(active + 1)}
                className="flex shrink-0 items-center justify-center text-white/50 transition-colors duration-300 hover:text-white"
              >
                <Icon name="chevron-right" className="block size-6" />
              </button>
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/5" />
              {showBar && <ProgressBar key={tabs[active]} durationMs={durationMs} />}
            </div>

            {/* Body */}
            <div className="flex flex-col lg:flex-row-reverse">
              <div className="h-60 shrink-0 overflow-hidden border-b-[1.5px] border-b-white/5 bg-feature-visual bg-dots-8 md:h-[432px] md:bg-dots-12 lg:w-1/2 lg:border-b-0">
                <LottieCanvas
                  src={`/assets/lottie/feature-showcase/${lottie}.lottie`}
                  autoplay={false}
                  loop={false}
                  onInstance={setDotLottie}
                />
              </div>
              <div className="flex flex-col gap-8 px-3 py-8 md:px-6 md:py-10 xl:px-[60px] xl:pt-20">
                <div className="flex flex-col gap-4 md:max-w-[560px]">
                  <h3 className="bg-heading-fade bg-clip-text font-display text-2xl font-semibold leading-[28.8px] text-white word-spacing-3 md:max-w-[488px] md:text-[28px] md:leading-[1.2]">
                    {title}
                  </h3>
                  <p className="text-base leading-[1.4] tracking-[0.025em] text-white/60">{description}</p>
                </div>
                <PrimaryCta size="small">{t.featureShowcase.cta}</PrimaryCta>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

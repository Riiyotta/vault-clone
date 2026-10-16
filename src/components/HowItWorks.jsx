import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Frame, Separator, Spacer } from './GridFrame.jsx'
import { PrimaryCta } from './Cta.jsx'
import LottieCanvas from './LottieCanvas.jsx'
import { stepBox } from '../tokens.js'
import { fmt, rich, useT } from '../i18n/index.jsx'

// Spec §8 — How it works / process steps. Copy: processSteps in src/i18n (3 steps).
const STEP_COUNT = 3
const FRAME_STARTS = [0, 170, 350]

// The original runs dotlottie-web 0.71.0, whose wasm core starts its playback clock at play().
// 0.81.x instead derives dt from rAF timestamps and its first tick after play() has dt = 0, so every
// play() lands one frame (~16 ms) late (measured: loop-back +15 ms vs the original). Seeding the
// player's last-frame time at play() restores the 0.71 timing. No-op if the field is absent.
function playFromNow(dl) {
  if (!dl) return
  dl.play()
  if ('_lastFrameTime' in dl && dl._lastFrameTime === null) dl._lastFrameTime = performance.now()
}
const STEP_DURATIONS = [170 / 30, 180 / 30, 218 / 30] // seconds: 5.667, 6.0, 7.267
const LINE_DURATION = 1.55
const IN_VIEW_THRESHOLD = 0.4
const noop = () => {}

function Step({ index, step, isActive, isOpen, isLast, runId, ariaLabel }) {
  const n = index + 1
  return (
    <div className="relative flex flex-col">
      <div className="relative z-10 flex items-center gap-[18px] xl:gap-7">
        <motion.button
          type="button"
          aria-label={ariaLabel}
          aria-pressed={isActive}
          data-step={index}
          initial={false}
          // framer-motion 14 runs backgroundColor through WAAPI; the original's build animates it on the JS
          // frameloop (starts one frame later). An onUpdate handler opts out of WAAPI so the curve matches.
          onUpdate={noop}
          animate={{ backgroundColor: isActive ? stepBox.activeBg : stepBox.inactiveBg }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          // Not shrink-0: on the original a long title squeezes the box (UA 390: step 3 box is 30×36).
          className={`relative flex size-9 items-center justify-center border border-white/10 md:size-[42px] xl:size-10 ${
            isActive ? 'overflow-hidden' : ''
          }`}
        >
          <span className="pointer-events-none absolute -left-px -top-px z-10 size-[5px] border-l border-t border-tick md:size-1.5" />
          <span className="pointer-events-none absolute -bottom-px -right-px z-10 size-[5px] border-b border-r border-tick md:size-1.5" />
          <motion.span
            initial={false}
            animate={{ color: isActive ? stepBox.activeText : stepBox.inactiveText }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 text-sm font-bold leading-5 md:text-base md:leading-6 xl:text-xl xl:leading-7"
          >
            {n}
          </motion.span>
        </motion.button>
        <h6 className="font-display text-xl font-semibold leading-7 text-white word-spacing-2 md:leading-6">
          {step.header}
        </h6>
      </div>

      <div
        aria-hidden={!isActive}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <motion.p
          initial={false}
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -6 }}
          transition={{ opacity: { duration: 0.3, ease: 'linear' }, y: { duration: 0.3, ease: 'easeOut' } }}
          className="min-h-0 overflow-hidden whitespace-pre-line pl-[54px] text-sm leading-[22px] tracking-tight text-white/60 md:pl-[60px] lg:text-base lg:leading-6 xl:pl-[68px]"
        >
          {step.description}
        </motion.p>
      </div>

      {isActive && !isLast && (
        <div className="absolute left-[18px] top-9 h-[calc(100%+20px-36px)] w-px overflow-hidden bg-white/20 md:left-[21px] md:top-[42px] md:h-[calc(100%+20px-42px)] xl:left-5 xl:top-10 xl:h-[calc(100%+20px-40px)]">
          <motion.div
            key={runId}
            className="absolute inset-0 origin-top bg-white"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              duration: LINE_DURATION,
              ease: 'easeInOut',
              delay: Math.max(STEP_DURATIONS[index] - LINE_DURATION, 0.3),
            }}
          />
        </div>
      )}
    </div>
  )
}

// `anchorId`: home renders the wrapper with id="how-it-works"; /pricing P4 passes null (no id, spec §P4).
export default function HowItWorks({ anchorId = 'how-it-works' }) {
  const t = useT()
  // Mirrors the original ProcessSteps source (measured 2026-10-14):
  // - IO (threshold .4) observes the whole #how-it-works wrapper and is attached only after the Lottie loads.
  //   Uses entry.isIntersecting. Enter: stop(), step 0 (new runId), play() if the page is visible. Exit: stop().
  // - Timer advances index+1 after STEP_DURATIONS[index] while in view and visible; the last step has no timer.
  //   Measured: step changes at +5.667 s and +11.667 s, back to step 0 on Lottie `complete` at +18.93 s.
  // - visibilitychange: stop(), step 0 (new runId), and play() again if now visible and in view.
  const wrapRef = useRef(null)
  const [state, setState] = useState({ index: 0, runId: 0 })
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const [dotLottie, setDotLottie] = useState(null)
  const dlRef = useRef(null)
  dlRef.current = dotLottie
  const step = state.index

  const setStep = useCallback((n) => setState(({ runId }) => ({ index: n, runId: runId + 1 })), [])

  // Lottie load, then IntersectionObserver + complete handler.
  useEffect(() => {
    if (!dotLottie) return
    const onLoad = () => setLoaded(true)
    if (!loaded) dotLottie.addEventListener('load', onLoad)
    if (dotLottie.isLoaded && !loaded) setLoaded(true)
    if (!wrapRef.current || !loaded) return () => dotLottie.removeEventListener('load', onLoad)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dotLottie.stop()
          setStep(0)
          if (pageVisible) playFromNow(dotLottie)
          setInView(true)
        } else {
          dotLottie.stop()
          setInView(false)
        }
      },
      { threshold: IN_VIEW_THRESHOLD },
    )
    const onComplete = () => {
      setStep(0)
      dotLottie.setFrame(0)
      playFromNow(dotLottie)
    }
    io.observe(wrapRef.current)
    dotLottie.addEventListener('complete', onComplete)
    return () => {
      io.disconnect()
      dotLottie.removeEventListener('load', onLoad)
      dotLottie.removeEventListener('complete', onComplete)
    }
  }, [dotLottie, loaded, pageVisible, setStep])

  // visibilitychange: stop, reset to step 0; resume from frame 0 when visible again and in view.
  useEffect(() => {
    const onVis = () => {
      const visible = !document.hidden
      dlRef.current?.stop()
      setPageVisible(visible)
      setStep(0)
      if (visible && inView) playFromNow(dlRef.current)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [inView, setStep])

  // Step timer. Advancing also bumps runId (restarts the connector line).
  useEffect(() => {
    if (!inView || !pageVisible || step === STEP_COUNT - 1) return
    const t = window.setTimeout(
      () => setState(({ index, runId }) => ({ index: (index + 1) % STEP_COUNT, runId: runId + 1 })),
      (STEP_DURATIONS[step] ?? STEP_DURATIONS[0]) * 1000,
    )
    return () => window.clearTimeout(t)
  }, [step, state.runId, inView, pageVisible])

  const playStep = (n) => {
    setStep(n)
    const dl = dlRef.current
    if (dl && pageVisible) {
      dl.setFrame(FRAME_STARTS[n] ?? 0)
      if (inView) playFromNow(dl)
    }
  }

  const onListClick = (e) => {
    const btn = e.target.closest('button[data-step]')
    if (btn) playStep(Number(btn.dataset.step))
  }
  const runId = state.runId

  return (
    <section>
      <div id={anchorId ?? undefined} ref={wrapRef} className="lg:scroll-mb-[120px]">
        <Frame frameClassName="flex flex-col items-center pt-24 pb-10 md:pb-12 lg:pt-[120px] lg:pb-16">
          <h2 className="inline-flex whitespace-pre-line text-center font-display text-[30px] font-semibold uppercase leading-9 text-white word-spacing-4 lg:text-5xl lg:leading-[64px] lg:word-spacing-7">
            {rich(t.processSteps.heading)}
          </h2>
        </Frame>

        <Separator crosses />

        <Frame frameClassName="flex flex-col gap-8 md:gap-10 lg:h-[400px] lg:flex-row-reverse lg:justify-between lg:gap-1 xl:gap-10">
          <div
            className="h-[210px] w-full border-b border-b-white/5 bg-steps-visual bg-dots-8 md:h-[412px] md:bg-dots-12 lg:h-[400px] lg:w-1/2 lg:shrink-0 lg:border-b-0"
          >
            <div className="relative size-full overflow-hidden">
              <LottieCanvas
                src="/assets/lottie/process-steps/gain-clarity-on-your-finances.lottie"
                autoplay={false}
                loop={false}
                onInstance={setDotLottie}
                className="absolute inset-0 top-[-7%] h-[114%] w-full md:top-0 md:h-full"
              />
            </div>
          </div>

          <div className="flex h-[360px] w-full flex-col gap-8 overflow-hidden px-3 md:h-[430px] md:pl-6 lg:h-full lg:flex-1 lg:gap-6 lg:pr-0 lg:pt-8 xl:pl-14 xl:pt-12">
            <div className="flex flex-col gap-5" onClick={onListClick}>
              {t.processSteps.steps.map((s, i) => {
                const isActive = inView && step === i
                const isOpen = isActive || (!inView && i === 0)
                return (
                  <Step
                    key={i}
                    index={i}
                    step={s}
                    isActive={isActive}
                    isOpen={isOpen}
                    isLast={i === STEP_COUNT - 1}
                    ariaLabel={fmt(t.processSteps.playStepAriaLabel, { step: i + 1 })}
                    runId={runId}
                  />
                )
              })}
            </div>
            <PrimaryCta size="small">{t.processSteps.cta}</PrimaryCta>
          </div>
        </Frame>
      </div>

      {/* Separator + spacer are hidden at md (768–1023): wrapper is `flex md:hidden lg:flex`.
          Sibling of #how-it-works (as in the original) so the IO target height matches. */}
      <div className="flex w-full flex-col items-center md:hidden lg:flex">
        <Separator crosses />
        <Spacer />
      </div>
    </section>
  )
}

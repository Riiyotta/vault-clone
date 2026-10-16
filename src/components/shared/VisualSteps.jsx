import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Separator, Spacer } from '../GridFrame.jsx'
import SectionHeading from './SectionHeading.jsx'
import { EASE_OUT_EXPO } from './reveal.js'
import { DOT_GRID_PANEL } from '../migration/Mock.jsx'

// VisualSteps: migration-offer §M5 and partners §B.8 (same component on the original): 4 steps that loop every
// 5s while ≥20% in view, DOM mock panes on a dot-grid panel, then separator / spacer / separator.
const STEP_COUNT = 4
const STEP_DURATION = 5 // s, every step
const FILL_DURATION = STEP_DURATION - 0.2 // 4.8s linear connector fill
const STATIC_STEP = 2 // reduced motion: visual shows step index 2 until the user clicks

const PANE_TRANSITION = { opacity: { duration: 0.4, ease: 'easeOut' }, y: { duration: 0.5, ease: EASE_OUT_EXPO } }

function usePageVisible() {
  const [visible, setVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const on = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return visible
}

/**
 * heading: section h2 text. steps: [{ title, description }]. panes(visualIndex) → 4 pane nodes.
 * cta: node rendered under the list.
 * expandAllWhenReduced: partners §B.8 — with reduced motion every description is expanded.
 */
export default function VisualSteps({ heading, steps, panes: renderPanes, cta, expandAllWhenReduced = false }) {
  const rowRef = useRef(null)
  const inView = useInView(rowRef, { amount: 0.2 })
  const seen = useInView(rowRef, { amount: 0.2, once: true })
  const pageVisible = usePageVisible()
  const reduced = useReducedMotion()
  const [{ index, runId, chosen }, setState] = useState({ index: 0, runId: 0, chosen: false })

  const autoAdvancing = inView && pageVisible && !reduced

  // Loops 1 → 2 → 3 → 4 → 1 every 5s while ≥20% in view and the tab is visible.
  useEffect(() => {
    if (!autoAdvancing) return
    const t = window.setTimeout(
      () => setState((s) => ({ ...s, index: (s.index + 1) % STEP_COUNT, runId: s.runId + 1 })),
      STEP_DURATION * 1000,
    )
    return () => window.clearTimeout(t)
  }, [autoAdvancing, index, runId])

  const choose = (i) => setState((s) => ({ index: i, runId: s.runId + 1, chosen: true }))
  const visualIndex = reduced && !chosen ? STATIC_STEP : index

  const panes = renderPanes(visualIndex)

  return (
    <section aria-labelledby="steps-heading" className="flex w-full flex-col items-center">
      <SectionHeading id="steps-heading">{heading}</SectionHeading>
      <div className="flex w-full justify-center">
        <div className="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
          <div ref={rowRef} className="flex flex-col border-x-[1.5px] border-white/5 lg:flex-row-reverse">
            <div
              className={`flex items-center justify-center border-b border-white/5 px-3 py-8 md:px-6 lg:min-h-[560px] lg:w-1/2 lg:shrink-0 lg:border-b-0 lg:p-12 ${DOT_GRID_PANEL}`}
            >
              <div aria-hidden="true" className="pointer-events-none relative h-[380px] w-full max-w-[440px] lg:h-[400px]">
                {panes.map((pane, i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={i === visualIndex ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={reduced ? { duration: 0 } : PANE_TRANSITION}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {pane}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start justify-center gap-8 px-3 pb-12 pt-8 md:px-6 lg:flex-1 lg:py-14 xl:px-14">
              <ol className="flex w-full flex-col gap-5">
                {steps.map((s, i) => {
                  const current = i === index
                  const expanded = current || (expandAllWhenReduced && reduced)
                  // Highlight starts only after the row has been seen once (step 1's text is open before that).
                  // Reduced motion: original highlights nothing until the user clicks a step (measured on /partners).
                  const pressed = (seen && !reduced && current) || (chosen && current)
                  const isLast = i === STEP_COUNT - 1
                  return (
                    <li key={i} className="relative flex flex-col">
                      <h3>
                        <button
                          type="button"
                          aria-pressed={pressed}
                          onClick={() => choose(i)}
                          className="flex cursor-pointer items-center gap-[18px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:gap-7"
                        >
                          <span
                            className={`relative flex size-9 shrink-0 items-center justify-center border text-sm font-bold transition-colors duration-300 motion-reduce:transition-none md:size-[42px] md:text-base xl:size-10 xl:text-xl ${
                              pressed ? 'border-white bg-white text-primary-black' : 'border-white/10 bg-white/2 text-white'
                            }`}
                          >
                            <span className="absolute -left-px -top-px size-[5px] border-l border-t border-tick md:size-1.5" />
                            <span className="absolute -bottom-px -right-px size-[5px] border-b border-r border-tick md:size-1.5" />
                            {i + 1}
                          </span>
                          <span className="font-display text-xl font-semibold leading-7 text-white word-spacing-2 md:leading-6">
                            {s.title}
                          </span>
                        </button>
                      </h3>
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <p className="max-w-[460px] text-pretty pl-[54px] pt-1.5 text-sm leading-[22px] tracking-tight text-white/60 md:pl-[60px] lg:text-base lg:leading-6 xl:pl-[68px]">
                            {s.description}
                          </p>
                        </div>
                      </div>
                      {!isLast && (
                        <span className="absolute -bottom-5 left-[18px] top-9 w-px overflow-hidden bg-white/20 md:left-[21px] md:top-[42px] xl:left-5 xl:top-10">
                          {current && autoAdvancing && (
                            <motion.span
                              key={runId}
                              className="absolute inset-0 origin-top bg-white"
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ duration: FILL_DURATION, ease: 'linear' }}
                            />
                          )}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
              {cta}
            </div>
          </div>
        </div>
      </div>
      <Separator crosses />
      <Spacer className="h-24 lg:h-[200px]" />
      <Separator crosses />
    </section>
  )
}

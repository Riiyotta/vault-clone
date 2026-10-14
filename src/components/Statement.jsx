import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useT } from '../i18n/index.jsx'

// Spec §3 — scroll-coloring statement. Also used on /partners (partners spec §B.5) with its own copy,
// rendered as a bare <div> and with `staticWhenReducedMotion`.

function Word({ word, i, n, progress }) {
  const opacity = useTransform(progress, [i / n, (i + 1) / n], [0, 1], { clamp: true })
  return (
    <span className="relative mr-1.5 mt-1.5 md:mr-2 lg:mr-3 lg:mt-3">
      <span aria-hidden="true" className="absolute opacity-20">
        {word}
      </span>
      <motion.span style={{ opacity }}>{word}</motion.span>
    </span>
  )
}

/**
 * text: the paragraph (defaults to home's scrollColoringText.paragraph).
 * as: wrapper tag ('section' on home, 'div' on /partners).
 * staticWhenReducedMotion: with prefers-reduced-motion, progress is fixed at 1 (every word filled).
 */
export default function Statement({ text, as: Tag = 'section', staticWhenReducedMotion = false }) {
  const t = useT()
  const words = (text ?? t.scrollColoringText.paragraph).split(' ')
  const pRef = useRef(null)
  const reduced = useReducedMotion()
  // The home page never passes `staticWhenReducedMotion` (verified in the RSC payload), so there progress is
  // always scroll-driven — even with prefers-reduced-motion.
  const { scrollYProgress } = useScroll({ target: pRef, offset: ['start 0.9', 'start 0.25'] })
  const full = useMotionValue(1)
  const progress = staticWhenReducedMotion && reduced ? full : scrollYProgress
  const pOpacity = useTransform(progress, [0, 1], [0, 1])

  return (
    <Tag className="flex w-full justify-center">
      <div className="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
        <div className="statement-frame relative flex w-full justify-center border-x border-white/5 py-[136px] md:py-[212px] lg:py-[300px]">
          <motion.p
            ref={pRef}
            style={{ opacity: pOpacity }}
            className="relative z-10 flex flex-wrap justify-center px-5 font-display text-lg font-semibold uppercase leading-7 tracking-wide text-white word-spacing-2 md:text-[32px] md:leading-[calc(1.75/1.125)] lg:max-w-[1200px] lg:px-0 lg:text-4xl lg:leading-10"
          >
            {words.map((w, i) => (
              <Word key={i} word={w} i={i} n={words.length} progress={progress} />
            ))}
          </motion.p>
        </div>
      </div>
    </Tag>
  )
}

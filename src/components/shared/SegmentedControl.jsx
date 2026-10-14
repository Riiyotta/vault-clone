import { useId, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * SegmentedControl (§P1 billing toggle, §P2 mobile plan picker): role="radiogroup" with a sliding white
 * pill (Framer shared layout, 0.3s easeOut). Roving tabindex + arrow/Home/End keys that select and focus.
 * size "default": billing toggle (md+ / <md / ≤360 sizes). size "small": full-width plan picker.
 * options: [{ value, label, badge? }]
 */
export default function SegmentedControl({ options, value, onChange, label, size = 'default', className = '' }) {
  const layoutId = `segmented-pill-${useId()}`
  const refs = useRef([])
  const small = size === 'small'

  const select = (i) => {
    onChange(options[i].value)
    refs.current[i]?.focus()
  }
  const onKeyDown = (e, i) => {
    const last = options.length - 1
    let next = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    select(next)
  }

  const btnSize = small
    ? 'flex-1 gap-2 px-3 py-2 text-sm leading-5'
    : 'gap-1.5 px-2.5 py-2 text-sm leading-5 max-[360px]:gap-1 max-[360px]:px-2 max-[360px]:text-[13px] md:gap-2 md:px-5 md:py-2.5 md:text-base md:leading-[22px]'

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`flex items-stretch rounded-full border border-white/20 p-1 ${small ? 'w-full' : 'w-fit'} ${className}`}
    >
      {options.map((o, i) => {
        const checked = o.value === value
        return (
          <button
            key={o.value}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`relative flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${btnSize} ${
              checked ? 'text-cta-text' : 'text-white/60 hover:text-white'
            }`}
          >
            {checked && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
            <span className="relative">{o.label}</span>
            {o.badge && (
              <span
                className={`relative rounded-full px-1 text-[10px] font-medium leading-4 transition-colors duration-300 motion-reduce:transition-none md:px-2 md:py-0.5 md:text-xs md:leading-4 ${
                  checked ? 'bg-cta-text/8 text-cta-text' : 'bg-white/8 text-white/80'
                }`}
              >
                {o.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

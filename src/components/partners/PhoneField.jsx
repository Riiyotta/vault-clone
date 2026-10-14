import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { COUNTRIES } from './countries.js'

// Phone field with country selector (CLONE_SPEC_partners_ua_legal.md §B.9 — the original is react-international-phone,
// custom-styled). Flags are local Twemoji SVGs. Value is the international string, prefilled "+1" (US).
const BY_ISO = Object.fromEntries(COUNTRIES.map((c) => [c[1], c]))
const flagSrc = (iso2) => `/assets/svg/flags/${iso2}.svg`

/** Country whose dial code is the longest prefix of the typed digits (ties → lowest priority, current wins). */
function guessCountry(digits, current) {
  let best = null
  for (const c of COUNTRIES) {
    if (!digits.startsWith(c[2])) continue
    if (!best || c[2].length > best[2].length || (c[2].length === best[2].length && (c[3] ?? 0) < (best[3] ?? 0)))
      best = c
  }
  if (best && current && current[2] === best[2]) return current
  return best ?? current
}

function Flag({ iso2, className }) {
  return <img src={flagSrc(iso2)} alt="" width={16} height={16} className={`size-4 shrink-0 rounded-[2px] ${className}`} />
}

const PhoneField = forwardRef(function PhoneField(
  { id, label, value, onChange, error, disabled, countryLabel, errorId },
  inputRef,
) {
  const [iso2, setIso2] = useState('us')
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState(null)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const country = BY_ISO[iso2]

  const measure = useCallback(() => {
    const r = wrapRef.current?.getBoundingClientRect()
    if (r) setRect({ left: r.left, top: r.bottom, width: r.width })
  }, [])

  // The list panel is `fixed`, aligned to the field (x / width) and kept aligned on scroll / resize.
  useLayoutEffect(() => {
    if (!open) return
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open, measure])

  // On open: focus the selected option and scroll it into view.
  useEffect(() => {
    if (!open || !rect) return
    const selected = listRef.current?.querySelector('[aria-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
    selected?.focus({ preventScroll: true })
  }, [open, rect])

  // Click outside closes.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const closeList = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  const select = (c) => {
    setIso2(c[1])
    onChange(`+${c[2]}`)
    setOpen(false)
    inputRef?.current?.focus()
  }

  const onInput = (e) => {
    // Keep a leading "+" and digits / common separators only.
    let next = e.target.value.replace(/[^\d\s()+-]/g, '')
    next = `+${next.replace(/\+/g, '')}`
    const guessed = guessCountry(next.replace(/\D/g, ''), country)
    if (guessed && guessed[1] !== iso2) setIso2(guessed[1])
    onChange(next)
  }

  const onListKeyDown = (e) => {
    const options = [...listRef.current.querySelectorAll('button')]
    const i = options.indexOf(document.activeElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = e.key === 'ArrowDown' ? Math.min(i + 1, options.length - 1) : Math.max(i - 1, 0)
      options[next]?.focus()
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      options[e.key === 'Home' ? 0 : options.length - 1]?.focus()
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      // Handled here so the popup's Esc / focus-trap handlers don't also act on it.
      e.preventDefault()
      e.stopPropagation()
      closeList()
    }
  }

  const border = open
    ? 'rounded-b-none border-white border-b-transparent before:absolute before:inset-x-4 before:bottom-0 before:h-px before:bg-white/10 before:content-[\'\']'
    : error
      ? 'border-red focus-within:border-white'
      : 'border-white/10 focus-within:border-white'

  return (
    <div className="relative flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-base font-light leading-6 text-white">
        {label}
      </label>
      <div ref={wrapRef} className={`relative flex items-center rounded-lg border ${border} ${disabled ? 'opacity-60' : ''}`}>
        <button
          ref={buttonRef}
          type="button"
          aria-label={countryLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && !open) {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className="my-3 flex h-6 shrink-0 cursor-pointer items-center border-r border-white/5 pl-5 pr-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <Flag iso2={iso2} className="mr-1.5" />
          <span
            aria-hidden="true"
            className={`size-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-white ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <input
          ref={inputRef}
          id={id}
          name="phone"
          type="tel"
          autoComplete="off"
          value={value}
          onChange={onInput}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-12 w-full border-0 bg-transparent px-2 text-base font-light text-white outline-none"
        />
      </div>
      {error && (
        <span id={errorId} className="text-sm text-red">
          {error}
        </span>
      )}

      {open &&
        rect &&
        createPortal(
          <div
            ref={listRef}
            onKeyDown={onListKeyDown}
            style={{ left: rect.left, top: rect.top, width: rect.width }}
            className="fixed z-[1100] flex max-h-[200px] flex-col overflow-hidden rounded-b-lg border-x border-b border-white bg-surface pt-3"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <ul role="listbox" aria-label={countryLabel} className="m-0 list-none pb-4 pr-6">
                {COUNTRIES.map((c) => {
                  const selected = c[1] === iso2
                  return (
                    <li key={c[1]}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        tabIndex={-1}
                        onClick={() => select(c)}
                        className={`flex w-full cursor-pointer items-center px-4 py-0.5 text-left text-base font-light leading-6 text-white outline-none hover:bg-white/5 focus-visible:bg-white/5 ${
                          selected ? 'bg-white/5' : ''
                        }`}
                      >
                        <Flag iso2={c[1]} className="mr-3" />
                        <span className="mr-1 truncate">{c[0]}</span>
                        <span className="text-white/60">+{c[2]}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>,
          document.getElementById('popupPortal') ?? document.body,
        )}
    </div>
  )
})

export default PhoneField

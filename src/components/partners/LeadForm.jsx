import { useEffect, useRef, useState } from 'react'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { PrimaryCta } from '../Cta.jsx'
import Icon from '../Icon.jsx'
import PhoneField from './PhoneField.jsx'
import { COUNTRIES } from './countries.js'
import { rich, useT } from '../../i18n/index.jsx'

// Partner lead form + result view (CLONE_SPEC_partners_ua_legal.md §B.9). Lazy-loaded by PartnerPopup.
// Validation mirrors the original (zod + react-hook-form): on submit, then live per field on change; the first
// invalid field receives focus.

// zod v3 `.email()` pattern.
const EMAIL_RE = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i
const FIELDS = ['firstName', 'lastName', 'email', 'phone']
const SIMULATED_REQUEST_MS = 800
const DIAL_CODES = new Set(COUNTRIES.map((c) => c[2]))

function validate(name, value, e) {
  const v = value.trim()
  if (name === 'firstName') return v ? null : e.firstName
  if (name === 'lastName') return v ? null : e.lastName
  if (name === 'email') return !v ? e.email : EMAIL_RE.test(v) ? null : e.emailInvalid
  // phone: nothing, or only the "+<dial code>" prefix, counts as empty; otherwise libphonenumber-js isValid.
  const digits = value.replace(/\D/g, '')
  if (!digits || DIAL_CODES.has(digits)) return e.phoneRequired
  return isValidPhoneNumber(value) ? null : e.phoneInvalid
}

const INPUT =
  'h-12 w-full rounded-lg border bg-inherit pb-3.5 pl-4 pt-2.5 text-base font-light text-white outline-none transition-all duration-200 focus:border-white disabled:opacity-60'

function TextField({ name, label, value, error, disabled, onChange, inputRef }) {
  const id = `lead-form-${name}`
  return (
    <div className="relative flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-base font-light leading-6 text-white">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${INPUT} ${error ? 'border-red' : 'border-white/10'}`}
      />
      {error && (
        <span id={`${id}-error`} className="text-sm text-red">
          {error}
        </span>
      )}
    </div>
  )
}

function Result({ title, body }) {
  return (
    <div className="flex w-full flex-col items-center gap-4 py-6 md:px-4 md:pb-6 md:pt-12">
      <span className="flex size-16 items-center justify-center rounded-full bg-surface">
        <Icon name="check" className="size-10 text-white" />
      </span>
      <h3
        id="popup-title"
        className="text-center font-display text-xl font-semibold uppercase leading-9 text-white word-spacing-3 md:text-[32px] md:leading-10 lg:text-3xl lg:leading-[48px]"
      >
        {title}
      </h3>
      <p className="text-center text-lg text-white/60">{rich(body)}</p>
    </div>
  )
}

export default function LeadForm() {
  const t = useT()
  const f = t.leadForm
  const ctx = f.contexts.partnerProgram
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', phone: '+1' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const refs = { firstName: useRef(null), lastName: useRef(null), email: useRef(null), phone: useRef(null) }
  const mounted = useRef(true)

  // Focus the first field once the form is shown (§B.9).
  useEffect(() => {
    refs.firstName.current?.focus()
    return () => {
      mounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }))
    // After the first submit, re-validate the changed field live (react-hook-form reValidateMode "onChange").
    if (submitted) setErrors((er) => ({ ...er, [name]: validate(name, value, f.errors) }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    const next = Object.fromEntries(FIELDS.map((n) => [n, validate(n, values[n], f.errors)]))
    setErrors(next)
    const firstInvalid = FIELDS.find((n) => next[n])
    if (firstInvalid) {
      refs[firstInvalid].current?.focus()
      return
    }
    setStatus('submitting')
    // CLONE-ONLY: the original POSTs {firstName, lastName, email, phone, source: "partner_program", utm_*} to
    // /api/add-lead. This clone never sends the form anywhere (no fetch, no external endpoint): the request is
    // simulated locally with a short delay and always resolves to the specced success state.
    await new Promise((r) => window.setTimeout(r, SIMULATED_REQUEST_MS))
    if (mounted.current) setStatus('success')
  }

  if (status === 'success') return <Result title={t.popup.success.title} body={t.popup.success.body} />

  const submitting = status === 'submitting'
  const field = (name) => ({
    name,
    label: f.fields[name],
    value: values[name],
    error: errors[name],
    disabled: submitting,
    onChange,
    inputRef: refs[name],
  })

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4 id="popup-title" className="font-display text-2xl font-semibold leading-[28.8px] text-white word-spacing-3">
          {ctx.heading}
        </h4>
        <p className="leading-[26px] text-white/60">{ctx.description}</p>
      </div>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex w-full flex-col gap-4 md:flex-row">
            <TextField {...field('firstName')} />
            <TextField {...field('lastName')} />
          </div>
          <TextField {...field('email')} />
          <PhoneField
            ref={refs.phone}
            id="lead-form-phone"
            errorId="lead-form-phone-error"
            label={f.fields.phone}
            value={values.phone}
            error={errors.phone}
            disabled={submitting}
            countryLabel={f.countrySelectorAriaLabel}
            onChange={(v) => onChange('phone', v)}
          />
        </div>
        <PrimaryCta as="button" type="submit" size="large" fullWidth disabled={submitting}>
          {ctx.submit}
        </PrimaryCta>
      </form>
    </div>
  )
}

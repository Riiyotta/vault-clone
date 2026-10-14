import { Frame } from '../GridFrame.jsx'
import { LOGIN, PrimaryCta } from '../Cta.jsx'
import Eyebrow from '../shared/Eyebrow.jsx'
import Icon from '../Icon.jsx'
import { OUTLINE_CLASSES, openContact } from '../shared/contact.jsx'
import { getPlans } from './plans.js'
import { useT } from '../../i18n/index.jsx'

// max-md:text-[16px] (not text-base) so the 22px line-height is kept, as in the v4 original.
const OUTLINE_CARD = `${OUTLINE_CLASSES} w-full max-md:text-[16px]`

function PlanCta({ plan }) {
  const { kind, label } = plan.cta
  if (kind === 'primary-link')
    return (
      <PrimaryCta size="large" fullWidth className="max-md:text-[16px]">
        {label}
      </PrimaryCta>
    )
  if (kind === 'contact')
    return (
      <button type="button" onClick={openContact} className={`${OUTLINE_CARD} cursor-pointer`}>
        {label}
      </button>
    )
  return (
    <a href={LOGIN} className={OUTLINE_CARD}>
      {label}
    </a>
  )
}

function PlanCard({ plan, period }) {
  const t = useT()
  const amount = plan.price[period]
  const sub = plan.sub?.[period]
  return (
    <article
      aria-labelledby={`plan-${plan.id}-name`}
      className={`relative row-span-4 grid grid-rows-subgrid gap-y-6 px-4 py-8 md:px-6 ${
        plan.recommended ? 'plan-card-pro' : 'bg-primary-black'
      }`}
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h3
            id={`plan-${plan.id}-name`}
            className="font-display text-2xl font-semibold leading-[120%] text-white word-spacing-3"
          >
            {plan.name}
          </h3>
          {plan.recommended && <Eyebrow>{t.pricing.recommended}</Eyebrow>}
        </div>
        <p className="leading-[140%] text-white/60">{plan.tagline}</p>
      </header>

      <div className={`flex flex-col gap-2 ${sub ? '' : 'max-md:pb-5'}`}>
        <p className="flex items-center font-display font-semibold text-white md:h-12">
          {plan.custom ? (
            <span className="text-2xl leading-[120%] md:text-[28px]">{amount}</span>
          ) : (
            <span key={amount} className="text-5xl leading-none tabular-nums motion-safe:animate-fade-in">
              {amount}
            </span>
          )}
        </p>
        {sub ? (
          <p key={sub} className="min-h-10 text-sm leading-5 text-white/60 motion-safe:animate-fade-in">
            {sub}
          </p>
        ) : (
          <p aria-hidden="true" className="min-h-10 text-sm leading-5 text-white/60 max-md:hidden" />
        )}
      </div>

      <div className="flex items-center">
        <PlanCta plan={plan} />
      </div>

      <div className="flex flex-col gap-4">
        {plan.featuresHeader && <p className="text-sm leading-5 text-white/60">{plan.featuresHeader}</p>}
        <ul className="flex flex-col gap-3">
          {plan.features.map((f) => (
            <li key={f} className="flex gap-2.5 leading-6 text-white/80">
              <Icon name="check" className="mt-0.5 size-5 shrink-0 text-white/60" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

// §P1 plan cards grid: 1px gaps over bg-white/5 act as hairlines; cards align rows via subgrid.
export default function PlanCards({ period }) {
  const t = useT()
  return (
    <Frame frameClassName="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-2 xl:grid-cols-4">
      {getPlans(t).map((p) => (
        <PlanCard key={p.id} plan={p} period={period} />
      ))}
    </Frame>
  )
}

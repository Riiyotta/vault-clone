import { useState } from 'react'
import { Frame, Separator } from '../GridFrame.jsx'
import Eyebrow from '../shared/Eyebrow.jsx'
import SegmentedControl from '../shared/SegmentedControl.jsx'
import { HERO_H1, HERO_SUB } from '../shared/typography.js'
import PlanCards from './PlanCards.jsx'
import { useT } from '../../i18n/index.jsx'

// §P1 hero + billing toggle + plan cards (one <section>).
export default function PricingHero() {
  const t = useT()
  const h = t.pricing.hero
  const b = t.pricing.billing
  const PERIODS = [
    { value: 'monthly', label: b.monthly },
    { value: 'annual', label: b.annual, badge: b.annualBadge },
  ]
  const [period, setPeriod] = useState('annual')
  return (
    <section className="flex w-full flex-col items-center">
      <Frame frameClassName="flex flex-col items-center px-4 pt-24 pb-12 md:pt-28 md:pb-14 lg:pt-[120px] lg:pb-16">
        <div className="flex max-w-[400px] flex-col items-center gap-4 md:max-w-[560px] md:gap-6 lg:max-w-[750px]">
          <Eyebrow icon>{h.eyebrow}</Eyebrow>
          <h1 className={`text-center ${HERO_H1}`}>{h.headline}</h1>
          <p className={`text-balance px-4 text-center ${HERO_SUB}`}>
            <span className="block">{h.subheadline.trial}</span>
            <span className="block">{h.subheadline.noCard}</span>
          </p>
        </div>
        <SegmentedControl
          label={b.ariaLabel}
          options={PERIODS}
          value={period}
          onChange={setPeriod}
          className="mt-8 md:mt-10"
        />
      </Frame>
      <Separator crosses />
      <PlanCards period={period} />
    </section>
  )
}

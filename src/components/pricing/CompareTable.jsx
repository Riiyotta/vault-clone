import { useState } from 'react'
import { Frame } from '../GridFrame.jsx'
import Icon from '../Icon.jsx'
import SectionHeading from '../shared/SectionHeading.jsx'
import SegmentedControl from '../shared/SegmentedControl.jsx'
import { getCompareGroups, getPlans } from './plans.js'
import { useT } from '../../i18n/index.jsx'

const STICKY_TH = 'md:sticky md:top-0 md:z-10 shadow-[inset_0_-1px_0_rgba(255,255,255,.05)]'

function Cell({ value }) {
  const t = useT()
  const c = t.pricing.compare
  if (value === true)
    return (
      <>
        <Icon name="check" className="mx-auto block size-5 text-white" />
        <span className="sr-only">{c.included}</span>
      </>
    )
  if (value === false)
    return (
      <>
        <span aria-hidden="true" className="text-white/30">
          —
        </span>
        <span className="sr-only">{c.notIncluded}</span>
      </>
    )
  return typeof value === 'number' ? value.toLocaleString(t.numberLocale) : value
}

// §P2 Compare plans.
export default function CompareTable() {
  const t = useT()
  const c = t.pricing.compare
  const PLANS = getPlans(t)
  const PICKER_OPTIONS = PLANS.map((p) => ({ value: p.id, label: p.name }))
  const [selected, setSelected] = useState('pro')
  // Below md only the selected plan column is shown (instant swap).
  const colVisibility = (id) => (id === selected ? '' : 'max-md:hidden')
  const proBg = (id) => (id === 'pro' ? 'bg-surface' : '')

  return (
    <section aria-labelledby="compare-heading" className="flex w-full flex-col items-center">
      <SectionHeading id="compare-heading">{c.heading}</SectionHeading>
      <Frame frameClassName="pb-10 md:pb-12 lg:pb-16">
        <div className="sticky top-0 z-20 border-b border-white/5 bg-primary-black px-3 py-3 md:hidden">
          <SegmentedControl
            size="small"
            label={c.planSelectorAriaLabel}
            options={PICKER_OPTIONS}
            value={selected}
            onChange={setSelected}
          />
        </div>
        <table className="w-full table-auto border-collapse text-left md:table-fixed">
          <caption className="sr-only">{c.caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={`w-[58%] bg-primary-black md:w-[32%] lg:w-[36%] ${STICKY_TH}`}>
                <span className="sr-only">{c.featureColumn}</span>
              </th>
              {PLANS.map((p) => (
                <th
                  key={p.id}
                  scope="col"
                  className={`px-2 py-4 text-center font-display text-lg font-semibold leading-6 text-white md:py-5 lg:text-xl lg:leading-6 ${STICKY_TH} ${
                    p.id === 'pro' ? 'bg-surface' : 'bg-primary-black'
                  } ${colVisibility(p.id)}`}
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          {getCompareGroups(t).map((g) => (
            <tbody key={g.label}>
              <tr className="border-t border-white/5">
                <th
                  scope="colgroup"
                  colSpan={5}
                  className="px-3 pb-3 pt-8 text-[11px] font-medium uppercase leading-4 tracking-[0.05em] text-white/40 md:px-6 lang-uk:text-[12px]"
                >
                  {g.label}
                </th>
              </tr>
              {g.rows.map(([label, values]) => (
                <tr key={label} className="border-t border-white/5">
                  <th
                    scope="row"
                    className="px-3 py-4 text-left align-middle text-sm font-normal leading-5 text-white/80 md:px-6 lg:text-base lg:leading-6"
                  >
                    {label}
                  </th>
                  {PLANS.map((p, i) => (
                    <td
                      key={p.id}
                      className={`px-2 py-4 text-center align-middle text-sm leading-5 tabular-nums text-white/80 lg:text-base lg:leading-6 ${proBg(
                        p.id,
                      )} ${colVisibility(p.id)}`}
                    >
                      <Cell value={values[i]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </Frame>
    </section>
  )
}

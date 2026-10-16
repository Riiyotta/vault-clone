import { Link } from 'react-router-dom'
import { Frame } from '../GridFrame.jsx'
import Icon from '../Icon.jsx'
import SectionHeading from '../shared/SectionHeading.jsx'
import { BecomePartnerButton } from './PartnerPopup.jsx'
import { localizePath, useT } from '../../i18n/index.jsx'

// §B.6 "What you and your clients get": two columns over a white/5 bg; the 1px gap is the divider.
const H3 = 'font-display text-2xl font-semibold leading-[28.8px] text-white word-spacing-3'
const H4 = 'text-pretty text-lg font-medium leading-[27px] text-white'
const P = 'max-w-[520px] text-pretty leading-6 text-white/60'
// Inline link (also used by the FAQ answer link): underline white/40 → white on hover (300ms), focus ring.
export const INLINE_LINK =
  'text-white underline decoration-white/40 underline-offset-4 transition-colors duration-300 hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none'

function Column({ title, children }) {
  return (
    <div className="flex flex-col bg-primary-black">
      <div className="border-b border-white/5 px-4 py-6 md:px-6 lg:py-8 xl:px-14">
        <h3 className={H3}>{title}</h3>
      </div>
      <div className="flex flex-col px-4 pb-10 pt-7 md:px-6 lg:pb-14 lg:pt-10 xl:px-14">{children}</div>
    </div>
  )
}

export default function ValueGrid() {
  const t = useT()
  const v = t.partners.value
  return (
    <section aria-labelledby="value-heading" className="flex w-full flex-col items-center">
      <SectionHeading id="value-heading">{v.heading}</SectionHeading>
      <Frame frameClassName="grid gap-px bg-white/5 lg:grid-cols-2">
        <Column title={v.client}>
          <div className="flex flex-col gap-3">
            <h4 className={H4}>{v.switching.title}</h4>
            <p className={P}>{v.switching.description}</p>
            <Link
              to={localizePath('/migration-offer', t.locale)}
              className={`inline-flex items-center gap-1.5 self-start leading-6 ${INLINE_LINK}`}
            >
              {v.learnMore}
              <Icon name="arrow-right" className="size-3.5" />
            </Link>
          </div>
          <div className="my-7 flex items-center gap-4 lg:my-8">
            <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] font-medium uppercase leading-4 tracking-[0.05em] text-white/40 lang-uk:text-[12px]">
              {v.or}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
          </div>
          <div className="flex flex-col gap-3">
            <h4 className={H4}>{v.fresh.title}</h4>
            <p className={P}>{v.fresh.description}</p>
          </div>
        </Column>

        <Column title={v.company}>
          <ul className="flex flex-col gap-7">
            {['rewards', 'inviteLink', 'workspaces'].map((k) => (
              <li key={k} className="flex flex-col gap-2">
                <h4 className={H4}>{v.benefits[k].title}</h4>
                <p className={P}>{v.benefits[k].description}</p>
              </li>
            ))}
          </ul>
          <p className={`mt-6 ${P}`}>{v.contact}</p>
          <div className="mt-8">
            <BecomePartnerButton>{v.cta}</BecomePartnerButton>
          </div>
        </Column>
      </Frame>
    </section>
  )
}

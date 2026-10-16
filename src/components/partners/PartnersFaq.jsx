import { Link } from 'react-router-dom'
import Faq from '../shared/Faq.jsx'
import SectionHeading from '../shared/SectionHeading.jsx'
import { INLINE_LINK } from './ValueGrid.jsx'
import { localizePath, rich, useT } from '../../i18n/index.jsx'

// §B.7 FAQ (shared accordion). The "migration offer" link uses the "Learn more" inline-link classes, no arrow.
const IDS = ['earnings', 'tracking', 'workspaces', 'clients']

export default function PartnersFaq() {
  const t = useT()
  const f = t.partners.faq
  const tags = {
    link: (chunk) => (
      <Link to={localizePath('/migration-offer', t.locale)} className={INLINE_LINK}>
        {chunk}
      </Link>
    ),
  }
  const items = IDS.map((id) => ({ id, question: f.items[id].question, answer: <>{rich(f.items[id].answer, tags)}</> }))
  return (
    <section aria-labelledby="faq-heading" className="flex w-full flex-col items-center">
      <SectionHeading id="faq-heading">{f.heading}</SectionHeading>
      <Faq items={items} />
    </section>
  )
}

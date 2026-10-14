import { Link } from 'react-router-dom'
import Faq from '../shared/Faq.jsx'
import SectionHeading from '../shared/SectionHeading.jsx'
import { INLINE_ACTION, InlineContact } from '../shared/contact.jsx'
import { localizePath, rich, useT } from '../../i18n/index.jsx'

// §P3 FAQ items (copy: pricing.faq in src/i18n). <link> → migration offer, <contact> → ContactButton.
const IDS = ['trial', 'noBank', 'annual', 'switching', 'customPlans']

export default function PricingFaq() {
  const t = useT()
  const f = t.pricing.faq
  const tags = {
    link: (chunk) => (
      <Link to={localizePath('/migration-offer', t.locale)} className={INLINE_ACTION}>
        {chunk}
      </Link>
    ),
    contact: (chunk) => <InlineContact>{chunk}</InlineContact>,
  }
  const items = IDS.map((id) => ({ id, question: f.items[id].question, answer: <>{rich(f.items[id].answer, tags)}</> }))
  return (
    <section aria-labelledby="faq-heading" className="flex w-full flex-col items-center">
      <SectionHeading id="faq-heading">{f.heading}</SectionHeading>
      <Faq items={items} />
    </section>
  )
}

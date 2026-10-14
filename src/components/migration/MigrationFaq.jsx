import Faq from '../shared/Faq.jsx'
import SectionHeading from '../shared/SectionHeading.jsx'
import { InlineContact } from '../shared/contact.jsx'
import { rich, useT } from '../../i18n/index.jsx'

// §M4 FAQ items (copy: migrationOffer.faq in src/i18n). Array answers render as multiple paragraphs.
const IDS = ['tools', 'amount', 'costsMore', 'moreThanSix', 'trial', 'monthlyBilling', 'moveData']

export default function MigrationFaq() {
  const t = useT()
  const f = t.migrationOffer.faq
  const tags = { contact: (chunk) => <InlineContact>{chunk}</InlineContact> }
  const items = IDS.map((id) => {
    const { question, answer } = f.items[id]
    return { id, question, answer: Array.isArray(answer) ? answer : <>{rich(answer, tags)}</> }
  })
  return (
    <section aria-labelledby="faq-heading" className="flex w-full flex-col items-center">
      <SectionHeading id="faq-heading">{f.heading}</SectionHeading>
      <Faq items={items} />
    </section>
  )
}

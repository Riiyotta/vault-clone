import VisualSteps from '../shared/VisualSteps.jsx'
import { ContactPrimary } from '../shared/contact.jsx'
import { ChatPane, ImportPane, InvoicePane, UploadPane } from './StepPanes.jsx'
import { useT } from '../../i18n/index.jsx'

// §M5 How it works (shared VisualSteps with the migration panes and the "Talk to us" ContactButton).
const panes = (visualIndex) => [
  <ChatPane key="chat" />,
  <UploadPane key="upload" active={visualIndex === 1} />,
  <InvoicePane key="invoice" />,
  <ImportPane key="import" />,
]

export default function MigrationSteps() {
  const s = useT().migrationOffer.steps
  return (
    <VisualSteps
      heading={s.heading}
      steps={s.items}
      panes={panes}
      cta={<ContactPrimary size="small">{s.cta}</ContactPrimary>}
    />
  )
}

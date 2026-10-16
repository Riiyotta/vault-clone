import { motion } from 'framer-motion'
import Icon from '../Icon.jsx'
import {
  IconDisc,
  MockCard,
  MockDivider,
  MockLabel,
  MockPill,
  MockRow,
  Skeleton,
  VaultMark,
  VaultProHeader,
} from './Mock.jsx'
import { useT } from '../../i18n/index.jsx'

// §M5 visual panes (DOM mocks). Text is 12/18 (MockCard) unless noted.

export function ChatPane() {
  const c = useT().migrationOffer.steps.visuals.chat
  return (
    <MockCard className="max-w-[360px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <VaultMark />
          <span className="text-sm font-medium leading-5">{c.title}</span>
        </div>
        <MockPill>
          <span className="size-1.5 rounded-full bg-accent" />
          {c.online}
        </MockPill>
      </div>
      <MockDivider className="my-3.5" />
      <div className="flex flex-col gap-2.5 leading-5">
        <p className="max-w-[82%] self-end rounded-xl rounded-br-[4px] bg-white/8 px-3 py-2.5">
          {c.userMessage}
        </p>
        <div className="flex max-w-[86%] items-end gap-2 self-start">
          <IconDisc size="sm">
            <VaultMark className="h-2.5 w-3 text-white" />
          </IconDisc>
          <p className="rounded-xl rounded-bl-[4px] border border-white/10 px-3 py-2.5 text-white/80">
            {c.vaultMessage}
          </p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-2 rounded-full border border-white/10 py-2 pl-3 pr-2">
        <Skeleton tone="faint" className="flex-1" />
        <span className="flex size-6 items-center justify-center rounded-full bg-white text-primary-black">
          <Icon name="arrow-right" className="size-3" />
        </span>
      </div>
    </MockCard>
  )
}

// "Attached" → "Reviewed" swap when the pane becomes active; instant reset when inactive.
export function UploadPane({ active }) {
  const t = useT()
  const u = t.migrationOffer.steps.visuals.upload
  return (
    <MockCard className="max-w-[360px]">
      <MockLabel>{t.migrationOffer.mock.currentSubscription}</MockLabel>
      <div className="mt-2.5 flex items-center gap-3 rounded-lg border border-white/10 bg-white/2 p-3">
        <span className="flex h-11 w-9 shrink-0 items-end justify-center rounded-md border border-white/20 pb-1.5 text-[11px] font-semibold leading-4 text-white/60">
          PDF
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span>invoice.pdf</span>
          <span className="text-white/50">{u.meta}</span>
        </div>
        <div className="relative flex h-6 min-w-[96px] justify-end">
          <motion.span
            className="absolute right-0"
            initial={false}
            animate={{ opacity: active ? 0 : 1 }}
            transition={active ? { delay: 1.4, duration: 0.25, ease: 'easeOut' } : { duration: 0 }}
          >
            <MockPill size="md">{u.attached}</MockPill>
          </motion.span>
          <motion.span
            className="absolute right-0"
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={active ? { delay: 1.6, duration: 0.3, ease: 'easeOut' } : { duration: 0 }}
          >
            <MockPill size="md" tone="accent">
              <Icon name="check" className="size-3" />
              {u.reviewed}
            </MockPill>
          </motion.span>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Skeleton tone="faint" className="w-[78%]" />
        <Skeleton tone="faint" className="w-[52%]" />
      </div>
    </MockCard>
  )
}

export function InvoicePane() {
  const m = useT().migrationOffer.mock
  return (
    <MockCard className="max-w-[340px]">
      <VaultProHeader />
      <MockLabel className="mt-3.5">{m.firstInvoice}</MockLabel>
      <div className="mt-2 flex flex-col gap-1.5">
        <MockRow label={m.annualPlan} value={<Skeleton className="w-16" />} />
        <MockRow
          highlighted
          label={m.monthsDeducted}
          value={
            <span className="flex items-center gap-1.5 text-accent-soft">
              {'−'}
              <Skeleton tone="accent" className="w-9" />
            </span>
          }
        />
        <MockDivider className="my-1" />
        <div className="flex items-center justify-between gap-3 px-2.5 pb-0.5 pt-1">
          <span className="font-medium">{m.totalDue}</span>
          <Skeleton tone="strong" className="w-11" />
        </div>
      </div>
    </MockCard>
  )
}

const IMPORT_GRID = 'grid grid-cols-[minmax(0,0.85fr)_14px_minmax(0,1.15fr)_16px] items-center gap-x-2'
export function ImportPane() {
  const im = useT().migrationOffer.steps.visuals.import
  return (
    <MockCard className="max-w-[440px] lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <IconDisc>
            <Icon name="upload" className="size-4 text-white/60" />
          </IconDisc>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-5">{im.title}</span>
            <span className="text-white/50">transactions.csv</span>
          </div>
        </div>
        <MockPill>CSV</MockPill>
      </div>
      <MockDivider className="mb-3.5 mt-4" />
      <div className={`mb-2 ${IMPORT_GRID}`}>
        <MockLabel>{im.columnInFile}</MockLabel>
        <span />
        <MockLabel>{im.fieldInVault}</MockLabel>
        <span />
      </div>
      <div className="flex flex-col gap-2">
        {im.rows.map(([from, to], i) => (
          <div key={i} className={IMPORT_GRID}>
            <span className="truncate rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-white/80">{from}</span>
            <Icon name="arrow-right" className="size-3.5 text-white/40" />
            <span className="flex min-w-0 items-center justify-between gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5">
              <span className="truncate">{to}</span>
              <Icon name="chevron-down-small" className="size-3 text-white/50" />
            </span>
            <Icon name="check" className="size-4 text-white/60" />
          </div>
        ))}
      </div>
      <MockDivider className="mb-3.5 mt-4" />
      <div className="flex items-center justify-between gap-3">
        <span className="text-white/60">{im.matched}</span>
        <span className="flex h-7 items-center rounded-full bg-white px-3.5 font-medium text-primary-black">{im.action}</span>
      </div>
    </MockCard>
  )
}

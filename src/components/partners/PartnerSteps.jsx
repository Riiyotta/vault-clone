import Icon from '../Icon.jsx'
import VisualSteps from '../shared/VisualSteps.jsx'
import { IconDisc, MockCard, MockDivider, MockLabel, MockPill } from '../migration/Mock.jsx'
import { InviteCard, ListItem } from './PartnerMock.jsx'
import { BecomePartnerButton } from './PartnerPopup.jsx'
import { useT } from '../../i18n/index.jsx'

// §B.8 "How to become a partner": shared VisualSteps (loops 4 steps / 5s) with the partner mock panes.

function ApplicationPane({ a }) {
  const fields = [
    [a.company, 'Ledgerline'],
    [a.clients, a.clientsValue],
    [a.role, a.roleValue],
  ]
  return (
    <MockCard className="max-w-[360px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium leading-5">{a.title}</span>
        <MockPill size="md" tone="accent">
          {a.ready}
        </MockPill>
      </div>
      <div className="mt-3.5 flex flex-col gap-3">
        {fields.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1.5">
            <span className="text-white/50">{label}</span>
            <span className="rounded-lg border border-white/10 px-3 py-2">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex justify-end">
        <span className="flex h-7 items-center rounded-full bg-white px-3.5 font-medium leading-4 text-primary-black">
          {a.send}
        </span>
      </div>
    </MockCard>
  )
}

function IntroCallPane({ c, m }) {
  return (
    <MockCard className="max-w-[360px]">
      <div className="flex items-center gap-2.5">
        <IconDisc>
          <Icon name="partners/calendar" className="size-4 text-white/60" />
        </IconDisc>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-5">{c.title}</span>
          <span className="text-white/50">{c.videoCall}</span>
        </div>
      </div>
      <MockDivider className="my-3.5" />
      <div className="flex flex-col gap-1">
        <ListItem className="px-0" avatar="LE" title="Ledgerline" subtitle={m.partner} />
        <ListItem
          className="px-0"
          avatar={<Icon name="partners/vault-mark" className="h-3.5 w-4 text-white" />}
          title={c.partnerTeam}
          subtitle="Vault"
        />
      </div>
    </MockCard>
  )
}

function ReferralsPane({ r, m }) {
  const rows = [
    ['NS', 'Northwind Studio'],
    ['HD', 'Harbor Dental'],
    ['AL', 'Alder Logistics'],
  ]
  return (
    <MockCard padding="p-2" className="max-w-[360px]">
      <MockLabel className="px-2 pb-1.5 pt-2">{r.title}</MockLabel>
      {rows.map(([avatar, title]) => (
        <ListItem
          key={avatar}
          avatar={avatar}
          title={title}
          subtitle={m.paysForVault}
          trailing={<MockPill>{r.scheduled}</MockPill>}
        />
      ))}
    </MockCard>
  )
}

export default function PartnerSteps() {
  const p = useT().partners
  const v = p.steps.visuals
  const panes = () => [
    <ApplicationPane key="application" a={v.application} />,
    <IntroCallPane key="intro" c={v.introCall} m={p.mock} />,
    <div key="invite" className="w-full max-w-[360px]">
      <InviteCard m={p.mock} />
    </div>,
    <ReferralsPane key="referrals" r={v.referrals} m={p.mock} />,
  ]
  return (
    <VisualSteps
      heading={p.steps.heading}
      steps={p.steps.items}
      panes={panes}
      expandAllWhenReduced
      cta={<BecomePartnerButton>{p.steps.cta}</BecomePartnerButton>}
    />
  )
}

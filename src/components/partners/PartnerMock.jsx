import { motion } from 'framer-motion'
import Icon from '../Icon.jsx'
import { IconDisc, MockCard, MockDivider } from '../migration/Mock.jsx'

// Partner-page mock primitives (CLONE_SPEC_partners_ua_legal.md §B.3, §B.8). MockCard / MockDivider / MockLabel /
// MockPill / IconDisc are the shared ones from migration/Mock.jsx (pricing/migration spec §0.10).

export const INVITE_URL = 'app.usevault.ai/?ref=K7M2QX9D'

const PILL = 'col-start-1 row-start-1 inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-medium leading-4'

/**
 * "Your invite link" card. `copied`: also render the "Copied" pill stacked in the same grid cell (hero only);
 * copyVariants / copiedVariants are the hero's Framer variants for the swap.
 */
export function InviteCard({ m, copied = false, copyVariants, copiedVariants }) {
  return (
    <MockCard>
      <div className="flex items-center gap-2.5">
        <IconDisc>
          <Icon name="partners/link" className="size-4 text-white/60" />
        </IconDisc>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium leading-5">{m.inviteLink}</span>
          <span className="text-white/50">{m.tracked}</span>
        </div>
      </div>
      <MockDivider className="my-3.5" />
      <div className="flex items-center gap-2 rounded-lg border border-white/10 py-1.5 pl-2.5 pr-1.5">
        {/* The URL grows (measured 222 / 252px wide on the original), pushing the pill cell to the right edge. */}
        <span className="min-w-0 flex-1 truncate text-white/80">{INVITE_URL}</span>
        <div className="grid shrink-0 justify-items-end">
          <motion.span variants={copyVariants} className={`${PILL} bg-white text-primary-black`}>
            {m.copy}
          </motion.span>
          {copied && (
            <motion.span variants={copiedVariants} className={`${PILL} bg-white/10 text-white`}>
              {m.copied}
            </motion.span>
          )}
        </div>
      </div>
    </MockCard>
  )
}

export function Avatar({ children }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white/8 text-xs font-semibold text-white">
      {children}
    </span>
  )
}

/** Workspace / referral list row: avatar, title + subtitle, optional trailing node. */
export function ListItem({ avatar, title, subtitle, trailing, highlighted = false, className = 'px-2' }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border py-1.5 ${
        highlighted ? 'border-accent/35 bg-accent/10' : 'border-transparent'
      } ${className}`}
    >
      <Avatar>{avatar}</Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-white">{title}</span>
        <span className="truncate text-white/50">{subtitle}</span>
      </div>
      {trailing}
    </div>
  )
}

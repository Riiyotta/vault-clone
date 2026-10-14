// Mock UI primitives for the migration-offer visuals (CLONE_SPEC_pricing_migration.md §0.10).
import Icon from '../Icon.jsx'
import { useT } from '../../i18n/index.jsx'

export function MockCard({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-surface p-4 text-xs leading-[18px] text-white ${className}`}
    >
      {children}
    </Tag>
  )
}

export function MockDivider({ className = '' }) {
  return <div className={`h-px bg-white/5 ${className}`} />
}

export function MockLabel({ className = '', children }) {
  return (
    <p className={`text-[11px] font-medium uppercase leading-4 tracking-[0.05em] text-white/40 lang-uk:text-[12px] ${className}`}>
      {children}
    </p>
  )
}

const PILL_SIZE = {
  sm: 'h-5 px-2 text-[11px] leading-4',
  md: 'h-6 px-2.5 text-xs leading-4',
  lg: 'h-[26px] px-3 text-xs leading-4',
}
const PILL_TONE = {
  neutral: 'bg-white/8 text-white/80',
  accent: 'border border-accent/50 bg-accent/20 text-white',
  surface: 'border border-accent/50 bg-surface text-white',
}

export function MockPill({ size = 'sm', tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ${PILL_SIZE[size]} ${PILL_TONE[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function MockRow({ label, value, highlighted = false, className = '' }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-2.5 py-2 ${
        highlighted ? 'border-accent/35 bg-accent/10' : 'border-transparent text-white/80'
      } ${className}`}
    >
      <span>{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  )
}

export function IconDisc({ size = 'md', children }) {
  return size === 'md' ? (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10">{children}</span>
  ) : (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/8">{children}</span>
  )
}

const SKELETON_TONE = { muted: 'bg-white/20', strong: 'bg-white/40', accent: 'bg-accent/60', faint: 'bg-white/8' }
export function Skeleton({ tone = 'muted', className = '', style }) {
  return <span className={`block h-2 rounded ${SKELETON_TONE[tone]} ${className}`} style={style} />
}

/** Vault mark (fill currentColor). */
export function VaultMark({ className = 'h-3.5 w-4 text-white' }) {
  return <Icon name="vault-mark" className={className} />
}

/** "Vault Pro" + "Annual" pill header, shared by the hero invoice card and step 3. */
export function VaultProHeader() {
  const m = useT().migrationOffer.mock
  return (
    <div className="flex items-center gap-2">
      <VaultMark />
      <span className="text-sm font-medium leading-5">{m.vaultPro}</span>
      <MockPill className="ml-auto">{m.annual}</MockPill>
    </div>
  )
}

// DotGridPanel background (§0.10) = the home feature-visual dot grid.
export const DOT_GRID_PANEL = 'bg-feature-visual bg-dots-8 md:bg-dots-12'

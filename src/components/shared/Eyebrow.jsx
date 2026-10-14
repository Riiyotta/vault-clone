// Eyebrow pill (CLONE_SPEC_pricing_migration.md §0.6). Same visual as the home hero pill.
export default function Eyebrow({ children, icon = false }) {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-full bg-white/8 px-2 py-1 shadow-pill">
      {icon && <img src="/assets/svg/zap-icon.svg" alt="" aria-hidden="true" width={14} height={14} className="size-3.5" />}
      <span className="text-[11px] font-medium uppercase leading-4 tracking-[0.05em] text-white lang-uk:text-[12px]">{children}</span>
    </div>
  )
}

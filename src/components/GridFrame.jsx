// Global grid frame decoration (CLONE_SPEC §0.2).

export function CrossMarker({ className = '' }) {
  return (
    <img
      src="/assets/svg/cross-plus-marker.svg"
      alt=""
      aria-hidden="true"
      width={12}
      height={12}
      className={`relative z-[100] size-3 ${className}`}
    />
  )
}

/** Content column (`max-w-[1440px] px-6 md:px-10 lg:px-14`) with the 1.5px side hairlines. */
export function Frame({ as: Tag = 'div', id, className = '', frameClassName = '', border = 'border-x-[1.5px]', children }) {
  return (
    <div className="flex w-full justify-center">
      <Tag id={id} className={`w-full max-w-[1440px] px-6 md:px-10 lg:px-14 ${className}`}>
        <div className={`${border} border-white/5 ${frameClassName}`}>{children}</div>
      </Tag>
    </div>
  )
}

/**
 * Full-bleed 1px row between sections (spec §0.2).
 * - full: `bg-white/5` full bleed at every width (the rows after the nav and after the hero).
 * - default ("between-crosses-until-lg"): full bleed on lg+, below lg a ::before inset to the frame.
 * - crosses: two cross markers on the frame corners.
 */
export function Separator({ crosses = false, full = false }) {
  const pad = crosses ? 'px-[18px] md:px-[34px] lg:px-[50px]' : ''
  const inset = full
    ? ''
    : `before:absolute before:top-1/2 before:h-px before:-translate-y-1/2 before:bg-white/5 before:content-[''] lg:before:hidden ${
        crosses ? 'before:inset-x-[18px] md:before:inset-x-[34px]' : 'before:inset-x-6 md:before:inset-x-10 lg:before:inset-x-0'
      }`
  return (
    <div aria-hidden="true" className={`relative flex h-px w-full justify-center ${full ? 'bg-white/5' : 'lg:bg-white/5'}`}>
      <div className={`relative flex w-full max-w-[1440px] items-center justify-between ${pad} ${inset}`}>
        {crosses && (
          <>
            <CrossMarker />
            <CrossMarker />
          </>
        )}
      </div>
    </div>
  )
}

/** Empty spacer frame with side borders (`h-24 lg:h-50` by default). */
export function Spacer({ className = 'h-24 lg:h-[200px]' }) {
  return <Frame frameClassName={className} />
}

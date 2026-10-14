// Primary white CTA (spec §2 large, §5–7 small). No hover state (spec §11).
const LOGIN = 'https://app.usevault.ai/login'

/**
 * `as="button"` renders a <button type="button"> (pricing/migration ContactButton, §0.8);
 * `fullWidth` stretches it and centers the content (pricing Pro card CTA).
 */
export function PrimaryCta({ children, size = 'large', href = LOGIN, className = '', as = 'a', fullWidth = false, ...props }) {
  const large = size === 'large'
  const Tag = as
  const tagProps = as === 'a' ? { href } : { type: 'button' }
  return (
    <Tag
      {...tagProps}
      {...props}
      className={`flex items-center rounded-full border-4 border-white/20 bg-white bg-clip-padding font-medium text-cta-text ${
        fullWidth ? 'w-full justify-center' : 'w-fit'
      } ${
        large ? 'gap-4 py-3 pl-6 pr-4 text-lg leading-[22px]' : 'gap-3.5 py-2.5 pl-5 pr-3.5 text-base leading-6'
      } ${as === 'button' ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
      <span className={`flex items-center justify-center rounded-full bg-cta-chip ${large ? 'size-8' : 'size-7'}`}>
        <img
          src="/assets/svg/arrow-right.svg"
          alt=""
          aria-hidden="true"
          className={large ? 'size-4' : 'size-3.5'}
        />
      </span>
    </Tag>
  )
}

export { LOGIN }

// Renders a local /assets/svg icon as a CSS mask so it takes `currentColor`
// (needed for the icons whose SVG uses fill/stroke="currentColor").
export default function Icon({ name, className = '', style }) {
  const url = `url(/assets/svg/${name}.svg)`
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        ...style,
      }}
    />
  )
}

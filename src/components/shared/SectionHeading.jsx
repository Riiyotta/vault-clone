import { Frame, Separator } from '../GridFrame.jsx'

// Section heading block (§0.5) followed by its separator (§0.4).
export default function SectionHeading({ id, children }) {
  return (
    <>
      <Frame frameClassName="flex justify-center px-4 pt-24 pb-10 md:pb-12 lg:pt-[120px] lg:pb-16">
        <h2
          id={id}
          className="text-balance text-center font-display text-3xl font-semibold uppercase text-white word-spacing-4 lg:text-5xl lg:leading-[64px] lg:word-spacing-7"
        >
          {children}
        </h2>
      </Frame>
      <Separator crosses />
    </>
  )
}

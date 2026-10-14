import { useEffect, useRef, useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

/**
 * DotLottie canvas wrapper. A ResizeObserver calls `.resize()` (spec §4).
 * `onInstance` receives the DotLottie instance (or null on unmount).
 */
export default function LottieCanvas({ src, className = 'size-full', onInstance, ...props }) {
  const wrapRef = useRef(null)
  const [instance, setInstance] = useState(null)

  useEffect(() => {
    onInstance?.(instance)
  }, [instance, onInstance])

  useEffect(() => {
    if (!instance || !wrapRef.current) return
    const ro = new ResizeObserver(() => instance.resize())
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [instance])

  return (
    <div ref={wrapRef} className={className}>
      <DotLottieReact
        src={src}
        className="size-full leading-[0]"
        dotLottieRefCallback={setInstance}
        {...props}
      />
    </div>
  )
}

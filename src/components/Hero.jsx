import { PrimaryCta } from './Cta.jsx'
import { useT } from '../i18n/index.jsx'

// Spec §2. Static: no entrance animation on the original.
// UA (partners/UA spec §C.3–C.5): pill 12px, text block max-width 880px at all widths, hero-uk image.
export default function Hero() {
  const t = useT()
  return (
    <section className="hero-section relative flex w-screen max-w-full flex-col items-center overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[400px] bg-hero-fade" />

      <div className="relative z-10 w-full max-w-[1440px] px-6 md:px-10 lg:px-14">
        <div className="flex flex-col items-center border-x-[1.5px] border-white/5">
          <div className="relative z-10 mx-auto flex max-w-[400px] flex-col items-center gap-4 pt-[136px] md:max-w-[560px] md:gap-6 lg:max-w-[750px] lg:pt-[146px] lang-uk:max-w-[880px]">
            <div className="flex items-center gap-1.5 rounded-full bg-white/8 px-2 py-1 shadow-pill">
              <img src="/assets/svg/zap-icon.svg" alt="" aria-hidden="true" width={14} height={14} className="size-3.5" />
              <span className="text-[11px] font-medium uppercase leading-4 tracking-[0.05em] text-white lang-uk:text-[12px]">
                {t.hero.badge}
              </span>
            </div>

            <h1 className="inline-flex whitespace-pre-line text-center font-display text-[32px] font-semibold leading-[38.4px] tracking-[0.02em] text-white word-spacing-4 md:text-[48px] md:leading-[52.8px] md:word-spacing-6 lg:text-[64px] lg:leading-[72px] lg:word-spacing-8">
              {t.hero.headline}
            </h1>

            <p className="px-4 text-center text-sm font-light leading-5 text-white md:max-w-[500px] md:text-base md:leading-[26px]">
              {t.hero.subheadline}
            </p>
          </div>

          <div className="hero-img-outer relative flex h-full w-full justify-center px-2 pt-[76px] md:px-8 md:pt-14 lg:px-28 lg:pt-[90px]">
            <div className="hero-img-wrap relative z-[5] w-full max-w-[1104px]">
              <img
                src={t.hero.image}
                width={3312}
                height={2004}
                alt={t.hero.imageAlt}
                className="relative z-10 h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="flex justify-center py-10 md:pb-[70px] md:pt-12 lg:py-16">
            <PrimaryCta size="large">{t.hero.cta}</PrimaryCta>
          </div>
        </div>
      </div>
    </section>
  )
}

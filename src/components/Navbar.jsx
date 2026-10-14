import { useLayoutEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { LOGIN } from './Cta.jsx'
import { localeFromPath, localizePath, stripLocale, useT } from '../i18n/index.jsx'

// Spec §1. `key` = nav.items.* message key; hrefs are EN paths, localized by useSiteNav().resolve.
export const NAV_LINKS = [
  { key: 'product', href: '#product' },
  { key: 'automation', href: '#automation' },
  { key: 'reports', href: '#reports' },
  { key: 'security', href: '#security' },
  { key: 'pricing', href: '/pricing' },
]

/**
 * Internal links use react-router <Link>; in-page hashes ("#product") and external URLs stay plain <a>
 * (home's useAnchorScroll intercepts the hash clicks).
 */
export function SiteLink({ href, children, ...props }) {
  if (href.startsWith('#') || /^(https?:|mailto:)/.test(href)) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} {...props}>
      {children}
    </Link>
  )
}

/**
 * Route- and locale-aware link targets (pricing/migration spec §0.2, §0.3; partners/UA spec §A, §C.6): on home
 * (`/` or `/ua`) the section links are "#product" and the logo "#top"; on every other route they become
 * "/#product" and "/" (UA: "/ua#product" and "/ua"). Internal paths get the /ua prefix on UA routes.
 * `isActive` compares against the current route without its locale prefix (only "Pricing" can match).
 */
export function useSiteNav() {
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)
  const basePath = stripLocale(pathname)
  const isHome = basePath === '/'
  const home = localizePath('/', locale)
  return {
    pathname,
    basePath,
    locale,
    isHome,
    logoHref: isHome ? '#top' : home,
    resolve: (href) => {
      if (href.startsWith('#')) return isHome ? href : `${home}${href}`
      return localizePath(href, locale)
    },
    isActive: (href) => href === basePath,
  }
}

const LANG_LINK = 'px-1 py-1 text-sm leading-5 transition-colors duration-[400ms]'

function LangSwitch({ className = '' }) {
  // §C.6: EN href = current path without /ua, UA href = /ua + EN path. The current locale is white with
  // aria-current="true"; the other is white/50 → white on hover (400ms).
  const { basePath, locale } = useSiteNav()
  const t = useT()
  const state = (active) => (active ? 'text-white' : 'text-white/50 hover:text-white')
  return (
    <div role="group" aria-label={t.languageSwitcher.ariaLabel} className={`flex shrink-0 items-center gap-1 ${className}`}>
      <span className="flex items-center gap-1">
        <Link
          lang="en"
          hrefLang="en"
          aria-current={locale === 'en' ? 'true' : undefined}
          to={basePath}
          className={`${LANG_LINK} ${state(locale === 'en')}`}
        >
          EN<span className="sr-only"> English</span>
        </Link>
      </span>
      <span className="flex items-center gap-1">
        <span aria-hidden="true" className="text-sm text-white/20">/</span>
        <Link
          lang="uk"
          hrefLang="uk"
          aria-current={locale === 'uk' ? 'true' : undefined}
          to={localizePath(basePath, 'uk')}
          className={`${LANG_LINK} ${state(locale === 'uk')}`}
        >
          UA<span className="sr-only"> Українська</span>
        </Link>
      </span>
    </div>
  )
}

function DesktopNav() {
  const nav = useSiteNav()
  const t = useT()
  return (
    <div className="hidden w-full justify-center lg:flex">
      <nav className="w-full max-w-[1440px] lg:px-14">
        <div className="flex items-center justify-between border-x-[1.5px] border-white/5 py-8 lg:px-6 xl:px-14">
          <SiteLink href={nav.logoHref} aria-label={t.nav.homeAriaLabel}>
            <img src="/assets/svg/vault-logo.svg" alt="Vault AI" width={188} height={26} className="h-[26px] w-[188px]" />
          </SiteLink>
          <ul className="flex items-center justify-center gap-5 whitespace-nowrap xl:gap-[37px]">
            {NAV_LINKS.map((l) => {
              const active = nav.isActive(l.href)
              return (
                <li
                  key={l.href}
                  className={`leading-[26px] transition-colors duration-[400ms] hover:text-white ${
                    active ? 'text-white' : 'text-white/80'
                  }`}
                >
                  <SiteLink href={nav.resolve(l.href)} aria-current={active ? 'page' : undefined}>
                    {t.nav.items[l.key]}
                  </SiteLink>
                </li>
              )
            })}
          </ul>
          <div className="flex items-center gap-4 xl:gap-8">
            <LangSwitch />
            <a
              href={LOGIN}
              className="flex w-fit items-center justify-center rounded-full border border-white/20 px-6 py-4 text-lg font-medium leading-[22px] text-white"
            >
              {t.nav.cta}
            </a>
          </div>
        </div>
      </nav>
    </div>
  )
}

const panelVariants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.3, ease: 'linear' }, opacity: { duration: 0.16, ease: 'easeOut' } },
  },
  open: {
    height: 'auto',
    opacity: 1,
    transition: { height: { duration: 0.5, ease: 'linear' }, opacity: { duration: 0.22, ease: 'easeOut' } },
  },
}

function MobileNav() {
  const [open, setOpen] = useState(false)
  const nav = useSiteNav()
  const t = useT()

  // Body scroll lock while open (spec §1).
  useLayoutEffect(() => {
    if (!open) return
    const y = window.scrollY
    const s = document.body.style
    Object.assign(s, { position: 'fixed', top: `-${y}px`, left: '0', right: '0', width: '100%' })
    return () => {
      Object.assign(s, { position: '', top: '', left: '', right: '', width: '' })
      window.scrollTo(0, y)
    }
  }, [open])

  const toggle = () => setOpen((o) => !o)

  return (
    <div className="relative z-50 flex w-full justify-center lg:hidden">
      <nav className="w-full max-w-[1440px] px-6 md:px-10">
        <div className="flex items-center justify-between border-x-[1.5px] border-white/5 px-3 py-4 md:px-8 md:py-6">
          <SiteLink href={nav.logoHref} aria-label="Vault AI" onClick={() => setOpen(false)}>
            <img
              src="/assets/svg/vault-logo.svg"
              alt="Vault AI"
              width={116}
              height={16}
              className="h-4 w-[116px] md:h-7 md:w-[200px]"
            />
          </SiteLink>
          <button
            type="button"
            aria-label={open ? t.mobileNav.closeMenu : t.mobileNav.openMenu}
            aria-expanded={open}
            onClick={toggle}
            className="flex cursor-pointer items-center justify-center text-white"
          >
            {/* Measured on the original: inline SVGs swapped by a plain conditional render (no transition). */}
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 21" className="size-6 md:size-7">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.667"
                  d="m15.24 5.117-10 10m0-10 10 10"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 28 28" className="size-6 md:size-7">
                <path
                  fill="#fff"
                  d="M26.833 15.143H1.167a1.167 1.167 0 0 1 0-2.333h25.666a1.167 1.167 0 0 1 0 2.333M26.833 6.198H1.167a1.167 1.167 0 0 1 0-2.334h25.666a1.167 1.167 0 0 1 0 2.334M26.833 24.086H1.167a1.167 1.167 0 0 1 0-2.333h25.666a1.167 1.167 0 0 1 0 2.333"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Original: outer wrapper has initial={false} — no fade-in on open (opacity stays 1);
          only the exit fades it out over 0.28s easeOut. The inner panel animates height/opacity via variants. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="menu"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute inset-x-0 top-[calc(100%+1px)] z-40 overflow-hidden px-6 md:px-10"
          >
            <motion.div
              variants={panelVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="mx-auto w-full max-w-[1440px] overflow-hidden border-x-[1.5px] border-white/5 bg-menu-panel shadow-2xl shadow-black/20 backdrop-blur-lg"
            >
              <div className="scrollbar-hide flex min-h-[360px] w-full flex-col gap-6 border-b-white/5 pb-5 md:gap-8 md:border-b-[1.5px] md:pb-8">
                <ul className="flex flex-col divide-y divide-white/5 border-b border-b-white/5">
                  {/* The original passes no activeId on home or /migration-offer; on /pricing item 05 is white. */}
                  {NAV_LINKS.map((l, i) => {
                    const active = nav.isActive(l.href)
                    return (
                      <li key={l.href}>
                        <SiteLink
                          href={nav.resolve(l.href)}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setOpen(false)}
                          className="group flex w-full items-center gap-8 px-4 py-[15px] transition-colors duration-300 md:px-[34px] md:py-4"
                        >
                          <span
                            className={`transition-colors duration-300 group-hover:text-white ${
                              active ? 'text-white' : 'text-white/40'
                            }`}
                          >
                            {String(i + 1).padStart(2, '0')}.
                          </span>
                          <span
                            className={`leading-[26px] transition-colors duration-300 group-hover:text-white ${
                              active ? 'text-white' : 'text-white/80'
                            }`}
                          >
                            {t.nav.items[l.key]}
                          </span>
                        </SiteLink>
                      </li>
                    )
                  })}
                </ul>
                <LangSwitch className="px-3 md:px-[30px]" />
                <div className="px-4 md:px-8">
                  <a
                    href={LOGIN}
                    className="flex w-full items-center justify-center rounded-[36px] border border-white/20 py-4 text-lg font-medium leading-7 text-white"
                  >
                    {t.nav.cta}
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  return (
    <header className="flex w-full flex-col items-center">
      <DesktopNav />
      <MobileNav />
    </header>
  )
}

import { Frame, Separator, Spacer } from './GridFrame.jsx'
import Icon from './Icon.jsx'
import { SiteLink, useSiteNav } from './Navbar.jsx'
import { fmt, useT } from '../i18n/index.jsx'

// Spec §9 (labels from src/i18n; UA Help Center → help.usevault.ai/uk/, partners/UA spec §C.6)
const groups = (t) => [
  {
    label: t.footer.groups.platform,
    links: [
      { label: t.nav.items.product, href: '#product' },
      { label: t.nav.items.automation, href: '#automation' },
      { label: t.nav.items.reports, href: '#reports' },
      { label: t.nav.items.security, href: '#security' },
      { label: t.nav.items.pricing, href: '/pricing', highlightActive: true },
    ],
  },
  {
    label: t.footer.groups.resources,
    links: [
      { label: t.footer.helpCenter, href: t.footer.helpCenterUrl, external: true },
      { label: t.footer.status, href: 'https://status.usevault.ai/', external: true },
      { label: t.footer.migrationOffer, href: '/migration-offer' },
      { label: t.footer.partnerProgram, href: '/partners' },
    ],
  },
  {
    label: t.footer.groups.legal,
    className: 'max-md:col-span-2',
    links: [
      { label: t.footer.legal.terms, href: '/terms' },
      { label: t.footer.legal.privacy, href: '/privacy' },
      { label: t.footer.legal.dpa, href: '/dpa' },
    ],
  },
]

const SOCIAL_BASE = 'relative flex h-4 items-center text-gray transition-colors duration-[400ms] hover:text-white'
const SOCIAL_LINK =
  "relative flex h-4 items-center text-gray transition-colors duration-[400ms] hover:text-white before:absolute before:left-1/2 before:top-1/2 before:size-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"

const ext = { target: '_blank', rel: 'noopener noreferrer' }
// §C.3: on uk the social / mail icons sit 0.45px lower (`position: relative; top: .45px`).
const UA_ICON_NUDGE = 'lang-uk:relative lang-uk:top-[0.45px]'

export default function Footer() {
  const nav = useSiteNav()
  const t = useT()
  const year = new Date().getFullYear()
  return (
    <footer>
      <Frame>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b-[1.5px] border-white/5 px-4 pb-8 pt-10 md:grid-cols-[repeat(3,max-content)] md:justify-between md:px-6 md:pb-10 md:pt-12 lg:grid-cols-[minmax(0,1fr)_repeat(3,max-content)] lg:gap-x-12 lg:py-14 xl:gap-x-20 xl:px-14">
          <div className="col-span-2 flex flex-col items-start gap-6 md:col-span-3 lg:col-span-1">
            <SiteLink href={nav.logoHref} aria-label={t.nav.homeAriaLabel}>
              <img
                src="/assets/svg/vault-logo.svg"
                alt=""
                width={188}
                height={26}
                className="h-4 w-[116px] md:h-[26px] md:w-[188px]"
              />
            </SiteLink>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/company/usevault-ai/" {...ext} aria-label={t.footer.linkedinAriaLabel} className={SOCIAL_LINK}>
                {/* viewBox 18.011×25.16 → 11.45×16 at h 16 */}
                <Icon name="linkedin" className={`block h-4 w-[11.45px] ${UA_ICON_NUDGE}`} />
              </a>
              <a href="https://t.me/usevault_ai" {...ext} aria-label={t.footer.telegramAriaLabel} className={SOCIAL_LINK}>
                {/* viewBox 13.024×16.029 → 13×16 at h 16 */}
                <Icon name="telegram" className={`block h-4 w-[13px] ${UA_ICON_NUDGE}`} />
              </a>
              <a
                href="mailto:hello@usevault.ai"
                className={`${SOCIAL_BASE} gap-1.5 before:absolute before:-inset-y-1 before:inset-x-0 before:content-['']`}
              >
                {/* viewBox 15.547×16 → 15.55×16 at h 16 */}
                <Icon name="mail" className={`block h-4 w-[15.55px] ${UA_ICON_NUDGE}`} />
                <span className="text-sm md:text-base">{t.footer.email}</span>
              </a>
            </div>
          </div>

          {groups(t).map((g) => (
            <div key={g.label} className={`flex flex-col gap-4 ${g.className ?? ''}`}>
              <p className="text-[11px] font-medium uppercase leading-4 tracking-[0.05em] text-white/40 lang-uk:text-[12px]">
                {g.label}
              </p>
              <ul className="flex flex-col gap-3">
                {g.links.map((l) => {
                  // §0.3: only "Pricing" is highlighted on its own route ("Migration offer" is not).
                  const active = l.highlightActive && nav.isActive(l.href)
                  return (
                    <li
                      key={l.label}
                      className={`whitespace-nowrap leading-[26px] transition-colors duration-[400ms] hover:text-white ${
                        active ? 'text-white' : 'text-white/60'
                      }`}
                    >
                      <SiteLink
                        href={nav.resolve(l.href)}
                        aria-current={active ? 'page' : undefined}
                        {...(l.external ? ext : {})}
                      >
                        {l.label}
                      </SiteLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-gray md:p-6 lg:py-8 xl:px-14">
          <span className="inline-flex">{fmt(t.footer.copyright, { year })}</span>
          <div className="flex items-center gap-2">
            <span className="text-gray">{t.footer.builtBy}</span>
            <a
              href="https://www.overcode.tech/"
              target="_blank"
              rel="noopener"
              aria-label={t.footer.overcodeAriaLabel}
              className="group flex items-center"
            >
              <span className="flex rounded-full bg-badge px-3 pb-[7px] pt-[5px] group-hover:bg-primary">
                <img src="/assets/svg/overcode-wordmark.svg" alt="" aria-hidden="true" className="h-[10px] w-[60px]" />
              </span>
              <span className="-ml-1 flex rounded-full bg-badge py-1.5 pl-[11px] pr-2.5 text-white group-hover:bg-primary">
                <Icon name="overcode-icon" className="block size-[11px]" />
              </span>
            </a>
          </div>
        </div>
      </Frame>
      <Separator crosses />
      <Spacer className="h-12 md:h-[50px] lg:h-16" />
    </footer>
  )
}

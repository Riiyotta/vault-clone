import { Fragment, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import en from './en.js'
import uk from './uk.js'

// Minimal i18n layer (CLONE_SPEC_partners_ua_legal.md §C). The locale is derived from the URL: `/ua` and `/ua/*`
// are Ukrainian, everything else English. (`/ru` exists on the original but is out of scope.)
const MESSAGES = { en, uk }
export const UA_PREFIX = '/ua'

export function localeFromPath(pathname) {
  return pathname === UA_PREFIX || pathname.startsWith(`${UA_PREFIX}/`) ? 'uk' : 'en'
}

/** '/ua/pricing' → '/pricing', '/ua' → '/', EN paths unchanged. */
export function stripLocale(pathname) {
  if (localeFromPath(pathname) === 'en') return pathname
  return pathname.slice(UA_PREFIX.length) || '/'
}

/** Locale-prefixed internal path: ('/pricing','uk') → '/ua/pricing', ('/','uk') → '/ua', ('/#product','uk') → '/ua#product'. */
export function localizePath(path, locale) {
  if (locale !== 'uk' || !path.startsWith('/')) return path
  return path === '/' || path.startsWith('/#') ? `${UA_PREFIX}${path.slice(1)}` : `${UA_PREFIX}${path}`
}

export function useLocale() {
  return localeFromPath(useLocation().pathname)
}

/** Message tree for the current route's locale. */
export function useT() {
  return MESSAGES[useLocale()]
}

export function getMessages(locale) {
  return MESSAGES[locale]
}

/** `{name}` interpolation. */
export function fmt(str, vars) {
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

/**
 * Rich-text messages: `<br></br>` → <br/>, `<tag>chunk</tag>` → tags[tag](chunk). Returns an array of nodes, so
 * "See the <link>migration offer</link>." renders the same DOM as the hand-written JSX it replaced.
 */
export function rich(str, tags = {}) {
  const out = []
  const re = /<(\w+)>(.*?)<\/\1>/g
  let last = 0
  let m
  while ((m = re.exec(str))) {
    if (m.index > last) out.push(str.slice(last, m.index))
    const [, tag, chunk] = m
    const node = tag === 'br' && !tags.br ? <br /> : tags[tag] ? tags[tag](chunk) : chunk
    out.push(<Fragment key={out.length}>{node}</Fragment>)
    last = re.lastIndex
  }
  if (last < str.length) out.push(str.slice(last))
  return out
}

/**
 * <html> side effects per locale (§C.1, §C.2): `lang`, and on UA the inline style the original sets on <html>
 * (`--font-body: var(--font-manrope); --font-display: var(--font-unbounded)`). EN removes it again, so the
 * :root defaults (Outfit / clashDisplay, src/index.css) apply.
 */
export function LocaleDocument() {
  const locale = useLocale()
  useLayoutEffect(() => {
    const html = document.documentElement
    html.lang = locale
    if (locale === 'uk') {
      html.style.setProperty('--font-body', 'var(--font-manrope)')
      html.style.setProperty('--font-display', 'var(--font-unbounded)')
    } else {
      html.style.removeProperty('--font-body')
      html.style.removeProperty('--font-display')
      if (!html.getAttribute('style')) html.removeAttribute('style')
    }
  }, [locale])
  return null
}

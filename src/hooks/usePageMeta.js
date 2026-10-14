import { useEffect } from 'react'
import { getMessages, localizePath, useLocale } from '../i18n/index.jsx'

// Per-route <title> and meta tags.
// EN: CLONE_SPEC_pricing_migration.md §1 / §2 heads, home values from index.html, partners §B.0, legal §D.5.
// UA: CLONE_SPEC_partners_ua_legal.md §C.1 (home), §E.2/§E.3 (partners, legal), pricing/migration from the
// fetched /ua pages. og:locale en_US / uk_UA (§C.1). Strings live in src/i18n.
const SITE = 'https://www.usevault.ai'

// path: EN route path (null = no og:url/canonical); hreflang: which alternates the original lists.
const PAGES = {
  home: { path: '/', hreflang: null, msg: (t) => t.meta.home },
  pricing: { path: '/pricing', hreflang: 'en-ru-uk', msg: (t) => t.pricing.meta },
  migration: { path: '/migration-offer', hreflang: 'en-ru-uk', msg: (t) => t.migrationOffer.meta },
  partners: { path: '/partners', hreflang: 'en-ru-uk', msg: (t) => t.partners.meta },
  terms: { path: '/terms', hreflang: 'en-uk', msg: (t) => t.legal.terms },
  privacy: { path: '/privacy', hreflang: 'en-uk', msg: (t) => t.legal.privacy },
  dpa: { path: '/dpa', hreflang: 'en-uk', msg: (t) => t.legal.dpa },
  // Not specced (§E "/subprocessors was not specced"): assumed to follow the legal pages' pattern.
  subprocessors: { path: '/subprocessors', hreflang: 'en-uk', msg: (t) => t.legal.subprocessors },
  // Clone-only route (not on the original site).
  notFound: { path: null, hreflang: null, msg: (t) => t.meta.notFound },
}

function hreflangs(kind, path) {
  if (!kind) return null
  const links = { en: path }
  if (kind === 'en-ru-uk') links.ru = `/ru${path}`
  links.uk = localizePath(path, 'uk')
  links['x-default'] = path
  return links
}

function build(page, locale) {
  const p = PAGES[page]
  const m = p.msg(getMessages(locale))
  const meta = { title: m.title, description: m.description, ogTitle: m.ogTitle, twitterTitle: m.twitterTitle }
  meta.ogLocale = locale === 'uk' ? 'uk_UA' : 'en_US'
  if (page === 'home') {
    // EN home: og:url only (as before). UA home (§C.1): og:url + canonical /ua and hreflang en/ru/uk/x-default.
    meta.url = locale === 'uk' ? `${SITE}/ua` : SITE
    if (locale === 'uk') {
      meta.canonical = `${SITE}/ua`
      meta.hreflang = { en: '', ru: '/ru', uk: '/ua', 'x-default': '' }
    }
  } else if (p.path) {
    meta.url = `${SITE}${localizePath(p.path, locale)}`
    meta.canonical = meta.url
    meta.hreflang = hreflangs(p.hreflang, p.path)
  }
  return meta
}

// Built once so each meta object has a stable identity (the effect below depends on it).
const CACHE = {}
for (const page of Object.keys(PAGES)) CACHE[page] = { en: build(page, 'en'), uk: build(page, 'uk') }

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (content == null) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function usePageMeta(page) {
  const locale = useLocale()
  const meta = CACHE[page][locale]
  useEffect(() => {
    const { title, description, url, canonical, hreflang, ogLocale } = meta
    const ogTitle = meta.ogTitle ?? title
    const twitterTitle = meta.twitterTitle ?? title
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', ogTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url ?? null)
    setMeta('property', 'og:locale', ogLocale)
    setMeta('name', 'twitter:title', twitterTitle)
    setMeta('name', 'twitter:description', description)

    const added = []
    if (canonical) {
      const link = document.createElement('link')
      link.rel = 'canonical'
      link.href = canonical
      added.push(link)
    }
    Object.entries(hreflang ?? {}).forEach(([lang, path]) => {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = lang
      link.href = `${SITE}${path}`
      added.push(link)
    })
    added.forEach((l) => document.head.appendChild(l))
    return () => added.forEach((l) => l.remove())
  }, [meta])
}

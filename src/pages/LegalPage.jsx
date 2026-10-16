import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { Frame, Separator } from '../components/GridFrame.jsx'
import { LEGAL_DOCS } from '../components/legal/outline.js'
import useAnchorScroll from '../hooks/useAnchorScroll.js'
import usePageMeta from '../hooks/usePageMeta.js'
import { fmt, localizePath, rich, useT } from '../i18n/index.jsx'

// Shared legal template for /terms, /privacy, /dpa (+ the placeholder /subprocessors), EN and UA
// (CLONE_SPEC_partners_ua_legal.md §D). No hero, TOC, sticky element or animation. In-page anchors (#8, #annex-1)
// smooth-scroll with zenscroll (1000ms) and land 40px below the top (h2/h3 scroll-mt-10) via useAnchorScroll.
//
// CLONE-ONLY: every paragraph, list item and table cell is placeholder copy (legal.placeholder in src/i18n).
// The headings are the original outline; the original legal body text is intentionally not reproduced.

// §D.2 element styles. v3: md:text-* also sets line-height, so md:leading-* is repeated where the spec keeps it.
const H1 =
  'break-words font-display text-[32px] font-semibold leading-[120%] text-white md:text-5xl md:leading-[110%] lang-uk:hyphens-auto'
const H2 =
  'mt-10 scroll-mt-10 break-words font-display text-xl font-semibold leading-[120%] text-white md:text-2xl md:leading-[120%] lang-uk:hyphens-auto'
const H3 = 'mt-8 scroll-mt-10 break-words text-lg font-medium leading-[150%] text-white'
const P_BASE = 'break-words leading-[26px] text-white/80'
const P = `mt-5 ${P_BASE}`
const STRONG = 'font-medium text-white'
const A = 'underline decoration-white/20 underline-offset-4 transition-colors duration-[400ms] hover:decoration-white'
const UL = 'mt-4 flex list-disc flex-col gap-3 pl-5 marker:text-white/40'
const LI = 'break-words leading-[26px] text-white/80'
const HR = 'mt-10 border-t border-white/5'

function Table({ columns, rows, cell }) {
  const data = Array.from({ length: rows }, (_, r) => columns.map((_, c) => (c === 0 ? `${cell} ${r + 1}` : cell)))
  return (
    <div className="mt-6">
      {/* below md: one card per record (before the table in DOM order, as on the original) */}
      <div className="divide-y divide-white/5 border-y border-white/5 md:hidden">
        {data.map((row, r) => (
          <div key={r} className="flex flex-col gap-3 py-5">
            <p className="break-words text-lg font-medium leading-[150%] text-white">
              <strong className={STRONG}>{row[0]}</strong>
            </p>
            <dl className="flex flex-col gap-3">
              {columns.slice(1).map((col, c) => (
                <div key={col} className="flex flex-col gap-0.5">
                  <dt className="text-sm leading-5 text-white/40">{col}</dt>
                  <dd className="break-words leading-[26px] text-white/80">{row[c + 1]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      {/* md+: table. th/td compute vertical-align: baseline on the original. */}
      <table className="hidden w-full border-collapse text-left md:table">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 align-baseline text-sm font-medium leading-5 text-white/60">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, r) => (
            <tr key={r}>
              {row.map((value, c) => (
                <td key={c} className="break-words px-4 py-3 align-baseline leading-[26px] text-white/80">
                  {c === 0 ? <strong className={STRONG}>{value}</strong> : value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Renders one placeholder body entry. `clauseNo` labels the strong lead-in ("4.1 Placeholder clause."). */
function Body({ entry, clauseNo, t }) {
  const ph = t.legal.placeholder
  const pageLink = (to) => (chunk) => (
    <Link to={localizePath(to, t.locale)} className={A}>
      {chunk}
    </Link>
  )
  const hashLink = (hash) => (chunk) => (
    <a href={hash} className={A}>
      {chunk}
    </a>
  )
  if (entry === 'p')
    return (
      <p className={P}>
        <strong className={STRONG}>
          {clauseNo ? `${clauseNo} ` : ''}
          {ph.clause}
        </strong>{' '}
        {ph.clauseText} {ph.paragraph}
      </p>
    )
  if (entry === 'em')
    return (
      <p className={P}>
        <em className="italic">{ph.emphasis}.</em> {ph.paragraph}
      </p>
    )
  if (entry === 'ul')
    return (
      <ul className={UL}>
        {[1, 2, 3].map((n) => (
          <li key={n} className={LI}>
            {fmt(ph.listItem, { n })}
          </li>
        ))}
      </ul>
    )
  if (entry === 'contact')
    return (
      <>
        <p className={P}>
          {ph.contactLines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {i === 0 ? <strong className={STRONG}>{line}</strong> : line}
            </Fragment>
          ))}
        </p>
        <p className={P}>{rich(ph.contactEmail, { link: (chunk) => <a href={`mailto:${chunk}`} className={A}>{chunk}</a> })}</p>
      </>
    )
  if (entry.table) return <Table columns={entry.table} rows={entry.rows} cell={ph.cell} />
  if (entry.link === 'section')
    return <p className={P}>{rich(fmt(ph.seeSection, { section: entry.section }), { link: hashLink(`#${entry.section}`) })}</p>
  if (entry.link === 'annex') return <p className={P}>{rich(ph.seeAnnex, { link: hashLink('#annex-1') })}</p>
  if (entry.link === 'page') {
    const label = t.legal[entry.label].title.split(' | ')[0]
    return <p className={P}>{rich(fmt(ph.seePage, { label }), { link: pageLink(entry.to) })}</p>
  }
  return null
}

function renderBody(body, clausePrefix, t) {
  let clause = 0
  return body.map((entry, i) => {
    const clauseNo = entry === 'p' && clausePrefix ? `${clausePrefix}.${++clause}` : null
    return <Body key={i} entry={entry} clauseNo={clauseNo} t={t} />
  })
}

export default function LegalPage({ doc }) {
  usePageMeta(doc)
  useAnchorScroll()
  const t = useT()
  const d = LEGAL_DOCS[doc]
  const numeric = (id) => (/^\d+(\.\d+)?$/.test(id) ? id : null)

  return (
    <>
      <Navbar />
      <Separator crosses full />
      <main data-placeholder-copy="legal" className="flex w-full flex-col items-center overflow-hidden text-white">
        <Frame frameClassName="px-4 py-12 md:px-6 md:py-16 lg:py-20 xl:px-14">
          <article className="mx-auto w-full max-w-[750px]">
            <h1 id={d.h1.id} className={H1}>
              {d.h1.text}
            </h1>
            <p className={P}>
              <strong className={STRONG}>Vault AI</strong>
              <br />
              {t.legal.effectiveDate}
            </p>
            {d.intro && renderBody(d.intro, null, t)}
            {d.preamble && (
              <>
                <hr className={HR} />
                <p className={`mt-10 ${P_BASE}`}>{t.legal.placeholder.paragraph}</p>
                {renderBody(d.preamble, null, t)}
              </>
            )}
            {d.blocks.map((b) => (
              <Fragment key={b.id}>
                {b.type === 'h2' ? (
                  <>
                    <hr className={HR} />
                    <h2 id={b.id} className={H2}>
                      {b.text}
                    </h2>
                  </>
                ) : (
                  <h3 id={b.id} className={H3}>
                    {b.text}
                  </h3>
                )}
                {renderBody(b.body ?? ['p'], numeric(b.id), t)}
              </Fragment>
            ))}
          </article>
        </Frame>
        <Separator crosses />
      </main>
      <Footer />
    </>
  )
}

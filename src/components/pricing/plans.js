// Plan data (CLONE_SPEC_pricing_migration.md §P1 "Card copy and data", §P2 rows). Copy comes from src/i18n
// (pricing.*); this file only holds the structure, prices and which cells are included.

const PLAN_DEFS = [
  { id: 'free', price: { annual: '$0', monthly: '$0' }, sub: false, cta: 'outline-link' },
  { id: 'basic', price: { annual: '$25', monthly: '$30' }, sub: true, cta: 'outline-link' },
  { id: 'pro', recommended: true, price: { annual: '$42', monthly: '$50' }, sub: true, cta: 'primary-link' },
  { id: 'enterprise', custom: true, sub: false, cta: 'contact' },
]

const CTA_LABEL = { 'outline-link': 'getStarted', 'primary-link': 'startTrial', contact: 'contact' }

export function getPlans(t) {
  const p = t.pricing
  return PLAN_DEFS.map((d) => {
    const copy = p.plans[d.id]
    return {
      id: d.id,
      name: copy.name,
      tagline: copy.tagline,
      recommended: d.recommended ?? false,
      custom: d.custom ?? false,
      price: d.custom ? { annual: p.price.custom, monthly: p.price.custom } : d.price,
      sub: d.sub ? { annual: p.price.perSeatMonthAnnual, monthly: p.price.perSeatMonth } : null,
      cta: { kind: d.cta, label: p.cta[CTA_LABEL[d.cta]] },
      featuresHeader: copy.featuresHeader,
      features: copy.features,
    }
  })
}

// true = included, false = not included; numbers render with the locale's thousands separator;
// { v: key } = a pricing.compare.values[key] string.
const V = (v) => ({ v })
const COMPARE_DEFS = [
  {
    group: 'usage',
    rows: [
      ['transactions', [200, 800, 1500, V('custom')]],
      ['manualCsv', [true, true, true, true]],
    ],
  },
  {
    group: 'integrations',
    rows: [
      ['bankConnections', [false, 2, 10, V('custom')]],
      ['cryptoWallets', [false, false, true, true]],
      ['balanceRefresh', [V('standard'), V('standard'), V('standard'), V('moreFrequent')]],
    ],
  },
  {
    group: 'reports',
    rows: [
      ['paymentCalendar', [false, true, true, true]],
      ['cashflow', [false, true, true, true]],
      ['pnl', [false, false, true, true]],
      ['customReports', [false, false, true, true]],
    ],
  },
  {
    group: 'team',
    rows: [
      ['seats', [V('upTo3'), V('noLimit'), V('noLimit'), V('noLimit')]],
      ['flexibleAccess', [false, true, true, true]],
    ],
  },
  { group: 'support', rows: [['prioritySupport', [false, false, true, true]]] },
]

export function getCompareGroups(t) {
  const c = t.pricing.compare
  return COMPARE_DEFS.map(({ group, rows }) => ({
    label: c.groups[group],
    rows: rows.map(([key, values]) => [
      c.rows[key],
      values.map((v) => (v && typeof v === 'object' ? c.values[v.v] : v)),
    ]),
  }))
}

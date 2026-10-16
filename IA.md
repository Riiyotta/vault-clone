# https://www.usevault.ai/ (clone in /Users/riyaghosh/V3/vault)

Source: https://www.usevault.ai/ (clone in /Users/riyaghosh/V3/vault)
Status: **draft**
17 routes · 6 templates · 23 unique sections

> Generated from `ia.json` by `build.mjs`. Edit the JSON, not this file.

## Shape of the site

The largest 3 templates (Legal document, Home, Pricing) account for 12 of 17 routes (71%). The remaining 5 routes span 3 templates.

| template | routes | share |
|---|---:|---:|
| Legal document | 8 | 47% |
| Home | 2 | 12% |
| Pricing | 2 | 12% |
| Migration offer | 2 | 12% |
| Partners | 2 | 12% |
| Not found (clone-only) | 1 | 6% |

## Page chrome

**17 routes carry chrome = `full`** — Home, Pricing, Migration offer, Partners, Legal document, Not found (clone-only).

## Sections by reuse

How widely a section is shared determines whether it belongs in a shared
component library or stays local to its page.

| section | category | templates | routes | implementation | scope |
|---|---|---:|---:|---|---|
| `chrome.navbar` | CHROME | 6 | 17 | `src/components/Navbar.jsx` | All 17 routes. |
| `chrome.grid-frame` | CHROME | 6 | 17 | `src/components/GridFrame.jsx` | All 17 routes; wraps every section between nav and footer. |
| `chrome.footer` | CHROME | 6 | 17 | `src/components/Footer.jsx` | All 17 routes. |
| `content.legal-article` | CONTENT | 1 | 8 | `src/pages/LegalPage.jsx + src/components/legal/outline.js` | Legal template: 8 routes (4 documents x 2 locales). |
| `support.faq-accordion` | SUPPORT | 3 | 6 | `src/components/shared/Faq.jsx` | Pricing, migration offer and partners templates. |
| `narrative.scroll-statement` | NARRATIVE | 2 | 4 | `src/components/Statement.jsx` | Home and partners templates (4 routes with locales). |
| `process.lottie-steps` | PROCESS | 2 | 4 | `src/components/HowItWorks.jsx` | Home and pricing templates. |
| `process.visual-steps` | PROCESS | 2 | 4 | `src/components/shared/VisualSteps.jsx` | Migration offer and partners templates. |
| `hero.home-dashboard` | HERO | 1 | 2 | `src/components/Hero.jsx` | Home template only (/ and /ua). |
| `hero.pricing-plans` | HERO | 1 | 2 | `src/components/pricing/PricingHero.jsx + PlanCards.jsx` | Pricing template only (/pricing and /ua/pricing). |
| `hero.migration-split` | HERO | 1 | 2 | `src/components/migration/MigrationHero.jsx` | Migration offer template only. |
| `hero.partners-split` | HERO | 1 | 2 | `src/components/partners/PartnersHero.jsx + PartnerMock.jsx` | Partners template only. |
| `features.product-grid` | FEATURES | 1 | 2 | `src/components/ProductHighlights.jsx` | Home template only. |
| `features.showcase-automation` | FEATURES | 1 | 2 | `src/components/FeatureTabs.jsx` | Home template only. |
| `features.showcase-reports` | FEATURES | 1 | 2 | `src/components/FeatureTabs.jsx` | Home template only. |
| `features.showcase-security` | FEATURES | 1 | 2 | `src/components/FeatureTabs.jsx` | Home template only. |
| `features.migration-explainer` | FEATURES | 1 | 2 | `src/components/migration/OfferExplanation.jsx` | Migration offer template only. |
| `features.migration-conditions` | FEATURES | 1 | 2 | `src/components/migration/Conditions.jsx` | Migration offer template only. |
| `features.partner-audience` | FEATURES | 1 | 2 | `src/components/partners/Audience.jsx` | Partners template only. |
| `features.partner-value-grid` | FEATURES | 1 | 2 | `src/components/partners/ValueGrid.jsx` | Partners template only. |
| `commerce.compare-table` | COMMERCE | 1 | 2 | `src/components/pricing/CompareTable.jsx` | Pricing template only. |
| `forms.partner-popup` | FORMS | 1 | 2 | `src/components/partners/PartnerPopup.jsx + LeadForm.jsx + PhoneField.jsx` | Partners template only; opened from its hero and CTA buttons. |
| `hero.not-found` | HERO | 1 | 1 | `src/pages/NotFound.jsx` | Not-found template only (any unmatched path). |

**7 shared sections** appear in more than one template and belong in a component library.

**16 single-use sections** appear in exactly one template. Building these
as "reusable" components up front would be speculative — keep them page-local
until a second caller actually appears.

## Templates

### Home — `template.home`

2 routes · `/`, `/ua` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | CHROME | `chrome.navbar` | shared ×6 |
| 2 | CHROME | `chrome.grid-frame` | shared ×6 |
| 3 | HERO | `hero.home-dashboard` | page-local |
| 4 | NARRATIVE | `narrative.scroll-statement` | shared ×2 |
| 5 | FEATURES | `features.product-grid` | page-local |
| 6 | FEATURES | `features.showcase-automation` | page-local |
| 7 | FEATURES | `features.showcase-reports` | page-local |
| 8 | FEATURES | `features.showcase-security` | page-local |
| 9 | PROCESS | `process.lottie-steps` | shared ×2 |
| 10 | CHROME | `chrome.footer` | shared ×6 |

### Pricing — `template.pricing`

2 routes · `/pricing`, `/ua/pricing` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | CHROME | `chrome.navbar` | shared ×6 |
| 2 | CHROME | `chrome.grid-frame` | shared ×6 |
| 3 | HERO | `hero.pricing-plans` | page-local |
| 4 | COMMERCE | `commerce.compare-table` | page-local |
| 5 | SUPPORT | `support.faq-accordion` | shared ×3 |
| 6 | PROCESS | `process.lottie-steps` | shared ×2 |
| 7 | CHROME | `chrome.footer` | shared ×6 |

### Migration offer — `template.migration-offer`

2 routes · `/migration-offer`, `/ua/migration-offer` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | CHROME | `chrome.navbar` | shared ×6 |
| 2 | CHROME | `chrome.grid-frame` | shared ×6 |
| 3 | HERO | `hero.migration-split` | page-local |
| 4 | FEATURES | `features.migration-explainer` | page-local |
| 5 | FEATURES | `features.migration-conditions` | page-local |
| 6 | SUPPORT | `support.faq-accordion` | shared ×3 |
| 7 | PROCESS | `process.visual-steps` | shared ×2 |
| 8 | CHROME | `chrome.footer` | shared ×6 |

### Partners — `template.partners`

2 routes · `/partners`, `/ua/partners` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | CHROME | `chrome.navbar` | shared ×6 |
| 2 | CHROME | `chrome.grid-frame` | shared ×6 |
| 3 | HERO | `hero.partners-split` | page-local |
| 4 | FEATURES | `features.partner-audience` | page-local |
| 5 | NARRATIVE | `narrative.scroll-statement` | shared ×2 |
| 6 | FEATURES | `features.partner-value-grid` | page-local |
| 7 | SUPPORT | `support.faq-accordion` | shared ×3 |
| 8 | PROCESS | `process.visual-steps` | shared ×2 |
| 9 | FORMS | `forms.partner-popup` | page-local |
| 10 | CHROME | `chrome.footer` | shared ×6 |

### Legal document — `template.legal`

8 routes · `/terms`, `/privacy`, `/dpa`, `/subprocessors`, `/ua/terms`, `/ua/privacy`, `/ua/dpa`, `/ua/subprocessors` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | CHROME | `chrome.navbar` | shared ×6 |
| 2 | CHROME | `chrome.grid-frame` | shared ×6 |
| 3 | CONTENT | `content.legal-article` | page-local |
| 4 | CHROME | `chrome.footer` | shared ×6 |

### Not found (clone-only) — `template.not-found`

1 route · `/*` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | CHROME | `chrome.navbar` | shared ×6 |
| 2 | CHROME | `chrome.grid-frame` | shared ×6 |
| 3 | HERO | `hero.not-found` | page-local |
| 4 | CHROME | `chrome.footer` | shared ×6 |

## Section reference

### CHROME

_Site-wide frame: top navigation, footer, and the hairline grid frame with separators and cross markers._

**`chrome.navbar`** — Top navigation: logo, section links (Product/Automation/Reports/Security), Pricing link, EN/UA switch, login and Get started CTA; below 1024px a burger opening an animated blurred dropdown. On non-home routes the logo links to / and section links to /#anchor; Pricing gets the active state on the pricing template.

· All 17 routes. · appears on 17 routes · implemented by `src/components/Navbar.jsx`

**`chrome.grid-frame`** — Hairline layout frame: 1.5px white/5 side borders on each section, 1px separators between sections, 12px plus-shaped cross markers at separator corners.

· All 17 routes; wraps every section between nav and footer. · appears on 17 routes · implemented by `src/components/GridFrame.jsx`

**`chrome.footer`** — Footer: brand mark and socials, Platform / Resources / Legal link columns, bottom bar with copyright and the Built by Overcode badge, plus the closing spacer.

· All 17 routes. · appears on 17 routes · implemented by `src/components/Footer.jsx`

### HERO

_Page-opening block directly under the nav._

**`hero.home-dashboard`** — Centred home hero: eyebrow pill, display h1, subtitle, Get started CTA, and the large dashboard screenshot with four glow layers over the planet background. Locale swaps the screenshot (hero-en / hero-uk).

· Home template only (/ and /ua). · appears on 2 routes · implemented by `src/components/Hero.jsx`

**`hero.pricing-plans`** — Pricing hero: PRICING eyebrow, h1, Monthly/Annual segmented toggle (default Annual, sliding pill, '2 months free' badge) and the four plan cards (Free, Basic, Pro with gradient border and Recommended pill, Enterprise) whose prices fade on toggle.

· Pricing template only (/pricing and /ua/pricing). · appears on 2 routes · implemented by `src/components/pricing/PricingHero.jsx + PlanCards.jsx`

**`hero.migration-split`** — Split hero for the migration offer: text column with h1 and Talk to us button on the left, an invoice mock on the right that reveals in sequence once and cross-fades the total.

· Migration offer template only. · appears on 2 routes · implemented by `src/components/migration/MigrationHero.jsx`

**`hero.partners-split`** — Split hero for the partner programme: text column with h1 and Become a partner button on the left, an animated DOM scene (invite-link card, connector line, workspace list) on the right that plays once on entering view.

· Partners template only. · appears on 2 routes · implemented by `src/components/partners/PartnersHero.jsx + PartnerMock.jsx`

**`hero.not-found`** — Clone-only 404 block: eyebrow, h1, subtitle and a link home. Has no counterpart on the original site.

· Not-found template only (any unmatched path). · appears on 1 routes · implemented by `src/pages/NotFound.jsx`

### NARRATIVE

_Long-form positioning copy presented as a motion piece rather than a feature._

**`narrative.scroll-statement`** — Large paragraph whose words fill from ghost (0.2) to white one by one as the block scrolls from 90% to 25% of the viewport. Copy is per page; layout and motion are identical.

· Home and partners templates (4 routes with locales). · appears on 4 routes · implemented by `src/components/Statement.jsx`

### FEATURES

_Product or offer explanation modules: grids, tabbed showcases, lists, charts._

**`features.product-grid`** — #product: 3x2 grid of product cards, each with a looping canvas Lottie that freezes off screen, a title and a short description.

· Home template only. · appears on 2 routes · implemented by `src/components/ProductHighlights.jsx`

**`features.showcase-automation`** — #automation tabbed showcase: three tabs that auto-advance with a linear progress bar (durations from Lottie markers, gated at 35% visibility), Lottie segment per tab, text and Try it free CTA.

· Home template only. · appears on 2 routes · implemented by `src/components/FeatureTabs.jsx`

**`features.showcase-reports`** — #reports tabbed showcase: same mechanics as the automation showcase with the reports Lottie and copy, mirrored layout.

· Home template only. · appears on 2 routes · implemented by `src/components/FeatureTabs.jsx`

**`features.showcase-security`** — #security tabbed showcase: same mechanics as the automation showcase with the security Lottie and copy.

· Home template only. · appears on 2 routes · implemented by `src/components/FeatureTabs.jsx`

**`features.migration-explainer`** — 'You don't pay for two tools at once': two explanatory paragraphs beside a 12-month timeline chart whose bars fill on scroll.

· Migration offer template only. · appears on 2 routes · implemented by `src/components/migration/OfferExplanation.jsx`

**`features.migration-conditions`** — 'The offer applies if': five eligibility conditions, each with an icon that animates once on scroll.

· Migration offer template only. · appears on 2 routes · implemented by `src/components/migration/Conditions.jsx`

**`features.partner-audience`** — 'Who it's for': five-row audience list with icons that animate in on scroll.

· Partners template only. · appears on 2 routes · implemented by `src/components/partners/Audience.jsx`

**`features.partner-value-grid`** — 'What you and your clients get': two-column value grid (Your client / Your company) separated by an 'Or' divider.

· Partners template only. · appears on 2 routes · implemented by `src/components/partners/ValueGrid.jsx`

### PROCESS

_Numbered, auto-advancing step sequences paired with a visual._

**`process.lottie-steps`** — 'Gain Clarity on your Finances': three timed steps that expand in turn beside one Lottie, connector line grows 1.55s easeInOut, loops when the Lottie completes, Get started CTA. Carries the #how-it-works anchor on home only.

· Home and pricing templates. · appears on 4 routes · implemented by `src/components/HowItWorks.jsx`

**`process.visual-steps`** — Four-step sequence that auto-advances every 5s while in view and loops; the connector between numbers fills over 4.8s; clicking a step selects it and restarts the timer; each step shows its own DOM mock screen (no Lottie). Step content is per page.

· Migration offer and partners templates. · appears on 4 routes · implemented by `src/components/shared/VisualSteps.jsx`

### COMMERCE

_Plan comparison and pricing detail beyond the hero._

**`commerce.compare-table`** — Compare plans: five-group feature table with a sticky header row and shaded Pro column from 768px; below 768px a sticky plan picker shows one plan column at a time.

· Pricing template only. · appears on 2 routes · implemented by `src/components/pricing/CompareTable.jsx`

### SUPPORT

_Question-and-answer content._

**`support.faq-accordion`** — FAQ accordion under a section heading: multi-open items, 300ms grid-rows expand, chevron rotates 90deg to -90deg. Question set is per page.

· Pricing, migration offer and partners templates. · appears on 6 routes · implemented by `src/components/shared/Faq.jsx`

### FORMS

_Lead capture overlays._

**`forms.partner-popup`** — 'Become a partner' modal: gradient-bordered form with validated fields, phone country dropdown with flags, Esc and focus trap, body scroll lock. In the clone the submit is simulated locally and never leaves the browser.

· Partners template only; opened from its hero and CTA buttons. · appears on 2 routes · implemented by `src/components/partners/PartnerPopup.jsx + LeadForm.jsx + PhoneField.jsx`

### CONTENT

_Document-style body content with no marketing motion._

**`content.legal-article`** — Bordered frame with a 750px centred article: h1, last-updated line, h2/h3 headings, body paragraphs, lists, underlined links, tables that become stacked cards below 768px, in-page anchors that smooth-scroll to 40px above the heading. Body text in the clone is placeholder.

· Legal template: 8 routes (4 documents x 2 locales). · appears on 8 routes · implemented by `src/pages/LegalPage.jsx + src/components/legal/outline.js`

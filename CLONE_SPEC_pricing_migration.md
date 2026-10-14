Source: https://www.usevault.ai/

# Vault AI: clone spec for `/pricing` and `/migration-offer`

Measured live on 2026-10-14 with headless Chromium (Playwright 1.63) at 1440, 1280, 768 and 390 px. Values come from computed styles, bounding boxes and the site's own JS chunks: copy, prices, Framer Motion variants and timings were read from the production bundles, then checked live by sampling `style.transform` and `opacity` over time. This file extends `CLONE_SPEC.md` (home) and reuses its section numbers, e.g. "home §1".

Reference screenshots:
- `recon/pricing/pricing-1440-full.png`, `pricing-390-full.png`, `pricing-1440-viewport.png`, `pricing-1440-monthly-cards.png`
- `recon/migration-offer/migration-offer-1440-full.png`, `migration-offer-390-full.png`, `migration-offer-1440-viewport.png`, `migration-1440-steps-step4.png`

The chat bubble in the screenshots is Intercom (third-party). Do not clone it.

New assets are listed in `ASSET_MANIFEST_pricing_migration.md`. Both routes load **no new raster images, fonts, videos or lotties**:
- Fonts are Outfit + clashDisplay only, as on home.
- `/pricing` reuses `lottie/process-steps/gain-clarity-on-your-finances.lottie`.
- `/migration-offer` has no Lottie and no canvas. Every visual is DOM/SVG.
- All new icons are inline SVGs. They were saved to `public/assets/svg/`.

---

## 0. Shared building blocks (both routes)

### 0.1 Page shell
- Same as home §0–§1: `body` bg `#03020B`, Outfit 16/24, `<main class="flex w-full flex-col items-center overflow-x-clip text-white">`.
- Grid frame is the same as home §0.2: a `max-w-[1440px] px-6 md:px-10 lg:px-14` column, with an inner `border-x-[1.5px] border-white/5`.

### 0.2 Nav: same as home §1, with these differences
- Both logo links (desktop nav, mobile nav, footer) use `href="/"`, not `#top`.
- Section links point at home: `/#product`, `/#automation`, `/#reports`, `/#security`, plus `/pricing`.
- The language switch links to the localized route: EN `/pricing` or `/migration-offer`, UA `/ua/pricing` or `/ua/migration-offer`.
- **Active state on `/pricing`:**
  - Desktop: the `Pricing` `<li>` is `text-white` (#fff) instead of `text-white/80`, and its `<a>` has `aria-current="page"`.
  - Mobile menu: item `05. Pricing` has index and label both `#fff` and `aria-current="page"`. The other items stay at index white/40 and label white/80.
- **`/migration-offer` has no active nav item.** All five links are at their default color, and so is the mobile menu.
- Below the nav sits the "full" separator with crosses (`bg-white/5` at every width). It is the same as home.

### 0.3 Footer: same as home §9, with these differences
- Logo href is `/`. Links use `/#product`-style hrefs.
- On `/pricing` the footer `Pricing` `<li>` is `text-white` and its `<a>` has `aria-current="page"`.
- On `/migration-offer` the footer "Migration offer" link is **not** highlighted.
- Footer height: 476 (1440/1280), 528 (768), 694 (390). The final separator and spacer are as on home.

### 0.4 Separator component (`Separator`)
Every separator between sections on these pages is `line="between-crosses-until-lg"` with cross icons.
- Outer: `relative flex h-px w-full justify-center lg:bg-white/5`.
- Inner: `relative flex w-full max-w-[1440px] items-center justify-between px-[18px] md:px-[34px] lg:px-[50px]`, plus a `::before` (`absolute top-1/2 h-px -translate-y-1/2 bg-white/5 inset-x-[18px] md:inset-x-[34px] lg:hidden`).
- It holds two `cross-plus-marker.svg` (12×12, `relative z-[100]`) at x = 50 and 1378 (1440), 50/1218 (1280), 34/722 (768), 18/360 (390).
- This is home §0.2 "between-crosses-until-lg".

### 0.5 Section heading block (`SectionHeading`, shared by Compare, FAQ, Offer, Conditions, How it works)
- Wrapper: `w-full max-w-[1440px] px-6 md:px-10 lg:px-14` > `div.flex.justify-center.border-x-[1.5px].border-white/5.px-4.pt-24.pb-10.md:pb-12.lg:pt-30.lg:pb-16`.
  - Padding: 120/16/64/16 at lg, 96/16/48/16 at md, 96/16/40/16 below md.
- `h2`:
  - Classes: `word-spacing-4 lg:word-spacing-7 text-center font-display text-3xl font-semibold text-balance text-white uppercase lg:text-5xl lg:leading-16`.
  - Computed: clashDisplay 600, **48px/64px, word-spacing 7px** (≥1024); **30px/36px, word-spacing 4px** (<1024). White, uppercase, centered, `text-wrap: balance`.
- One separator (0.4) always follows the heading block.

### 0.6 Eyebrow pill (`Eyebrow`)
- Container: `flex items-center gap-1.5 rounded-full bg-white/8 px-2 py-1`, which is 4px 8px padding, 6px gap, bg rgba(255,255,255,.08).
- Shadow: `inset 0 .5px .5px rgba(255,255,255,.12), inset 0 1px 3px rgba(255,255,255,.10), inset 0 2px 8px rgba(255,255,255,.04), 0 .5px .5px rgba(8,1,20,.03), 0 1px 1px -.5px rgba(8,1,20,.03), 0 2px 2px -1px rgba(8,1,20,.03)`.
- Optional icon: `zap-icon.svg` at 14×14. It already exists in assets.
- Label: Outfit 11px/16px, weight 500, letter-spacing .05em (0.55px), uppercase, white.
- Height 24. The "PRICING" pill is 83×24.

### 0.7 Hero h1 + sub (shared typography)
- h1:
  - Classes: `word-spacing-4 md:word-spacing-6 lg:word-spacing-8 font-display font-semibold tracking-[2%] text-balance text-white`.
  - Sizes: **56px/64px** (lg), **48px/52.8px** (md, `leading-[110%]`), **32px/38.4px** (<md, `leading-[120%]`). Word-spacing 8 / 6 / 4px.
- Sub `p`: Outfit **300**, white. 16px/26px (md+, `md:max-w-[500px]`) or 14px/20px (<md). Each line is a `<span class="block">`.

### 0.8 Buttons (`Button` / `AppLoginLink` / `ContactButton`)
- **Outline** (`variant="outline"`):
  - Classes: `flex items-center justify-center rounded-full border border-white/20 px-6 py-4 text-lg leading-[22px] font-medium text-white`.
  - Box: 56 tall, 18px/22px Outfit 500. In pricing cards it is `w-full` and `max-md:text-base` (16px below 768).
- **Primary large**:
  - Classes: `bg-white text-[#090A11] border-4 border-white/20 bg-clip-padding text-lg leading-[22px] gap-4 pl-6 pr-4 py-3 rounded-full font-medium`.
  - Box: 64 tall. Arrow chip `size-8` (32) `rounded-full bg-[#05040C]` holding `arrow-right.svg` at 16×16.
- **Primary small**:
  - Classes: `gap-3.5 pl-5 pr-3.5 py-2.5`, 16px/24px, 56 tall. Arrow chip `size-7` (28) holding the arrow at 14×14.
- **No hover state** on any of these buttons. Measured: bg, color, border, transform and shadow are unchanged on hover. This matches home.
- **ContactButton behaviour** ("Contact us", "Talk to us", inline "Contact us", "ask us in the chat"):
  - It is a `<button type="button">`.
  - onClick: if `window.Intercom?.booted` and `.intercom-lightweight-app, #intercom-container` exist, it calls Intercom `showNewMessage("")`. Otherwise it sets `window.location.href = "mailto:hello@usevault.ai"`.
  - It also pushes `{event:"contact_click", cta_placement, locale, channel}` to `window.dataLayer`.
  - **There is no modal or popup.** `#popupPortal` stays empty on both routes. For the clone, use `mailto:hello@usevault.ai` (Intercom is out of scope).
  - Placements: `pricing_enterprise`, `pricing_faq`, `migration_hero`, `migration_faq`, `migration_steps`.
- **AppLoginLink** (`<a>`): `href="https://app.usevault.ai/login"`. It pushes `sign_up_click` with a placement: `pricing_free`, `pricing_basic` or `pricing_pro`.
- **Inline action** (links and buttons inside FAQ answers):
  - Classes: `cursor-pointer text-white underline decoration-white/40 underline-offset-4 transition-colors duration-300 hover:decoration-white`.
  - Hover changes the text-decoration-color from rgba(255,255,255,.4) to #fff over 300ms cubic-bezier(.4,0,.2,1).

### 0.9 FAQ accordion (`Faq`): used on both routes
- List wrapper: `<ul class="flex flex-col divide-y divide-white/5 border-x-[1.5px] border-white/5">` inside the standard column. Items are separated by 1px white/5 borders.
- Each `<li>` holds `<h3><button>` and an answer region.
- **Button**:
  - `id="faq-{id}-question"`, `aria-expanded`, `aria-controls="faq-{id}-answer"`.
  - Classes: `group flex w-full cursor-pointer items-center justify-between gap-6 px-4 py-5 md:px-[34px] md:py-6 text-left text-lg leading-[150%] font-medium text-white`.
  - Typography: Outfit 500, 18px/27px, white.
  - Padding: 24px 34px (md+) or 20px 16px (<md).
  - Height: 75 for one line (md+); 67 for one line and 94 for two lines (390).
  - Focus-visible: 2px white outline, offset −2px.
- **Chevron**:
  - `chevron-right.svg` (24×24 viewBox, stroke 2, currentColor), rendered at `size-5` (20×20).
  - Classes: `shrink-0 text-white/50 transition-[rotate,color] duration-300 group-hover:text-white`.
  - **Closed: `rotate: 90deg`** (points down). **Open: `rotate: -90deg`** (points up).
  - The transition is 300ms cubic-bezier(.4,0,.2,1). The sampled rotation went 90° → 84° → 35° → −35° → −61° → −81° → −89° → −90° over about 300ms.
  - Hover makes the chevron #fff over 300ms. The question text stays white.
- **Answer region**:
  - `<div id="faq-{id}-answer" role="region" aria-labelledby=… inert={!open}>`.
  - Classes: `grid transition-[grid-template-rows] duration-300 ease-out` with `grid-rows-[0fr]` when closed and `grid-rows-[1fr]` when open. Inner `div.min-h-0.overflow-hidden`.
  - Measured height 0 → 48 in about 300ms (ease-out = cubic-bezier(0,0,.2,1)).
- **Answer text**:
  - Single paragraph: `<p class="max-w-[800px] px-4 pb-6 md:px-[34px] leading-[150%] text-white/60">`, Outfit 16px/24px, rgba(255,255,255,.6).
  - Multi-paragraph: `div.flex.max-w-[800px].flex-col.gap-3.px-4.pb-6.md:px-[34px]` holding several `<p class="leading-[150%] text-white/60">`.
- **Several items can be open at once.** State is a `Set`, and clicking toggles that id only. All items are closed on load.
- `motion-reduce:transition-none` applies to every transition.

### 0.10 Mock UI primitives (migration-offer visuals)
| name | classes / computed |
|---|---|
| MockCard | `w-full rounded-xl border border-white/10 bg-[#080710] p-4 text-xs leading-[18px] text-white`, i.e. radius 12px, 1px rgba(255,255,255,.1) border, bg #080710, 16px padding, 12px/18px Outfit |
| MockDivider | `h-px bg-white/5` (margins vary per use) |
| MockLabel | Outfit 11px/16px, 500, tracking .05em, uppercase, white/40 |
| MockPill sm | `inline-flex h-5 px-2 text-[11px] leading-4 font-medium rounded-full gap-1.5 whitespace-nowrap`, tone neutral `bg-white/8 text-white/80` |
| MockPill md | `h-6 px-2.5 text-xs leading-4` |
| MockPill lg | `h-[26px] px-3 text-xs leading-4` |
| pill tone accent | `border border-accent/50 bg-accent/20 text-white` (accent = #5176FE) |
| pill tone surface | `border border-accent/50 bg-[#080710] text-white` |
| MockRow | `flex items-center justify-between gap-3 rounded-lg border px-2.5 py-2`. Normal: `border-transparent text-white/80`. Highlighted: `border-accent/35 bg-accent/10`. The value span is `shrink-0 tabular-nums` |
| IconDisc md | `flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10` |
| IconDisc sm | `size-6 rounded-full bg-white/8` |
| Skeleton bar | `block h-2 rounded` + `bg-white/20` (muted) / `bg-white/40` (strong) / `bg-accent/60` (accent) |
| DotGridPanel bg | `radial-gradient(circle, rgba(255,255,255,.08) .8px, transparent .8px), linear-gradient(180deg, rgba(217,217,217,.03) 0%, rgba(217,217,217,.01) 100%)`, bg-size `8px 8px, 100% 100%` (md+: `12px 12px, 100% 100%`). Note: this differs from home's process-steps dots, which use rgba(49,49,56,.35) and a reversed gradient |

Colors used: `--color-accent #5176FE`, `--color-accent-soft #9BAEF2`, `#080710` (card surface / Pro column).

### 0.11 Reveal hook (`useReveal`) and easing constants
- `EASE_OUT_EXPO = [0.22, 1, 0.36, 1]`.
- `useReveal({amount})` returns Framer props `{initial:"hidden", whileInView:"shown", viewport:{once:true, amount}}`. The default amount is 0.3.
- With `prefers-reduced-motion`, it returns `{initial:"hidden", animate:"shown"}` and every transition becomes `{duration:0}`.
- Variants are named `hidden` and `shown` and propagate to child `motion.*` elements.

---

## 1. `/pricing`

**`<title>Pricing | Vault AI</title>`**
- `meta description` / `og:description` / `twitter:description`: "Vault AI plans and pricing: Free, Basic, Pro and Enterprise. Every new workspace starts with a 1-month Pro trial, no credit card required."
- `og:title` / `twitter:title`: "Pricing | Vault AI".
- `og:url`: https://www.usevault.ai/pricing. `og:site_name`: "Vault AI". `og:locale`: en_US. `og:type`: website.
- `og:image` / `twitter:image`: https://www.usevault.ai/og-image.png (1200×630). `twitter:card`: summary_large_image.
- `theme-color` and `msapplication-TileColor`: #03020b.
- `canonical`: https://www.usevault.ai/pricing.
- hreflang: en → /pricing, ru → /ru/pricing, uk → /ua/pricing, x-default → /pricing.

Document height: **4632** (1440 and 1280), **5163** (768), **6071** (390).

DOM order:
1. Nav (§0.2, Pricing active).
2. Full separator.
3. **P1 Hero + plan cards** (one `<section>`).
4. Separator.
5. **P2 Compare plans**.
6. Separator.
7. **P3 FAQ**.
8. Separator.
9. **P4 "Gain Clarity on your Finances"**: this is home §8.
10. Separator.
11. Footer (§0.3).

Y positions (top/height):

| block | 1440 | 1280 | 768 | 390 |
|---|---|---|---|---|
| nav | 0/120 | 0/120 | 0/76 | 0/56 |
| P1 hero frame | 121/528 | 121/528 | 77/490 | 57/453 |
| P1 cards grid | 650/583 | 650/583 | 568/1135 | 511/2009 |
| P2 compare | 1234/1377 | 1234/1377 | 1704/1269 | 2521/1316 |
| P3 FAQ | 2612/628 | 2612/628 | 2974/560 | 3838/629 |
| P4 gain clarity | 3241/914 | 3241/914 | 3535/1099 | 4468/908 |
| footer | 4156/476 | 4156/476 | 4635/528 | 5377/694 |

### P1. Hero + billing toggle + plan cards

**Hero frame**
- `div.flex.flex-col.items-center.border-x-[1.5px].border-white/5.px-4.pt-24.pb-12.md:pt-28.md:pb-14.lg:pt-30.lg:pb-16`.
- Padding: 120/16/64 (lg), 112/16/56 (md), 96/16/48 (<md).
- Text stack: `flex flex-col items-center gap-4 md:gap-6`. Max-width 400 (<md), 560 (md), 750 (lg).
  1. Eyebrow (§0.6) with the zap icon, text **"PRICING"** (source string is "Pricing" plus CSS uppercase). At 1440 it sits at x 679, y 241, 83×24.
  2. **h1**: "Start free. Upgrade when you need more."
     - Centered, §0.7 sizes.
     - 1440: box 750×128 (2 lines) at y 289. 768: 560×106. 390: 308×115 (3 lines).
  3. **Sub** (centered, `px-4 text-balance`):
     - Span 1 (block): "Every new workspace starts with a 1-month Pro trial."
     - Span 2 (block): "No credit card required · Cancel anytime." This is a non-breaking space before the middle dot: `required&nbsp;· Cancel`.
     - 1440: lines at y 441 and 467, 368 wide, 16/26 weight 300.
- **Billing toggle** (`SegmentedControl`, `role="radiogroup" aria-label="Billing period"`), `mt-8 md:mt-10` (32 / 40px):
  - Container: `flex items-stretch rounded-full border border-white/20 p-1 w-fit`. Measured 296×52 at md+ and 220×46 at 390.
  - Options:
    - `Monthly` (value `monthly`).
    - `Annual` (value `annual`) with badge **"2 months free"**.
  - **Default is Annual.**
  - Buttons:
    - `role="radio" aria-checked tabindex={checked?0:-1}`.
    - Classes: `relative flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors duration-300`.
    - md+: `gap-2 px-5 py-2.5 text-base leading-[22px]`. Monthly is 98×42 and Annual 188×42.
    - <md: `gap-1.5 px-2.5 py-2 text-sm leading-5`. Monthly is 71×36 and Annual 139×36.
    - ≤360px: `gap-1 px-2 text-[13px]`.
  - **Checked option**: text `#090A11`. Behind the label sits a `motion.span` with `layoutId` and `absolute inset-0 rounded-full bg-white`. It is a sliding white pill.
  - **Unchecked option**: text rgba(255,255,255,.6). Hover changes it to `#fff` over 300ms cubic-bezier(.4,0,.2,1).
  - **Badge** (`relative rounded-full font-medium transition-colors duration-300`):
    - md+: `px-2 py-0.5 text-xs leading-4`, 89×20. <md: `px-1 text-[10px] leading-4`.
    - When its option is checked: `bg-[#090A11]/8 text-[#090A11]`. When unchecked: `bg-white/8 text-white/80`.
  - **Pill motion**: a Framer shared-layout animation, `transition {duration:.3, ease:"easeOut"}`. Sampled live going Annual → Monthly: the pill's x went 675 → 577 and its width 188 → 98 over about 300ms (transform `translate3d(…) scale(x,1)` resolving to `none`).
  - Keyboard: ArrowRight/ArrowDown go to the next option and ArrowLeft/ArrowUp to the previous one, both wrapping. Home and End jump to the first and last. Each key selects and focuses.
  - Focus-visible: `outline-2 outline-offset-2 outline-white`.
  - The wrapper has `MotionConfig reducedMotion="user"`.
- Followed by a separator. Its crosses sit at y 644 at 1440.

**Plan cards grid**
- `div.grid.grid-cols-1.gap-px.border-x-[1.5px].border-white/5.bg-white/5.md:grid-cols-2.xl:grid-cols-4`. The 1px gaps show the white/5 bg, which acts as the hairline dividers.
- Columns: 4 × 330.75px (1440), 4 × 290.75 (1280), 2 × 342.5 (768), 1 × 340 (390).
- Each card is an `<article aria-labelledby="plan-{id}-name">`:
  - Classes: `relative row-span-4 grid grid-rows-subgrid gap-y-6 bg-primary-black px-4 py-8 md:px-6`. Padding 32/24 (md+) or 32/16 (<md). Row gap 24.
  - The **subgrid** aligns header, price, CTA and features rows across the cards in the same grid row.
  - Card heights: 583 at 1440 and 1280 (all four). At 768: 575 (row 1) and 559 (row 2). At 390: 415 / 575 / 559 / 456.
- Card rows:
  1. `<header class="flex flex-col gap-2">`
     - Row `flex flex-wrap items-center justify-between gap-x-3 gap-y-2` holds `h3#plan-{id}-name` (`word-spacing-3 font-display text-2xl leading-[120%] font-semibold`, i.e. clashDisplay 600, 24px/28.8px, ws 3px, white). The Pro card adds an Eyebrow with no icon, text **"RECOMMENDED"** (107×24 at 1440).
     - Tagline `p.leading-[140%].text-white/60`: 16px/22.4px.
  2. Price block `flex flex-col gap-2`. When there is no sub-line it also gets `max-md:pb-5`.
     - `p.flex.items-center.font-display.font-semibold.text-white.md:h-12` (48px tall at md+).
     - Amount span: `text-5xl leading-none tabular-nums motion-safe:animate-fade-in`, i.e. clashDisplay 600 **48px/48px**. It is keyed by amount, so it remounts and re-runs `fade-in` (**0.18s ease-out both**, opacity 0→1) whenever the period changes.
     - Custom: `text-2xl leading-[120%] md:text-[28px]` (28px/33.6px at md+, 24px below).
     - Sub-line `p.min-h-10.text-sm.leading-5.text-white/60`: 14/20, min-height 40. It uses `motion-safe:animate-fade-in` and is keyed by text.
     - For Free and Enterprise the sub-line is empty, `aria-hidden`, and `max-md:hidden`.
  3. CTA row `div.flex.items-center`:
     - Free and Basic: Outline link, full width.
     - Pro: Primary large link, full width (64 tall).
     - Enterprise: Outline `<button>` ContactButton.
     - All use `max-md:text-base`.
  4. Features `div.flex.flex-col.gap-4`:
     - Optional `p.text-sm.leading-5.text-white/60`: "Everything in {Prev}, plus:".
     - `<ul class="flex flex-col gap-3">` items: `li.flex.gap-2.5.leading-6.text-white/80` (16/24). Each has a **check icon** (`check.svg`, viewBox 25×24, fill currentColor) at `mt-0.5 size-5 shrink-0 text-white/60` (20×20).
- **Pro card highlight** (recommended):
  - Background: `linear-gradient(180deg, rgba(81,118,254,.10) 0%, rgba(3,2,11,0) 55%), linear-gradient(#03020B,#03020B)`.
  - Gradient border via `::before`:
    - Geometry: `pointer-events-none absolute -inset-px p-px content-['']`.
    - Fill: `background: linear-gradient(96.18deg, rgba(81,118,254,.75) 7.9%, rgba(155,174,242,.5) 64.2%, rgba(81,118,254,.1) 118.37%)`.
    - Mask: `mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)`. This leaves a 1px ring that overlaps the grid hairlines.

**Card copy and data** (the prices are `plans` data in the bundle):

| plan | tagline | annual price (default) | monthly price | sub-line annual | sub-line monthly | CTA | features header | features |
|---|---|---|---|---|---|---|---|---|
| **Free** | For individuals | $0 | $0 | (none) | (none) | Get started → https://app.usevault.ai/login | (none) | 200 transactions per month · Manual entry and CSV import · Up to 3 seats |
| **Basic** | For small teams | **$25** | **$30** | per seat / month, billed annually | per seat / month | Get started → app login | Everything in Free, plus: | 800 transactions per month · 2 bank connections · No seat limit · Flexible user access settings · Payment calendar and Cashflow reports |
| **Pro** (RECOMMENDED) | For growing teams | **$42** | **$50** | per seat / month, billed annually | per seat / month | Start free trial (primary + arrow) → app login | Everything in Basic, plus: | 1,500 transactions per month · 10 bank connections · Crypto wallets · P&L and custom reports · Priority support |
| **Enterprise** | For larger companies | Custom | Custom | (none) | (none) | Contact us (button → Intercom/mailto) | Everything in Pro, plus: | Custom transaction volume · Custom number of bank connections · More frequent balance refresh on integrations |

1440 geometry, from the Free card at x 57 (each later card is offset by 331 / 332):
- h3 y 682.
- Tagline y 719.
- Price span y 765, 48 tall. Sub-line y 821.
- CTA y 889, 283×56. The Pro CTA is at y 885, 64 tall, with the chip at x 939.
- Features header y 973.
- `<ul>` y 973 (Free) or 1009 (others), rows every 36px (24 + 12 gap).

### P2. Compare plans (`<section aria-labelledby="compare-heading">`)
- Heading block (§0.5): **"Compare plans"** (`h2#compare-heading`). Box 431×64 at 1440. Then a separator.
- Body frame: `border-x-[1.5px] border-white/5 pb-10 md:pb-12 lg:pb-16`.
- **Mobile plan selector** (<768 only):
  - `div.sticky.top-0.z-20.border-b.border-white/5.bg-primary-black.px-3.py-3.md:hidden`, 71px tall. It stays stuck at top 0 while the table scrolls.
  - Inside: `SegmentedControl` size small, full width, `aria-label="Plan to compare"`, options Free / Basic / Pro / Enterprise. **Default is Pro.**
  - Buttons: `flex-1 gap-2 px-3 py-2 text-sm leading-5`, 36 tall, with the same sliding white pill (0.3s easeOut).
- **Table**:
  - `<table class="w-full table-auto border-collapse text-left md:table-fixed">` with `<caption class="sr-only">Compare plans</caption>`.
  - **thead**:
    - First `th` is empty (sr-only "Feature"). Width: `w-[58%] md:w-[32%] lg:w-[36%]`.
    - Plan `th`s: `bg-primary-black px-2 py-4 md:py-5 text-center font-display text-lg leading-6 lg:text-xl font-semibold text-white` (18/24, or 20/24 at lg).
    - At md+ all header cells are `md:sticky md:top-0 md:z-10` with `box-shadow: inset 0 -1px 0 rgba(255,255,255,.05)`. Verified: they stick at viewport y=0 while scrolling the table.
    - Header row height is 64 at 1440. Column widths at 1440: 477 / 212 / 212 / 212 / 212.
  - **Pro column** (th and every td) has `bg-[#080710]` at every width.
  - Below md, columns other than the selected plan get `max-md:hidden`. Example at 390 with Free selected: widths 197 / 143.
  - **Group header rows**: `<th scope="colgroup" colSpan=5>`, `px-3 md:px-6 pt-8 pb-3`, Outfit 11px/16px, 500, tracking .05em, uppercase, white/40. Height 61.
  - **Data rows** `tr.border-t.border-white/5`:
    - Row `th` (`scope="row"`): `px-3 md:px-6 py-4 text-left align-middle text-sm leading-5 lg:text-base lg:leading-6 font-normal text-white/80`.
    - `td`: `px-2 py-4 text-center align-middle text-sm leading-5 lg:text-base lg:leading-6 text-white/80 tabular-nums`.
    - Row heights are 57 (text) or 59 (icon) at 1440.
  - **Cell kinds**:
    - Included: `check.svg` at `mx-auto block size-5 text-white` (20px, **white**) plus sr-only "Included".
    - Excluded: `<span aria-hidden class="text-white/30">—</span>` (em dash) plus sr-only "Not included".
    - Number: formatted with a thousands separator (1,500).
    - Text values: Custom, Standard, More frequent, No limit, "Up to 3".
- Rows (Free | Basic | Pro | Enterprise):

| group | row | Free | Basic | Pro | Enterprise |
|---|---|---|---|---|---|
| USAGE | Transactions per month | 200 | 800 | 1,500 | Custom |
| | Manual entry & CSV import | ✓ | ✓ | ✓ | ✓ |
| INTEGRATIONS | Bank connections | — | 2 | 10 | Custom |
| | Crypto wallets | — | — | ✓ | ✓ |
| | Balance refresh | Standard | Standard | Standard | More frequent |
| REPORTS | Payment calendar | — | ✓ | ✓ | ✓ |
| | Cashflow | — | ✓ | ✓ | ✓ |
| | P&L | — | — | ✓ | ✓ |
| | Custom reports | — | — | ✓ | ✓ |
| TEAM & ACCESS | Seats | Up to 3 | No limit | No limit | No limit |
| | Flexible user access settings | — | ✓ | ✓ | ✓ |
| SUPPORT | Priority support | — | — | ✓ | ✓ |

(Group labels in source case: Usage, Integrations, Reports, Team & access, Support.)

Table height: 1064 (1440/1280), 1040 (768), 1032 (390, plus the 71px sticky selector above it).

### P3. FAQ (`<section aria-labelledby="faq-heading">`)
Heading **"Frequently asked questions"** (809×64 at 1440, 505×36 at 768, 308×72 at 390). Then a separator, then the accordion (§0.9). Items in order:

1. `faq-trial`: **What happens after the free trial?**
   - "After one month, you choose Free or Basic, or keep Pro. We ask for card details at that point."
2. `faq-noBank`: **Can I use Vault without connecting a bank?**
   - "Yes. On every plan you can add transactions manually or import them from CSV. Bank connections are available from Basic, crypto wallets from Pro."
3. `faq-annual`: **How does annual billing work?**
   - "You pay for 12 months upfront at a lower monthly rate, about 2 months free."
4. `faq-switching`: **Switching from another finance tool?**
   - "Choose an annual plan, and we deduct the cost of the months left on your current subscription from your first invoice. See the [migration offer](/migration-offer)."
   - The link is a Next `<Link>` with inline-action style (§0.8).
5. `faq-customPlans`: **Do you offer custom plans?**
   - "Yes. Enterprise plans can have custom transaction volumes and bank connection limits. [Contact us]."
   - "Contact us" is an inline ContactButton `<button>`.

The answer `<p>` is 800px wide at 1440 and 1280 (`max-w-[800px]`) and full width below that.

### P4. "Gain Clarity on your Finances": same as home §8, with these differences
- Same markup, Lottie (`/lottie/process-steps/gain-clarity-on-your-finances.lottie`, autoplay false, loop false), step copy, CTA "Get started" → app login, step logic and the trailing spacer (`h-24 lg:h-50`, hidden at md).
- **Difference:** the wrapper `div.flex.w-full.flex-col.items-center.lg:scroll-mb-30` has **no `id="how-it-works"`** on this page.
- Measured at 1440: section y 3241, h 914. Heading frame 312 (h2 488×128). Row 400 (canvas 663×400 at x 720). Spacer 200.
- At 1280 the canvas is 583×400. At 768 it is 686×411 on top. At 390 it is 340×238.

### Pricing: responsive deltas
| item | 1440 | 1280 | 768 | 390 |
|---|---|---|---|---|
| hero padding top/bottom | 120/64 | 120/64 | 112/56 | 96/48 |
| h1 | 56/64, 2 lines | same | 48/52.8, 2 lines | 32/38.4, 3 lines |
| sub | 16/26 | 16/26 | 16/26 | 14/20 |
| toggle | 296×52 | 296×52 | 296×52 | 220×46 |
| cards | 4 cols × 331 | 4 × 291 | 2 × 343 | 1 × 340 |
| card padding x | 24 | 24 | 24 | 16 |
| CTA text | 18px | 18px | 18px | 16px |
| price sub-line (Free/Enterprise) | blank 40px | blank | blank | hidden; price block gets pb-5 |
| section h2 | 48/64 | 48/64 | 30/36 | 30/36 |
| compare | 5 cols, sticky thead | same | 5 cols, sticky thead | sticky plan selector + 2 cols |
| table text | 16/24 | 16/24 | 14/20 | 14/20 |
| FAQ button padding | 24/34 | 24/34 | 24/34 | 20/16 |

### Pricing: hover/interaction inventory
| element | state change | timing |
|---|---|---|
| Billing toggle unchecked option | white/60 → #fff | 300ms cubic-bezier(.4,0,.2,1) |
| Billing toggle selection | white pill slides (Framer layoutId); label colors swap; badge bg/color swap | pill 0.3s easeOut; colors 300ms |
| Price numbers / sub-line on period change | remount + `fade-in` opacity 0→1 | 0.18s ease-out |
| Compare plan selector (<md) | same as billing toggle; shows only the selected plan column | instant column swap |
| FAQ question hover | chevron white/50 → #fff | 300ms |
| FAQ open/close | grid-rows 0fr↔1fr; chevron rotate 90°↔−90° | 300ms ease-out / 300ms standard |
| Inline links/buttons in answers | underline color white/40 → #fff | 300ms |
| CTAs (outline, primary) | none | – |
| Nav/footer | as home | – |

---

## 2. `/migration-offer`

**`<title>Migration offer | Vault AI</title>`**
- `meta description` / `og:description` / `twitter:description`: "Switching from another finance tool? Choose an annual Vault plan, and we deduct the cost of the months left on your current subscription, up to six, from your first invoice."
- `og:title` / `twitter:title`: "Migration offer | Vault AI".
- `og:url` and canonical: https://www.usevault.ai/migration-offer.
- hreflang: en → /migration-offer, ru → /ru/migration-offer, uk → /ua/migration-offer, x-default → /migration-offer.
- The other meta tags (og image, site name, theme color, twitter card) are identical to `/pricing`.

Document height: **4806** (1440 and 1280), **5270** (768), **5688** (390).

DOM order:
1. Nav (§0.2, no active item).
2. Full separator.
3. **M1 Split hero**.
4. Separator.
5. **M2 "You don't pay for two tools at once"** (text + timeline chart).
6. Separator.
7. **M3 "The offer applies if"** (conditions list).
8. Separator.
9. **M4 FAQ**.
10. Separator.
11. **M5 "How it works"** (visual steps), which ends with its own separator, spacer and separator.
12. Footer.

| block | 1440 | 1280 | 768 | 390 |
|---|---|---|---|---|
| M1 hero | 121/720 | 121/720 | 77/998 | 57/977 |
| M2 offer | 842/793 | 842/793 | 1076/892 | 1035/1064 |
| M3 conditions | 1636/901 | 1636/901 | 1969/889 | 2100/989 |
| M4 FAQ | 2538/780 | 2538/780 | 2859/712 | 3090/765 |
| M5 how it works (incl. spacer) | 3319/1010 | 3319/1010 | 3572/1169 | 3856/1137 |
| footer | 4330/476 | 4330/476 | 4742/528 | 4994/694 |

### M1. Split hero (`SplitHero`)
- Frame: `relative flex flex-col overflow-hidden border-x-[1.5px] border-white/5 lg:min-h-[720px] lg:flex-row`. Height 720 at lg; it stacks below lg.
- **Left text column**:
  - Classes: `relative z-10 flex flex-col items-start gap-8 px-4 pt-24 md:px-6 md:pt-28 lg:w-[62%] lg:shrink-0 lg:pt-34 xl:pl-14`.
  - Padding top 136 (lg) / 112 (md) / 96. Left padding 56 at xl, so text starts at x 113 at 1440. Width 62% at lg.
  - Inner `flex flex-col items-start gap-4 md:gap-6` (left-aligned):
    1. Eyebrow with zap: **"MIGRATION OFFER"**.
    2. **h1** (§0.7 sizes, left-aligned): `<span class="lg:block">Switch to Vault</span> <span class="lg:block">without paying twice</span>`.
       - Two forced lines at lg (613×128 at 1440, y 305). Natural wrap below lg (638×106 at 768; 308×115 at 390).
    3. Sub `p` (300 weight, 16/26 at md+ with `md:max-w-[500px]`, 14/20 below):
       - Block 1: "Already paying for a similar finance tool?"
       - Block 2: "Choose an annual Vault plan, and we'll deduct the cost of the months left on your current subscription from your first invoice."
  - **CTA** (gap 32 below the stack): Primary large ContactButton **"Talk to us"** + arrow chip. 170×64, at x 113, y 567 (1440). Placement `migration_hero`.
- **Right scene column** (`aria-hidden`):
  - Classes: `relative flex items-center justify-center px-4 pt-12 pb-16 md:px-6 lg:flex-1 lg:py-16 lg:pr-6 lg:pl-0`.
  - Background layers, both absolutely centered with `-translate-1/2` and `pointer-events-none`:
    - Glow: `h-[660px] w-[460px] rounded-full bg-radial-[closest-side] from-accent/20 to-transparent blur-xl`. Computed: `radial-gradient(closest-side, rgba(81,118,254,.2) 0%, transparent 100%)`, `filter: blur(24px)`. At 1440: x 901, y 151, 460×660.
    - Dot grid: DotGridPanel (§0.10), `h-[700px] w-[520px]`, `mask-image: radial-gradient(closest-side, black 35%, transparent)`. At 1440: 520×700.
  - **Scene** (`motion.div`, reveal amount .3, `flex w-full flex-col items-center`), from top to bottom:
    1. **Card 1** (`motion.div w-full max-w-80`, so 320 wide). MockCard containing:
       - Row `flex items-center gap-2.5`:
         - IconDisc md with `receipt.svg` at `size-4 text-white/60`.
         - Column: "Current subscription" (`text-sm leading-5 font-medium`, 14/20) over "$45 / month" (`text-white/50 tabular-nums`, 12/18).
       - MockDivider `my-3.5`.
       - Row `flex items-baseline justify-between gap-3`: "4 months left" (`font-medium`) and "4 × $45 = $180" (`whitespace-nowrap text-white/60 tabular-nums`).
    2. **FlowConnector**: `relative z-10 flex justify-center`.
       - Line `motion.div relative h-[88px] w-px origin-top bg-white/20`. It has two end dots `absolute size-2 rounded-full border border-white/40 bg-primary-black`, at `-top-1` and `-bottom-1`, centered with `left-1/2 -translate-x-1/2`.
       - Centered label: MockPill lg tone surface **"Cost deducted"** (`h-[26px] px-3 text-xs border border-accent/50 bg-[#080710]`).
    3. **Card 2** (`motion.div w-full max-w-85`, so 340 wide). MockCard containing:
       - Row `flex items-center gap-2`: `vault-mark.svg` at `h-3.5 w-4 text-white`, then "Vault Pro" (14/20, 500), then a MockPill sm "Annual" with `ml-auto`.
       - MockLabel `mt-3.5` "First invoice".
       - `div.mt-2.flex.flex-col.gap-1.5` containing:
         - MockRow "Annual plan" / "$504".
         - A `div.relative` with an absolutely positioned highlight (`motion.span absolute inset-0 rounded-lg border border-accent/35 bg-accent/10`) under MockRow `relative text-white`: "Cost of 4 months deducted" / `<span class="font-medium text-accent-soft">−$180</span>`. The minus sign is U+2212.
         - MockDivider `my-1`.
         - Total row `flex items-center justify-between gap-3 px-2.5 pt-1 pb-0.5 font-medium`: "Total due" and `span.relative.tabular-nums` holding "$504" (block) with "$324" absolutely positioned over it at `top-0 right-0`.
  - Data (computed in the bundle): the competitor charges $45/month with 4 months left. Pro annual = 12 × $42 = **$504**. Deducted = min(45×4, 504/12×6 = 252) = **$180**. First invoice = **$324**.
- **Hero motion** (Framer, `whileInView` once, amount .3; it plays on load because the hero is in view). Times are measured from the moment the scene enters view.

| element | from → to | duration / ease | delay |
|---|---|---|---|
| Card 1 | opacity 0 → 1; y 12 → 0 | opacity .4s easeOut; y .5s EASE_OUT_EXPO | 0.4s |
| Connector line | scaleY 0 → 1 (origin top) | .45s EASE_OUT_EXPO | 1.2s |
| "Cost deducted" pill | opacity 0, scale .9 → 1, 1 | .3s easeOut | 1.4s |
| Card 2 | opacity 0 → 1; y 12 → 0 | .4s easeOut / .5s EXPO | 1.6s |
| Deduction row highlight bg | opacity 0 → 1 | .3s easeOut | 2.2s |
| Total "$504" | opacity 1 → 0 | .3s easeOut | 2.4s |
| Total "$324" | opacity 0 → 1 | .3s easeOut | 2.4s |

  Live sampling confirmed the order and spacing: card 1 rose over about 0.4s, the line drew about 0.8s later, then the pill, card 2, the highlight and the total cross-fade. The whole sequence ends at about 2.7s.
- Layout below lg: the text comes first, then the scene with `pt-12 pb-16` (48/64), centered.
  - At 768 the frame is 998 tall, the CTA at y 477, and the "First invoice" label at y 847.
  - At 390 the frame is 977 tall, the CTA at y 436, and card 2's "First invoice" label at x 58, width 274.

### M2. Offer explanation (`<section aria-labelledby="offer-heading">`)
- Heading (§0.5): `<span class="lg:block">You don't pay for</span> <span class="lg:block">two tools at once</span>`.
  - Uppercase on screen. 2 forced lines at lg (542×128). At 768 it is 654×72 (2 lines by wrap). At 390 it is 308×108 (3 lines).
- Then a separator, then the body grid `grid border-x-[1.5px] border-white/5 lg:grid-cols-2` (2 × 663 at 1440, 2 × 583 at 1280).
- **Text cell**:
  - Classes: `order-last lg:order-first flex flex-col justify-center gap-4 px-3 pt-8 pb-12 md:px-6 lg:py-12 xl:px-14`. It sits **below the chart under lg**.
  - Two `p.max-w-[500px].leading-[26px].text-white/60` (16/26):
    1. "Companies often put off switching not because of the product, but because they're still paying for another tool. So we take the cost of that overlap off your first year."
    2. "You choose an annual Vault plan, and the cost of the months left on your current subscription, up to six, is deducted from your first invoice. You start working in Vault right away, and the money you've already paid isn't wasted."
- **Chart cell**:
  - DotGridPanel with `flex items-center justify-center border-b border-white/5 px-3 py-8 md:px-6 lg:min-h-[480px] lg:border-b-0 lg:p-12`. Height 480 at lg.
  - Inside: `<figure class="w-full max-w-[560px]">` (560×356 at 1440; 487 wide at 1280; 316×398 at 390). It wraps a MockCard with `lg:p-6`.
  - `aria-label`: "Current tool paid for months 1 to 4. Vault annual plan: the cost of months 1 to 4 is deducted, months 5 to 12 are paid as usual."
  - Contents, top to bottom:
    1. `figcaption.text-sm.leading-5.font-medium`: "Example: 4 months left on your current subscription".
    2. MockDivider `mt-4 mb-[18px]`.
    3. Chart area `div.relative` (`aria-hidden`):
       - Dashed divider overlay: `absolute inset-x-0 -inset-y-1 grid grid-cols-12 gap-x-1 lg:gap-x-1.5`. Its child spans `grid-column: 1 / span 4` with `-mr-0.5 lg:-mr-[3px] border-r border-dashed border-white/20`.
       - Month ruler `mb-3.5 grid grid-cols-12 gap-x-1 lg:gap-x-1.5`:
         - Each item is `flex flex-col items-center gap-1 text-[11px] leading-[14px] text-white/40 tabular-nums`: a number (`min-h-[14px]`) over a tick (`h-1 w-px bg-white/20`).
         - Numbers 1–12. Below lg only 1, 4, 8 and 12 are visible; the others are `max-lg:invisible`.
       - `p.mb-2.text-white/80` "Current tool".
       - Bar row `mb-[18px] grid grid-cols-12 gap-x-1 lg:gap-x-1.5` holding one bar at `grid-column: 1 / span 4`:
         - Shape: `relative h-6 lg:h-7 origin-left rounded-md border border-white/20 bg-clip-padding`.
         - Fill: `background: repeating-linear-gradient(135deg, rgba(255,255,255,.18) 0 1px, transparent 1px 6px)` (hatched).
       - `p.mb-2.text-white/80` "Vault, annual plan".
       - Bar row holding:
         - "Deducted" bar (`1 / span 4`): `border-accent/75 bg-accent/20`.
         - "Paid" bar (`5 / -1`): `border-white/10 bg-white/5`.
       - Bars are 24 tall (<lg) or 28 tall (lg), with radius 6px.
    4. Legend `ul.mt-[18px].flex.flex-wrap.gap-x-5.gap-y-2.text-white/80`. Each item is `li.flex.items-center.gap-2` with a swatch (`h-3 w-6 shrink-0 rounded-sm border`) styled like its bar:
       - "Your current subscription" (hatched).
       - "Cost deducted" (accent).
       - "Paid as usual" (white/5).
    5. MockDivider `mt-[18px] mb-3.5`.
    6. `p.leading-5.text-white/60` (12/20): "The cost of the overlapping months comes off your first invoice."
- **Motion** (reveal on the figure, amount .2, once):
  - Figure: opacity 0 → 1, y 8 → 0, .3s easeOut.
  - Bars: scaleX 0 → 1 (origin-left), EASE_OUT_EXPO:
    - Current-tool bar: delay .2s, duration .7s.
    - Vault deducted bar: delay .6s, duration .6s.
    - Vault paid bar: delay 1.0s, duration .9s.
  - Dashed divider: opacity 0 → 1, .3s easeOut, delay 1.3s.
  - Verified live: the bars filled in sequence and the dash appeared at about 1.6s after the figure started.

### M3. Conditions (`<section aria-labelledby="conditions-heading">`)
- Heading (§0.5): **"The offer applies if"** (548×64 at 1440, 341×36 at 768). Then a separator.
- Frame: `relative overflow-hidden border-x-[1.5px] border-white/5`.
  - Glow (`aria-hidden`):
    - Geometry: `pointer-events-none absolute -top-[40%] -right-[10%] h-[140%] w-[120%] lg:w-[70%] rounded-full blur-xl`.
    - Fill: `radial-gradient(closest-side, rgba(81,118,254,.2) 0%, rgba(81,118,254,.1) 50%, transparent 100%)`. Filter `blur(24px)`. Measured 928×913 at 1440.
- List: `ul.relative.flex.flex-col.divide-y.divide-white/5.py-2.lg:py-6`.
- Each `li`:
  - Classes: `grid items-center gap-x-4 gap-y-3 px-4 py-6 md:px-6 lg:gap-x-6 lg:py-8 xl:px-14`.
  - Columns: `grid-cols-[44px_minmax(0,1fr)]` below lg; `lg:grid-cols-[72px_minmax(0,0.9fr)_minmax(0,1.3fr)]` at lg.
  - Rows are about 121px apart at 1440. Measured columns at 1440: icon at x 113, h3 at x 209 (448 wide), p at x 681 (646 wide).
- Cell contents:
  - **Icon**: `svg size-11 lg:size-14` (44 / 56). viewBox 56. It has a background rect (`x=.5 y=.5 w=55 h=55 rx=14`, fill accent at 10% opacity, stroke white/5) and a `g transform="translate(14.8 14.8) scale(1.1)"` holding the glyph paths. The files are `condition-*.svg`.
  - **h3**: `word-spacing-3 font-display text-xl leading-7 lg:text-2xl lg:leading-[120%] font-semibold text-white`. 24/28.8 at lg, 20/28 below.
  - **p**: `col-span-2 lg:col-span-1 leading-6 text-pretty text-white/60` (16/24). Below lg it wraps under the icon and title row.
- Items:

| icon file | h3 | p |
|---|---|---|
| condition-new-customers.svg | New customers | You're new to Vault. |
| condition-annual-plan.svg | Annual Basic or Pro | You choose Basic or Pro with annual billing. |
| condition-active-subscription.svg | Active subscription | You have an active paid subscription to a similar finance tool and can show an invoice or receipt. |
| condition-up-to-six-months.svg | Up to six months | We deduct the cost of up to six remaining months, and no more than the cost of six months of your Vault plan. |
| condition-deadline.svg | Until 31 December 2026 | You sign your annual plan by 31 December 2026. |

- **Icon motion** (each svg is a `motion.svg` with reveal amount .6, once):
  - Animated paths start at delay `0.25 + 0.09 × n`.
  - Kinds:
    - `pop`: scale 0 → 1 and opacity 0 → 1, .7s EXPO.
    - `fade`: opacity 0 → 1, .26s easeOut.
    - `rise`: scaleY 0 → 1 from the bottom (originY 1), .7s EXPO.
    - `slideY`: y −5 → 0 and opacity 0 → 1, .7s EXPO.
    - `draw`: pathLength 0 → 1, .8s EXPO.
  - Each path uses `transform-box: fill-box; transform-origin: 50% 50%`, or 50% 100% for `rise`.
  - Per icon:
    - New customers: the sparkle path (accent-soft) pops at n=0.
    - Annual plan: the front document (accent-soft) slides in with slideY.
    - Active subscription: the circle (accent-soft) pops, and the check stroke (#03020B) draws with n=4, i.e. a .61s delay.
    - Up to six months: the first 6 ring segments (accent-soft) fade with n=0…5, i.e. delays .25, .34, .43, .52, .61, .70s. The other 6 segments are static `fill-accent/50`.
    - Deadline: the hourglass sand (accent-soft) rises.
  - Static fills: body #5176FE, accent-soft #9BAEF2, mute rgba(81,118,254,.5). Line strokes are 1.5px with round caps.

### M4. FAQ (`<section aria-labelledby="faq-heading">`)
Same component as §0.9 and P3. Heading "Frequently asked questions". Items:

1. `faq-tools`: **Which tools count?**
   - "Paid finance management, accounting and reporting tools similar to Vault. If you're not sure, [ask us in the chat]."
   - "ask us in the chat" is an inline ContactButton `<button>` (placement `migration_faq`).
2. `faq-amount`: **How is the amount calculated?** This answer has three paragraphs (`gap-3`):
   - "We multiply the monthly price of your current subscription by the months left on it, up to six. For example, with Vault Pro on annual billing ($504 per user):"
   - "$45 a month, 4 months left: we deduct $180, and your first invoice is $324."
   - "$100 a month, 6 months left: that's $600, but we deduct no more than the cost of six months of Vault Pro, $252, so your first invoice is $252."
3. `faq-costsMore`: **What if my current subscription costs more than Vault?**
   - "We deduct up to the cost of six months of your Vault plan, so your first invoice is never less than half of the annual price."
4. `faq-moreThanSix`: **What if more than six months are left?**
   - "We deduct the cost of six of them."
5. `faq-trial`: **Can I try Vault first?**
   - "Yes. Every new workspace gets a one-month Pro trial. Use the offer when you move to an annual plan."
6. `faq-monthlyBilling`: **Does it work with monthly billing?**
   - "No, the offer is for annual plans only."
7. `faq-moveData`: **How do I move my data?**
   - "Export your transactions as CSV and import them into Vault. You match columns, categories and attributes on one screen, so nothing is retyped by hand. If you need help, we'll go through it with you on a call, so you won't be left to figure it out alone."

### M5. How it works (`VisualSteps`, `<section aria-labelledby="steps-heading">`)
This is a different component from home §8: no Lottie, a CSS-transition number box, and DOM mock visuals.

- Heading (§0.5): **"How it works"** (386×64 at 1440). Then a separator.
- Row: `flex flex-col border-x-[1.5px] border-white/5 lg:flex-row-reverse`. Height 560 at 1440.
  - **Visual panel** (right at lg, top below lg):
    - DotGridPanel, `flex items-center justify-center border-b border-white/5 px-3 py-8 md:px-6 lg:min-h-[560px] lg:w-1/2 lg:shrink-0 lg:border-b-0 lg:p-12`.
    - Inner stage: `pointer-events-none relative h-[380px] w-full max-w-[440px] lg:h-[400px]` (`aria-hidden`).
    - It holds 4 stacked `motion.div absolute inset-0 flex items-center justify-center` panes, one per step.
  - **Text column**:
    - Classes: `flex flex-col items-start justify-center gap-8 px-3 pt-8 pb-12 md:px-6 lg:flex-1 lg:py-14 xl:px-14`. Text x 113 at 1440.
    - `<ol class="flex w-full flex-col gap-5">`. Each `li.relative.flex.flex-col` contains:
      - `<h3><button aria-pressed>`.
        - Button classes: `flex cursor-pointer items-center gap-[18px] xl:gap-7 text-left`. Focus-visible: 2px white outline, offset 2.
        - **Number box** `span`:
          - Classes: `relative flex size-9 md:size-[42px] xl:size-10 shrink-0 items-center justify-center border text-sm md:text-base xl:text-xl font-bold transition-colors duration-300`.
          - Number: Outfit 700, 14 / 16 / 20px.
          - Corner ticks as on home: `absolute -top-px -left-px size-[5px] md:size-1.5 border-t border-l border-[#EDEDFA]`, mirrored at bottom-right.
          - **Active** (`aria-pressed=true`): `border-white bg-white text-primary-black` (#fff bg, #03020B text).
          - **Inactive**: `border-white/10 bg-white/2 text-white` (bg rgba(255,255,255,.02)).
          - The color change is a CSS transition, 300ms cubic-bezier(.4,0,.2,1).
        - Title: `word-spacing-2 font-display text-xl leading-7 md:leading-6 font-semibold text-white` (20px/24px at md+).
      - Description wrapper: `grid transition-[grid-template-rows] duration-300 ease-out`, `grid-rows-[1fr]` for the current index and `[0fr]` otherwise.
        - Inner `div.min-h-0.overflow-hidden` holding `p.max-w-[460px].pt-1.5.pl-[54px].md:pl-[60px].xl:pl-[68px].text-sm.leading-[22px].lg:text-base.lg:leading-6.tracking-tight.text-pretty.text-white/60`.
        - **No opacity/y animation on the text**, unlike home.
      - Connector (every step except the last):
        - Track: `span absolute top-9 -bottom-5 left-[18px] md:top-[42px] md:left-[21px] xl:top-10 xl:left-5 w-px overflow-hidden bg-white/20`.
        - Fill (only while the step is active and auto-advancing): `motion.span absolute inset-0 origin-top bg-white`, scaleY 0 → 1, **linear, duration = stepDuration − 0.2 = 4.8s**. It is keyed by runId so it restarts.
    - Then the CTA: Primary small ContactButton **"Talk to us"** (149×56, placement `migration_steps`).
- **Step copy**:
  1. **Write to us**: "Tell us in the chat which tool you use, what it costs and when your subscription ends."
  2. **Show your subscription**: "Send the invoice or receipt for your current subscription. We review every request individually."
  3. **Get your annual invoice**: "Choose Basic or Pro with annual billing. The confirmed amount is already deducted from your first invoice."
  4. **Move your data**: "Import your transaction history and match fields, categories and attributes on the import screen. We'll help on a call if you need it."
- **Step logic** (verified live):
  - `stepDuration = 5s` for every step.
  - Auto-advance runs only while the row is ≥20% in view (IntersectionObserver amount .2, not once), the tab is visible (`visibilitychange`), and reduced motion is off. A `setTimeout(5000)` then sets `index = (index+1) % 4` and increments runId. It **loops**: step 4 returns to step 1.
  - Highlight (`aria-pressed`) only starts after the row has been seen once (amount .2, once). Before that no box is filled, but step 1's description is open.
  - Clicking a step sets index, runId+1 and `chosen=true`, which restarts the 5s timer from that step. Verified: after clicking step 4, the pressed pattern was `0001`.
  - Reduced motion: no auto-advance. The visual shows step index 2 (`staticStep`) until the user clicks.
  - Live trace: the pressed index changed every about 5.0s, and the connector fill scaleY grew linearly at about 0.208 per second (1/4.8).
- **Visual pane transitions**:
  - Active pane: `{opacity:1, y:0}`. Others: `{opacity:0, y:10}`.
  - Transition: opacity .4s easeOut, y .5s EASE_OUT_EXPO, with `initial={false}`.
- **Visual panes**. Each is a MockCard. Text is 12/18 unless noted.
  1. **Chat** (`max-w-90`, 360):
     - Header `flex items-center justify-between gap-3`:
       - Left: `vault-mark.svg` (h-3.5 w-4) and "Vault team" (14/20, 500).
       - Right: MockPill sm holding a `size-1.5 rounded-full bg-accent` dot and "Online".
     - MockDivider `my-3.5`.
     - `div.flex.flex-col.gap-2.5.leading-5` holding two bubbles:
       - User bubble `p.max-w-[82%].self-end.rounded-xl.rounded-br-sm.bg-white/8.px-3.py-2.5`: "We use another finance tool, and our subscription ends in four months."
       - Vault row `flex max-w-[86%] items-end gap-2 self-start`:
         - IconDisc sm with vault-mark at `h-2.5 w-3`.
         - Bubble `p.rounded-xl.rounded-bl-sm.border.border-white/10.px-3.py-2.5.text-white/80`: "Thanks! Send us the invoice, and we'll deduct the cost of those months from your first annual invoice."
     - Composer `mt-3.5 flex items-center gap-2 rounded-full border border-white/10 py-2 pr-2 pl-3`:
       - Skeleton `h-2 flex-1 bg-white/8`.
       - Send chip `flex size-6 items-center justify-center rounded-full bg-white text-primary-black` holding `arrow-right.svg` at `size-3` with the path stroke set to currentColor.
  2. **Upload** (`max-w-90`):
     - MockLabel "Current subscription".
     - File row `mt-2.5 flex items-center gap-3 rounded-lg border border-white/10 bg-white/2 p-3`:
       - PDF tile `flex h-11 w-9 shrink-0 items-end justify-center rounded-md border border-white/20 pb-1.5 text-[11px] leading-4 font-semibold text-white/60` with text "PDF".
       - Column: "invoice.pdf" over "Subscription invoice" (white/50).
       - Status slot `relative flex h-6 min-w-24 justify-end` holding two `motion.span absolute right-0`:
         - MockPill md neutral "Attached".
         - MockPill md accent with `check.svg` at size-3 and "Reviewed".
       - When this pane becomes active, "Attached" fades out (opacity 1 → 0, **delay 1.4s, .25s easeOut**) and "Reviewed" fades in (**delay 1.6s, .3s easeOut**). On inactive panes the transition is instant. Verified live: Attached hid about 1.65s after the click and Reviewed showed at about 1.95s.
     - Skeletons `mt-3 flex flex-col gap-2`: widths 78% and 52%, both bg-white/8.
  3. **Invoice** (`max-w-85`, 340):
     - Header: vault-mark + "Vault Pro", with MockPill sm "Annual".
     - MockLabel `mt-3.5` "First invoice".
     - Rows `mt-2 flex flex-col gap-1.5`:
       - "Annual plan" with a skeleton `w-16 bg-white/20`.
       - Highlighted row "Cost of 4 months deducted" with `span.flex.items-center.gap-1.5.text-accent-soft` holding "−" and a skeleton `w-9 bg-accent/60`.
       - Divider `my-1`.
       - Total row `px-2.5 pt-1 pb-0.5`: "Total due" (500) and a skeleton `w-11 bg-white/40`.
  4. **Import** (`max-w-110 lg:p-5`, 440 wide, padding 20 at lg):
     - Header:
       - Left: IconDisc md with `upload.svg` (size-4 white/60), then "Import transactions" (14/20, 500) over "transactions.csv" (white/50).
       - Right: MockPill sm "CSV".
     - Divider `mt-4 mb-3.5`.
     - Header grid `grid grid-cols-[minmax(0,0.85fr)_14px_minmax(0,1.15fr)_16px] items-center gap-x-2 mb-2`: MockLabel "Column in file", empty, MockLabel "Field in Vault", empty.
     - 5 rows on the same grid (`flex flex-col gap-2`). Each row has:
       - Source cell: `truncate rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-white/80`.
       - `arrow-right.svg` at `size-3.5 text-white/40` (stroke currentColor).
       - Target cell: `flex min-w-0 items-center justify-between gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5`, holding a truncated label and `chevron-down-small.svg` (size-3 white/50).
       - `check.svg` at `size-4 text-white/60`.
     - Row pairs: Date→Date · Description→Counterparty · Amount→Amount · Type→Category · Project→Attribute · Project.
     - Divider `mt-4 mb-3.5`.
     - Footer `flex items-center justify-between gap-3`: "5 of 5 matched" (white/60) and an "Import" chip (`flex h-7 items-center rounded-full bg-white px-3.5 font-medium text-primary-black`).
- After the row come a separator, the spacer `h-24 lg:h-50` (96 / 200; it is visible at md too, 96 tall at 768) and a final separator. Unlike home, this spacer is **not** hidden at md.

### Migration-offer: responsive deltas
| item | 1440 | 1280 | 768 | 390 |
|---|---|---|---|---|
| hero | row, min-h 720, text 62% | same | stacked (998 tall) | stacked (977) |
| hero text pad top | 136 | 136 | 112 | 96 |
| hero h1 | 56/64 (2 forced lines) | same | 48/52.8 | 32/38.4 (3 lines) |
| hero CTA | 170×64 | same | same | same |
| offer grid | 2 cols (text left, chart right) | 2 × 583 | 1 col: chart, then text | 1 col |
| figure | 560 wide | 487 | 560 | 316 |
| month labels | all 12 | all 12 | 1/4/8/12 | 1/4/8/12 |
| conditions li | 3-col grid (72 / .9fr / 1.3fr) | same | icon+title row, text below | same |
| condition icon | 56 | 56 | 44 | 44 |
| condition h3 | 24/28.8 | 24/28.8 | 20/28 | 20/28 |
| steps | visual right 50%, text left | same | visual on top (stage 380 tall) | same |
| step box | 40, 20px | 40 | 42, 16px | 36, 14px |
| step description | 16/24, pl 68 | same | 14/22, pl 60 | 14/22, pl 54 |
| FAQ button padding | 24/34 | 24/34 | 24/34 | 20/16 |

### Migration-offer: hover/interaction inventory
| element | change | timing |
|---|---|---|
| FAQ items | as §0.9 (chevron hover, rotate, grid-rows) | 300ms |
| "ask us in the chat" inline button | underline white/40 → #fff; click opens Intercom or mailto | 300ms |
| Step number buttons | click selects the step; box colors swap | 300ms CSS |
| "Talk to us" (hero, steps) | no hover; click goes to Intercom or mailto | – |
| Hero scene | one-time reveal sequence (table above) | 0.4–2.7s |
| Offer chart | one-time bar fill on reveal | 0–1.6s |
| Condition icons | one-time glyph animation per icon at 60% in view | 0.25–1.4s |
| Steps | auto-advance loop every 5s, 4.8s linear connector fill, pane cross-fade | see M5 |

---

## 3. Motion summary: what is CSS vs Framer
- **CSS only:**
  - `fade-in` keyframes on prices (0.18s ease-out both).
  - All `transition-colors` (300/400ms, cubic-bezier(.4,0,.2,1)).
  - FAQ grid-rows (300ms ease-out) and chevron rotate (300ms).
  - Steps description grid-rows (300ms ease-out) and number box colors (300ms).
- **Framer Motion:**
  - Segmented-control pill (`layoutId`, 0.3s easeOut).
  - Hero scene, offer chart and condition icons (`whileInView` once).
  - VisualSteps pane cross-fade, connector fill, upload status swap.
- Every animation honours `prefers-reduced-motion`: `motion-reduce:transition-none`, Framer transitions with duration 0, and no auto-advance.
- **None of the following exist**: scroll-scrubbed effects on these routes (no `useScroll`), parallax, marquees, or hover transforms.

## 4. Not measurable / not cloned
- **Intercom messenger**, which "Contact us", "Talk to us" and "ask us in the chat" open: third-party, out of scope. Use the site's own fallback, `mailto:hello@usevault.ai`.
- **`/ru/*` and `/ua/*` localized copies**: not recorded.
- **P4 Lottie**: canvas-rendered, same file as home (see home §13).
- **dataLayer, Cloudflare and Facebook pixel tracking**: not replicated.

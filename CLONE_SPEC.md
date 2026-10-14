Source: https://www.usevault.ai/

# Vault AI: clone spec (home `/`)

Measured live on 2026-10-14 with Playwright (Chromium) at 1440, 1280, 768 and 390 px. All values below are computed styles or bounding boxes, not estimates. Assets are listed in `ASSET_MANIFEST.md` and stored in `public/assets/`. Reference screenshots: `recon/original-1440-full.png` and `recon/original-390-full.png`. Both were taken after scrolling past the statement section so that it is fully revealed. The chat bubble in them is Intercom (third-party); ignore it.

## 0. Stack detected on the original
- **Next.js (App Router, Turbopack) + Tailwind CSS v4**. Many class names below are v4 syntax; the translations to v3 are in section 0.3.
- **Framer Motion** (`window.MotionIsMounted`) is used for `motion.*`, `useScroll`, `useTransform` and `AnimatePresence`.
- **dotLottie** (`@lottiefiles/dotlottie-react`, dotlottie-web 0.71.0) renders every product animation to `<canvas>`. Animated visuals are therefore canvas Lottie, not DOM. Use `@lottiefiles/dotlottie-react` with the downloaded `.lottie` files.
- **zenscroll** (loaded lazily, `window.noZensmooth = true`, `setup(1000, 0)`) drives anchor smooth-scroll: 1000 ms, edge offset 0. `#automation`, `#reports` and `#security` scroll so the section is *centered* (`zenscroll.center`). `#product` uses `toY(top - scroll-margin-top)`. `#top` scrolls to 0. Native `scroll-behavior` is `auto`.
- **Not present:** GSAP, Lenis, Webflow IX2, AOS, Swiper, `<video>` elements, marquees and infinite CSS loops.
- next-intl i18n (EN / UA). `html lang="en"`, class `antialiased`.
- The page does not use `scroll-smooth`, sticky elements on desktop, or hover transforms.

### 0.1 Design tokens (from `:root`)
| token | value |
|---|---|
| --color-primary-black (page bg) | `#03020B` |
| --color-primary | `#7506A7` (used only for the Overcode badge hover) |
| --color-gray | `#BFBFBF` (footer copyright, social icons) |
| --color-accent | `#5176FE` (unused on home) |
| --color-accent-soft | `#9BAEF2` |
| --color-red | `#EE3D2C` |
| white alpha used | `white/5` = rgba(255,255,255,.05) for all hairlines/borders; `/8` pill bg; `/10` step box border; `/20` CTA border & slash; `/40` footer group labels; `/50` inactive tab & UA link; `/60` body copy; `/80` nav links |
| primary CTA text | `#090A11`; arrow chip bg `#05040C` |
| Overcode badge bg | `#25222C` |
| step corner ticks | `#EDEDFA` |
| --ease-out | cubic-bezier(0,0,.2,1) |
| default transition | 150ms cubic-bezier(.4,0,.2,1) |
| --blur-lg | 16px |
| body | bg `#03020B`, font Outfit 16px/24px; `<main>` text white |

Breakpoints: `sm` 40rem (640), `md` 768, `lg` 1024, `xl` 80rem (1280), `xxl` 1440 (custom), `2xl` 96rem. In tailwind.config.js add `screens: { xxl: '1440px' }`.

### 0.2 Global grid frame (repeated in every section)
- Content column: `w-full max-w-[1440px] px-6 md:px-10 lg:px-14` (24 / 40 / 56 px). Inside it is a frame with `border-x-[1.5px] border-white/5`, i.e. vertical hairlines at x=56 and x=1384 at 1440 px.
- **Horizontal separators**: between sections there is a full-bleed 1px row (`relative flex h-px w-full justify-center`), and it has two variants:
  - `bg-white/5` full-bleed line with **cross markers**: an inner `max-w-[1440px] px-[18px] md:px-[34px] lg:px-[50px] flex justify-between items-center` holding two `cross-plus-marker.svg` icons at 12×12, `relative z-[100]`. They sit centred on the frame corners (at 1440: x=50 and x=1378; at 1280: 50 and 1218; at 768: 34 and 722; at 390: 18 and 360).
  - "between-crosses-until-lg": `lg:bg-white/5` full bleed on lg+. Below lg the line is a `::before` inset to the frame (`inset-x-6 md:inset-x-10`, or `inset-x-[18px] md:inset-x-[34px]` when the row has crosses).
- Where the separators appear (1440 y-coords): 120 (after nav, with crosses), 1483 (after hero, with crosses), 2292, 3107, 3308, 3815, 4016, 4523, 4724, 5231, 5544 (crosses), 5945 (crosses), 6146 (crosses), 6559 (crosses).
- Feature cards and the step-number boxes also carry `+` markers or corner ticks (details below).

### 0.3 Tailwind v4 to v3 notes
Spacing is 4 px per unit, so `h-89` = 356px, `h-93` = 372px, `max-w-360` = 1440px, `max-w-276` = 1104px, `max-w-187.5` = 750px, `pt-36.5` = 146px, `pt-34` = 136px, `py-75` = 300px, `py-53` = 212px, `h-100` = 400px, `h-108` = 432px, `h-103` = 412px, `lg:gap-y-17.5` = 70px. In v3 these need arbitrary values (`h-[356px]`). `rounded-full` = 9999px. `bg-white/8` = rgba(255,255,255,.08). Translations use the CSS `translate` property (`-50%`) instead of `transform`; either one works.

Custom utilities to add: `.word-spacing-N { word-spacing: Npx }` for N in 1–12, and `.scrollbar-hide`.

---

## 1. Nav (`Nav.jsx`)

### Desktop (lg+ ≥1024): `<nav class="hidden lg:block w-full max-w-[1440px] lg:px-14">`
- **Not sticky, no blur.** It scrolls away with the page and is position static. Height **120px** (py-8 = 32px top and bottom, 56px content).
- Inner row: `flex items-center justify-between border-x-[1.5px] border-white/5 py-8 lg:px-6 xl:px-14` (at ≥1280 the padding is 32px 56px).
- Logo `a[href=#top]` holds the SVG at 188×26; x=114 at 1440/1280.
- Center `<ul>`: gap 20px (lg) / **37px** (xl+, `gap-9.25`), `whitespace-nowrap`. At 1440 it spans x 468–918.
  - Links: Outfit 16px / line-height 26px, weight 400, color `rgba(255,255,255,.8)`. **Hover** → `#fff`, `transition-colors 400ms cubic-bezier(.4,0,.2,1)`.
  - Copy and hrefs: `Product` #product · `Automation` #automation · `Reports` #reports · `Security` #security · `Pricing` /pricing
- Right group `flex items-center gap-4 xl:gap-8`:
  - Language switch `flex gap-1`: `EN` (active, `#fff`, href `/`, sr-only "English") · `/` (14px, `white/20`) · `UA` (`white/50`, hover `#fff` over 400ms, href `/ua`, sr-only "Українська"). Each link is `px-1 py-1 text-sm leading-5`, i.e. 14/20, box 26×28.
  - **Outline CTA "Get started"** → `https://app.usevault.ai/login`: 142×56, `rounded-full border border-white/20` (1px rgba(255,255,255,.2)), padding 16px 24px, Outfit 18px/22px weight 500, white. No hover state.

### Mobile/tablet (<1024): `div.relative.z-50.flex.justify-center.lg:hidden > nav.w-full.max-w-[1440px].px-6.md:px-10`
- Inner row: `border-x-[1.5px] border-white/5 px-3 py-4 md:px-8 md:py-6`. Height **56px** at 390 and **76px** at 768.
- Logo 116×16 (at 768: 200×28). Burger button 24×24 (md 28×28), white, `aria-label="Open menu"`; it switches to `menu-close.svg` with label "Close menu".
- **Menu panel** (AnimatePresence):
  - Wrapper `absolute top-[calc(100%+1px)] inset-x-0 z-40 overflow-hidden px-6 md:px-10`. Opacity animates 0↔1 over 0.28s easeOut.
  - Inner panel `mx-auto max-w-[1440px] overflow-hidden border-x-[1.5px] border-white/5 backdrop-blur-lg` (`backdrop-filter: blur(16px)`), `bg: linear-gradient(180deg,#03020B 0%,rgba(3,2,11,0) 100%)`, `shadow-2xl shadow-black/20`.
  - Inner panel variants: closed `{height:0, opacity:0}` with height 0.3s linear and opacity 0.16s easeOut. Open `{height:'auto', opacity:1}` with height **0.5s linear** and opacity **0.22s easeOut**.
  - Content `flex min-h-[360px] flex-col gap-6 pb-5 md:gap-8 md:pb-8 md:border-b-[1.5px] border-b-white/5`.
  - `<ul class="flex flex-col divide-y divide-white/5 border-b border-b-white/5">` with 5 items. Each is `a.group.flex.items-center.gap-8.px-4.py-[15px].md:px-[34px].md:py-4`, 56px tall.
    - Index span `01.`…`05.` in `white/40`; label in `white/80`, line-height 26px. Both turn `#fff` on group-hover over 300ms. The active section is white.
  - Then the language switch (`px-3 md:px-[30px]`, same as desktop).
  - Then the CTA "Get started", full width (`px-4 md:px-8`): `border border-white/20 rounded-[36px] text-lg py-4`, 18px/28px weight 500, white, 62px tall.
  - While the menu is open, the body scroll is locked (`body{position:fixed; top:-scrollY; left:0; right:0; width:100%}`). Clicking a link closes the menu.

---

## 2. Hero (`Hero.jsx`): `<section>`, 1440: y 121–1483 (h 1362); 1280: h 1265; 768: h 979; 390: h 783

- Section: `relative flex w-screen max-w-full flex-col items-center overflow-hidden`.
  - **::before**: the planet background. `absolute top-20 (80px) lg:top-10 (40px) h-full w-full z-0 bg-[url(/assets/img/planet.png)] bg-contain bg-top bg-no-repeat xxl:bg-cover`. At 1440 it is cover, positioned 50% 0, top 40px.
  - **Bottom fade overlay**: `absolute inset-x-0 bottom-0 h-[400px]`, `background: linear-gradient(180deg, rgba(3,2,11,0) 0%, rgba(3,2,11,.05) 4.78%, #03020B 35.5%)`.
- Content `relative z-10 w-full max-w-[1440px] px-6 md:px-10 lg:px-14` → frame `flex flex-col items-center border-x-[1.5px] border-white/5`.
- Text block: `relative z-10 mx-auto flex flex-col items-center gap-4 md:gap-6`, `max-w-[400px] md:max-w-[560px] lg:max-w-[750px]`, `pt-[136px] lg:pt-[146px]`. Width is 750 at ≥lg, 560 at md, 339 at 390.
  1. **Eyebrow pill** (247×24):
     - `flex items-center gap-1.5 rounded-full bg-white/8 px-2 py-1`.
     - box-shadow: `inset 0 .5px .5px rgba(255,255,255,.12), inset 0 1px 3px rgba(255,255,255,.10), inset 0 2px 8px rgba(255,255,255,.04), 0 .5px .5px rgba(8,1,20,.03), 0 1px 1px -.5px rgba(8,1,20,.03), 0 2px 2px -1px rgba(8,1,20,.03)`.
     - zap-icon 14×14, then the text **"FINANCIAL MANAGEMENT PLATFORM"**: Outfit 11px/16px, weight 500, letter-spacing .05em (0.55px), uppercase, white.
  2. **H1** "Control your Business Finances in One Place". The source has a non-breaking space in "in One" (`in&nbsp;One Place`).
     - clashDisplay weight 600, white, centered, `letter-spacing: 2%`.
     - Sizes: **64px/72px**, word-spacing 8px at lg+ (box 750×144, 2 lines); 48px/52.8px (110%), ws 6px at md (560×106); 32px/38.4px (120%), ws 4px at <768 (339×115, 3 lines).
     - Uses `inline-flex text-center whitespace-pre-line`.
  3. **Sub** "AI-native platform to track transactions, generate reports, and automate manual financial work, built for SMBs."
     - Outfit **weight 300**, 16px/26px (md+), 14px/20px (<md), white, `px-4`, centered.
     - Width: md:max-w-[500px], so the box is 500×52 at ≥768 and 339×60 at 390.
- Gap from the text block to the image: the image outer wrapper has padding-top 90px (lg, `pt-22.5`), 56px (md), 76px (<md).
- **Image outer** `relative flex justify-center h-full w-full px-2 md:px-8 lg:px-28` (112px side padding at lg).
  - **::before** = hero-img-before-gradient.svg, `bg-contain no-repeat`, left 50% translate(-50%). Sizes: 600×600, top -176px (lg); 320×320, top -72px (md); 200×200, top -16px (<md).
  - **::after** = hero-img-after-gradient.svg, contain, left 50% translate(-50%). Sizes: 800×400, top 0 (lg); 200×200, top 32px (below lg).
- **Image wrapper** `relative z-[5] w-full max-w-[1104px]`.
  - **::before** = hero-highlight-before-gradient.svg, z-10, `bg-contain bg-center no-repeat`, left 50% -50%. Sizes: 720×40, top -20px (lg); 360×24, top -13px (md); 240×24, top -13px (<md).
  - **::after** = hero-highlight-after-gradient.svg, z-[2], contain, no-repeat, left 50% -50%. Sizes: 1200×560, top -104px (xl); top -80px, h 560 (lg); w 105% at md (652×376, top -17%); w 100% at <md (top -17%).
  - **img** `hero-en.png`, `relative z-10 h-full w-full object-contain`. Alt: "Vault AI dashboard showing the total balance, a balance chart and recent transactions". Rendered size: 1101×666 at 1440; 941×569 at 1280; 621×376 at 768; 323×195 at 390. The image is part of the page (no rounded corners or border are added in CSS; the frame is baked into the PNG).
- **CTA row** `py-10 md:pt-12 md:pb-[70px] lg:py-16` (64px top and bottom at lg). It contains the **Primary Large CTA "Get started"** → app.usevault.ai/login, box 188×64:
  - `flex items-center gap-4 rounded-full bg-white text-[#090A11] border-4 border-white/20 bg-clip-padding pl-6 pr-4 py-3`, Outfit 18px/22px weight 500.
  - Arrow chip: `size-8 (32px) rounded-full bg-[#05040C]` holding arrow-right.svg at 16px.
  - The 4px translucent border shows over the page background because of bg-clip-padding. No hover state.
- **Motion:** none. The hero renders statically, with no entrance animation (no `opacity:0` in the SSR output for the hero).

---

## 3. Scroll-coloring statement (`ScrollRevealText.jsx`): 1440 y 1484–2292 (h 808)
- Frame `relative flex w-full justify-center border-x border-white/5` (**1px** here, not 1.5). Padding is `py-[136px] md:py-[212px] lg:py-[300px]`.
- **::before** = scroll-coloring-text-bg.svg (the big outlined V-mark):
  - `absolute top-1/2 z-0 bg-contain bg-no-repeat`, translate(-50%,-50%).
  - At md+: left 50%, 626×544. At <md: left 51%, `h-full max-h-[262px] w-full max-w-[308px]` (renders 308×262).
- **Paragraph** `<p>` (motion.p) `relative z-10 flex flex-wrap justify-center px-5 lg:px-0 lg:max-w-[1200px] font-display font-semibold uppercase tracking-wide word-spacing-2`:
  - Font sizes: 36px/40px (lg), 32px (md; computed line-height 49.8px), 18px/28px (<md).
  - Letter-spacing .025em (0.9px at 36px). Color white.
  - Box 1200×208 at 1440, 4 lines.
- Copy (23 words): **"Vault gives you a complete system to track, understand, and automate your business finances bringing transactions, reports, and workflows together in one place"**.
- Each word is markup: `<span class="relative mt-1.5 mr-1.5 md:mr-2 lg:mt-3 lg:mr-3"><span class="absolute opacity-20">word</span><motion.span style={{opacity}}>word</motion.span></span>`. Word margins are 12px right and 12px top at lg; 8px right and 6px top at md; 6px and 6px at <md.
- **Motion (scroll-linked, scrubbed, reversible):**
  - `const { scrollYProgress } = useScroll({ target: pRef, offset: ["start 0.9", "start 0.25"] })`. Progress runs from 0, when the paragraph top reaches 90% of the viewport height, to 1, when it reaches 25%.
  - `<p>` opacity = `useTransform(progress, [0,1], [0,1])`.
  - Word i of n=23: overlay opacity = `useTransform(progress, [i/n, (i+1)/n], [0,1])`, clamped. The ghost copy stays at opacity .2 permanently, so the reveal is a sequential word-by-word "fill" from 20% to 100%.
  - Verified live: at progress 0.231 the first 5 words were full and word 6 was at 0.31; at 0.25-viewport everything was at 1.
  - With `prefers-reduced-motion`, progress is fixed at 1.

---

## 4. Product highlights grid (`ProductHighlights.jsx`): `<section id="product" class="scroll-mt-10">`, 1440 y 2293–3107

- Grid frame: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-x-[1.5px] border-white/5`. Gap: `gap-x-5 gap-y-6` below lg (20 / 24px); `lg:gap-x-4 lg:gap-y-[70px]`.
- Card boxes: at 1440 each is **431×372** (x 58, 505, 952; rows y 2293 and 2735). At 1280 each is 378×372. At 768 each is 333×350, two columns. At 390 each is 339×356, one column.
- Card: `relative flex w-full flex-col justify-between gap-8 border-y border-white/5`, height 356 / md 350 / lg 372. Per-card border overrides are listed below.
- Four `cross-plus-marker` 12px icons sit at the corners (`absolute -top-1.5 -left-1.5`, and so on; z-100).
- Header `flex flex-col gap-2 pt-3 pr-2 pl-3 md:px-4 md:pt-6 xl:px-6 xl:pt-[26px]`.
  - h4: Outfit 18px / line-height 150% (27px), weight 500, white.
  - p: Outfit 16px/140% (22.4px) at xl; 14px/19.6px at md–lg; 16px at <md. Color white/60, letter-spacing normal.
  - Optional "Soon" pill: same as the hero eyebrow but without the icon. It sits beside the h4 in `flex flex-wrap items-center gap-x-2 gap-y-1`.
- Animation box `relative h-full w-full overflow-hidden md:h-[216px] lg:h-[230px]`. Inside is a container `flex h-full w-full <per-card>` holding a DotLottie canvas (`loop autoplay`, layout `{fit:'contain', align}`). A ResizeObserver calls `.resize()`.

| # | title | badge | description | lottie | align | container classes | card border classes |
|---|---|---|---|---|---|---|---|
| 1 | Global Financial Ledger | – | A unified system that brings all your financial data into one reliable source of truth. | global-financial-ledger | [1,1] | `pl-3 pt-px h-[calc(100%+2px)]` | `border-t-0 md:border-r md:border-b` |
| 2 | Secure Bank & Web3 Integrations | – | Connect your bank accounts and Web3 wallets through trusted providers like Plaid. | web3-integrations | [.5,1] | `px-2.5 md:px-4 xl:px-6` | `md:border-t-0 md:border-l lg:border-r` |
| 3 | Custom Financial Reports | – | Go beyond standard P&L - build reports around the metrics that matter to your business. | custom-financial-reports | [.5,1] | `px-5 pb-[38px] md:pb-7 lg:px-9 lg:pb-7` | `md:border-r lg:border-t-0 lg:border-l` |
| 4 | User Management | – | Control access with configurable roles and permissions for your team. | user-management | [.5,1] | `px-1.5 md:px-3 xxl:px-0` | `md:border-l lg:border-r lg:border-b-0 lg:border-l-0` |
| 5 | Workflow Automations | Soon | Automate routine financial tasks with customizable workflows and AI-powered transaction enrichment. | workflow-automations | [.5,1] | `bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0.8px,transparent_0.8px)] bg-[length:14px_14px] bg-center pt-4 pb-3 md:py-[18px] lg:pt-4 lg:pb-3` | card adds `bg-[linear-gradient(180deg,rgba(217,217,217,0)_0%,rgba(217,217,217,0.02)_100%)] px-3 pb-[18px] md:px-4 xl:px-6 md:pb-4 lg:pb-8 md:border-r md:border-b-0 lg:border-l`; header uses `px-0` |
| 6 | Invoice Builder | Soon | Create and manage invoices instantly. Keep revenue tracking in one place. | invoice-builder | [1,1] | `pl-3 h-[calc(100%+2px)]` | `border-b-0 md:border-l` |

The canvas aria-labels are "<title> animation" (card 2 uses "Secure Bank and Web3 Integrations animation").

---

## 5–7. Feature showcases ×3 (`FeatureShowcase.jsx`, rendered with `sectionId` automation / reports / security)
Each section consists of:
1. A spacer frame `h-24 lg:h-50` (96 / 200px) with side borders.
2. A separator (no crosses).
3. `<div id="{automation|reports|security}" class="w-full max-w-[1440px] px-6 md:px-10 lg:px-14">` → `border-x-[1.5px] border-white/5`.

Each section block is 707px tall at 1440 (200 spacer + 1 line + 74 tabs + 432 body).

**Desktop tabs (lg+)** `hidden lg:grid grid-cols-3`. There are 3 buttons, each 442×74 at 1440:
- `relative flex h-[74px] items-center justify-center xl:justify-start xl:pl-[60px] overflow-hidden`, Outfit 18px/22px weight 500.
- Inactive tabs are white/50 and turn white on hover via `transition-colors duration-300`. The active tab is white. The middle button adds `border-x border-white/5`.
- Each button has a bottom hairline `absolute inset-x-0 bottom-0 h-px bg-white/5`.
- **Progress bar** on the active tab: `motion.span absolute inset-x-0 bottom-0 h-px origin-left bg-white`, animating `scaleX 0→1` over the tab duration with linear easing. It is rendered only while the section is in view and the Lottie is loaded.

**Mobile/tablet header (<lg)** `relative flex items-center justify-between overflow-hidden px-2.5 py-4 md:px-3`, 56px tall:
- chevron-left and chevron-right buttons (24px, white/50, hover white over 300ms; aria "Previous feature" / "Next feature").
- Centered h3 with the active tab name: Outfit 18px (md 20px)/22px weight 500. It is wrapped in `AnimatePresence mode="wait" initial={false}`: enter `{opacity:0,y:8}` → `{opacity:1,y:0}`, exit `{opacity:0,y:-8}`, 0.25s easeOut.
- Bottom hairline plus the same progress bar.

**Body** `flex flex-col lg:flex-row-reverse`:
- **Visual (right on desktop)**: `shrink-0 lg:w-1/2 h-60 md:h-[432px] overflow-hidden border-b-[1.5px] border-b-white/5 lg:border-b-0`. Rendered sizes: 663×432 at 1440; 583×432 at 1280; 685×432 at 768; 339×240 at 390.
  - background: `radial-gradient(circle, rgba(255,255,255,.08) .8px, transparent .8px), linear-gradient(180deg, rgba(217,217,217,.03) 0%, rgba(217,217,217,.01) 100%)`.
  - `background-size: 8px 8px, 100% 100%` (md+: `12px 12px, 100% 100%`), i.e. a dot grid.
  - Contains a DotLottie canvas at `size-full`.
- **Text (left)** `flex flex-col gap-8 px-3 py-8 md:px-6 md:py-10 xl:px-[60px] xl:pt-20` (padding 80/60/40 at ≥1280):
  - Inner `flex flex-col gap-4 md:max-w-[560px]`.
  - **h3**: clashDisplay 600, 28px/120% (33.6px) at md+ and 24px/28.8px below; word-spacing 3px; `md:max-w-[488px]`. It has `bg-[linear-gradient(180deg,#FFF 0%,rgba(255,255,255,.8) 100%)] bg-clip-text`. NOTE: the original does *not* set `text-transparent`, so the computed color is white and the gradient is invisible. Render it as plain white.
  - **p**: Outfit 16px/140% (22.4px), letter-spacing .025em (0.4px), white/60.
  - **Primary Small CTA "Try it free"** → app.usevault.ai/login, box 153×56: same as the large CTA but `gap-3.5 pl-5 pr-3.5 py-2.5`, 16px/24px weight 500, arrow chip `size-7` (28px) with a 14px arrow.

| id | tabs | h3 | p |
|---|---|---|---|
| automation | Enrich Financial Data · Alert on Unusual Expenses · Automate Recurring Reports | Automate financial tasks that used to require manual work | Set up smart automations and let Vault categorize transactions, enrich financial data, send reports and alerts, and run financial workflows automatically. Save hours of repetitive work every week. |
| reports | Profit & Loss Overview · Expense Breakdown · Custom Financial Reports | Understand your business finances in real time | Vault transforms transactions into real-time reports that help you understand revenue, expenses, cash flow, and profitability. Go beyond standard P&L - visualize any financial data to make better business decisions. |
| security | Centralized Financial Ledger · Secure Accounts Integrations · Role-Based Access Control | Built on secure financial infrastructure | Vault is designed with a reliable financial data architecture, secure integrations, and role-based access control to ensure your data stays accurate and protected. |

**Tab and Lottie logic (from the original source):**
- An IntersectionObserver on the `<section>` uses **threshold 0.35**. Each time the section enters view, the active tab resets to 0.
- The Lottie loads with `autoplay:false, loop:false`. After load, read `dotLottie.markers()`. For active tab k (1-based), the segment is `[section{k}_in, section{k+1}_in]`; the last tab uses `[section3_in, section3_out]`. Then call `setLoop(false)`, `setSegment(a,b)`, `setFrame(a)`, and `play()` if in view, otherwise `pause()`.
- Tab duration = `(b - a) / 30 * 1000` ms (fallback 5000 ms). When it elapses, `active = (active+1) % 3`, and this loops indefinitely while in view. A click jumps to that tab and restarts its timer. The progress bar duration equals the tab duration.
- Measured live, automation advanced at about 5.5s and 6.4s.

| section | tab 1 | tab 2 | tab 3 |
|---|---|---|---|
| automation | 6→167 = 5.367 s | 167→359 = 6.400 s | 359→570 = 7.033 s |
| reports | 7→141 = 4.467 s | 141→282 = 4.700 s | 282→422 = 4.667 s |
| security | 8→149 = 4.700 s | 149→286 = 4.567 s | 286→421 = 4.500 s |

---

## 8. How it works / Process steps (`ProcessSteps.jsx`): `<section><div id="how-it-works" class="lg:scroll-mb-30">`, 1440 y 5232–6146

- **Heading frame** `flex flex-col items-center border-x-[1.5px] border-white/5 pt-24 pb-10 md:pb-12 lg:pt-30 lg:pb-16` (padding 120/64 at lg, 96/48 at md, 96/40 below). Height is 312 at 1440 and 216 at 768.
  - **h2** "GAIN CLARITY" `<br>` "ON YOUR FINANCES" (the copy is "Gain Clarity / on your Finances" with `uppercase`). clashDisplay 600, white, centered.
  - Sizes: 48px/64px with word-spacing 7px at lg (box 488×128); 30px/36px with ws 4px below lg (304×72).
- A separator with crosses follows.
- **Row** `flex flex-col gap-8 md:gap-10 border-x-[1.5px] border-white/5 lg:h-[400px] lg:flex-row-reverse lg:justify-between lg:gap-1 xl:gap-10`.
  - **Visual**: `w-full h-[210px] md:h-[412px] lg:h-[400px] lg:w-1/2 lg:shrink-0 border-b border-b-white/5 lg:border-b-0`. At 1440 it is 663×400.
    - bg: `radial-gradient(circle, rgba(49,49,56,.35) .8px, transparent .8px), linear-gradient(180deg, rgba(217,217,217,.01) 0%, rgba(217,217,217,.03) 100%)`, size `8px 8px,100% 100%` (md: `12px 12px`).
    - Inside: `relative size-full overflow-hidden` → DotLottie `gain-clarity-on-your-finances.lottie`, `absolute inset-0 top-[-7%] h-[114%] w-full md:top-0 md:h-full`, autoplay false, loop false.
  - **Text column** `flex h-[360px] md:h-[430px] lg:h-full lg:flex-1 w-full flex-col gap-8 lg:gap-6 overflow-hidden px-3 md:pl-6 lg:pt-8 lg:pr-0 xl:pt-12 xl:pl-14`. At ≥1280 the padding is 48px 0 0 56px.
    - Steps list `flex flex-col gap-5`. Each step is `relative flex flex-col` containing a header row `relative z-10 flex items-center gap-[18px] xl:gap-7` with:
      - **Number box** (button, `aria-label="Play step N"`): size 36 / md 42 / xl 40, `border border-white/10`, bg `rgba(255,255,255,.02)`. Two corner ticks: `absolute -top-px -left-px size-[5px] md:size-1.5 border-t border-l border-[#EDEDFA]` and the mirror tick at bottom-right.
      - Number: Outfit 700, 14/20 (<md), 16/24 (md), 20/28 (xl).
      - **Active step**: the box bg animates to `#ffffff` and the number color to `#000000`, both 0.3s easeOut. Inactive: bg rgba(255,255,255,.02), number `#fff`.
      - **h6**: clashDisplay 600, 20px, line-height 28px (<md) or 24px (md+), word-spacing 2px, white.
    - Description wrapper `grid transition-[grid-template-rows] duration-300 ease-out` with `grid-rows-[1fr]` (open) or `grid-rows-[0fr]` (closed). Inside is a `motion.p` with `min-h-0 overflow-hidden whitespace-pre-line text-white/60 tracking-tight`:
      - Type: 14px/22px (<lg), 16px/24px (lg). Left padding 54 / md 60 / xl 68px (`pl-13.5 md:pl-15 xl:pl-17`).
      - Animation: `{opacity: active?1:0, y: active?0:-6}`, opacity 0.3s linear, y 0.3s easeOut.
      - The `grid-rows-[1fr]` (expanded) state applies when the step is active, or for step 0 when the section is not in view.
    - **Connector line** (active, non-last step only): `absolute top-9 left-[18px] md:top-[42px] md:left-[21px] xl:top-10 xl:left-5 w-px h-[calc(100%+20px-36px)]` (md: −42px, xl: −40px), `bg-white/20 overflow-hidden`. Its child `motion.div absolute inset-0 origin-top bg-white` animates scaleY 0→1 over **1.55s easeInOut** with delay = `max(stepDuration − 1.55, .3)`. It is keyed by runId so it restarts.
    - Steps copy (keep the `\n` line breaks, rendered via `whitespace-pre-line`):
      1. **Connect your accounts**: "Sign up and securely connect your bank\n accounts and Web3 wallets."
      2. **Structure your data**: "Set up automations, define revenue and expense\n categories, and create reports tailored to your business."
      3. **Turn data into decisions**: "Vault transforms raw data into insights that reveal\n what's working, what's changing, and where to focus\n next - so you can act with confidence."
    - Then the **Primary Small CTA "Get started"** (166×56) → app.usevault.ai/login.
  - **Step logic**:
    - Lottie frame starts are `[0, 170, 350]` of 568 total. Step durations are `[170/30, 180/30, 218/30]` = **5.667s, 6.0s, 7.267s**.
    - An IntersectionObserver on the visual uses **threshold 0.4**. On enter: `stop()`, set step 0, `play()`. On exit: `stop()`.
    - While in view and the tab is visible, a setTimeout of the step duration advances the step (index+1). The last step has no timer. On the Lottie `complete` event, it resets to step 0, calls `setFrame(0)` and `play()`, and the cycle loops.
    - Clicking a number sets that step and calls `setFrame(start[n])` then `play()`.
    - `visibilitychange` stops playback and resets to step 0 while the page is hidden.
- After the row: a separator with crosses, then a spacer frame `h-24 lg:h-50` (200px at lg) with side borders, then a separator with crosses. The spacer wrapper is `flex md:hidden lg:flex`, so **it is hidden at md (768–1023)**.

---

## 9. Footer (`Footer.jsx`): `<footer>`, 1440 y 6147–6624 (h 477); 768 h 529; 390 h 695

- Frame `border-x-[1.5px] border-white/5`.
- **Top grid** `grid border-b-[1.5px] border-white/5`:
  - Columns: `grid-cols-2` (<md); `md:grid-cols-[repeat(3,max-content)] md:justify-between`; `lg:grid-cols-[minmax(0,1fr)_repeat(3,max-content)]`.
  - Gaps: `gap-x-6 gap-y-10`, `lg:gap-x-12`, `xl:gap-x-20` (80px).
  - Padding: `px-4 pt-10 pb-8` (<md) · `md:px-6 md:pt-12 md:pb-10` · `lg:py-14` · `xl:px-14` (56px all round at ≥1280).
  - Computed columns at 1440: 651 / 84 / 121 / 117.
  - **Brand column** (`col-span-2 md:col-span-3 lg:col-span-1`, `flex flex-col items-start gap-6`): the logo (188×26; 116×16 below md), then `flex items-center gap-4` holding:
    - LinkedIn icon (h 16) → https://www.linkedin.com/company/usevault-ai/ (target _blank)
    - Telegram icon → https://t.me/usevault_ai
    - Mail icon plus "hello@usevault.ai" (16/24; 14/20 below md, gap 6px) → mailto:hello@usevault.ai
    - All are `text-gray` (#BFBFBF), turning white on hover over 400ms. Each icon has a 24×24 hit area via `::before`.
  - **Link groups** `flex flex-col gap-4`:
    - Label `<p>`: Outfit 11px/16px weight 500, tracking .05em, uppercase, white/40.
    - `<ul class="flex flex-col gap-3">` items: 16px/26px, white/60, hover white over 400ms, `whitespace-nowrap`.
    - **PLATFORM**: Product #product · Automation #automation · Reports #reports · Security #security · Pricing /pricing
    - **RESOURCES**: Help Center https://help.usevault.ai/en/ (_blank) · Status https://status.usevault.ai/ (_blank) · Migration offer /migration-offer · Partner program /partners
    - **LEGAL** (`max-md:col-span-2`): Terms of Service /terms · Privacy Policy /privacy · DPA /dpa
- **Bottom bar** `flex flex-wrap items-center justify-between gap-3 p-4 md:p-6 lg:py-8 xl:px-14 text-gray`. Height 88 at 1440 (padding 32/56).
  - Left: "© 2026 VAULT AI. All rights reserved." in 16/24 #BFBFBF. The year is the current year (`© {year} VAULT AI. All rights reserved.`).
  - Right: `flex items-center gap-2`, "Built by" (#BFBFBF), then the Overcode badge `a.group` → https://www.overcode.tech/ (_blank, aria "Overcode (opens in a new tab)"):
    - Pill 1: `rounded-full bg-[#25222C] px-3 pt-[5px] pb-[7px]`, holding overcode-wordmark at 60×10.
    - Pill 2: `-ml-1 rounded-full bg-[#25222C] py-1.5 pr-2.5 pl-[11px]`, holding overcode-icon at 11×11.
    - On **group hover** both pills switch bg to `#7506A7` instantly (no transition class).
- Then a separator with crosses and a final spacer frame `h-12 md:h-[50px] lg:h-16` (48 / 50 / 64px) with side borders.

---

## 10. Responsive deltas summary

| element | 1440 | 1280 | 768 | 390 |
|---|---|---|---|---|
| doc height | 6623 | 6527 | 7280 | 7498 |
| nav | desktop, 120h | desktop, 120h, ul gap 37 | mobile bar 76h | mobile bar 56h |
| hero h | 1362 | 1265 | 979 | 783 |
| hero text top pad | 146 | 146 | 136 | 136 |
| h1 | 64/72 | 64/72 | 48/52.8 | 32/38.4 |
| hero img | 1101×666 | 941×569 | 621×376 | 323×195 |
| statement py / font | 300 / 36px | 300 / 36px | 212 / 32px | 136 / 18px |
| cards | 3 col 431×372 | 3 col 378×372 | 2 col 333×350 | 1 col 339×356 |
| feature tabs | 3-col tab bar | 3-col tab bar | arrows + title | arrows + title |
| feature visual | right 663×432 | right 583×432 | top 685×432 | top 339×240 |
| feature text pad | 80/60/40 | 80/60/40 | 40/24 | 32/12 |
| steps h2 | 48/64 | 48/64 | 30/36 | 30/36 |
| steps visual | right 663×400 | right 583×400 | top 685×412 | top 339×210 |
| footer grid | 4 cols | 4 cols | brand row + 3 cols | 2 cols (legal spans 2) |

## 11. Hover inventory (complete)
| element | change | timing |
|---|---|---|
| desktop nav links | white/80 → #fff | 400ms cubic-bezier(.4,0,.2,1) |
| UA language link | white/50 → #fff | 400ms |
| feature tab buttons (inactive) | white/50 → #fff | 300ms |
| mobile feature chevrons | white/50 → #fff | 300ms |
| mobile menu items | index white/40 → #fff, label white/80 → #fff | 300ms |
| footer links | white/60 → #fff | 400ms |
| footer social + email | #BFBFBF → #fff | 400ms |
| Overcode badge | bg #25222C → #7506A7 | instant |
| CTAs (white primary + outline) | **none** | – |

All hover rules are wrapped in `@media (hover:hover)`. No hover transforms or shadows exist anywhere.

## 12. Motion inventory (complete)
1. Statement scroll-fill (section 3): Framer `useScroll` with offset `["start 0.9","start 0.25"]`, scrubbed per word.
2. Product card Lotties (section 4): `loop autoplay`. dotLottie freezes canvases offscreen (IntersectionObserver threshold 0).
3. Feature showcases (sections 5–7): marker-segmented Lottie, auto-advancing tabs (IntersectionObserver 0.35), linear 1px progress bar, mobile title swap (y ±8, 0.25s easeOut).
4. Process steps (section 8): Lottie plus a timed step accordion (IntersectionObserver 0.4), with the number box bg/color at 0.3s easeOut, description grid-rows 300ms ease-out, opacity 0.3s linear / y −6→0 0.3s easeOut, and the connector line scaleY over 1.55s easeInOut.
5. Mobile menu open/close (section 1).
6. Anchor smooth-scroll via zenscroll (1000ms).
7. CSS keyframes defined but not used on home: `fade-in` (.18s ease-out), `scale-in` (.22s cubic-bezier(.22,1,.36,1), translateY 8px + scale .96 → 0/1) for popups, and `spin`.

There are no load or entrance animations, no parallax, and no marquees.

## 13. Limits / not measurable
- Lottie visuals are **canvas-rendered**, so the text and graphics inside them are not in the DOM. Use the `.lottie` files as-is. Their internal timing is in ASSET_MANIFEST.md.
- Desktop hover states of the lottie canvases: none.
- The Intercom launcher is third-party; it is visible in the screenshots and not part of the clone.

## 14. Other routes found (not yet specced)
Internal: `/pricing`, `/ua` (Ukrainian locale of home), `/migration-offer`, `/partners`, `/terms`, `/privacy`, `/dpa`.
External: `https://app.usevault.ai/login` (all CTAs), `https://help.usevault.ai/en/`, `https://status.usevault.ai/`, LinkedIn, Telegram, `https://www.overcode.tech/`, `mailto:hello@usevault.ai`.

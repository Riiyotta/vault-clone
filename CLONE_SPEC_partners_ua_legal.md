Source: https://www.usevault.ai/

# Vault AI: clone spec, additional routes (`/partners`, `/ua`, `/terms`, `/privacy`, `/dpa`)

This file supplements `CLONE_SPEC.md` (home). Section references like "home §3" point into that file. Everything here was measured live on 2026-10-14 with Playwright/Chromium at 1440, 1280, 768 and 390 px using computed styles, bounding boxes, captured WAAPI animations and the site's own JS chunks (animation configs were read from source, not estimated). New assets are listed in `ASSET_MANIFEST_partners_ua_legal.md`. Screenshots are in `recon/<route>/`.

Colour shorthand used below: `accent` = `#5176FE` (rgb 81,118,254, the `--color-accent` token; computed values print as `oklab(0.6137 -0.0063 -0.2061 / a)`), `accent-soft` = `#9BAEF2`, `primary-black` = `#03020B`, `red` = `#EE3D2C`, `white/N` = rgba(255,255,255,N/100). Mock-card surface is `#080710`.

---

# A. Shared chrome on every non-home route

- **Nav**: identical to home §1 (desktop 120px; mobile 56/76px, same menu panel). The only differences are hrefs:
  - Logo → `/` instead of `#top`.
  - Section links → `/#product`, `/#automation`, `/#reports`, `/#security`. Pricing stays `/pricing`.
  - Language switch: EN → current path (e.g. `/partners`, `aria-current="true"`, white); UA → `/ua` + path (e.g. `/ua/partners`, white/50, hover white 400ms).
- **Separator after nav**: full-bleed `bg-white/5` with crosses (home §0.2).
- **Footer**: identical to home §9 (477 / 529 / 695px tall at 1440 / 768 / 390), including the separator and the final 64/50/48px spacer frame. Footer PLATFORM links use `/#product` and so on.
- **Separators inside these pages** all use the "between-crosses-until-lg" variant (home §0.2): full-bleed `lg:bg-white/5` with two cross markers, and an inset `::before` line below lg.
- Page bg is `#03020B`, and `<main class="flex w-full flex-col items-center overflow-x-clip text-white">` (legal pages use `overflow-hidden`).
- Intercom launcher is third-party, so do not clone it.

---

# B. `/partners`

## B.0 Meta
- `<title>`: **Partner program | Vault AI**
- description / og:description / twitter:description: "For accounting firms, CFOs, consultants and teams serving SMBs: refer businesses to Vault, track sign-ups through your invite link and work in your clients' workspaces from one account."
- og:title / twitter:title "Partner program | Vault AI". og:url and canonical `https://www.usevault.ai/partners`. og:locale `en_US`. og:image `/og-image.png` (1200×630, already in assets). twitter:card `summary_large_image`. theme-color `#03020b`.
- hreflang: en `/partners`, ru `/ru/partners`, uk `/ua/partners`, x-default `/partners`.

## B.1 Page structure (DOM order) and heights

| # | block | 1440 y / h | 1280 h | 768 h | 390 h |
|---|---|---|---|---|---|
| – | nav + separator | 0 / 121 | 121 | 77 | 57 |
| 1 | Split hero `<section>` | 121 / 720 | 720 | 1051 | 1012 |
| – | separator | 841 | | | |
| 2 | Who it's for `<section aria-labelledby="audience-heading">` | 842 / 901 | 903 | 913 | 1037 |
| – | separator | 1743 | | | |
| 3 | Scroll-coloring statement (a bare `div`, not a section) | 1744 / 756 | 756 | 647 | 442 |
| – | separator | 2500 | | | |
| 4 | What you and your clients get `<section aria-labelledby="value-heading">` | 2501 / 904 | 904 | 1197 | 1369 |
| – | separator | 3405 | | | |
| 5 | FAQ `<section aria-labelledby="faq-heading">` | 3406 / 552 | 552 | 484 | 507 |
| – | separator | 3958 | | | |
| 6 | How to become a partner `<section aria-labelledby="steps-heading">`, including the trailing spacer | 3959 / 1010 | 1010 | 1147 | 1173 |
| – | separator | 4969 | | | |
| 7 | Footer | 4970 / 477 | 477 | 529 | 695 |
| | **document height** | **5446** | 5448 | 6050 | 6297 |

## B.2 Section heading frame (used by sections 2, 4, 5, 6): `SectionHeading`
- Wrapper `w-full max-w-[1440px] px-6 md:px-10 lg:px-14` → frame `flex justify-center border-x-[1.5px] border-white/5 px-4 pt-24 pb-10 md:pb-12 lg:pt-30 lg:pb-16`. Padding is 120/16/64 at lg (frame 248 tall), 96/16/48 at md, and 96/16/40 below md.
- `<h2>`: `font-display` (clashDisplay) 600, uppercase, centered, `text-balance`, white, letter-spacing normal.
  - lg+: 48px / 64px with word-spacing 7px.
  - Below lg: 30px / 36px (`text-3xl`) with word-spacing 4px.
- It is followed by a separator with crosses, then the section body.
- Copy: "Who it's for", "What you and your clients get", "Frequently asked questions", "How to become a partner" (rendered uppercase).
- Measured 1440 boxes: 339×64, 892×64, 809×64, 736×64 (all one line). At 390: 211×36, 307×72, 307×72, 307×72.

## B.3 Split hero (`SplitHero`)
`section.flex.w-full.flex-col.items-center > div.w-full.max-w-[1440px].px-6.md:px-10.lg:px-14 > div.relative.flex.flex-col.overflow-hidden.border-x-[1.5px].border-white/5.lg:min-h-[720px].lg:flex-row`

The section has no planet background and no bottom fade, unlike home.

### Left column (text)
- `relative z-10 flex flex-col items-start gap-8 px-4 pt-24 md:px-6 md:pt-28 lg:w-[62%] lg:shrink-0 lg:pt-34 xl:pl-14`
- Padding at 1440 is 136/24/0/56. Width is 822 at 1440 and 722 at 1280. At md, pt 112 / px 24. Below md, pt 96 / px 16. Gap 32px to the CTA.
- Inner `flex flex-col items-start gap-4 md:gap-6`:
  1. **Eyebrow pill**: identical to the home hero pill (home §2.1: bg white/8, same 6-layer inset shadow, zap icon 14px, gap 6, px 8 py 4). Text **"Partner program"**, 11px/16px weight 500, tracking .05em, uppercase (12px when lang is uk/ru). Box 148×24, left-aligned, at y=257 (1440).
  2. **H1** "Bring your clients" / "to Vault":
     - Markup is two `<span class="lg:block">` joined by a space, so there is a forced line break at lg+ only.
     - clashDisplay 600, letter-spacing 2%, `text-balance`, white.
     - Sizes: **56px/64px** with word-spacing 8px at lg+ (box 523×128); 48px/52.8px (110%) with word-spacing 6px at md (637×106, 2 lines); 32px/38.4px with word-spacing 4px below md (307×77, 2 lines).
  3. **Sub** `<p class="text-sm leading-5 font-light text-white md:max-w-125 md:text-base md:leading-6.5">`:
     - Two `<span class="block">` lines: "For accounting firms, CFOs, consultants and teams serving SMBs." / "Your clients get clarity on their finances in real time, and you earn a reward for the businesses you bring."
     - Outfit 300, 16px/26px at md+ (box 500×78) and 14px/20px below md (307×100). White.
- **CTA "Become a partner"**: a `<button>` that opens the partner popup (B.9). It is the Primary Large button from home §2: 241×64, bg white, text `#090A11`, border 4px white/20 with bg-clip-padding, pl 24 pr 16 py 12, gap 16, 18px/22px weight 500, arrow chip 32px `#05040C` holding the arrow-right 16px. No hover state.

### Right column (animated scene, `aria-hidden`)
- `relative flex items-center justify-center px-4 pt-12 pb-16 md:px-6 lg:flex-1 lg:py-16 lg:pr-6 lg:pl-0`.
  - 1440: 504×720, padding 64/24/64/0. 1280: 443 wide.
  - Below lg it stacks under the text: 685×587 at 768 (pad 48/24/64), 339×587 at 390 (pad 48/16/64).
- **Glow**: `pointer-events-none absolute top-1/2 left-1/2 h-[660px] w-[460px] -translate-1/2 rounded-full blur-xl`, with `background: radial-gradient(closest-side, rgba(81,118,254,.2) 0%, transparent 100%)` and `filter: blur(24px)`.
- **Dot grid**: `absolute top-1/2 left-1/2 h-[700px] w-[520px] -translate-1/2 pointer-events-none`.
  - `background: radial-gradient(circle, rgba(255,255,255,.08) .8px, transparent .8px), linear-gradient(180deg, rgba(217,217,217,.03) 0%, rgba(217,217,217,.01) 100%)`.
  - `background-size: 8px 8px, 100% 100%` (md+: `12px 12px, 100% 100%`).
  - `mask-image: radial-gradient(closest-side, black 35%, transparent)`.
  - This is the same "DotGridPanel" background as the home feature visuals.
- **Scene** `relative flex w-full justify-center > div.flex.w-full.flex-col.items-center` holds three stacked items:
  1. **Invite card** wrapper `w-full max-w-[340px]` → MockCard: `w-full rounded-xl (12px) border border-white/10 bg-[#080710] p-4 text-xs leading-[18px] text-white` (12/18 Outfit 400). It is 340×139 at 1440 and 307 wide at 390.
     - Header row `flex items-center gap-2.5`:
       - Icon disc: `size-8 rounded-full border border-white/10`, holding the link icon 16px in white/60 (`svg/partners/link.svg`).
       - Text column: "Your invite link" in 14/20 weight 500, then "Sign-ups through it are tracked" in white/50.
     - Divider `h-px bg-white/5 my-3.5` (14px).
     - Link field `flex items-center gap-2 rounded-lg (8px) border border-white/10 py-1.5 pr-1.5 pl-2.5` (306×38):
       - `truncate text-white/80` "app.usevault.ai/?ref=K7M2QX9D".
       - Then `grid justify-items-end` stacking two pills in the same cell (`col-start-1 row-start-1`):
         - **Copy**: `h-6 px-2.5 rounded-full bg-white text-[#03020B]` 12/16 weight 500, 48×24.
         - **Copied**: same, but `bg-white/10 text-white`, 58×24.
  2. **Flow connector** `relative z-10 flex justify-center`:
     - Line `relative h-[88px] w-px origin-top bg-white/20`. It has 8px dots at both ends: `absolute -top-1` and `-bottom-1`, `left-1/2 -translate-x-1/2 rounded-full border border-white/40 bg-[#03020B]`.
     - Over it, centered (`absolute inset-0 flex items-center justify-center`), the pill **"Via your link"**: `h-[26px] px-3 rounded-full border border-accent/50 bg-[#080710]` 12/16 weight 500 white, 91×26.
  3. **Workspaces card** wrapper `w-full max-w-[320px]` → MockCard with `p-2` (320×248):
     - Label "Workspaces": 11/16 weight 500, tracking .05em, uppercase, white/40, `px-2 pt-2 pb-1.5`.
     - 4 list items, each `flex items-center gap-2.5 rounded-lg border px-2 py-1.5` (302×50) with `border-transparent`:
       - Avatar `size-7 rounded-md bg-white/8` 12px weight 600 white initials.
       - Text column: `truncate text-white` title, then `truncate text-white/50` subtitle.
     - Rows: LE "Ledgerline" / "Your workspace"; NS "Northwind Studio" / "Accountant"; HD "Harbor Dental" / "Admin".
     - The 4th row (AL "Alder Logistics" / "Accountant · new invite") is **highlighted**: `border-accent/35 bg-accent/10`.

### Hero scene motion (Framer Motion, plays once)
- Trigger: the scene root is `motion.div` with `initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.3 }}`. The SSR output already has the hidden inline styles.
- `EXPO` = cubic-bezier(.22,1,.36,1). `easeOut` = cubic-bezier(0,0,.58,1).
- Timeline (delays are relative to entering view; measured live as WAAPI opacity anims with exactly these timings):

| element | from → to | opacity | transform |
|---|---|---|---|
| Invite card | opacity 0, y 12 → 1, 0 | 0.4s easeOut, delay 0.4 | y: 0.5s EXPO, delay 0.4 |
| "Copy" pill | opacity 1 → 0 | 0.2s easeOut, delay 1.1 | – |
| "Copied" pill | opacity 0 → 1 | 0.2s easeOut, delay 1.1 | – |
| Connector line | scaleY 0 → 1 (origin top) | – | 0.45s EXPO, delay 1.1 |
| "Via your link" pill | opacity 0, scale .9 → 1, 1 | 0.3s easeOut, delay 1.3 | (same transition) |
| Workspaces card | opacity 0, y 12 → 1, 0 | 0.4s easeOut, delay 1.8 | y: 0.5s EXPO, delay 1.8 |
| AL row (wrapper `motion.div`) | opacity 0, y −6 → 1, 0 | 0.3s easeOut, delay 2.5 | y: 0.4s EXPO, delay 2.5 |

- The final state persists: "Copied" stays visible, and nothing loops.
- With `prefers-reduced-motion`: `initial="hidden" animate="shown"` and all transitions use `{duration: 0}`.

## B.4 Who it's for (audience list)
- Heading frame (B.2) "Who it's for", then a separator.
- Body: `w-full max-w-[1440px] px-6 md:px-10 lg:px-14` → `relative overflow-hidden border-x-[1.5px] border-white/5`.
  - **Glow** (`aria-hidden`): `pointer-events-none absolute -top-[40%] -right-[10%] h-[140%] w-[120%] lg:w-[70%] rounded-full blur-xl` (blur 24px), with `background: radial-gradient(closest-side, rgba(81,118,254,.2) 0%, rgba(81,118,254,.1) 50%, transparent 100%)`. At 1440 it is 928×913 at x=588 (it pools at the right).
  - `<ul class="relative flex flex-col divide-y divide-white/5 py-2 lg:py-6">`: dividers are 1px white/5. Padding is 24px vertical at lg and 8px below.
- Each `<li>` is a grid: `grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-4 py-6 md:px-6 lg:grid-cols-[72px_minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-x-6 lg:py-8 xl:px-14`.
  - 1440: columns 72 / 447 / 646, padding 32/56, row height 121.
  - 1280: columns 72 / 382 / 551. The first h3 wraps to 2 lines, so that row is 123.
  - 768: columns 44 / 1fr, padding 24, row heights 128–153.
  - 390: padding 24/16, row heights 152–189.
  - **Icon** `svg.size-11.lg:size-14` (44 / 56px), viewBox 0 0 56 56:
    - `rect x=.5 y=.5 w=55 h=55 rx=14` with fill accent/10 and stroke white/5.
    - Then `<g transform="translate(14.8 14.8) scale(1.1)">` holding 24-unit glyph paths. Stroke paths are accent-soft at 1.5 width with round caps/joins. "Body" fills are accent. "Accent" fills are accent-soft. "Ink" strokes are `#03020B`.
    - Files: `public/assets/svg/partners/audience-*.svg`, final state; `data-animation` marks the animated path.
  - **h3**: clashDisplay 600, word-spacing 3px, white. 24px/28.8px at lg+; 20px/28px below lg.
  - **p**: `col-span-2 lg:col-span-1` (below lg it drops under icon+title at full width), Outfit 16/24, white/60, `text-pretty`.

| # | h3 | p | icon file | animated path |
|---|---|---|---|---|
| 1 | Accounting and fractional CFO firms | Give your clients a live view of their cash and expenses, and work from the same numbers they see. | audience-accounting-firms.svg | scale pans (slideY) |
| 2 | Freelance CFOs | Run several clients' finances from one account, with reports built around how each business works. | audience-freelance-cfo.svg | centre disc (pop) |
| 3 | Consulting companies | Recommend Vault to clients who need clear finance reporting, and earn a reward for it. | audience-consulting.svg | magnifier lens (slideX) |
| 4 | SaaS products | Serve the same small and mid-sized businesses? Refer your users to Vault and add value for them. | audience-saas.svg | cursor (pop) |
| 5 | Service companies | Agencies and service firms whose clients need a clearer view of their finances. | audience-services.svg | clasp (pop) |

- **Icon motion**: each `motion.svg` has `whileInView="shown"` with `viewport {once:true, amount:0.6}`. Only the marked path animates, with `transform-origin: 50% 50%; transform-box: fill-box`:
  - `pop`: scale 0 → 1 and opacity 0 → 1, 0.7s EXPO.
  - `slideX`: x −6 → 0 and opacity, 0.7s EXPO.
  - `slideY`: y −5 → 0 and opacity, 0.7s EXPO.
  - Delay for all is **0.25s**. Other paths are static.
- Rows have no hover state.

## B.5 Scroll-coloring statement
- Same as home §3 (frame `border-x` 1px white/5, `py-[136px] md:py-[212px] lg:py-[300px]`, same V-mark `::before` with an identical SVG, same per-word `useScroll` fill with offset `["start 0.9","start 0.25"]`, same type and word margins). It uses `staticWhenReducedMotion`.
- Copy (18 words): **"The Vault partner program is how we grow together with the people businesses already trust with their finances."** (uppercase via CSS).
- Paragraph box: 1200×156 at 1440 (3 lines); 686×223 at 768 (32px, line-height 49.78px); 340×170 at 390 (18/28). Section heights are 756 / 647 / 442.

## B.6 What you and your clients get (value grid)
- Heading frame "What you and your clients get", then a separator.
- Grid: `grid gap-px border-x-[1.5px] border-white/5 bg-white/5 lg:grid-cols-2`. The white/5 bg shows through the 1px gap as a divider.
  - Columns are 662+662 at 1440 and 582+582 at 1280.
  - Below lg there is a single column, stacked with a 1px gap.
- Each column `flex flex-col bg-[#03020B]`:
  - **Header** `border-b border-white/5 px-4 py-6 md:px-6 lg:py-8 xl:px-14` (94 tall at 1440) holding an **h3**: clashDisplay 600, 24px/28.8px, word-spacing 3px, white, at every width.
  - **Body** `flex flex-col px-4 pt-7 pb-10 md:px-6 lg:pt-10 lg:pb-14 xl:px-14`. Padding is 40/56/56 at 1440; 28/24/40 at md; 28/16/40 at 390.
- Shared item: `h4` is Outfit 18px/27px weight 500, white, `text-pretty`. `p` is `max-w-[520px] leading-6 text-pretty text-white/60`, 16/24.
- **Left column "Your client"**:
  - Block 1 (`flex flex-col gap-3`): h4 "Already uses a similar tool".
    - p "Our migration offer: the cost of the months left on their current subscription comes off their first annual Vault invoice."
    - Link **"Learn more"** → `/migration-offer`:
      - `inline-flex items-center gap-1.5 self-start leading-6`, white, `underline decoration-white/40 underline-offset-4`.
      - Arrow svg 14px (`arrow-right.svg`, stroke currentColor).
      - Hover: decoration white, `transition-colors 300ms`. Focus-visible: outline 2px white, offset 2px.
  - "Or" divider `my-7 lg:my-8 flex items-center gap-4` (margins 28/32): line `h-px flex-1 bg-white/10`, then the label "Or" (11/16 weight 500, tracking .05em, uppercase, white/40; 12px for uk/ru), then a second line.
  - Block 2 (gap-3): h4 "Starting fresh", p "An extended free trial and free personal onboarding."
- **Right column "Your company"**:
  - `<ul class="flex flex-col gap-7">` (28px), each li `flex flex-col gap-2`:
    - "Referral rewards" / "Earn a reward when the businesses you bring pay for Vault. We agree the terms with each partner individually."
    - "Personal invite link" / "Share your own invite link. We see who signed up through you, so every referral counts."
    - "Your clients' workspaces" / "Join your clients' workspaces with the role you need and work with each client's finances from one account."
  - p `mt-6`: "Contact us to discuss the current terms. We'll explain how rewards work and tailor the partnership to your company."
  - **CTA "Become a partner"** `mt-8`: the Primary Small button from home §5 (212×56, pl 20 pr 14 py 10, gap 14, 16/24 weight 500, arrow chip 28px with a 14px arrow). Opens the popup.

## B.7 FAQ (accordion)
- Heading frame "Frequently asked questions", then a separator.
- `<ul class="flex flex-col divide-y divide-white/5 border-x-[1.5px] border-white/5">`.
- Each `<li>` contains `<h3><button>` and a region:
  - **Button**: `id="faq-{id}-question" aria-expanded aria-controls="faq-{id}-answer"`, classes `group flex w-full cursor-pointer items-center justify-between gap-6 px-4 py-5 text-left md:px-[34px] md:py-6`.
    - Type: Outfit 18px/27px weight 500, white.
    - Row height is 75 (md+) and 67 (below md, single line). Padding is 24/34 (md+) and 20/16 (below md).
  - **Chevron**: `chevron-right.svg` at 20px, `shrink-0 text-white/50`, `transition-[rotate,color] duration-300`.
    - Closed: `rotate: 90deg` (points down). Open: `rotate: -90deg` (points up).
    - Hover (group): color → white.
  - **Answer region**: `role="region" aria-labelledby`, has `inert` when closed. Classes `grid transition-[grid-template-rows] duration-300 ease-out`, with `grid-rows-[0fr]` closed and `grid-rows-[1fr]` open (300ms cubic-bezier(0,0,.2,1)).
    - Child `min-h-0 overflow-hidden` holds `<p class="max-w-[800px] px-4 pb-6 md:px-[34px] leading-[150%] text-white/60">` (16/24).
- **Multiple items can be open at once**: the state is a Set, and each click toggles its own id. All start closed.
- Focus-visible: outline 2px white, offset −2px.
- With `motion-reduce`, transitions are none.

| id | question | answer |
|---|---|---|
| earnings | How much do partners earn? | Terms depend on your company and your clients. We agree them individually on an intro call. |
| tracking | How do you track my referrals? | Every partner gets a personal invite link. When a business signs up through it, we see that it came from you and let you know. |
| workspaces | Can I work in my clients' workspaces? | Yes. Your clients invite you with the role you need, and you work with each of them from one account. |
| clients | What do my clients get? | If they already use a similar tool, our **[migration offer](/migration-offer)**. If not, an extended free trial and free personal onboarding. (The link uses the same inline-link classes as "Learn more", without the arrow.) |

## B.8 How to become a partner (`VisualSteps`)
- Heading frame "How to become a partner", then a separator.
- Row `flex flex-col border-x-[1.5px] border-white/5 lg:flex-row-reverse`, 560 tall at lg.

### Visual panel (right on lg, top below lg)
- DotGridPanel bg (as in the hero; 12px dots md+, 8px below) with classes `flex items-center justify-center border-b border-white/5 px-3 py-8 md:px-6 lg:min-h-[560px] lg:w-1/2 lg:shrink-0 lg:border-b-0 lg:p-12`.
- Sizes: 663×560 at 1440 (padding 48); 685×445 at 768 (32/24); 339×445 at 390 (32/12).
- Inner `aria-hidden pointer-events-none relative h-[380px] w-full max-w-[440px] lg:h-[400px]` stacks 4 absolutely positioned layers (`absolute inset-0 flex items-center justify-center`), each holding a MockCard with `max-w-[360px]` (307–315 wide on mobile).
- Only the layer for the current step is visible:
  - Each layer is a `motion.div` with `animate={{opacity: active?1:0, y: active?0:10}}`.
  - Opacity transitions 0.4s easeOut; y transitions 0.5s EXPO. Use `initial={false}`.
- Cards (same MockCard / pill / list-item primitives as the hero):
  1. **Application** (360×318):
     - Header `flex justify-between gap-3`: "Partner application" (14/20 weight 500) and the pill "Ready to send" (`h-6 px-2.5` 12/16 weight 500, `border border-accent/50 bg-accent/20` white).
     - `mt-3.5 flex flex-col gap-3`: 3 fields, each `flex flex-col gap-1.5` with a label in white/50 and a value box `rounded-lg border border-white/10 px-3 py-2`:
       - Company / Ledgerline
       - Your clients / Small and mid-sized businesses
       - You are / Accounting firm
     - Footer `mt-3.5 flex justify-end`: pill "Send" (`h-7 px-3.5 rounded-full bg-white text-[#03020B]` 12/16 weight 500).
  2. **Intro call** (360×205):
     - Icon disc (32px, border white/10) with the calendar icon 16px in white/60 (`svg/partners/calendar.svg`), then "Intro call" / "Video call".
     - Divider `my-3.5`.
     - `flex flex-col gap-1` with list items at `px-0`:
       - LE "Ledgerline" / "Partner".
       - Avatar `size-7 rounded-md bg-white/8` holding the Vault mark (`svg/partners/vault-mark.svg`, 16×14, white), "Partner team" / "Vault".
  3. **Invite link** (360×139): same as the hero invite card, with the "Copy" pill only.
  4. **Referrals** (`p-2`, 360×198):
     - Label "Your referrals".
     - 3 list items: NS Northwind Studio, HD Harbor Dental, AL Alder Logistics. Each has the subtitle "Pays for Vault" and a trailing pill "Scheduled" (`h-5 px-2 text-[11px] leading-4 rounded-full bg-white/8 text-white/80` weight 500).

### Steps text column
- `flex flex-col items-start justify-center gap-8 px-3 pt-8 pb-12 md:px-6 lg:flex-1 lg:py-14 xl:px-14`. Padding is 56 at 1440; 32/24/48 at md; 32/12/48 at 390.
- `<ol class="flex w-full flex-col gap-5">` holds 4 `<li class="relative flex flex-col">`:
  - `<h3><button type="button" aria-pressed class="flex cursor-pointer items-center gap-[18px] xl:gap-7 text-left">` contains:
    - **Number box**: `relative flex size-9 md:size-[42px] xl:size-10 shrink-0 items-center justify-center border font-bold transition-colors duration-300`. Number type is 14/20 (<md), 16/24 (md), 20/28 (xl). It has two corner ticks (`size-[5px] md:size-1.5`, border-t/l and border-r/b `#EDEDFA`, at −1px).
      - Inactive: `border-white/10 bg-white/2 text-white`.
      - Active: `border-white bg-white text-[#03020B]`, a CSS 300ms colour transition (unlike home, which uses Framer).
    - **Title**: clashDisplay 600, 20px, word-spacing 2px, white, line-height 28px (<md) / 24px (md+).
  - **Description**: `grid transition-[grid-template-rows] duration-300 ease-out` toggling `grid-rows-[1fr]`/`[0fr]`. Inside, `min-h-0 overflow-hidden > p.max-w-[460px] pt-1.5 pl-[54px] md:pl-[60px] xl:pl-[68px] text-sm leading-[22px] lg:text-base lg:leading-6 tracking-tight text-pretty text-white/60` (letter-spacing −0.4px at 16px).
  - **Connector** (all but the last li): `span.absolute top-9 -bottom-5 left-[18px] w-px overflow-hidden bg-white/20`, with md values `top-[42px] left-[21px]` and xl values `top-10 left-5`. While the step is active and running it contains `motion.span.absolute.inset-0.origin-top.bg-white` animating scaleY 0 → 1 over **4.8s linear** (`stepDuration − 0.2`), keyed by runId so it restarts.
- Then the **CTA "Become a partner"** (Primary Small, 212×56). Opens the popup.

| # | title | description |
|---|---|---|
| 1 | Leave a request | Tell us about your company and your clients in a short form. |
| 2 | Intro call | We discuss your clients, referral terms and how we'll work together. |
| 3 | Get your invite link | You get a personal invite link, and you can join your clients' workspaces. |
| 4 | Earn rewards | We track sign-ups from your link and pay rewards on the agreed schedule. |

- **Step logic** (from source):
  - `inView = useInView(rowRef, {amount: 0.2})` is not once. `seen = useInView(rowRef, {amount: 0.2, once: true})`.
  - `running = inView && !document.hidden && !reducedMotion`.
  - State starts as `{index: 0, runId: 0}`. While running, a `setTimeout(5000)` sets `index = (index+1) % 4` and `runId+1`. It **loops through all 4 steps**, unlike home, where the last step has no timer.
  - Clicking a number/title sets that index, `runId+1` and `chosen=true`, which restarts the 5s timer.
  - The highlighted number box (`aria-pressed`) appears only after the row has been seen once. Before that no box is filled, but step 1's description is already expanded.
  - The expanded description and the visible visual both follow `index`.
  - Reduced motion: all descriptions are expanded, there is no timer, and the visual shows step 3 ("Get your invite link") until the user clicks.
- After the row: a separator, then a spacer frame `h-24 lg:h-50` (96 / 200px) with side borders. Unlike home, this spacer is NOT hidden at md.

## B.9 "Become a partner" popup (lead form modal)
- Opened by all three "Become a partner" buttons. The content is lazy-loaded (prefetched on idle, on IntersectionObserver, on pointerenter and on focus).
- While the chunk loads, it shows a spinner (`size-8 animate-spin text-white/60`, `py-10`) with sr-only "Loading…".
- **Portal** into `#popupPortal`: `fixed inset-0 z-[1000] flex h-dvh w-screen items-center justify-center p-4 md:p-6`, with `animation: fade-in .18s ease-out both`.
  - **Backdrop** `absolute inset-0 bg-[#03020B]/60`. Clicking it closes the popup.
  - **Gradient border frame** `flex max-h-full w-full max-w-[484px] md:w-[90%] md:min-h-[400px] rounded-[32px] p-px transform-gpu will-change-transform`:
    - `background: linear-gradient(96.18deg, rgba(81,118,254,.75) 7.9%, rgba(155,174,242,.5) 64.2%, rgba(81,118,254,.1) 118.37%)`.
    - `animation: scale-in .22s cubic-bezier(.22,1,.36,1) both` (keyframes are in home §12.7).
    - Size: 484×541 at 1440 (623 tall with errors); 358×621 at 390.
  - **Dialog** `role="dialog" aria-modal="true" aria-labelledby="popup-title" tabIndex=-1`, classes `relative flex flex-1 flex-col overflow-y-auto rounded-[32px] bg-[#080710] p-6 md:p-8 outline-none`.
  - **Close button** `absolute top-3 right-3 md:top-4 md:right-4 z-10 size-9 rounded-full text-white/50`, hover white over 300ms, `aria-label="Close"`, icon 20px (`svg/partners/popup-close.svg`).
  - Behaviour: Esc closes; focus is trapped (Tab/Shift+Tab cycle); focus moves to the first field and is restored on close; body scroll lock (`body{position:fixed;top:0;left:0;right:0;width:100%}`).
- **Content** `flex w-full flex-col gap-6`:
  - Header `flex flex-col gap-2`:
    - `h4#popup-title` "Become a Vault partner": clashDisplay 600, 24/28.8, word-spacing 3px, white.
    - `p` "Tell us about yourself, and we'll get in touch to discuss the terms.": 16/26, white/60.
  - Form `flex flex-col gap-8`:
    - Fields `flex flex-col gap-3`:
      - Row `flex w-full flex-col gap-4 md:flex-row` holds First name and Last name (201 each at 1440; stacked at 390).
      - Then Work email, then Phone.
    - Field `relative flex w-full flex-col gap-2`:
      - `<label for="lead-form-{name}">`: Outfit 300, 16/24, white.
      - `<input type="text" autocomplete="off">` with classes `h-12 w-full rounded-lg border border-white/10 bg-inherit pt-2.5 pb-3.5 pl-4 text-base font-light text-white outline-0 transition-all duration-200`.
        - Focus: border white.
        - Error: border `#EE3D2C`, plus a `<span class="text-sm text-red">` (14/20, `#EE3D2C`) under the input inside the same gap-2 column.
        - Disabled (while submitting): opacity .6.
    - **Phone** (react-international-phone, custom-styled):
      - Wrapper `relative rounded-lg border border-white/10 focus-within:border-white` (50 tall); error turns it red.
      - Country button `my-3 flex h-6 items-center border-r border-white/5 pl-5 pr-3`, `aria-label="Country selector"`:
        - Flag img 16×16, radius 2px, `mr-1.5`. Twemoji SVG, default US.
        - Caret: CSS triangle `border-x-[5px] border-t-[5px] border-x-transparent border-t-white`. It points up when open.
      - `<input type="tel" id="lead-form-phone" class="h-12 w-full border-0 bg-transparent px-2 text-base font-light text-white outline-none">`, prefilled "+1".
      - **Open dropdown**:
        - The wrapper switches to `rounded-b-none border-b-transparent border-white` and shows a `::before` hairline (`left-4 right-4 bottom-0 h-px bg-white/10`).
        - The list panel is `fixed z-[1100] rounded-b-lg border-x border-b border-white bg-[#080710] pt-3 overflow-hidden`, aligned to the wrapper (x/width), max-height 200px.
        - Scroll container `overflow-y-auto overscroll-contain` → `ul.m-0.list-none.pr-6.pb-4`.
        - 218 items, each `button.flex.w-full.items-center.px-4.py-0.5.text-left.text-base.font-light.text-white` (28 tall), with hover/selected `bg-white/5`. Inside: flag 16px `mr-3`, name `mr-1 truncate`, dial code `text-white/60`.
    - **Submit**: Primary Large button full width "Send request" (418×64 at 1440; 308×64 at 390).
- **Validation** (zod + react-hook-form, on submit, then live on change):
  - firstName required: "Please enter your First name".
  - lastName required: "Please enter your Last name".
  - email required: "Please enter your email". Invalid format: "Email address is invalid".
  - phone required: "Please enter your phone number". Invalid (libphonenumber-js `isValid`): "Phone number is invalid".
  - The first invalid field receives focus.
- **Submit**: `POST /api/add-lead` with JSON `{firstName,lastName,email,phone, source:"partner_program", utm_source, utm_medium, utm_campaign, utm_term, utm_content}`. **Not exercised live**, because it would create a real lead.
- **Result view** (from source; replaces the form):
  - Container `flex w-full flex-col items-center gap-4 py-6 md:px-4 md:pt-12 md:pb-6`.
  - Icon circle `size-16 rounded-full bg-[#080710]` holding a 40px icon: a check for success, the error icon otherwise.
  - `h3#popup-title`: clashDisplay 600, uppercase, word-spacing 3px. Sizes `text-xl leading-9` (20/36), `md:text-[32px] md:leading-10`, `lg:text-3xl lg:leading-12` (30/48).
  - `p`: centered, 18px, white/60.
  - Success: "You are in!" / "Thank you for contacting us.<br>We'll be in touch soon with next steps."
  - Error: "Ooops!" / "Something went wrong.<br>Please try again".
- Screenshots: `recon/partners/popup-1440.png`, `popup-errors-1440.png`, `popup-country-dropdown-1440.png`, `popup-390.png`.

## B.10 Hover / interactive inventory (partners-specific)
| element | change | timing |
|---|---|---|
| FAQ question row (group) | chevron white/50 → white | 300ms cubic-bezier(.4,0,.2,1) |
| FAQ open/close | chevron rotate 90° ↔ −90°; answer grid-rows 0fr ↔ 1fr | 300ms (rows ease-out) |
| "Learn more" and the inline "migration offer" link | underline decoration white/40 → white | 300ms |
| Step number buttons | no hover; click selects the step (active box bg/border white, text #03020B) | 300ms colour transition |
| Popup close X | white/50 → white | 300ms |
| Popup inputs | border white/10 → white on focus | 200ms all |
| Country list item | bg → white/5 on hover | instant |
| "Become a partner" buttons | none (same as home CTAs) | – |
| Nav / footer | as home §11 | |

## B.11 Responsive deltas summary (partners)
| element | 1440 | 1280 | 768 | 390 |
|---|---|---|---|---|
| hero layout | row: text 62% (822) + scene 504; min-h 720 | text 722 + scene 443 | stacked: text 464 + scene 587 | stacked: text 425 + scene 587 |
| hero text pad | 136/24/0/56 | 136/24/0/56 | 112/24/0 | 96/16/0 |
| h1 | 56/64 ws8, 2 lines (forced) | same | 48/52.8 ws6 | 32/38.4 ws4 |
| h2 | 48/64 ws7 | same | 30/36 ws4 | 30/36 ws4 |
| audience row | 3-col grid 72/0.9fr/1.3fr, pad 32/56 | 72/382/551 | 44/1fr, p spans 2 cols, pad 24 | pad 24/16 |
| audience icon / h3 | 56 / 24/28.8 | same | 44 / 20/28 | 44 / 20/28 |
| statement | py 300, 36/40 | same | py 212, 32px | py 136, 18/28 |
| value grid | 2 cols 662 | 2 cols 582 | 1 col | 1 col |
| FAQ button pad | 24/34 | 24/34 | 24/34 | 20/16 |
| steps | visual right 663×560, text left pad 56 | 583 each | visual top 685×445, text below | visual top 339×445 |
| step number | 40, 20/28 | 40 | 42, 16/24 | 36, 14/20 |
| step desc | 16/24, pl 68 | 16/24, pl 68 | 14/22, pl 60 | 14/22, pl 54 |
| trailing spacer | 200 | 200 | 96 | 96 |

---
# C. `/ua` (Ukrainian home)

**Verdict:** `/ua` is the same React tree as `/` (same sections, components, motion and timings, with Lottie files loaded from the same URLs). It differs in five ways: **locale fonts, strings, the hero image, a few `:lang(uk)` overrides, and locale-prefixed hrefs**. At 1440 and 1280 the document height is identical to EN (6623 / 6527). At 768 and 390 longer strings cause small height changes (C.4).

## C.1 Meta
- `<html lang="uk">`.
- `<title>`: **Vault AI | Управління фінансами бізнесу | FP&A-платформа**
- description / og:description / twitter:description: "AI-платформа для обліку транзакцій, звітів та автоматизації рутинної фінансової роботи. Для малого й середнього бізнесу."
- og:title "Vault AI | Управління фінансами бізнесу". twitter:title "Vault AI".
- og:url and canonical `https://www.usevault.ai/ua`. og:locale **`uk_UA`**. og:image `/og-image.png` (same as EN).
- hreflang: en `https://www.usevault.ai`, ru `/ru`, uk `/ua`, x-default `https://www.usevault.ai`.

## C.2 Fonts (the biggest visual difference)
- The `<html>` element gets an inline style: `--font-body: var(--font-manrope); --font-display: var(--font-unbounded)`. Every `font-display` element therefore renders in **Unbounded**, and body text renders in **Manrope**.
  - The full stacks are `"unbounded", "Unbounded Fallback", Arial, sans-serif` and `"manrope", "Manrope Fallback", Arial, sans-serif`.
- Font files and fallback `@font-face` metrics already exist (`public/assets/fonts/Unbounded-latin-cyrillic.woff2`, `Manrope-latin-cyrillic.woff2`, and `ASSET_MANIFEST.md` lines 14–15, 34–35). On `/ua`, both are loaded together with Outfit and ClashDisplay.
- **Font sizes, line-heights, weights and word-spacing are unchanged.** The same utility classes apply, for example:
  - h1 64/72 weight 600 word-spacing 8px.
  - Statement 36/40 with letter-spacing .9px.
  - Feature h3 28/33.6.
  - Steps h2 48/64.
  - Body 16/26 weight 300.
  - Tabs 18/22 weight 500.
- Implementation: in the clone, set CSS vars on `<html>` per locale (EN: Outfit / clashDisplay; UA: Manrope / Unbounded), and have `font-display`/`font-body` utilities read those vars.

## C.3 `:lang(uk)` overrides (also apply to `ru`)
| element | EN | UA |
|---|---|---|
| Hero eyebrow pill text, "Soon" pills, footer group labels, partners mock labels, "Or" divider, all 11px uppercase micro-labels | 11px/16px, tracking .05em | **12px**/16px (tracking .05em = 0.6px) |
| Hero text block `max-w-100 md:max-w-140 lg:max-w-187.5` | 400 / 560 / 750 | **`max-width: 880px` at all widths**. The `:lang` rule has higher specificity and overrides the responsive ones. Measured widths: 751 at lg, 563 at 768 (EN 560), 339 at 390. |
| Footer social icons (LinkedIn/Telegram/mail svg) | top 0 | `top: 0.45px` (relative) |
| h1/h2 on legal pages | – | `hyphens: auto` |

## C.4 Layout shifts from longer strings (measured)
| item | EN | UA |
|---|---|---|
| hero pill box | 247×24 | 251×24 |
| h1 (1440) | 750×144, 2 lines | 751×144, 2 lines. The headline has an explicit `\n` (`whitespace-pre-line`): "Усі фінанси бізнесу\nна одному екрані". |
| hero CTA "Почати" | 188×64 | **152×64** |
| nav CTA "Почати" | 142×56 | 106×56 |
| desktop nav `<ul>` (1440) | 450 wide, x 468–918 | 442 wide, x 494–936. Item widths 56/99/34/55/50, gap 37. |
| feature CTA "Спробувати безкоштовно" | 153×56 | **259×56** |
| process CTA "Почати" | 166×56 | 133×56 |
| statement words | 23 | 19 (box 1200×208, 4 lines, at 1440) |
| automation h3 (≥lg) | 488×67 (2 lines) | 488×101 (3 lines). Section height is unchanged at lg, because the body is fixed at 432. |
| steps h2 "Прозорість / у ваших фінансах" | 488×128 | 577×128 (1440); 360×72 (768); **339×108, 3 lines** (390) |
| step h6 widths (1440) | 236/203/240 | 226/213/325 |
| doc height 1440 / 1280 | 6623 / 6527 | 6623 / 6527 (identical) |
| doc height 768 | 7280 (feature sections 903/926/903, steps 1099) | **7269** (937/903/881, steps 1099) |
| doc height 390 | 7498 (feature 759/782/708, steps 908) | **7614** (811/782/737, steps 944) |
| footer columns at 1280 | 4 cols | 379/99/156/179 |

All other boxes (hero 1362/1265/979/783, image sizes, card sizes 431×372, tab bars, step boxes, footer heights) match EN exactly.

## C.5 Hero image
- `hero-uk.png` (3312×2004 RGBA). It shows the same dashboard as EN, but its UI is in Ukrainian. It is served through `next/image` at `w=3840&q=75`.
- The downloaded copies are `public/assets/img/hero-uk.png` (original) and `hero-uk-q75.webp` (optimized).
- Alt text: **"Інтерфейс Vault AI"**.
- Rendered size and gradients are identical to home §2.
- Lottie files are **the same `.lottie` files as EN**. Any text inside the canvases stays English; there are no UA-specific lotties.

## C.6 Language switch and link behaviour
- The switch is the same component as home §1.
  - On `/ua`: **EN** `<a lang="en" hreflang="en" href="/">` is white/50 and turns white on hover (400ms).
  - **UA** `<a lang="uk" hreflang="uk" href="/ua" aria-current="true">` is white.
  - On EN pages the states are mirrored.
- Rule: the EN href is the current path without the `/ua` prefix; the UA href is `/ua` + the EN path (e.g. `/partners` ↔ `/ua/partners`, `/terms` ↔ `/ua/terms`, `/` ↔ `/ua`).
- `aria-label` of the group is "Мова" (EN "Language"). The sr-only labels are "English" and "Українська".
- **Hrefs on `/ua`** (home page):
  - Logo → `#top`.
  - Section links → `#product`, `#automation`, `#reports`, `#security` (same-page).
  - Pricing → `/ua/pricing`.
  - CTAs → `https://app.usevault.ai/login` (unchanged).
  - Footer:
    - Help Center → `https://help.usevault.ai/uk/`.
    - Status → `https://status.usevault.ai/`.
    - "Перехід на Vault" → `/ua/migration-offer`.
    - "Партнерська програма" → `/ua/partners`.
    - Legal → `/ua/terms`, `/ua/privacy`, `/ua/dpa`.
- **On other UA pages** (e.g. `/ua/partners`), the logo → `/ua` and section links → `/ua#product`, `/ua#automation` and so on.
- **Other locale routes (all HTTP 200):**
  - UA: `/ua/pricing`, `/ua/partners` (title "Партнерська програма | Vault AI"), `/ua/migration-offer`, `/ua/terms`, `/ua/privacy`, `/ua/dpa`, `/ua/subprocessors`.
  - A **`/ru`** locale also exists (hreflang on home and partners; `/ru`, `/ru/partners`). It is not linked from the language switch.
  - `/subprocessors` exists too (linked from DPA).
- Mobile menu on `/ua`: items "01. Продукт" … "05. Тарифи" (56px each); burger aria-labels "Відкрити меню" / "Закрити меню"; CTA "Почати".

## C.7 Motion
Identical to home §12. Same components, the same tab/step durations (they come from Lottie markers, and the files are the same), and the same statement scroll-fill. In UA the statement has 19 words, so each word's segment is 1/19 of the progress.

## C.8 Strings table: home (EN → UA), keyed as in the site's i18n messages
Notes:
- `<br></br>` is a rich-text line break.
- `\n` is a literal newline rendered with `whitespace-pre-line`.
- In `processSteps.steps.*.description`, EN has embedded `\n` line breaks (see home §8) but **UA has none**. The UA copy is the single strings below.
- The "Soon" pill text is `productHighlights.soon`.
- Strings were taken from the site's own `next-intl` message payload, so they are exact.

| key | EN | UA |
|---|---|---|
| `meta.title` | Vault AI \| Finance management app \| FP&A Software | Vault AI \| Управління фінансами бізнесу \| FP&A-платформа |
| `meta.description` | AI-native platform to track transactions, generate reports, and automate manual financial work, built for SMBs. | AI-платформа для обліку транзакцій, звітів та автоматизації рутинної фінансової роботи. Для малого й середнього бізнесу. |
| `meta.siteName` | Vault AI | Vault AI |
| `meta.ogTitle` | Vault AI \| Finance management app | Vault AI \| Управління фінансами бізнесу |
| `meta.ogDescription` | AI-native platform to track transactions, generate reports, and automate manual financial work, built for SMBs. | AI-платформа для обліку транзакцій, звітів та автоматизації рутинної фінансової роботи. Для малого й середнього бізнесу. |
| `meta.twitterTitle` | Vault AI | Vault AI |
| `meta.twitterDescription` | AI-native platform to track transactions, generate reports, and automate manual financial work, built for SMBs. | AI-платформа для обліку транзакцій, звітів та автоматизації рутинної фінансової роботи. Для малого й середнього бізнесу. |
| `nav.homeAriaLabel` | Vault AI home | Vault AI — на головну |
| `nav.cta` | Get started | Почати |
| `nav.items.product` | Product | Продукт |
| `nav.items.automation` | Automation | Автоматизація |
| `nav.items.reports` | Reports | Звіти |
| `nav.items.security` | Security | Безпека |
| `nav.items.pricing` | Pricing | Тарифи |
| `languageSwitcher.ariaLabel` | Language | Мова |
| `mobileNav.openMenu` | Open menu | Відкрити меню |
| `mobileNav.closeMenu` | Close menu | Закрити меню |
| `hero.badge` | FINANCIAL MANAGEMENT PLATFORM | ПЛАТФОРМА УПРАВЛІННЯ ФІНАНСАМИ |
| `hero.headline` | Control your Business Finances in One Place | Усі фінанси бізнесу\nна одному екрані |
| `hero.subheadline` | AI-native platform to track transactions, generate reports, and automate manual financial work, built for SMBs. | AI-платформа для обліку транзакцій, звітів та автоматизації рутинної фінансової роботи. Для малого й середнього бізнесу. |
| `hero.cta` | Get started | Почати |
| `hero.imageAlt` | Vault AI dashboard showing the total balance, a balance chart and recent transactions | Інтерфейс Vault AI |
| `scrollColoringText.paragraph` | Vault gives you a complete system to track, understand, and automate your business finances bringing transactions, reports, and workflows together in one place | Vault дає повну систему, щоб відстежувати, розуміти й автоматизувати фінанси бізнесу, об’єднуючи транзакції, звіти та процеси на одному екрані |
| `productHighlights.soon` | Soon | Незабаром |
| `productHighlights.cards.global-financial-ledger.title` | Global Financial Ledger | Єдиний фінансовий реєстр |
| `productHighlights.cards.global-financial-ledger.description` | A unified system that brings all your financial data into one reliable source of truth. | Усі фінансові дані компанії консолідуються в одному достовірному джерелі. |
| `productHighlights.cards.global-financial-ledger.ariaLabel` | Global Financial Ledger animation | Анімація «Єдиний фінансовий реєстр» |
| `productHighlights.cards.web3-integrations.title` | Secure Bank & Web3 Integrations | Інтеграції з банками та Web3 |
| `productHighlights.cards.web3-integrations.description` | Connect your bank accounts and Web3 wallets through trusted providers like Plaid. | Підключайте банківські рахунки та Web3-гаманці через перевірених провайдерів на кшталт Plaid. |
| `productHighlights.cards.web3-integrations.ariaLabel` | Secure Bank and Web3 Integrations animation | Анімація «Інтеграції з банками та Web3» |
| `productHighlights.cards.custom-financial-reports.title` | Custom Financial Reports | Налаштовувані звіти |
| `productHighlights.cards.custom-financial-reports.description` | Go beyond standard P&L - build reports around the metrics that matter to your business. | Стандартний P&L — лише початок: будуйте звіти навколо метрик, важливих саме для вашого бізнеса. |
| `productHighlights.cards.custom-financial-reports.ariaLabel` | Custom Financial Reports animation | Анімація «Налаштовувані звіти» |
| `productHighlights.cards.user-management.title` | User Management | Керування доступом |
| `productHighlights.cards.user-management.description` | Control access with configurable roles and permissions for your team. | Налаштовувані ролі та права доступу для всієї команди. |
| `productHighlights.cards.user-management.ariaLabel` | User Management animation | Анімація «Керування доступом» |
| `productHighlights.cards.workflow-automations.title` | Workflow Automations | Автоматизація процесів |
| `productHighlights.cards.workflow-automations.description` | Automate routine financial tasks with customizable workflows and AI-powered transaction enrichment. | Автоматизуйте рутинні фінансові задачі за допомогою налаштовуваних сценаріїв та AI-збагачення транзакцій. |
| `productHighlights.cards.workflow-automations.ariaLabel` | Workflow Automations animation | Анімація «Автоматизація процесів» |
| `productHighlights.cards.invoice-builder.title` | Invoice Builder | Конструктор інвойсів |
| `productHighlights.cards.invoice-builder.description` | Create and manage invoices instantly. Keep revenue tracking in one place. | Створюйте інвойси й керуйте ними миттєво. Облік виручки — на одному екрані. |
| `productHighlights.cards.invoice-builder.ariaLabel` | Invoice Builder animation | Анімація «Конструктор інвойсів» |
| `featureShowcase.cta` | Try it free | Спробувати безкоштовно |
| `featureShowcase.previousAriaLabel` | Previous feature | Попередня можливість |
| `featureShowcase.nextAriaLabel` | Next feature | Наступна можливість |
| `featureShowcase.sections.automation.title` | Automate financial tasks that used to require manual work | Автоматизуйте фінансові завдання, які раніше виконувалися вручну |
| `featureShowcase.sections.automation.description` | Set up smart automations and let Vault categorize transactions, enrich financial data, send reports and alerts, and run financial workflows automatically. Save hours of repetitive work every week. | Налаштуйте розумні сценарії — і Vault сам категоризує транзакції, збагачуватиме фінансові дані, надсилатиме звіти й сповіщення, запускатиме фінансові процеси. Заощаджуйте години рутини щотижня. |
| `featureShowcase.sections.automation.tabs.enrich-financial-data` | Enrich Financial Data | Збагачення даних |
| `featureShowcase.sections.automation.tabs.alert-unusual-expenses` | Alert on Unusual Expenses | Сповіщення про витрати |
| `featureShowcase.sections.automation.tabs.automate-recurring-reports` | Automate Recurring Reports | Регулярні звіти |
| `featureShowcase.sections.reports.title` | Understand your business finances in real time | Аналізуйте фінанси бізнесу в реальному часі |
| `featureShowcase.sections.reports.description` | Vault transforms transactions into real-time reports that help you understand revenue, expenses, cash flow, and profitability. Go beyond standard P&L - visualize any financial data to make better business decisions. | Vault перетворює транзакції на звіти у режимі реального часу: виручка, витрати, грошовий потік і прибутковість. Не обмежуйтеся стандартним P&L — візуалізуйте будь-які фінансові дані й ухвалюйте рішення впевненіше. |
| `featureShowcase.sections.reports.tabs.profit-loss-overview` | Profit & Loss Overview | Огляд P&L |
| `featureShowcase.sections.reports.tabs.expense-breakdown` | Expense Breakdown | Структура витрат |
| `featureShowcase.sections.reports.tabs.custom-financial-reports` | Custom Financial Reports | Налаштовувані звіти |
| `featureShowcase.sections.security.title` | Built on secure financial infrastructure | Побудовано на надійній фінансовій інфраструктурі |
| `featureShowcase.sections.security.description` | Vault is designed with a reliable financial data architecture, secure integrations, and role-based access control to ensure your data stays accurate and protected. | В основі Vault — продумана архітектура фінансових даних, безпечні інтеграції та рольова модель доступу. Ваші дані залишаються точними й захищеними. |
| `featureShowcase.sections.security.tabs.centralized-financial-ledger` | Centralized Financial Ledger | Централізований реєстр |
| `featureShowcase.sections.security.tabs.secure-accounts-integrations` | Secure Accounts Integrations | Безпечні інтеграції |
| `featureShowcase.sections.security.tabs.role-based-access-control` | Role-Based Access Control | Рольова модель доступу |
| `processSteps.heading` | Gain Clarity <br></br>on your Finances | Прозорість <br></br>у ваших фінансах |
| `processSteps.cta` | Get started | Почати |
| `processSteps.playStepAriaLabel` | Play step {step} | Відтворити крок {step} |
| `processSteps.steps.connect-your-accounts.header` | Connect your accounts | Підключіть рахунки |
| `processSteps.steps.connect-your-accounts.description` | Sign up and securely connect your bank\n accounts and Web3 wallets. | Зареєструйтеся та безпечно підключіть банківські рахунки й Web3-гаманці. |
| `processSteps.steps.structure-your-data.header` | Structure your data | Структуруйте дані |
| `processSteps.steps.structure-your-data.description` | Set up automations, define revenue and expense\n categories, and create reports tailored to your business. | Налаштуйте автоматизації, визначте категорії доходів і витрат, зберіть звіти під свій бізнес. |
| `processSteps.steps.turn-data-into-decisions.header` | Turn data into decisions | Перетворіть дані на рішення |
| `processSteps.steps.turn-data-into-decisions.description` | Vault transforms raw data into insights that reveal\n what's working, what's changing, and where to focus\n next - so you can act with confidence. | Vault перетворює сирі дані на зрозумілу картину: що працює, що змінюється і на чому зосередитися далі, — щоб ви діяли впевнено. |
| `footer.linkedinAriaLabel` | LinkedIn | LinkedIn |
| `footer.telegramAriaLabel` | Vault AI on Telegram | Vault AI у Telegram |
| `footer.email` | hello@usevault.ai | hello@usevault.ai |
| `footer.copyright` | © {year} VAULT AI. All rights reserved. | © {year} VAULT AI. Усі права захищені. |
| `footer.builtBy` | Built by | Створено в |
| `footer.overcodeAriaLabel` | Overcode (opens in a new tab) | Overcode (відкривається в новій вкладці) |
| `footer.legal.terms` | Terms of Service | Умови використання |
| `footer.legal.privacy` | Privacy Policy | Політика конфіденційності |
| `footer.legal.dpa` | DPA | DPA |
| `footer.helpCenter` | Help Center | Довідковий центр |
| `footer.status` | Status | Статус |
| `footer.migrationOffer` | Migration offer | Перехід на Vault |
| `footer.partnerProgram` | Partner program | Партнерська програма |
| `footer.groups.platform` | Platform | Платформа |
| `footer.groups.resources` | Resources | Ресурси |
| `footer.groups.legal` | Legal | Документи |

---

# D. Legal pages `/terms`, `/privacy`, `/dpa`: shared template

Body copy is intentionally **not** reproduced; use placeholder text. Only the template and the heading outlines are specced.

## D.1 Layout
- Nav and footer as in section A. There is **no hero, page header band, TOC, sidebar, sticky element, back-to-top button, or entrance/scroll animation**.
- `<main>` → `div.w-full.max-w-[1440px].px-6.md:px-10.lg:px-14` → frame `border-x-[1.5px] border-white/5 px-4 py-12 md:px-6 md:py-16 lg:py-20 xl:px-14`.
  - Padding is 80/56 at 1440, 64/24 at md, and 48/16 at 390.
  - Inside it, `<article class="mx-auto w-full max-w-[750px]">`, which is 750 wide and centered (x 345 at 1440). At 390 it is 307 wide.
- After the frame comes one separator (crosses), then the footer.
- Document heights at 1440: terms **10693**, privacy **8557**, dpa **9393**. Privacy at 390: 14716.

## D.2 Typography and element styles (computed at 1440 unless noted)
| element | classes | computed |
|---|---|---|
| `h1` (id = slug, e.g. `terms-of-service`) | `font-display text-[32px] leading-[120%] font-semibold text-white md:text-5xl md:leading-[110%] break-words` (+ `hyphens-auto` for uk/ru) | clashDisplay 600; **48px/52.8px** md+; 32px/38.4px below md; white; no word-spacing |
| "last updated" line (first `p` after h1) | `mt-5 leading-6.5 break-words text-white/80` | `<strong class="font-medium text-white">Vault AI</strong><br>Effective date: 12 October 2026` (UA: "Дата набрання чинності: 12 жовтня 2026 р."); Outfit 16/26, white/80; strong weight 500, white; margin-top 20 |
| `hr` (before every h2) | `mt-10 border-t border-white/5` | 1px rgba(255,255,255,.05), margin-top 40, full article width |
| `h2` (id = section number `"1"`…`"18"`, or `annex-1`, `annex-2`, `contact`) | `mt-10 scroll-mt-10 font-display text-xl leading-[120%] font-semibold text-white md:text-2xl break-words` | clashDisplay 600; **24px/28.8px** md+, 20px/24px below; margin-top 40; scroll-margin-top 40 |
| `h3` (privacy, dpa; id like `"3.1"`) | `mt-8 scroll-mt-10 text-lg leading-[150%] font-medium text-white break-words` | Outfit 500, 18px/27px, white; margin-top 32; scroll-margin-top 40 |
| `h4` | not used on any of the three pages | – |
| `p` | `mt-5 leading-6.5 break-words text-white/80` | Outfit 400, 16px/26px, rgba(255,255,255,.8), margin-top 20. Clause numbers / lead-ins are `<strong class="font-medium text-white">` (e.g. "4.1 Account security."). `<em class="italic">` also occurs. |
| `p` directly after the first `hr` (dpa preamble) | `mt-10 …` | same as p, margin-top 40 |
| `a` | `underline decoration-white/20 underline-offset-4 transition-colors duration-400 hover:decoration-white` | Colour is inherited (white/80, or white weight 500 inside strong). Underline 1px at offset 4px, colour white/20 → white on hover over 400ms cubic-bezier(.4,0,.2,1). Targets include `mailto:hello@usevault.ai`, `/privacy`, `/subprocessors`, `#annex-1`, `#8`. |
| `ul` | `mt-4 flex list-disc flex-col gap-3 pl-5 marker:text-white/40` | margin-top 16, padding-left 20, 12px gap between items, disc marker rgba(255,255,255,.4) |
| `li` | `leading-6.5 break-words text-white/80` | 16/26, white/80 |
| `ol` | not used | – |
| `br` | used inside contact address paragraphs | – |

## D.3 Tables (responsive pair)
- Wrapper `div.mt-6` (24px).
- **md+**: `<table class="hidden w-full border-collapse text-left md:table">`.
  - `thead tr.border-b.border-white/5`.
  - `th.px-4.py-3.text-sm.leading-5.font-medium.text-white/60` (14/20 weight 500, padding 12/16).
  - `tbody.divide-y.divide-white/5`.
  - `td.px-4.py-3.align-top.leading-6.5.break-words.text-white/80` (16/26). The first cell's content is wrapped in `<strong class="font-medium text-white">`.
  - The table has no outer border and no zebra striping. Column widths are auto (content-driven).
- **Below md**, the table is replaced by a card list: `div.divide-y.divide-white/5.border-y.border-white/5.md:hidden`.
  - Each record is `div.flex.flex-col.gap-3.py-5` (20px vertical padding), containing:
    - Title `p.text-lg.leading-[150%].font-medium.text-white` (18/27 weight 500), the first column's value.
    - `dl.flex.flex-col.gap-3`. Each remaining column is a `div.flex.flex-col.gap-0.5` with `dt.text-sm.leading-5.text-white/40` (14/20; the column header) and `dd.leading-6.5.text-white/80` (16/26).
- Tables used:
  - terms §5: 4 columns "Plan | Price | Transactions / month | Bank accounts", 4 rows.
  - privacy §3.1, §3.2, §3.3: 3 columns "What | Why | Lawful basis".
  - privacy §6: "Provider | Purpose | Location".
  - privacy §8: "Data | Retention".
  - dpa Annex 2: "Sub-processor | Purpose | Location".

## D.4 Behaviour
- In-page anchor links (e.g. `#annex-1`, `#8`) use the site's zenscroll: a smooth ~1000ms ease-in-out scroll. It lands with the heading 40px below the viewport top (= `scroll-mt-10`). Measured live: the target heading top was at 41px after 1.0s. `location.hash` is updated.
- Native `scroll-behavior` is `auto`.
- UA versions (`/ua/terms` and so on) are **fully translated** with the same template, rendered in Unbounded/Manrope with `hyphens: auto` on headings.
  - The i18n key `legal.englishOnlyNotice` ("The legal documents are available in English only." / "Юридичні документи доступні лише англійською мовою.") exists but is **not rendered** on `/ua/terms` (checked).

## D.5 Per-page meta and heading outline
**`/terms`**:
- title "Terms of Service | Vault AI".
- description "The terms governing use of Vault AI, the financial management and planning platform operated by Overcode Limited."
- canonical `/terms`. hreflang en `/terms`, uk `/ua/terms`, x-default `/terms` (no ru). og:* mirror title and description, og:image `/og-image.png`.
- Outline:
  - H1 `#terms-of-service` Terms of Service
  - H2 `#1` 1. About these Terms
  - `#2` 2. Definitions
  - `#3` 3. Eligibility
  - `#4` 4. Accounts and Workspaces
  - `#5` 5. Plans, Seats and Payment (includes a table)
  - `#6` 6. What the Service Is, and What It Is Not
  - `#7` 7. Bank Connections, Wallets and Third-Party Data
  - `#8` 8. Your Obligations and Acceptable Use (includes a ul)
  - `#9` 9. Data Protection
  - `#10` 10. Availability and Support
  - `#11` 11. Intellectual Property
  - `#12` 12. Suspension, Termination, Export and Deletion (ul)
  - `#13` 13. Warranties and Disclaimers
  - `#14` 14. Limitation of Liability (ul)
  - `#15` 15. Changes to These Terms
  - `#16` 16. General
  - `#17` 17. Governing Law and Jurisdiction
  - `#18` 18. Contact (address with `<br>` and a mailto link)

**`/privacy`**:
- title "Privacy Policy | Vault AI".
- description "How Vault AI handles personal data, as controller and as processor, and the rights available to you."
- canonical `/privacy`. hreflang en, uk `/ua/privacy`, x-default.
- Outline:
  - H1 `#privacy-policy` Privacy Policy
  - H2 1. Who we are
  - 2. Two different roles
  - 3. Data we process as controller
    - H3 `#3.1` 3.1 Account data (table)
    - `#3.2` 3.2 Billing data (table)
    - `#3.3` 3.3 Usage and technical data (table)
    - `#3.4` 3.4 Marketing
  - H2 4. Data we process as processor
  - 5. Bank and wallet connections
  - 6. Who we share data with (table)
  - 7. International transfers
  - 8. How long we keep data (table)
  - 9. Security
  - 10. Your rights
  - 11. Automated decision-making
  - 12. Cookies
  - 13. Children
  - 14. Changes to this policy
  - 15. Contact
  - (H2 ids are `1`…`15`.)

**`/dpa`**:
- title "Data Processing Agreement | Vault AI".
- description "The data processing terms between Overcode Limited and Vault AI customers, including sub-processors and international transfers."
- canonical `/dpa`. hreflang en, uk `/ua/dpa`, x-default.
- Outline:
  - H1 `#data-processing-agreement` Data Processing Agreement
  - (preamble p mt-10)
  - H2 1. Definitions
  - 2. Roles of the parties
  - 3. Scope of processing
    - H3 3.1 Subject matter and duration
    - 3.2 Nature and purpose
    - 3.3 Types of Personal Data
    - 3.4 Categories of Data Subjects
  - H2 4. Our obligations
  - 5. Sub-processors
  - 6. Data Subject requests
  - 7. Audit and compliance
  - 8. International transfers
  - 9. Retention and deletion
  - 10. Liability
  - 11. General
  - `#annex-1` Annex 1 — Technical and organisational measures
  - `#annex-2` Annex 2 — Sub-processors (table)
  - `#contact` Contact

UA page titles/descriptions are in the `legal.*` rows of the strings table below (E.3).

---

# E. Limits / not measured
- The partner popup **submission** (success/error states) was specced from the JS source only. It was not submitted live, to avoid creating a real lead.
- Lottie canvases (UA home) are identical files, so their internal text is not localized. There is nothing to measure beyond `CLONE_SPEC.md`.
- Country flags in the phone selector are 218 Twemoji SVGs loaded from `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/<codepoints>.svg` (react-international-phone default). Only the US flag was downloaded; the build can keep using the CDN.
- The `/ru` locale, `/pricing`, `/migration-offer` and `/subprocessors` were not specced (out of scope).

# E.2 Strings table: partners page + lead popup (EN → UA, for `/partners` and `/ua/partners`)
| key | EN | UA |
|---|---|---|
| `leadForm.heading` | Get clarity on your finances | Прозорість у ваших фінансах |
| `leadForm.description` | Understand your data and make better decisions. | Розумійте свої дані та ухвалюйте кращі рішення. |
| `leadForm.fields.firstName` | First name | Ім’я |
| `leadForm.fields.lastName` | Last name | Прізвище |
| `leadForm.fields.email` | Work email | Робоча пошта |
| `leadForm.fields.phone` | Phone | Телефон |
| `leadForm.submit` | See Vault in action | Отримати доступ |
| `leadForm.errors.firstName` | Please enter your First name | Вкажіть ім’я |
| `leadForm.errors.lastName` | Please enter your Last name | Вкажіть прізвище |
| `leadForm.errors.email` | Please enter your email | Вкажіть робочу пошту |
| `leadForm.errors.emailInvalid` | Email address is invalid | Некоректна адреса пошти |
| `leadForm.errors.phoneRequired` | Please enter your phone number | Вкажіть номер телефону |
| `leadForm.errors.phoneInvalid` | Phone number is invalid | Некоректний номер телефону |
| `leadForm.countrySelectorAriaLabel` | Country selector | Вибір країни |
| `leadForm.contexts.partnerProgram.heading` | Become a Vault partner | Станьте партнером Vault |
| `leadForm.contexts.partnerProgram.description` | Tell us about yourself, and we'll get in touch to discuss the terms. | Розкажіть про себе, і ми зв’яжемося з вами, щоб обговорити умови. |
| `leadForm.contexts.partnerProgram.submit` | Send request | Надіслати заявку |
| `popup.success.title` | You are in! | Готово! |
| `popup.success.body` | Thank you for contacting us.<br></br>We'll be in touch soon with next steps. | Дякуємо за звернення.<br></br>Незабаром зв’яжемося й розкажемо про наступні кроки. |
| `popup.error.title` | Ooops! | Ой! |
| `popup.error.body` | Something went wrong.<br></br>Please try again | Щось пішло не так.<br></br>Спробуйте ще раз |
| `popup.close` | Close | Закрити |
| `popup.loading` | Loading… | Завантаження… |
| `partners.meta.title` | Partner program \| Vault AI | Партнерська програма \| Vault AI |
| `partners.meta.description` | For accounting firms, CFOs, consultants and teams serving SMBs: refer businesses to Vault, track sign-ups through your invite link and work in your clients' workspaces from one account. | Для бухгалтерських компаній, CFO, консультантів і команд, які працюють із малим і середнім бізнесом: рекомендуйте Vault, відстежуйте реєстрації за посиланням-запрошенням і працюйте у воркспейсах клієнтів з одного акаунта. |
| `partners.hero.eyebrow` | Partner program | Партнерська програма |
| `partners.hero.headline.start` | Bring your clients | Приведіть клієнтів |
| `partners.hero.headline.end` | to Vault | у Vault |
| `partners.hero.subheadline.audience` | For accounting firms, CFOs, consultants and teams serving SMBs. | Для бухгалтерських компаній, CFO, консультантів і команд, які працюють із малим і середнім бізнесом. |
| `partners.hero.subheadline.reward` | Your clients get clarity on their finances in real time, and you earn a reward for the businesses you bring. | Ваші клієнти отримують прозорість фінансів у реальному часі, а ви — винагороду за компанії, які привели. |
| `partners.hero.cta` | Become a partner | Стати партнером |
| `partners.mock.inviteLink` | Your invite link | Ваше посилання-запрошення |
| `partners.mock.tracked` | Sign-ups through it are tracked | Реєстрації за ним враховуються |
| `partners.mock.copy` | Copy | Копіювати |
| `partners.mock.copied` | Copied | Скопійовано |
| `partners.mock.viaYourLink` | Via your link | За вашим посиланням |
| `partners.mock.workspaces` | Workspaces | Воркспейси |
| `partners.mock.yourWorkspace` | Your workspace | Ваш воркспейс |
| `partners.mock.accountant` | Accountant | Бухгалтер |
| `partners.mock.admin` | Admin | Адміністратор |
| `partners.mock.newInvite` | Accountant · new invite | Бухгалтер · нове запрошення |
| `partners.mock.partner` | Partner | Партнер |
| `partners.mock.paysForVault` | Pays for Vault | Оплачує Vault |
| `partners.audience.heading` | Who it's for | Для кого |
| `partners.audience.items.accountingFirms.title` | Accounting and fractional CFO firms | Бухгалтерські компанії та CFO на аутсорсі |
| `partners.audience.items.accountingFirms.description` | Give your clients a live view of their cash and expenses, and work from the same numbers they see. | Дайте клієнтам актуальну картину грошей і витрат та працюйте з тими ж цифрами, що й вони. |
| `partners.audience.items.freelanceCfos.title` | Freelance CFOs | Фрилансери-CFO |
| `partners.audience.items.freelanceCfos.description` | Run several clients' finances from one account, with reports built around how each business works. | Ведіть фінанси кількох клієнтів з одного акаунта, зі звітами під те, як працює кожен бізнес. |
| `partners.audience.items.consulting.title` | Consulting companies | Консалтингові компанії |
| `partners.audience.items.consulting.description` | Recommend Vault to clients who need clear finance reporting, and earn a reward for it. | Рекомендуйте Vault клієнтам, яким потрібна зрозуміла фінансова звітність, і отримуйте за це винагороду. |
| `partners.audience.items.saas.title` | SaaS products | SaaS-продукти |
| `partners.audience.items.saas.description` | Serve the same small and mid-sized businesses? Refer your users to Vault and add value for them. | Працюєте з тим самим малим і середнім бізнесом? Рекомендуйте Vault своїм користувачам. |
| `partners.audience.items.services.title` | Service companies | Сервісні компанії |
| `partners.audience.items.services.description` | Agencies and service firms whose clients need a clearer view of their finances. | Агенції та сервісні компанії, чиїм клієнтам потрібна прозорість фінансів. |
| `partners.statement` | The Vault partner program is how we grow together with the people businesses already trust with their finances. | Партнерська програма Vault — це про те, як ми зростаємо разом із тими, кому бізнес уже довіряє свої фінанси. |
| `partners.value.heading` | What you and your clients get | Що отримуєте ви та ваші клієнти |
| `partners.value.client` | Your client | Ваш клієнт |
| `partners.value.company` | Your company | Ваша компанія |
| `partners.value.benefits.rewards.title` | Referral rewards | Партнерська винагорода |
| `partners.value.benefits.rewards.description` | Earn a reward when the businesses you bring pay for Vault. We agree the terms with each partner individually. | Отримуйте винагороду, коли компанії, яких ви привели, оплачують Vault. Умови ми узгоджуємо з кожним партнером індивідуально. |
| `partners.value.benefits.inviteLink.title` | Personal invite link | Персональне посилання |
| `partners.value.benefits.inviteLink.description` | Share your own invite link. We see who signed up through you, so every referral counts. | Діліться власним посиланням-запрошенням. Ми бачимо, хто зареєструвався через вас, тож кожна рекомендація врахована. |
| `partners.value.benefits.workspaces.title` | Your clients' workspaces | Воркспейси клієнтів |
| `partners.value.benefits.workspaces.description` | Join your clients' workspaces with the role you need and work with each client's finances from one account. | Долучайтеся до воркспейсів клієнтів із потрібною роллю та працюйте з фінансами кожного клієнта з одного акаунта. |
| `partners.value.switching.title` | Already uses a similar tool | Вже користується схожим сервісом |
| `partners.value.switching.description` | Our migration offer: the cost of the months left on their current subscription comes off their first annual Vault invoice. | Пропозиція «Перехід на Vault»: вартість місяців, що залишилися в поточній підписці, вираховуємо з першого річного інвойсу Vault. |
| `partners.value.learnMore` | Learn more | Детальніше |
| `partners.value.or` | Or | Або |
| `partners.value.fresh.title` | Starting fresh | Починає з нуля |
| `partners.value.fresh.description` | An extended free trial and free personal onboarding. | Подовжений безкоштовний пробний період і безкоштовний персональний онбординг. |
| `partners.value.contact` | Contact us to discuss the current terms. We'll explain how rewards work and tailor the partnership to your company. | Зв’яжіться з нами, щоб обговорити умови: ми пояснимо, як працює винагорода, і налаштуємо партнерство під вашу компанію. |
| `partners.value.cta` | Become a partner | Стати партнером |
| `partners.faq.heading` | Frequently asked questions | Поширені запитання |
| `partners.faq.items.earnings.question` | How much do partners earn? | Скільки заробляють партнери? |
| `partners.faq.items.earnings.answer` | Terms depend on your company and your clients. We agree them individually on an intro call. | Умови залежать від вашої компанії та клієнтів. Ми узгоджуємо їх індивідуально під час знайомства. |
| `partners.faq.items.tracking.question` | How do you track my referrals? | Як ви враховуєте мої рекомендації? |
| `partners.faq.items.tracking.answer` | Every partner gets a personal invite link. When a business signs up through it, we see that it came from you and let you know. | Кожен партнер отримує персональне посилання-запрошення. Коли компанія реєструється за ним, ми бачимо, що вона від вас, і повідомляємо вам про це. |
| `partners.faq.items.workspaces.question` | Can I work in my clients' workspaces? | Чи можу я працювати у воркспейсах клієнтів? |
| `partners.faq.items.workspaces.answer` | Yes. Your clients invite you with the role you need, and you work with each of them from one account. | Так. Клієнти запрошують вас із потрібною роллю, і ви працюєте з кожним із них з одного акаунта. |
| `partners.faq.items.clients.question` | What do my clients get? | Що отримують мої клієнти? |
| `partners.faq.items.clients.answer` | If they already use a similar tool, our <link>migration offer</link>. If not, an extended free trial and free personal onboarding. | Якщо вони вже користуються схожим сервісом — пропозицію <link>«Перехід на Vault»</link>. Якщо ні — подовжений безкоштовний пробний період і безкоштовний персональний онбординг. |
| `partners.steps.heading` | How to become a partner | Як стати партнером |
| `partners.steps.cta` | Become a partner | Стати партнером |
| `partners.steps.items.apply.title` | Leave a request | Залиште заявку |
| `partners.steps.items.apply.description` | Tell us about your company and your clients in a short form. | Розкажіть про свою компанію та клієнтів у короткій формі. |
| `partners.steps.items.introCall.title` | Intro call | Знайомство |
| `partners.steps.items.introCall.description` | We discuss your clients, referral terms and how we'll work together. | Обговорюємо ваших клієнтів, умови винагороди та формат співпраці. |
| `partners.steps.items.inviteLink.title` | Get your invite link | Отримайте посилання |
| `partners.steps.items.inviteLink.description` | You get a personal invite link, and you can join your clients' workspaces. | Ви отримуєте персональне посилання-запрошення і можете долучатися до воркспейсів клієнтів. |
| `partners.steps.items.rewards.title` | Earn rewards | Отримуйте винагороду |
| `partners.steps.items.rewards.description` | We track sign-ups from your link and pay rewards on the agreed schedule. | Ми відстежуємо реєстрації за вашим посиланням і виплачуємо винагороду з узгодженою періодичністю. |
| `partners.steps.visuals.application.title` | Partner application | Заявка партнера |
| `partners.steps.visuals.application.ready` | Ready to send | Готово до надсилання |
| `partners.steps.visuals.application.company` | Company | Компанія |
| `partners.steps.visuals.application.clients` | Your clients | Ваші клієнти |
| `partners.steps.visuals.application.clientsValue` | Small and mid-sized businesses | Малий і середній бізнес |
| `partners.steps.visuals.application.role` | You are | Хто ви |
| `partners.steps.visuals.application.roleValue` | Accounting firm | Бухгалтерська компанія |
| `partners.steps.visuals.application.send` | Send | Надіслати |
| `partners.steps.visuals.introCall.title` | Intro call | Знайомство |
| `partners.steps.visuals.introCall.videoCall` | Video call | Відеодзвінок |
| `partners.steps.visuals.introCall.partnerTeam` | Partner team | Партнерська команда |
| `partners.steps.visuals.referrals.title` | Your referrals | Ваші рекомендації |
| `partners.steps.visuals.referrals.scheduled` | Scheduled | Заплановано |

# E.3 Strings table: legal meta (EN → UA)

| key | EN | UA |
|---|---|---|
| `legal.englishOnlyNotice` | The legal documents are available in English only. | Юридичні документи доступні лише англійською мовою. |
| `legal.terms.title` | Terms of Service \| Vault AI | Умови використання \| Vault AI |
| `legal.terms.description` | The terms governing use of Vault AI, the financial management and planning platform operated by Overcode Limited. | Умови, що регулюють використання Vault AI — платформи фінансового менеджменту та планування, якою керує Overcode Limited. |
| `legal.privacy.title` | Privacy Policy \| Vault AI | Політика конфіденційності \| Vault AI |
| `legal.privacy.description` | How Vault AI handles personal data, as controller and as processor, and the rights available to you. | Як Vault AI поводиться з персональними даними — як контролер і як обробник — та які права ви маєте. |
| `legal.dpa.title` | Data Processing Agreement \| Vault AI | Угода про обробку даних \| Vault AI |
| `legal.dpa.description` | The data processing terms between Overcode Limited and Vault AI customers, including sub-processors and international transfers. | Умови обробки даних між Overcode Limited і замовниками Vault AI, включно із субобробниками та міжнародними передаваннями. |
| `legal.subprocessors.title` | Sub-processors \| Vault AI | Субобробники \| Vault AI |
| `legal.subprocessors.description` | The third-party providers Vault AI uses to process customer data, their purpose and their location. | Сторонні постачальники, яких Vault AI залучає до обробки даних замовників, їхнє призначення та розташування. |

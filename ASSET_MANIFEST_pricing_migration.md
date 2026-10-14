Source: https://www.usevault.ai/

# Asset manifest: `/pricing` and `/migration-offer`

This supplements `ASSET_MANIFEST.md` (home). I checked the network log (Playwright, every response) on both routes at 1440 and 390.

**Already in the home assets, so nothing new was downloaded:**
- Fonts: Outfit latin and ClashDisplay-Variable are the only font requests.
- Favicons.
- OG image: `og-image.png`. Both routes use the same `https://www.usevault.ai/og-image.png`.
- `lottie/process-steps/gain-clarity-on-your-finances.lottie`, used by the pricing P4 section.
- The dotLottie wasm (CDN).

**No new raster images, videos or fonts** are requested by either route. Every new visual is an inline React SVG. I saved those to `public/assets/svg/` (top-level folder, the same convention as home) from the live DOM and the JS bundle, unchanged except for removing Tailwind class attributes and Framer inline styles.

## New SVGs (`public/assets/svg/`)

| File | Source | viewBox / render size | Fill / stroke | Used in |
|---|---|---|---|---|
| check.svg | inline `<svg viewBox="0 0 25 24">` (module 53836) | 25×24; rendered 20×20 (`size-5`), 16 (`size-4`) or 12 (`size-3`) | `fill="currentColor"`, evenodd | Pricing card feature bullets (white/60); compare table "Included" (white); migration import rows (white/60); "Reviewed" pill |
| receipt.svg | inline 16×16 (module 23071) | 16×16; rendered 16 | `stroke="currentColor"`, width 1.3, round caps | Migration hero card 1 IconDisc (white/60) |
| vault-mark.svg | inline 30×26 (module 95880) | 30×26; rendered 16×14 (`h-3.5 w-4`) or 12×10 (`h-2.5 w-3`) | `fill="currentColor"` | Migration "Vault Pro" and "Vault team" mock headers, chat avatar |
| upload.svg | inline 16×16 (module 99758; path copied from the bundle) | 16×16; rendered 16 | `stroke="currentColor"`, width 1.4 | Migration step-4 "Import transactions" IconDisc |
| chevron-down-small.svg | inline 16×16 (module 99758) | 16×16; rendered 12 | `stroke="currentColor"`, width 1.4, `m4 6 4 4 4-4` | Migration import mock: target-field dropdown chevron |
| condition-new-customers.svg | `NewCustomerIcon` (module 47956), final animated state | 56×56; rendered 56 (lg) or 44 | rect fill #5176FE @10%, stroke #fff @5%, rx 14; body #5176FE; sparkle #9BAEF2 | Migration M3 row 1 |
| condition-annual-plan.svg | `AnnualPlanIcon` | 56×56 | back doc #5176FE, front doc #9BAEF2, lines stroke #03020B 1.5 | M3 row 2 |
| condition-active-subscription.svg | `ActiveSubscriptionIcon` | 56×56 | receipt #5176FE, lines #9BAEF2 1.5, badge circle #9BAEF2, check stroke #03020B 1.5 | M3 row 3 |
| condition-up-to-six-months.svg | `UpToSixMonthsIcon` (12 ring segments) | 56×56 | segments 1–6 #9BAEF2, 7–12 #5176FE @50% | M3 row 4 |
| condition-deadline.svg | `DeadlineIcon` (hourglass) | 56×56 | caps stroke #9BAEF2 1.5, glass #5176FE, sand #9BAEF2 | M3 row 5 |

The condition icons animate on reveal: the accent paths pop, fade, rise, slide or draw (see spec §M3). The static files are the end state. To reproduce the motion, inline the SVG as a React component and wrap the accent paths in `motion.path`. Each file's `<g transform="translate(14.8 14.8) scale(1.1)">` is the glyph group, and the timing uses those paths.

## Reused existing SVGs (already in `public/assets/svg/`)
| File | Where on these routes |
|---|---|
| zap-icon.svg | Eyebrow pills "PRICING" and "MIGRATION OFFER" (14×14) |
| arrow-right.svg | Primary CTA arrow chips (16 / 14); migration chat send chip (12) and import rows (14). In those last two it is recoloured via `[&_path]:stroke-current` because the file hard-codes `stroke="#fff"`, so inline it or change it to currentColor for those uses |
| chevron-right.svg | FAQ chevrons (rendered 20×20, rotated 90° when closed and −90° when open) |
| cross-plus-marker.svg | Separators |
| vault-logo.svg, menu-burger.svg, menu-close.svg, linkedin.svg, telegram.svg, mail.svg, overcode-*.svg | Nav / footer (unchanged) |

## Not fetched
- Intercom widget assets (third-party, out of scope).
- Cloudflare RUM, the Facebook pixel and GTM (tracking).
- `/ru` and `/ua` locale variants. They use no locale-specific assets.

## Screenshots (`recon/`)
- `recon/pricing/pricing-1440-full.png`, `pricing-1440-viewport.png`, `pricing-1440-monthly-cards.png` (Monthly toggle state), `pricing-390-full.png`
- `recon/migration-offer/migration-offer-1440-full.png`, `migration-offer-1440-viewport.png` (hero after its reveal), `migration-1440-steps-step4.png`, `migration-offer-390-full.png`

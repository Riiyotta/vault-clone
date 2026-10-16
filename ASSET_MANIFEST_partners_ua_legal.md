Source: https://www.usevault.ai/

# Asset manifest: `/partners`, `/ua`, `/terms`, `/privacy`, `/dpa`

This supplements `ASSET_MANIFEST.md`. Only **new** files are listed here. Everything else these routes load is already in `public/assets/`.

## New files

| local path | bytes | original URL | used on | notes |
|---|---|---|---|---|
| `public/assets/img/hero-uk.png` | 1,403,537 | `/_next/static/media/hero-uk.0o3u6lzcs6p--.png` | `/ua` hero | 3312×2004 RGBA PNG. Ukrainian-UI dashboard, rendered at the same size as hero-en. Alt: "Інтерфейс Vault AI". |
| `public/assets/img/hero-uk-q75.webp` | 135,518 | `/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fhero-uk.0o3u6lzcs6p--.png&w=3840&q=75` | `/ua` hero | The next/image optimized WebP (3312×2004, q75) the site actually serves. It is the UA counterpart of `hero-en-q75.webp`. |
| `public/assets/svg/partners/audience-accounting-firms.svg` | 573 | inline SVG (FeatureIcon "AccountingIcon") | `/partners` "Who it's for" row 1 | 56×56 tile. rect fill #5176FE@10%, stroke white@5%, rx 14; glyph in `<g transform="translate(14.8 14.8) scale(1.1)">`. The animated path is marked `data-animation="slideY"`. |
| `public/assets/svg/partners/audience-freelance-cfo.svg` | 653 | inline SVG ("FreelanceCfoIcon") | row 2 | animated path `pop` |
| `public/assets/svg/partners/audience-consulting.svg` | 638 | inline SVG ("ConsultingIcon") | row 3 | animated path `slideX` |
| `public/assets/svg/partners/audience-saas.svg` | 780 | inline SVG ("SaasIcon") | row 4 | animated path `pop`. The "ink" strokes are #03020B. |
| `public/assets/svg/partners/audience-services.svg` | 608 | inline SVG ("ServicesIcon") | row 5 | animated path `pop` |
| `public/assets/svg/partners/link.svg` | 307 | inline SVG (16×16, stroke 1.3, currentColor) | partners hero invite card, steps card 3 | Rendered 16px in white/60 inside a 32px bordered disc. |
| `public/assets/svg/partners/calendar.svg` | 225 | inline SVG (16×16, stroke 1.2, currentColor) | partners steps card 2 ("Intro call") | Rendered 16px in white/60. |
| `public/assets/svg/partners/vault-mark.svg` | 527 | inline SVG (viewBox 0 0 30 26, fill currentColor) | partners steps card 2 ("Partner team" avatar) | Rendered 16×14 in white inside a 28px `bg-white/8` rounded-md tile. |
| `public/assets/svg/partners/popup-close.svg` | 216 | inline SVG (viewBox 0 0 21 21, stroke 1.667, currentColor) | partner popup close button | Rendered 20px in white/50, hover white. |
| `public/assets/svg/partners/flag-us.svg` | 2,462 | `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1fa-1f1f8.svg` | partner popup phone field (default country) | The other 217 flags come from the same Twemoji 14.0.2 CDN pattern, via the react-international-phone default. They were not downloaded. |
| `public/assets/svg/flags/<iso2>.svg` (218 files, ~1.1 MB) | – | `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/<codepoints>.svg` (downloaded with curl on 2026-10-14) | partner popup country selector (all 218 countries) | One file per country in react-international-phone's default list (data in `src/components/partners/countries.js`); `us.svg` is byte-identical to `partners/flag-us.svg`. Referenced locally, so the clone makes no CDN requests. |

Attribution: flag graphics are Twemoji by Twitter, Inc and other contributors, licensed CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/); the country list is from react-international-phone 4.8.0 (MIT, © 2022 Yurii Brusentsov).

## Reused existing assets (no download needed)
- `svg/arrow-right.svg`: CTA arrow chips and the "Learn more" link arrow (14px).
- `svg/chevron-right.svg`: FAQ chevron (rotated 90° when closed, −90° when open).
- `svg/zap-icon.svg`: partners hero eyebrow.
- `svg/cross-plus-marker.svg`, `svg/vault-logo.svg`, footer icons: shared chrome.
- `img/scroll-coloring-text-bg.svg`: partners statement. It is byte-identical (md5 4bc7f88a…) to the copy the site serves at `/img/scroll-coloring-text/scroll-coloring-text-bg.svg`.
- `fonts/Manrope-latin-cyrillic.woff2` and `fonts/Unbounded-latin-cyrillic.woff2`: these are **actually loaded on `/ua` and every `/ua/*` page** (body = Manrope, display = Unbounded). Their fallback `@font-face` metrics are in `ASSET_MANIFEST.md`.
- Lottie files: `/ua` loads exactly the same 10 `.lottie` URLs as `/`. No locale-specific Lottie files exist.
- `favicon/og-image.png`: the og:image for all of these routes.

## Assets not present
- `/partners` has no raster images, video or Lottie. Every visual is DOM/CSS (mock cards) plus the inline SVGs above.
- The legal pages load no images beyond the shared chrome.

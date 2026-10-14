Source: https://www.usevault.ai/

# Asset Manifest — usevault.ai home page

All files were downloaded from the live site with curl (HTTP 200) into `public/assets/`. 44 files in total. Nothing had to come from the saved-page fallback folder. In the app, reference them as `/assets/...`.

## Fonts (`public/assets/fonts/`)

| File | Original URL | Family / weights | Used on home? |
|---|---|---|---|
| Outfit-latin.woff2 (32 KB) | /_next/static/media/1b99372b3eaef0c8-s.0gx2haw2tmll8.woff2 | Outfit, variable 100–900 | YES (body font) |
| Outfit-latin-ext.woff2 (15 KB) | /_next/static/media/b2ea385cb5ae8625-s.0kjod.kaq1k69.woff2 | Outfit, variable 100–900 | only for latin-ext glyphs |
| ClashDisplay-Variable.woff2 (29 KB) | /_next/static/media/ClashDisplay_Variable-s.0nlqp5k3.u4t2.woff2 | clashDisplay (variable) | YES (display font, weight 600) |
| Manrope-latin-cyrillic.woff2 (41 KB) | /_next/static/media/manrope_latin_cyrillic.0ozgxi5axn~c0.woff2 | manrope 200–800 | declared but NOT loaded on home |
| Unbounded-latin-cyrillic.woff2 (237 KB) | /_next/static/media/unbounded_latin_cyrillic.13i4w.npxwnja.woff2 | unbounded 200–900 | declared but NOT loaded on home |

### @font-face rules (copied from the site CSS; only the paths are changed)
```css
/* Outfit — latin */
@font-face{font-family:Outfit;font-style:normal;font-weight:100 900;font-display:swap;
  src:url(/assets/fonts/Outfit-latin.woff2) format("woff2");
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
/* Outfit — latin-ext */
@font-face{font-family:Outfit;font-style:normal;font-weight:100 900;font-display:swap;
  src:url(/assets/fonts/Outfit-latin-ext.woff2) format("woff2");
  unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Outfit Fallback";src:local(Arial);ascent-override:100.18%;descent-override:26.05%;line-gap-override:0%;size-adjust:99.82%}

/* Clash Display — the site declares NO font-weight descriptor; keep it that way to match rendering */
@font-face{font-family:clashDisplay;src:url(/assets/fonts/ClashDisplay-Variable.woff2) format("woff2");font-display:swap}
@font-face{font-family:"clashDisplay Fallback";src:local(Arial);ascent-override:77.76%;descent-override:21.84%;line-gap-override:7.86%;size-adjust:114.46%}

/* Optional (other routes / locales only) */
@font-face{size-adjust:87.963%;ascent-override:113.684%;descent-override:29.558%;line-gap-override:0%;font-family:manrope;src:url(/assets/fonts/Manrope-latin-cyrillic.woff2) format("woff2");font-display:swap;font-weight:200 800;font-style:normal}
@font-face{size-adjust:87.832%;ascent-override:101.33%;descent-override:28.464%;line-gap-override:10.247%;font-family:unbounded;src:url(/assets/fonts/Unbounded-latin-cyrillic.woff2) format("woff2");font-display:swap;font-weight:200 900;font-style:normal}
```
Stacks: `--font-body: "Outfit","Outfit Fallback"`, `--font-display: "clashDisplay","clashDisplay Fallback"`.

## Images (`public/assets/img/`)

| File | Original URL | Dimensions / format | Where it's used |
|---|---|---|---|
| hero-en.png | /_next/static/media/hero-en.0iy~tz90zg3.r.png | 3312×2004 PNG RGBA, 1.4 MB | Hero dashboard screenshot (`<img width=3312 height=2004>`, object-contain). Lossless source, kept for reference; the clone uses hero-en-q75.webp. |
| hero-en-optimized-q75.png | /_next/image?url=…hero-en…&w=3840&q=75 | 3312×2004 PNG palette, 406 KB | Same optimizer URL fetched *without* `image/webp` in Accept. Palette-quantized: NOT identical (max channel delta 167 vs served). Not used. |
| hero-en-q75.webp | /_next/image?url=…hero-en…&w=3840&q=75 (Accept: image/webp, as Chromium sends) | 3312×2004 WebP (VP8, opaque), 132 KB | **Used by Hero.jsx.** Byte-identical to what the original serves to Chromium at every width (single 1x srcset candidate). The source PNG is fully opaque, so no alpha is lost. |
| planet.png | /img/hero/planet.png | 1440×1279 PNG RGBA | Hero section `::before` background (planet/arc glow) |
| hero-img-before-gradient.svg | /img/gradients/hero-img-before-gradient.svg | viewBox 559×559 | Blue blurred circle (#0036FF, blur 50) plus star dots behind the hero image |
| hero-img-after-gradient.svg | /img/gradients/hero-img-after-gradient.svg | viewBox 547×274 | Ellipse #597CFF with blur 50 |
| hero-highlight-before-gradient.svg | /img/gradients/hero-highlight-before-gradient.svg | viewBox 524×20 | Thin glowing line along the top edge of the hero image |
| hero-highlight-after-gradient.svg | /img/gradients/hero-highlight-after-gradient.svg | viewBox 1256×328 | Large ellipse #204FFF with blur 48, behind the hero image |
| scroll-coloring-text-bg.svg | /img/scroll-coloring-text/scroll-coloring-text-bg.svg | viewBox 608×528 | Outlined "V-mark" glow behind the scroll-reveal statement |

## Lottie (`public/assets/lottie/`), dotLottie (.lottie, zip) files

The site plays them with `@lottiefiles/dotlottie-react` (dotlottie-web 0.71.0, WASM from cdn.jsdelivr.net). All run at 30 fps.

| File | Size (w×h) | Frames (ip→op) | Markers | Usage |
|---|---|---|---|---|
| product-highlights/global-financial-ledger.lottie | 407×233 | 0→247 (8.23 s) | – | card 1, loop+autoplay, layout fit contain align [1,1] |
| product-highlights/web3-integrations.lottie | 384×233 | 8→294 | – | card 2, align [0.5,1] |
| product-highlights/custom-financial-reports.lottie | 360×208 | 2→151 | – | card 3, align [0.5,1] |
| product-highlights/user-management.lottie | 404×253 | 8→270 | – | card 4, align [0.5,1] |
| product-highlights/workflow-automations.lottie | 221×194 | 9→180 | – | card 5, align [0.5,1] |
| product-highlights/invoice-builder.lottie | 409×235 | 0→200 | – | card 6, align [1,1] |
| feature-showcase/automate-financial-tasks.lottie | 663×432 | 0→573 | section1_in 6, section1_out 145, section2_in 167, section2_out 331, section3_in 359, section3_out 570 | #automation |
| feature-showcase/understand-your-business-finances.lottie | 663×398 | 5→422 | s1_in 7, s1_out 140, s2_in 141, s2_out 281, s3_in 282, s3_out 422 | #reports |
| feature-showcase/financial-infrastructure.lottie | 663×432 | 8→424 | s1_in 8, s1_out 145, s2_in 149, s2_out 283, s3_in 286, s3_out 421 | #security |
| process-steps/gain-clarity-on-your-finances.lottie | 663×398 | 0→568 (18.93 s) | section1_in 0, section1_out_section2_in 158, section2_out_section3_in 333 | How it works |

(The marker frames above are rounded; the real values are e.g. 144.999.)

## Favicons / meta (`public/assets/favicon/`)
favicon.ico (48/32/16), favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180), web-app-manifest-192x192.png, web-app-manifest-512x512.png, site.webmanifest (theme/bg `#03020b`), og-image.png (1200×630).

Head tags to reproduce:
```
<title>Vault AI | Finance management app | FP&A Software</title>
og:title "Vault AI | Finance management app"; og:description / twitter:description "AI-native platform to track transactions, generate reports, and automate manual financial work, built for SMBs."
og:url https://www.usevault.ai, og:site_name "Vault AI", og:locale en_US, og:type website, og:image /og-image.png (1200×630)
twitter:card summary_large_image, twitter:title "Vault AI"
```
If you copy the webmanifest, change its icon paths to `/assets/favicon/...`.

## Inline SVGs (`public/assets/svg/`), extracted from the live DOM

| File | viewBox | Notes |
|---|---|---|
| vault-logo.svg | 0 0 188 26 | white wordmark plus mark. Sizes: desktop nav 188×26 (h-6.5 w-47); mobile nav 116×16 (h-4 w-29), md 200×28; footer 188×26 (116×16 below md) |
| menu-burger.svg | 0 0 28 28 | fill #fff; 24px (size-6), md 28px |
| menu-close.svg | 0 0 21 21 | stroke currentColor 1.667; replaces the burger when the menu is open |
| cross-plus-marker.svg | 0 0 11 11 | "+" marker, fill #EDEDFA, rendered at 12×12 (size-3) on every grid intersection |
| zap-icon.svg | 0 0 14 14 | eyebrow pill icon, white→white/0.8 vertical gradient, 14×14 |
| arrow-right.svg | 0 0 16 16 | CTA arrow, stroke #fff 1.333; 16px (large CTA) / 14px (small CTA) |
| chevron-left.svg / chevron-right.svg | 24×24 | mobile feature-tab arrows, stroke currentColor 2 |
| linkedin.svg, telegram.svg, mail.svg | – | footer social icons, currentColor, height 16px |
| overcode-wordmark.svg, overcode-icon.svg | 0 0 133 24 / 0 0 25 24 | "Built by Overcode" badge |

## Not downloaded / third-party (intentionally)
- The dotlottie WASM (`cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.71.0/dist/dotlottie-player.wasm`) comes with the npm package `@lottiefiles/dotlottie-react`.
- Intercom chat widget (bottom-right launcher and greeting bubble in the screenshots), GTM/GA/Facebook pixel and Cloudflare RUM are third-party and not part of the clone.
- The page uses no video files and no raster icons beyond what is listed above.

const { colors } = require('./src/tokens.json')
const plugin = require('tailwindcss/plugin')
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default

/** @type {import('tailwindcss').Config} */
// CommonJS on purpose: Node 20's require(esm) caches ESM configs, so a running dev server
// never picks up edits to an ESM tailwind.config.js.
// Tokens from CLONE_SPEC.md §0.1 / §0.3 (Tailwind v4 values translated to v3).
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Spec §11: all hover rules are wrapped in @media (hover:hover).
  future: { hoverOnlyWhenSupported: true },
  theme: {
    // Spec §0.1 breakpoints: sm 40rem, md 768, lg 1024, xl 80rem, xxl 1440 (custom), 2xl 96rem.
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xxl: '1440px',
      '2xl': '1536px',
    },
    extend: {
      colors,
      opacity: {
        2: '0.02',
        8: '0.08',
      },
      // Locale font swap (CLONE_SPEC_partners_ua_legal.md §C.2): `font-body` / `font-display` read CSS vars that
      // default to Outfit / clashDisplay (index.css :root); UA pages override them with an inline style on <html>.
      fontFamily: {
        sans: ['Outfit', '"Outfit Fallback"'],
        body: 'var(--font-body)',
        display: 'var(--font-display)',
      },
      maxWidth: {
        frame: '1440px',
      },
      boxShadow: {
        pill:
          'inset 0 .5px .5px rgba(255,255,255,.12), inset 0 1px 3px rgba(255,255,255,.10), inset 0 2px 8px rgba(255,255,255,.04), 0 .5px .5px rgba(8,1,20,.03), 0 1px 1px -.5px rgba(8,1,20,.03), 0 2px 2px -1px rgba(8,1,20,.03)',
      },
      backgroundImage: {
        planet: 'url(/assets/img/planet.png)',
        'hero-fade':
          'linear-gradient(180deg, rgba(3,2,11,0) 0%, rgba(3,2,11,.05) 4.78%, #03020B 35.5%)',
        'hero-img-before': 'url(/assets/img/hero-img-before-gradient.svg)',
        'hero-img-after': 'url(/assets/img/hero-img-after-gradient.svg)',
        'hero-highlight-before': 'url(/assets/img/hero-highlight-before-gradient.svg)',
        'hero-highlight-after': 'url(/assets/img/hero-highlight-after-gradient.svg)',
        'statement-mark': 'url(/assets/img/scroll-coloring-text-bg.svg)',
        'menu-panel': 'linear-gradient(180deg,#03020B 0%,rgba(3,2,11,0) 100%)',
        'card-dots': 'radial-gradient(circle,rgba(255,255,255,0.08) 0.8px,transparent 0.8px)',
        'card-fade': 'linear-gradient(180deg,rgba(217,217,217,0) 0%,rgba(217,217,217,0.02) 100%)',
        'feature-visual':
          'radial-gradient(circle, rgba(255,255,255,.08) .8px, transparent .8px), linear-gradient(180deg, rgba(217,217,217,.03) 0%, rgba(217,217,217,.01) 100%)',
        'steps-visual':
          'radial-gradient(circle, rgba(49,49,56,.35) .8px, transparent .8px), linear-gradient(180deg, rgba(217,217,217,.01) 0%, rgba(217,217,217,.03) 100%)',
        'heading-fade': 'linear-gradient(180deg,#FFF 0%,rgba(255,255,255,.8) 100%)',
        // CLONE_SPEC_pricing_migration.md
        // §M1 hero glow: radial-gradient(closest-side, accent/20 → transparent)
        'migration-hero-glow': 'radial-gradient(closest-side, rgba(81,118,254,.2) 0%, transparent 100%)',
        // §M3 conditions glow
        'conditions-glow':
          'radial-gradient(closest-side, rgba(81,118,254,.2) 0%, rgba(81,118,254,.1) 50%, transparent 100%)',
        // §M2 "Current tool" bar / legend swatch
        hatch: 'repeating-linear-gradient(135deg, rgba(255,255,255,.18) 0 1px, transparent 1px 6px)',
        // CLONE_SPEC_partners_ua_legal.md §B.9 partner popup 1px gradient border frame
        'popup-border':
          'linear-gradient(96.18deg, rgba(81,118,254,.75) 7.9%, rgba(155,174,242,.5) 64.2%, rgba(81,118,254,.1) 118.37%)',
      },
      // §0.1 home "fade-in" keyframes (.18s ease-out both), used by the pricing price swap (spec §P1).
      // + §12.7 "scale-in" (partner popup frame, CLONE_SPEC_partners_ua_legal.md §B.9).
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(.96)' },
          to: { opacity: '1', transform: 'translate(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .18s ease-out both',
        'scale-in': 'scale-in .22s cubic-bezier(.22,1,.36,1) both',
      },
      backgroundSize: {
        'dots-14': '14px 14px',
        'dots-8': '8px 8px, 100% 100%',
        'dots-12': '12px 12px, 100% 100%',
      },
    },
  },
  // The original is Tailwind v4, whose divide-* puts the line on the BOTTOM of every child except the last
  // (`:where(& > :not(:last-child))`); v3 puts it on the top of every child except the first, which draws each
  // divider 1px lower. v3's divide plugins are replaced by v4-semantics equivalents below.
  corePlugins: { divideWidth: false, divideColor: false, divideOpacity: false },
  plugins: [
    // §C.3: `lang-uk:` = the original's `:lang(uk)` overrides (11px micro-labels → 12px, hero text max-w 880, ...).
    plugin(({ addVariant }) => addVariant('lang-uk', '&:lang(uk)')),
    plugin(({ matchUtilities, theme }) => {
      const child = '& > :not(:last-child)'
      const widths = { DEFAULT: '1px', 0: '0px', 2: '2px', 4: '4px', 8: '8px' }
      matchUtilities(
        {
          'divide-y': (w) => ({ [child]: { 'border-top-width': '0px', 'border-bottom-width': w, 'border-style': 'solid' } }),
          'divide-x': (w) => ({ [child]: { 'border-left-width': '0px', 'border-right-width': w, 'border-style': 'solid' } }),
        },
        { values: widths },
      )
      matchUtilities(
        { divide: (color) => ({ [child]: { 'border-color': color } }) },
        { values: flattenColorPalette(theme('colors')), type: ['color', 'any'] },
      )
    }),
  ],
}

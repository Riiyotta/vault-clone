# Design-repo: Vault AI clone (design system only)

An AI-ready, machine-validated design system extracted from a local clone of a real,
live company's marketing site (Vault AI, usevault.ai). A generator composes new pages as
**PageSpecs** (JSON) that are checked against a closed schema, real template node lists, a
compatibility graph and per-slot copy budgets.

**Status:** `design-review-pending` — `productionApproved: false` (see `registry.manifest.json`).

## Counts (recomputed from disk by `extraction/verify_all.py`)

| item | count |
|---|---|
| tokens | 293 |
| primitives | 12 |
| components | 15 |
| sections | 23 |
| templates | 6 |
| routes | 17 |

Tokens = 215 foundation + 32 semantic + 39 component + 7 locale. Also: 10 asset roles,
21 compatibility rules, 123 evidence citations.

## Read this first: what this repo is NOT

1. **The source is a real, live company's site.** This folder contains the design system
   only. It deliberately does **not** contain the source's marketing copy, legal text,
   Ukrainian strings, product screenshots, Lottie/.lottie animations, logo/brand mark, or
   any font files. Every example and section `example` uses generic placeholder copy.
   Copy budgets (`maxWords`) were derived from the *lengths* of measured strings; only the
   counts are recorded (`extraction/measured-values.json` → `copyBudgets`), never the text.
   The validator rejects PageSpecs that mention the source brand or its domains
   (`BRAND_DENYLIST`). Do not publish this repository or recommend making it public
   without the owner's decision.
2. **Fonts are referenced by family name only.** Display: *Clash Display* (Indian Type
   Foundry via Fontshare — **not OFL**; its EULA has restrictions — verify licensing before
   any production/web-embedding use). Body: *Outfit* (OFL 1.1). Locale `uk`: *Unbounded*
   (display) + *Manrope* (body), both OFL 1.1. Metric-compatible fallback `@font-face`
   overrides and open substitutes are recorded per family in
   `tokens/00-foundation/typography.json`. Obtain font files from their upstream
   distributions, never from the source site.
3. **Asset roles are a closed enum** (`assets/asset-roles.json`, wired through
   `schema/pagespec.schema.json`, `tokens/llm/component-allowlist.json` and
   `schema/example.pagespec.json`): `product-screenshot`, `product-animation`,
   `illustration-mock`, `icon`, `icon-illustrated`, `background-art`, `background-glow`,
   `brand-mark`, `social-icon`, `flag`. Each carries AI-generation guidance; generators must
   never reproduce real logos, real people, or real proprietary product UI/content.
   Compliance-critical roles are pinned to one policy (e.g. `brand-mark` →
   `must-not-fabricate`) and a flip to a different-but-valid policy fails verification.
   PageSpec asset refs must be `placeholder:<slug>` ids.
4. **Clone-only pieces** (do not exist on the original):
   - `template.not-found` / `hero.not-found` (the original's 404 was never recorded).
   - The lead form (`forms.partner-popup`) submits **locally only** — the clone never sends
     data. The contract pins `submission.mode` to `local-simulated` and the object is
     closed, so a PageSpec cannot declare an endpoint. Wiring a real endpoint is a human,
     out-of-band decision.
   - "Contact" actions use `mailto:` (`ctaAction: contact-mailto`) instead of the original's
     Intercom chat; Intercom, dataLayer/analytics and tracking pixels are intentionally
     absent. There is no `chat-widget` action.
   - Legal page body text is placeholder by design (`bodyIsPlaceholder` is `const true`).
5. **No external requests.** The clone served every asset locally (fonts, images, the
   10 animations, 218 Twemoji flags — CC-BY 4.0, attribution required — and the animation
   WASM). Generated pages should stay self-hosted. PageSpec hrefs may only be internal
   paths, `#anchors`, or `example.com`/`example.org` placeholders.
6. **Locales:** `en` and `uk` (`/ua` prefix) with per-locale typography overrides
   (`tokens/10-semantic/locale.json`: display/body font swap, 11px micro-labels → 12px,
   hero text block max-w 880px, hyphenated legal headings). `/ru` exists on the original
   but is **out of scope** and rejected by the validator.

## Layout

```
registry.manifest.json      status, versions, recomputed counts, entry points (all inside this folder)
tokens/00-foundation/       color, typography (+licensing), radius, spacing, breakpoint, elevation(+blur, gradients), icon-size, motion
tokens/10-semantic/         semantic roles (semantic.json) + per-locale overrides (locale.json)
tokens/20-component/        component-scoped tokens
tokens/30-layout/           frame, gutters, grids, divider semantics
tokens/themes/dark.json     every semantic/component token resolved (dark is the only theme on the source)
tokens/llm/                 component-allowlist.json, token-catalog.json, token-policy.json
assets/asset-roles.json     closed asset-role vocabulary + generation/licensing policy
primitives/ components/     12 primitive + 15 component contracts (props, tokens, evidence, responsive)
sections/                   23 section contracts (content schema w/ maxWords, motion, constraints, responsive, a11y, placeholder example)
templates/                  templates.json (6 page shapes, structured nodes) + routes.json (17 routes, 1:1)
compatibility/graph.json    21 rules (error/warn) - each enforced by the same-named function in the validator
schema/                     pagespec.schema.json (draft-07), example.pagespec.json, semantic_validate.py, tests/adversarial_test.py
extraction/                 measured-values.json (citations + corrections + copy budgets), verify_all.py, drift_proof.py
```

## Run the checks (Python 3 + `jsonschema`)

```bash
python3 schema/semantic_validate.py schema/example.pagespec.json   # validate any PageSpec
python3 schema/tests/adversarial_test.py                           # every mutation rejected, every control passes
python3 extraction/verify_all.py                                   # repo-wide consistency (citations warn if no sibling source)
python3 extraction/drift_proof.py                                  # proves each verify_all check fails on injected drift
```

`semantic_validate.py` always cross-checks a PageSpec's declared `template` against that
template's real node list (presence, order, repeatability) — never `nodes[]` in isolation.

## Evidence and corrections

Every token, contract and rule cites ids in `extraction/measured-values.json`, which maps
each id to a source file (relative to the clone's project root), a line range and a
structural anchor. When this folder sits beside the clone, `verify_all.py` checks every
range and anchor; standalone, those checks degrade to warnings. Later audits overrode the
Playwright specs in eight places (`correctionsOverridingSpecs`), all encoded here:
home statement is **not** frozen under reduced motion (partners is); the process-steps
observer watches the anchor wrapper at 0.4 after the animation loads; tab timers start
after markers load (duration = frames/30); compare-table group rows have no top border and
cells align baseline; Tailwind v4 `rounded-sm` = 4px; `divide-y` uses v4 semantics; UA
pricing hero text max-w 880px; the mobile menu wrapper fades out only.

## Versioning

`allowlistVersion` and `counts` are machine-checked; `repositoryVersion` is
documentation-only; `pageSpecVersion` is pinned in the schema for instances but the
manifest field itself is hand-maintained. See `versionFieldNote` in the manifest.

## Packaging

`design-repo.zip` (sibling of this folder) is built fresh and last with the CLI `zip`,
excluding `.DS_Store`/`__MACOSX`. It must not be committed to git alongside this folder;
the project's `.gitignore` does not yet list it (outside this build's write scope) — add
`design-repo.zip` there before any commit.

# Design-repo: Vault AI clone (design system only)

An AI-ready, machine-validated design system extracted from a local clone of a real,
live company's marketing site (Vault AI). A generator composes pages as **PageSpecs** (JSON)
that are checked against a closed schema, real template node lists, a compatibility graph,
per-slot copy budgets and, for generated pages, source-leakage rules.

**Status:** `design-review-pending` — `productionApproved: false` (see `registry.manifest.json`).
Repository 2.0.0, PageSpec 2.0.0 (adds the required `mode`; breaking).

## Counts (recomputed from disk by `extraction/verify_all.py`)

| item | count |
|---|---|
| tokens | 293 |
| primitives | 12 |
| components | 15 |
| sections | 24 |
| templates | 6 |
| routes | 17 |

Tokens = 215 foundation + 32 semantic + 39 component + 7 locale. Also: 20 asset roles,
21 compatibility rules + 11 generated-mode rules, 138 evidence citations, 6 generated
examples, 17 routes measured at 1440px. All of these are recomputed by `verify_all.py`.

## Two modes: `reference` and `generated`

Every PageSpec carries a required, closed `mode`:

- **`reference`** — a faithful reconstruction of the source page (review, evidence). Real
  brand, copy and reference-only asset roles (the source logo, screenshots, `.lottie`
  animations, planet art, mock scenes) are accepted. `schema/example.pagespec.json` is a
  reference example; the adversarial suite also proves a reference page carrying REAL
  source copy, CTA and screenshot role validates.
- **`generated`** — a NEW page for another brand. `schema/semantic_validate.py` adds
  `GENERATED_MODE_*` rules (listed in `compatibility/graph.json` → `generatedModeRules`):
  `_BRAND` (product name, wordmark spellings, domain labels, legal entity), `_CTA` (source
  CTA strings), `_COPY` (any 5-word run of source copy, hashed), `_URL` (source domains and
  subdomains, profile paths, e-mail domain, the lead-form endpoint), `_EXTERNAL_URL` (any URL
  or mailbox not on a reserved `.example` / `.invalid` / `example.com|org|net` host),
  `_PERSON`, `_CUSTOMER` (the mock client companies the source depicts), `_PARTNER` (the
  integration provider and chat vendor it names), `_ASSET` (a reference-only or
  blocked-for-generation role), `_ASSET_ROLE` (a role the section does not list in
  `generatedAssetRoles`) and `_ASSET_REF` (a ref slug that names a source media file).
  `schema/examples/generated.template.*.pagespec.json` — one per template (6) — use a
  fictional brand, original copy, generation-safe roles and reserved URLs.

**How detection works, and its limits.** The patterns are derived by
`extraction/build_source_brand.py` from the real clone (`src/` incl. the EN/UK i18n tables,
`CLONE_SPEC*.md`, `ASSET_MANIFEST*.md`, `public/`, `recon/`) into
`assets/asset-roles.json` → `sourceBrand` (readable patterns, with derivation notes and
evidence ids) and `assets/source-copy-hashes.json` (SHA-256 prefixes only; no source text).
Text is normalised first (`schema/textnorm.py`: NFKC, zero-width characters removed, curly
quotes straightened, Latin look-alike letters folded, separators squashed for the brand
tokens). Detection is **string-based**: a paraphrase, a translation into another language,
or text inside an image is NOT detected. The brand stem `vault` is matched as a substring,
so an ordinary word like "vaulted" is also rejected in generated pages (deliberate). Generic
CTA verbs ("Get started", "Contact us", ...) are exempt; that list was chosen by the agent
that built this revision. **No human has reviewed the derived patterns or pins**; every
"reviewed" note in this repo is an agent attestation, not a human sign-off. When the clone
sits beside this folder, `verify_all.py` re-derives the registry and fails if it is stale.

## Asset roles (`assets/asset-roles.json`)

Each role has a closed `availability` — `reference-only`, `generation-safe` or
`blocked-for-generation` — pinned in code (`PINNED_AVAILABILITY` in both
`schema/semantic_validate.py` and `extraction/verify_all.py`), plus `generatedModeGuidance`
and, when not generation-safe, `generationSafeSubstitutes`.

| availability | roles |
|---|---|
| reference-only | `brand-mark`, `product-screenshot`, `product-animation`, `background-art`, `illustration-mock` (the source's mock scenes embed its own mark) |
| blocked-for-generation | `third-party-logo` (the builder agency's wordmark credited in the footer) |
| generation-safe | `placeholder-brand-mark`, `generated-product-visual`, `generated-product-animation`, `generated-background-art`, `generated-mock-scene`, `fictional-avatar`, `generic-partner-placeholder`, `icon`, `icon-illustrated`, `background-glow`, `social-icon`, `flag`, `placeholder-url`*, `original-copy`* |

\* convention roles: not asset fields; enforced by the href schema and the
`GENERATED_MODE_URL` / `_EXTERNAL_URL` / `_COPY` / `_CTA` rules. Compliance-critical roles
also keep a pinned generation *policy* (e.g. `brand-mark` → `must-not-fabricate`). Every
section contract lists its `generatedAssetRoles`. PageSpec asset refs are always
`placeholder:<slug>` ids. Mock scenes may carry `parts` (brand marks, avatars, client
badges), and the footer an optional builder `credit`, both found in the source.

## Sections: semantic units, provenance vs taxonomy, retrieval

- Every contract has a closed `source` {id, file, lines, tag} (provenance: `verify_all`
  re-reads the cited range in the real file and checks the tag at its first line) and
  `semantic` {id, category} (taxonomy; `semantic.id` = contract id, never the source id).
  Meta schema: `schema/section-contract.schema.json` (closed).
- `retrievalEligible` is a closed boolean on every contract. Only `forms.partner-popup` (the
  runtime lead-form modal) is `false`, with a reason; this is pinned in both validators, in
  the allowlist (`retrievalIneligibleSections`) and checked again on PageSpec nodes.
- Category honesty: HERO is exactly the page-opening `hero.*` sections; the lead-form modal is
  CONVERSION; FEATURES/PROCESS sections that carry one inline button say why in
  `inlineCtaJustification` (`CLASS_POLICY`).
- **The former whole-page `content.legal-article` was decomposed** after measurement showed it
  held 88% of `/terms` (4465 of 5063px at 1440px): `content.legal-header` (h1, operator and
  date line, intro / DPA preamble) + `content.legal-section` (one per h2, repeatable, with its
  h3 sub-parts).

## Whole-page-wrapper gate (`extraction/wrapper_gate.py`, run by `verify_all.py`)

Heights of every template section on all 17 routes were measured at 1440x900 from a local
production build of the clone and recorded in `extraction/measured-values.json` →
`sectionHeights` (re-measure: `extraction/measure_sections.mjs`, Playwright resolved via
`NODE_PATH="$(npm root -g)"` or `PLAYWRIGHT_MODULE`; no machine path is stored). Pinned
thresholds: HERO > 1800px warns, > 3000px fails; one in-flow non-CHROME section > 50% of its
page warns, > 60% fails; missing measurements, wrong viewport or heights that do not add up
fail; whitelist entries (`extraction/wrapper-whitelist.json`, currently empty) need a 30+
character justification, a cap and an honest reviewer. Current result: 0 errors, 2 known
warnings — `/subprocessors` and `/ua/subprocessors`, an unspecced placeholder page whose only
body is the document header (51% / 52% of a short page). Tallest hero: home, 1363px.

## Read this first: what this repo is NOT

1. **The source is a real, live company's site.** This folder contains the design system
   only: no source marketing copy, legal text, Ukrainian strings, screenshots, `.lottie`
   animations, logos or font files. Section examples use placeholder copy; generated examples
   use a fictional brand. Deliberate exceptions: the hashed registry above, the readable
   `sourceBrand` patterns, and a few short source strings in `schema/tests/adversarial_test.py`
   (marked SOURCE) that exist only to prove rejection. Do not publish this repository or
   recommend making it public without the owner's decision.
2. **Fonts are referenced by family name only.** Display: *Clash Display* (Indian Type
   Foundry via Fontshare — **not OFL**; verify licensing before production use). Body:
   *Outfit* (OFL 1.1). Locale `uk`: *Unbounded* + *Manrope* (OFL 1.1). See
   `tokens/00-foundation/typography.json`.
3. **Clone-only pieces:** `template.not-found` / `hero.not-found`; the lead form submits
   locally only (`submission.mode` is `local-simulated`, the object is closed, so a PageSpec
   cannot declare an endpoint); contact actions use `mailto:` instead of the original's chat
   vendor; legal body text is placeholder (`bodyIsPlaceholder` const true).
4. **No external requests.** PageSpec hrefs may only be internal paths, `#anchors`, or
   reserved placeholder hosts.
5. **Locales:** `en` and `uk` (`/ua` prefix). `/ru` is out of scope and rejected.
6. **PageSpecs carry no token/style field** (styling is owned by contracts), so token misuse
   cannot be expressed in a PageSpec; the token catalog/policy (`tokens/llm/`) is kept in sync
   with the token files by `verify_all.py` (MASTER-GUIDE 3.21).

## Layout

```
registry.manifest.json      status, versions, recomputed counts, entry points (all inside this folder)
tokens/                     foundation, semantic (+locale), component, layout, themes/dark.json, llm/ (allowlist, catalog, policy)
assets/                     asset-roles.json (roles, availability, sourceBrand), source-copy-hashes.json
primitives/ components/     12 primitive + 15 component contracts
sections/                   24 section contracts (source + semantic, retrievalEligible, generatedAssetRoles, content schema, motion, responsive)
templates/                  templates.json (6 page shapes) + routes.json (17 routes, 1:1)
compatibility/graph.json    21 structural rules + 11 generatedModeRules
schema/                     pagespec.schema.json, section-contract.schema.json, example.pagespec.json (reference),
                            examples/ (6 generated), semantic_validate.py, textnorm.py, tests/adversarial_test.py
extraction/                 measured-values.json (citations, corrections, copy budgets, sectionHeights), verify_all.py,
                            prove_drift.py, wrapper_gate.py, wrapper-whitelist.json, measure_sections.mjs, build_source_brand.py
```

## Run the checks (Python 3 + `jsonschema`)

```bash
python3 schema/semantic_validate.py schema/example.pagespec.json schema/examples/*.json   # validate PageSpecs
python3 schema/semantic_validate.py --contracts                    # validate the section contracts
python3 schema/tests/adversarial_test.py                           # every mutation rejected, every control passes
python3 extraction/verify_all.py                                   # repo-wide consistency incl. pins and wrapper gate
python3 extraction/prove_drift.py [--scratch DIR]                  # every check/pin/gate fails on injected drift
python3 extraction/build_source_brand.py --check                   # registry vs the real source (needs the sibling clone)
```

When this folder sits beside the clone, citation ranges, section source ranges and the
source-brand registry are checked against the real files; standalone, those degrade to
warnings and only the pinned minimum is enforced.

## Versioning

`allowlistVersion` and `counts` are machine-checked; `pageSpecVersion` is pinned in the schema
for instances; `repositoryVersion` is documentation-only. See `versionFieldNote`.

## Packaging

`design-repo.zip` (sibling of this folder) is built fresh and last with the CLI `zip`,
excluding `.DS_Store`/`__MACOSX`/`__pycache__`; the project's `.gitignore` lists it and it is
not tracked.

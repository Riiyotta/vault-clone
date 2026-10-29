# Changelog

## 2.0.0 — 2026-10-29 (baseline R1–R14 revision, design-review-pending)

Breaking: PageSpec 2.0.0 adds the required `mode`; `content.legal-article` is replaced by
`content.legal-header` + `content.legal-section`.

- **Citation drift fixed at the root.** `ev.src.popup` cited `PartnerPopup.jsx:97-104`, which
  now holds focus-trap code (the file grew); re-read the file and re-pointed it to `112-119`
  (the ring at 112 and the `role="dialog"` panel at 113-119, both `rounded-[32px]`); the claim
  now names what those lines contain. The anchor check was not changed.
- **R1** `mode: "reference" | "generated"` required and closed in the schema;
  `pageSpecVersion` const 2.0.0; `schema/example.pagespec.json` is the reference example.
- **R2** generated mode: 11 `GENERATED_MODE_*` rules in `schema/semantic_validate.py`
  (`compatibility/graph.json` → `generatedModeRules`), patterns derived from the real source by
  the new `extraction/build_source_brand.py` into `assets/asset-roles.json` → `sourceBrand`
  (brand stems vault / overcode + product name, legal entity, 2 domains incl. all subdomains,
  2 profile paths, 1 form endpoint, 1 named person, 4 mock client companies, 2 named
  partners/vendors) and `assets/source-copy-hashes.json` (2717 copy-shingle, 6 CTA and 63
  media-stem hashes; no text). Shared normalisation `schema/textnorm.py` (NFKC, zero-width,
  curly quotes, look-alike letters). `BRAND_DENYLIST` (which rejected the brand in every
  page) is removed: reference pages may now carry real content, generated pages may not.
- **R3** every asset role has a closed `availability`, `generatedModeGuidance` and (when not
  generation-safe) `generationSafeSubstitutes`; 10 new roles (placeholder brand mark,
  generated product visual / animation / background art / mock scene, fictional avatar,
  generic partner placeholder, third-party logo, placeholder URL, original copy); mock-scene
  `parts` and a footer builder `credit` added from real source evidence; `PINNED_AVAILABILITY`
  in both validators; every section lists `generatedAssetRoles`. Finding: the source's mock
  scenes embed its own brand mark, so `illustration-mock` is reference-only.
- **R4** six generated examples (`schema/examples/generated.template.*.pagespec.json`, one per
  template) for a fictional brand, all 0 errors / 0 warnings.
- **R5** adversarial suite 70 → 179 checks (generated-mode leakage incl. obfuscated brand,
  copy, CTA, URL, endpoint, person, customer, partner, logo, screenshot, media; retrieval at
  node / contract / registry level; pins; contract provenance and classing; wrapper gate);
  `extraction/drift_proof.py` renamed `extraction/prove_drift.py` (`--scratch DIR`) with
  65 probes, one per check, pin and gate, including a real-source registry-staleness probe.
- **R6/R9** heights of every section on all 17 routes measured at 1440px from a local
  production build of the clone (`extraction/measure_sections.mjs`); the measurement exposed
  `content.legal-article` at 88% of `/terms` (4465 of 5063px), which was decomposed into a
  header + one section per h2. `extraction/wrapper_gate.py` (pinned 1800/3000px, 50/60%) runs
  inside `verify_all.py`: 0 errors, 2 known warnings (`/subprocessors`, `/ua/subprocessors`:
  the header is 51-52% of a short placeholder page). Tallest hero 1363px. Whitelist empty.
- **R7/R8** closed `schema/section-contract.schema.json`; every contract has `source`
  {id, file, lines, tag} (ranges re-read against the real files, tag checked at the first
  line) and `semantic` {id, category}; `retrievalEligible` on every contract, `false` only for
  the lead-form modal (pinned in both validators + allowlist + optional node field). The
  modal is re-classed CONVERSION; inline CTAs in FEATURES/PROCESS carry a justification.
- **R10** token catalog/policy unchanged and still in sync with the token files (checked).
- Root `ia.json` updated for the legal split (and a local machine path removed from its
  `meta.source`); `IA.md` / `matrix.csv` regenerated with `build.mjs`; `validate.mjs` passes.
- Honesty notes: detection is string-based (paraphrase/translation/images are not caught);
  no human has reviewed the derived patterns, the generic-CTA exemptions or the pins — every
  "reviewed" note is an agent attestation, not a human sign-off.

## 1.0.0 — 2026-10-16 (initial build, design-review-pending)

- Built from scratch from the local clone (React 18.3 / Vite 5.4 / Tailwind 3.4 /
  Framer Motion 14.2 / dotlottie-react 0.20 on dotlottie-web 0.81), its three Playwright
  specs, three asset manifests, `ia.json` and `recon/qa`.
- 293 tokens (215 foundation, 32 semantic, 39 component, 7 locale), dark theme fully
  resolved; LLM layer: allowlist 1.0.0, token catalog, token policy.
- 12 primitives, 15 components, 23 sections (ids reused from `ia.json`), 6 templates,
  17 routes mapped 1:1; 21 compatibility rules mirrored 1:1 by `semantic_validate.py`.
- Closed asset-role vocabulary (10 roles) with AI-generation/licensing guidance and pinned
  policies for compliance-critical roles.
- Copy budgets derived from measured string lengths (counts only, no source copy).
- Encoded eight audit corrections that override the original specs (see
  `extraction/measured-values.json` → `correctionsOverridingSpecs`).
- Spot-check findings vs. the pre-investigated brief: the dotLottie *React* package is
  0.20.0 (0.81 is the underlying dotlottie-web player); `ia.json` describes the reports
  showcase as a "mirrored layout" but source renders all three showcases with the same
  `lg:flex-row-reverse` body, so no mirrored variant was encoded; spec D.3's legal-table
  `align-top` is superseded by the source's `align-baseline`.
- Verification: schema (draft-07) 0 errors; adversarial suite all pass; verify_all all
  pass; drift_proof catches every injected defect; self-containment re-run in an isolated
  temp dir; zip built last and checked clean.

# Changelog

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

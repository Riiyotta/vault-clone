# Vault AI clone — information architecture

`ia.json` is the only IA file to hand-edit. `IA.md` and `matrix.csv` are generated from it and are overwritten on every build.

```bash
node validate.mjs   # checks route/template totals, section references, categories
node build.mjs      # regenerates IA.md and matrix.csv
```

## What the data shows

- **17 routes across 6 templates.** Every template except the clone-only 404 exists in English and Ukrainian, so the locale doubles the route count without adding layouts. The 8 legal routes (4 documents × 2 locales) are 47% of all routes but share one template with a single content section, so they are the cheapest part of the build.
- **7 of 23 sections are shared.** The navbar, footer and grid frame appear on all 17 routes. Four content sections are reused across templates: the FAQ accordion (pricing, migration offer, partners), the scroll statement (home, partners), the Lottie steps (home, pricing) and the four-step visual steps (migration offer, partners).
- **`process.visual-steps` is now shared.** It lives in `src/components/shared/VisualSteps.jsx`; `src/components/migration/VisualSteps.jsx` is a thin wrapper kept for the migration page.
- **16 sections are single-use** and should stay page-local until a second page needs them. The three home showcases (`features.showcase-*`) are separate sections in the IA because each has its own anchor and content, but all three render through one component, `FeatureTabs.jsx`.

## Notes

- Every section now has an `implementedBy` path. The legal pages render placeholder body text by design; only their layout, headings and meta follow the original.
- `validate.mjs` reports a note on `content.legal-article`: its scope mentions 4 and 2 while the computed count is 8. That is expected, since the scope says "4 documents × 2 locales", and needs no fix.
- `/ru` exists on the original but isn't linked from the language switch and isn't cloned, so it's not in the IA.

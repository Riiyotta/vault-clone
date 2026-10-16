#!/usr/bin/env python3
"""Adversarial suite: every rule must reject a crafted bad instance; every control must pass.

Controls: the bundled example plus one synthesized PageSpec per real route (built from each
template's own node list, so a new template is covered automatically).
Mutations: each targets one rule and must produce at least one ERROR tagged with that rule id
(or a WARN for warn-severity rules).
Run:  python3 schema/tests/adversarial_test.py      (exit 1 on any failure)
"""
import copy
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(REPO, "schema"))
import semantic_validate as V  # noqa: E402

with open(os.path.join(REPO, "schema", "example.pagespec.json"), encoding="utf-8") as f:
    EXAMPLE = json.load(f)


def ctl(tid, route=None):
    return V.build_control(tid, route)


def node(spec, sid):
    return next(n for n in spec["nodes"] if n["type"] == sid)


def m(base, fn):
    s = copy.deepcopy(base)
    fn(s)
    return s


HOME, PRICING, MIGR, PARTNERS, LEGAL = (ctl("template.home"), ctl("template.pricing"), ctl("template.migration-offer"),
                                        ctl("template.partners"), ctl("template.legal"))

MUTATIONS = [
    # ---- schema layer
    ("schema: invented node type alias", "SCHEMA", m(HOME, lambda s: s["nodes"][3].__setitem__("type", "narrative.statement"))),
    ("schema: wrong template enum", "SCHEMA", m(HOME, lambda s: s.__setitem__("template", "template.landing"))),
    ("schema: missing required field (meta)", "SCHEMA", m(HOME, lambda s: s.pop("meta"))),
    ("schema: missing reducedMotionFallback", "SCHEMA", m(HOME, lambda s: s["nodes"][2]["motion"].pop("reducedMotionFallback"))),
    ("schema: motion smuggles invented field", "SCHEMA", m(HOME, lambda s: s["nodes"][2]["motion"].__setitem__("inventedAnimation", "parallax"))),
    ("schema: motion pattern from another section", "SCHEMA", m(HOME, lambda s: s["nodes"][2]["motion"].__setitem__("pattern", "scroll-scrubbed-word-fill"))),
    ("schema: fallback not allowed for pattern", "SCHEMA", m(MIGR, lambda s: node(s, "process.visual-steps")["motion"].__setitem__("reducedMotionFallback", "static"))),
    ("schema: invented assetRole", "SCHEMA", m(HOME, lambda s: node(s, "hero.home-dashboard")["content"]["media"].__setitem__("role", "stock-photo"))),
    ("schema: valid role on wrong field (brand-mark as hero media)", "SCHEMA", m(HOME, lambda s: node(s, "hero.home-dashboard")["content"]["media"].__setitem__("role", "brand-mark"))),
    ("schema: asset ref is a source path, not a placeholder", "SCHEMA", m(HOME, lambda s: node(s, "hero.home-dashboard")["content"]["media"].__setitem__("ref", "/assets/img/hero.png"))),
    ("schema: real external URL in nav href", "SCHEMA", m(HOME, lambda s: node(s, "chrome.navbar")["content"]["links"][0].__setitem__("href", "https://real-company.io/login"))),
    ("schema: lead form gets a real endpoint", "SCHEMA", m(PARTNERS, lambda s: node(s, "forms.partner-popup")["content"]["submission"].__setitem__("endpoint", "https://example.com/api/lead"))),
    ("schema: lead form submission mode changed", "SCHEMA", m(PARTNERS, lambda s: node(s, "forms.partner-popup")["content"]["submission"].__setitem__("mode", "post"))),
    ("schema: legal body marked non-placeholder", "SCHEMA", m(LEGAL, lambda s: node(s, "content.legal-article")["content"].__setitem__("bodyIsPlaceholder", False))),
    ("schema: per-instance style override field", "SCHEMA", m(HOME, lambda s: s["nodes"][2].__setitem__("style", {"color": "#ff0000"}))),
    ("schema: compare cell 'included' carrying a value", "SCHEMA", m(PRICING, lambda s: node(s, "commerce.compare-table")["content"]["groups"][0]["rows"][1]["cells"].__setitem__(0, {"kind": "included", "value": "yes"}))),
    ("schema: product grid with 5 cards", "SCHEMA", m(HOME, lambda s: node(s, "features.product-grid")["content"]["cards"].pop())),
    ("schema: statement missing variant", "SCHEMA", m(HOME, lambda s: node(s, "narrative.scroll-statement").pop("variant"))),
    ("schema: chrome/ru-style locale", "SCHEMA", m(HOME, lambda s: s.__setitem__("locale", "ru"))),
    # ---- structural / template cross-reference
    ("struct: duplicate one-per-page section", "TEMPLATE_NODE_SEQUENCE", m(HOME, lambda s: s["nodes"].insert(5, copy.deepcopy(node(s, "features.product-grid"))))),
    ("struct: duplicate (section, variant)", "DUPLICATE_SECTION_VARIANT", m(PRICING, lambda s: s["nodes"].insert(5, copy.deepcopy(node(s, "support.faq-accordion"))))),
    ("struct: removed mandatory section", "TEMPLATE_NODE_SEQUENCE", m(PRICING, lambda s: s["nodes"].remove(node(s, "commerce.compare-table")))),
    ("struct: reordered fixed-position section", "TEMPLATE_NODE_SEQUENCE", m(MIGR, lambda s: s["nodes"].__setitem__(slice(3, 5), s["nodes"][4:2:-1]))),
    ("struct: section from another template (template mismatch)", "TEMPLATE_NODE_SEQUENCE", m(PRICING, lambda s: s["nodes"].insert(4, copy.deepcopy(node(MIGR, "features.migration-conditions"))))),
    ("struct: valid node list but declared template is different", "TEMPLATE_NODE_SEQUENCE", m(PRICING, lambda s: s.update({"template": "template.migration-offer", "route": "/new-offer"}))),
    ("struct: nav not first", "NAV_FIRST", m(LEGAL, lambda s: s["nodes"].insert(0, s["nodes"].pop(1)))),
    ("struct: grid frame not second", "GRID_FRAME_SECOND", m(LEGAL, lambda s: s["nodes"].pop(1))),
    ("struct: footer not last", "FOOTER_LAST", m(LEGAL, lambda s: s["nodes"].append(s["nodes"].pop(2)))),
    ("struct: hero added to heroless legal page", "ONE_HERO_PER_PAGE", m(LEGAL, lambda s: s["nodes"].insert(2, copy.deepcopy(node(ctl("template.not-found"), "hero.not-found"))))),
    ("struct: two heroes", "ONE_HERO_PER_PAGE", m(HOME, lambda s: s["nodes"].insert(3, copy.deepcopy(node(ctl("template.not-found"), "hero.not-found"))))),
    ("struct: hero not right after frame", "HERO_AFTER_FRAME", m(MIGR, lambda s: s["nodes"].insert(2, s["nodes"].pop(3)))),
    ("struct: popup not before footer", "POPUP_BEFORE_FOOTER", m(PARTNERS, lambda s: s["nodes"].insert(4, s["nodes"].pop(-2)))),
    # ---- cross-node / per-template semantics
    ("rule: lead-form trigger without popup", "POPUP_TRIGGER_PARITY", m(MIGR, lambda s: node(s, "hero.migration-split")["content"].__setitem__("ctaAction", "open-lead-form"))),
    ("rule: popup without any trigger", "POPUP_TRIGGER_PARITY", m(PARTNERS, lambda s: [node(s, x)["content"].__setitem__("ctaAction", "contact-mailto") for x in ("hero.partners-split", "process.visual-steps")] + [node(s, "features.partner-value-grid")["content"]["rightColumn"].__setitem__("ctaAction", "contact-mailto")])),
    ("rule: home statement frozen under reduced motion (spec bug, corr.a)", "STATEMENT_REDUCED_MOTION_BY_TEMPLATE", m(HOME, lambda s: node(s, "narrative.scroll-statement").update({"variant": "scrubbed-static-when-reduced", "motion": {"pattern": "scroll-scrubbed-word-fill", "reducedMotionFallback": "progress-fixed-at-1"}}))),
    ("rule: partners statement left scroll-driven", "STATEMENT_REDUCED_MOTION_BY_TEMPLATE", m(PARTNERS, lambda s: node(s, "narrative.scroll-statement").update({"variant": "scrubbed-always", "motion": {"pattern": "scroll-scrubbed-word-fill", "reducedMotionFallback": "scroll-driven-unchanged"}}))),
    ("rule: process anchor on pricing", "LOTTIE_STEPS_ANCHOR_HOME_ONLY", m(PRICING, lambda s: node(s, "process.lottie-steps")["content"].__setitem__("anchorId", "steps"))),
    ("rule: process anchor missing on home", "LOTTIE_STEPS_ANCHOR_HOME_ONLY", m(HOME, lambda s: node(s, "process.lottie-steps")["content"].__setitem__("anchorId", None))),
    ("rule: two recommended plans", "PRICING_ONE_RECOMMENDED", m(PRICING, lambda s: node(s, "hero.pricing-plans")["content"]["plans"][0].update({"recommended": True, "recommendedLabel": "Pick"}))),
    ("rule: duplicate anchor ids", "UNIQUE_ANCHOR_IDS", m(HOME, lambda s: node(s, "features.showcase-reports")["content"].__setitem__("anchorId", "capability-one"))),
    ("rule: known route bound to other template", "ROUTE_TEMPLATE_BINDING", m(PRICING, lambda s: s.__setitem__("route", "/partners"))),
    ("rule: uk locale on EN route", "LOCALE_ROUTE_PREFIX", m(ctl("template.legal", "/terms"), lambda s: s.__setitem__("locale", "uk"))),
    ("rule: /ru route (out of scope)", "LOCALE_ROUTE_PREFIX", m(HOME, lambda s: s.__setitem__("route", "/ru"))),
    ("rule: uk locale on en-only template", "TEMPLATE_LOCALE", m(ctl("template.not-found"), lambda s: s.update({"locale": "uk", "route": "/ua/missing"}))),
    ("runtime: maxWords overflow (hero headline)", "MAX_WORDS", m(HOME, lambda s: node(s, "hero.home-dashboard")["content"].__setitem__("headline", "one two three four five six seven eight nine ten"))),
    ("runtime: maxWords overflow (faq answer, nested array)", "MAX_WORDS", m(PRICING, lambda s: node(s, "support.faq-accordion")["content"]["items"][0]["answer"].__setitem__(0, " ".join(["word"] * 60)))),
    ("runtime: maxWords overflow (meta title)", "MAX_WORDS", m(HOME, lambda s: s["meta"].__setitem__("title", " ".join(["w"] * 12)))),
    ("content: source brand name in copy", "BRAND_DENYLIST", m(HOME, lambda s: node(s, "hero.home-dashboard")["content"].__setitem__("eyebrow", "Vault AI platform"))),
    ("content: source domain in alt text", "BRAND_DENYLIST", m(HOME, lambda s: node(s, "hero.home-dashboard")["content"]["media"].__setitem__("alt", "Screenshot from usevault"))),
]

# warn-severity rules: proven via the internal API (they must WARN, and must not ERROR)
WARN_MUTATIONS = [
    ("warn: unobserved same-category adjacency", "NO_ADJACENT_SAME_CATEGORY", m(PARTNERS, lambda s: s["nodes"].insert(4, s["nodes"].pop(5)))),
    ("warn: process not closing content", "PROCESS_CLOSES_CONTENT", m(PRICING, lambda s: s["nodes"].insert(4, s["nodes"].pop(5)))),
]


def budget_case():
    """MOTION_BUDGET_AUTO_ADVANCE cannot be exceeded by any template-valid page (home peaks at 4),
    so prove the rule function directly against a synthetic node list."""
    spec = copy.deepcopy(HOME)
    spec["nodes"].insert(8, copy.deepcopy(node(MIGR, "process.visual-steps")))
    warns = []
    V.RULES["MOTION_BUDGET_AUTO_ADVANCE"](spec, V.TEMPLATES["template.home"], warns.append, warns.append)
    return warns


def main():
    fails = 0
    controls = [("example.pagespec.json", EXAMPLE)] + [(f"control {t} {r}", ctl(t, r)) for t in V.TEMPLATES for r in V.TEMPLATES[t]["routes"]]
    for name, spec in controls:
        e, w = V.validate(spec)
        ok = not e and not w
        fails += not ok
        print(f"[{'PASS' if ok else 'FAIL'}] CONTROL {name}: {len(e)} errors, {len(w)} warnings" + ("" if ok else f" -> {e[:2]} {w[:2]}"))
    for name, rule, spec in MUTATIONS:
        e, _ = V.validate(spec)
        hit = [x for x in e if x.startswith(rule + ":")]
        fails += not hit
        print(f"[{'PASS' if hit else 'FAIL'}] REJECT {name} -> {rule}" + (f" ({hit[0][:110]})" if hit else f" NOT REJECTED; errors={e[:2]}"))
    for name, rule, spec in WARN_MUTATIONS:
        e, w = V.validate(spec)
        hit = [x for x in w if x.startswith(rule + ":")]
        ok = bool(hit) and not [x for x in e if x.startswith(rule + ":")]
        fails += not ok
        print(f"[{'PASS' if ok else 'FAIL'}] WARN   {name} -> {rule}" + (f" ({hit[0][:110]})" if hit else " NOT WARNED"))
    bw = budget_case()
    fails += not bw
    print(f"[{'PASS' if bw else 'FAIL'}] WARN   motion budget exceeded (direct rule call) -> MOTION_BUDGET_AUTO_ADVANCE {bw[:1]}")
    total = len(controls) + len(MUTATIONS) + len(WARN_MUTATIONS) + 1
    print(f"\n{total - fails}/{total} checks passed ({len(controls)} controls, {len(MUTATIONS)} rejections, {len(WARN_MUTATIONS) + 1} warnings)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

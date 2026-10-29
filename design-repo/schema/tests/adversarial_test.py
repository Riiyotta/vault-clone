#!/usr/bin/env python3
"""Adversarial suite: every rule must reject a crafted bad instance; every control must pass.

Controls: the bundled reference example, every generation-safe example in schema/examples/, one synthesized
PageSpec per real route in BOTH modes (built from each template's own node list, so a new template is covered
automatically), and a reference page carrying REAL source content (reference mode must accept it).
Mutations: each targets one rule and must produce at least one ERROR tagged with that rule id (or a WARN for
warn-severity rules). Groups: schema, structure, cross-node rules, generated-mode leakage (brand / logo / copy /
CTA / URL / person / customer / partner / screenshot / media), retrieval eligibility (node / contract / registry),
availability pins, section-contract provenance/taxonomy/category honesty, and the wrapper gate.

TEST FIXTURE NOTE: a few short source strings appear below (marked SOURCE) only to prove that generated mode rejects
them and reference mode accepts them. They are not design content.
Run:  python3 schema/tests/adversarial_test.py      (exit 1 on any failure)
"""
import copy
import glob
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(REPO, "schema"))
import semantic_validate as V  # noqa: E402

_spec = importlib.util.spec_from_file_location("wrapper_gate", os.path.join(REPO, "extraction", "wrapper_gate.py"))
WG = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(WG)


def load(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8") as f:
        return json.load(f)


EXAMPLE = load("schema/example.pagespec.json")
GEN_EXAMPLES = {load(os.path.relpath(p, REPO))["template"]: load(os.path.relpath(p, REPO)) for p in sorted(glob.glob(os.path.join(REPO, "schema", "examples", "generated.*.pagespec.json")))}


def ctl(tid, route=None, mode="reference"):
    return V.build_control(tid, route, mode)


def node(spec, sid):
    return next(n for n in spec["nodes"] if n["type"] == sid)


def m(base, fn):
    s = copy.deepcopy(base)
    fn(s)
    return s


def setp(path, value):
    """Mutation helper: set spec[...path] = value (path = list of keys / indexes, a str key selects a node by type)."""
    def fn(s):
        o = node(s, path[0])["content"]
        for k in path[1:-1]:
            o = o[k]
        o[path[-1]] = value
    return fn


HOME, PRICING, MIGR, PARTNERS, LEGAL = (ctl("template.home"), ctl("template.pricing"), ctl("template.migration-offer"),
                                        ctl("template.partners"), ctl("template.legal"))
G_HOME, G_PART, G_LEGAL, G_MIGR = GEN_EXAMPLES["template.home"], GEN_EXAMPLES["template.partners"], GEN_EXAMPLES["template.legal"], GEN_EXAMPLES["template.migration-offer"]

# SOURCE: real strings of the source (see module docstring)
SRC_HEADLINE = "Control your Business Finances in One Place"
SRC_STATEMENT_NO_BRAND = "It gives you a complete system to track, understand, and automate your business finances bringing transactions, reports, and workflows together"


def reference_with_real_content():
    s = copy.deepcopy(HOME)
    node(s, "chrome.navbar")["content"]["brandMark"]["alt"] = "Vault AI home"
    h = node(s, "hero.home-dashboard")["content"]
    h.update({"eyebrow": "Financial management platform", "headline": SRC_HEADLINE, "ctaLabel": "Get started"})
    h["media"].update({"role": "product-screenshot", "ref": "placeholder:hero-en"})
    node(s, "narrative.scroll-statement")["content"]["text"] = "Vault gives you a complete system to track, understand, and automate your business finances"
    node(s, "features.showcase-automation")["content"]["ctaLabel"] = "Try it free"
    node(s, "chrome.footer")["content"]["copyright"] = "© 2026 VAULT AI. All rights reserved."
    return s


REAL_REF = reference_with_real_content()
REAL_AS_GENERATED = m(REAL_REF, lambda s: s.__setitem__("mode", "generated"))

MUTATIONS = [
    # ---- schema layer
    ("schema: missing mode", "SCHEMA", m(HOME, lambda s: s.pop("mode"))),
    ("schema: mode outside the closed enum", "SCHEMA", m(HOME, lambda s: s.__setitem__("mode", "clone"))),
    ("schema: old pageSpecVersion", "SCHEMA", m(HOME, lambda s: s.__setitem__("pageSpecVersion", "1.0.0"))),
    ("schema: invented node type alias", "SCHEMA", m(HOME, lambda s: s["nodes"][3].__setitem__("type", "narrative.statement"))),
    ("schema: wrong template enum", "SCHEMA", m(HOME, lambda s: s.__setitem__("template", "template.landing"))),
    ("schema: missing required field (meta)", "SCHEMA", m(HOME, lambda s: s.pop("meta"))),
    ("schema: missing reducedMotionFallback", "SCHEMA", m(HOME, lambda s: s["nodes"][2]["motion"].pop("reducedMotionFallback"))),
    ("schema: motion smuggles invented field", "SCHEMA", m(HOME, lambda s: s["nodes"][2]["motion"].__setitem__("inventedAnimation", "parallax"))),
    ("schema: motion pattern from another section", "SCHEMA", m(HOME, lambda s: s["nodes"][2]["motion"].__setitem__("pattern", "scroll-scrubbed-word-fill"))),
    ("schema: fallback not allowed for pattern", "SCHEMA", m(MIGR, lambda s: node(s, "process.visual-steps")["motion"].__setitem__("reducedMotionFallback", "static"))),
    ("schema: invented assetRole", "SCHEMA", m(HOME, setp(["hero.home-dashboard", "media", "role"], "stock-photo"))),
    ("schema: valid role on wrong field (brand-mark as hero media)", "SCHEMA", m(HOME, setp(["hero.home-dashboard", "media", "role"], "brand-mark"))),
    ("schema: asset ref is a source path, not a placeholder", "SCHEMA", m(HOME, setp(["hero.home-dashboard", "media", "ref"], "/assets/img/hero.png"))),
    ("schema: real external URL in nav href", "SCHEMA", m(HOME, lambda s: node(s, "chrome.navbar")["content"]["links"][0].__setitem__("href", "https://real-company.io/login"))),
    ("schema: lookalike reserved host in href", "SCHEMA", m(HOME, lambda s: node(s, "chrome.navbar")["content"]["links"][0].__setitem__("href", "https://example.com.evil.io/x"))),
    ("schema: lead form gets a real endpoint", "SCHEMA", m(PARTNERS, setp(["forms.partner-popup", "submission", "endpoint"], "https://example.com/api/lead"))),
    ("schema: lead form submission mode changed", "SCHEMA", m(PARTNERS, setp(["forms.partner-popup", "submission", "mode"], "post"))),
    ("schema: legal body marked non-placeholder", "SCHEMA", m(LEGAL, setp(["content.legal-section", "bodyIsPlaceholder"], False))),
    ("schema: whole-page legal-article node (decomposed)", "SCHEMA", m(LEGAL, lambda s: node(s, "content.legal-section").__setitem__("type", "content.legal-article"))),
    ("schema: per-instance style override field", "SCHEMA", m(HOME, lambda s: s["nodes"][2].__setitem__("style", {"color": "#ff0000"}))),
    ("schema: node retrievalEligible not boolean", "SCHEMA", m(HOME, lambda s: s["nodes"][2].__setitem__("retrievalEligible", "yes"))),
    ("schema: compare cell 'included' carrying a value", "SCHEMA", m(PRICING, lambda s: node(s, "commerce.compare-table")["content"]["groups"][0]["rows"][1]["cells"].__setitem__(0, {"kind": "included", "value": "yes"}))),
    ("schema: product grid with 5 cards", "SCHEMA", m(HOME, lambda s: node(s, "features.product-grid")["content"]["cards"].pop())),
    ("schema: statement missing variant", "SCHEMA", m(HOME, lambda s: node(s, "narrative.scroll-statement").pop("variant"))),
    ("schema: chrome/ru-style locale", "SCHEMA", m(HOME, lambda s: s.__setitem__("locale", "ru"))),
    # ---- structural / template cross-reference
    ("struct: duplicate one-per-page section", "TEMPLATE_NODE_SEQUENCE", m(HOME, lambda s: s["nodes"].insert(5, copy.deepcopy(node(s, "features.product-grid"))))),
    ("struct: duplicate (section, variant)", "DUPLICATE_SECTION_VARIANT", m(PRICING, lambda s: s["nodes"].insert(5, copy.deepcopy(node(s, "support.faq-accordion"))))),
    ("struct: removed mandatory section", "TEMPLATE_NODE_SEQUENCE", m(PRICING, lambda s: s["nodes"].remove(node(s, "commerce.compare-table")))),
    ("struct: legal header removed", "TEMPLATE_NODE_SEQUENCE", m(LEGAL, lambda s: s["nodes"].remove(node(s, "content.legal-header")))),
    ("struct: legal section before its header", "TEMPLATE_NODE_SEQUENCE", m(LEGAL, lambda s: s["nodes"].insert(2, s["nodes"].pop(3)))),
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
    ("rule: lead-form trigger without popup", "POPUP_TRIGGER_PARITY", m(MIGR, setp(["hero.migration-split", "ctaAction"], "open-lead-form"))),
    ("rule: popup without any trigger", "POPUP_TRIGGER_PARITY", m(PARTNERS, lambda s: [node(s, x)["content"].__setitem__("ctaAction", "contact-mailto") for x in ("hero.partners-split", "process.visual-steps")] + [node(s, "features.partner-value-grid")["content"]["rightColumn"].__setitem__("ctaAction", "contact-mailto")])),
    ("rule: home statement frozen under reduced motion (spec bug, corr.a)", "STATEMENT_REDUCED_MOTION_BY_TEMPLATE", m(HOME, lambda s: node(s, "narrative.scroll-statement").update({"variant": "scrubbed-static-when-reduced", "motion": {"pattern": "scroll-scrubbed-word-fill", "reducedMotionFallback": "progress-fixed-at-1"}}))),
    ("rule: partners statement left scroll-driven", "STATEMENT_REDUCED_MOTION_BY_TEMPLATE", m(PARTNERS, lambda s: node(s, "narrative.scroll-statement").update({"variant": "scrubbed-always", "motion": {"pattern": "scroll-scrubbed-word-fill", "reducedMotionFallback": "scroll-driven-unchanged"}}))),
    ("rule: process anchor on pricing", "LOTTIE_STEPS_ANCHOR_HOME_ONLY", m(PRICING, setp(["process.lottie-steps", "anchorId"], "steps"))),
    ("rule: process anchor missing on home", "LOTTIE_STEPS_ANCHOR_HOME_ONLY", m(HOME, setp(["process.lottie-steps", "anchorId"], None))),
    ("rule: two recommended plans", "PRICING_ONE_RECOMMENDED", m(PRICING, lambda s: node(s, "hero.pricing-plans")["content"]["plans"][0].update({"recommended": True, "recommendedLabel": "Pick"}))),
    ("rule: duplicate anchor ids", "UNIQUE_ANCHOR_IDS", m(HOME, setp(["features.showcase-reports", "anchorId"], "capability-one"))),
    ("rule: duplicate legal anchor ids", "UNIQUE_ANCHOR_IDS", m(G_LEGAL, lambda s: [n for n in s["nodes"] if n["type"] == "content.legal-section"][1]["content"].__setitem__("anchorId", "1"))),
    ("rule: known route bound to other template", "ROUTE_TEMPLATE_BINDING", m(PRICING, lambda s: s.__setitem__("route", "/partners"))),
    ("rule: uk locale on EN route", "LOCALE_ROUTE_PREFIX", m(ctl("template.legal", "/terms"), lambda s: s.__setitem__("locale", "uk"))),
    ("rule: /ru route (out of scope)", "LOCALE_ROUTE_PREFIX", m(HOME, lambda s: s.__setitem__("route", "/ru"))),
    ("rule: uk locale on en-only template", "TEMPLATE_LOCALE", m(ctl("template.not-found"), lambda s: s.update({"locale": "uk", "route": "/ua/missing"}))),
    ("runtime: maxWords overflow (hero headline)", "MAX_WORDS", m(HOME, setp(["hero.home-dashboard", "headline"], "one two three four five six seven eight nine ten"))),
    ("runtime: maxWords overflow (faq answer, nested array)", "MAX_WORDS", m(PRICING, lambda s: node(s, "support.faq-accordion")["content"]["items"][0]["answer"].__setitem__(0, " ".join(["word"] * 60)))),
    ("runtime: maxWords overflow (meta title)", "MAX_WORDS", m(HOME, lambda s: s["meta"].__setitem__("title", " ".join(["w"] * 12)))),
    ("runtime: maxWords overflow (legal sub-part heading)", "MAX_WORDS", m(G_LEGAL, lambda s: [n for n in s["nodes"] if n["type"] == "content.legal-section"][1]["content"]["subsections"][0].__setitem__("heading", " ".join(["w"] * 11)))),
    # ---- retrieval eligibility (node level; contract / registry levels below)
    ("retrieval: modal flipped eligible on the node", "RETRIEVAL_ELIGIBILITY", m(PARTNERS, lambda s: node(s, "forms.partner-popup").__setitem__("retrievalEligible", True))),
    ("retrieval: content section marked ineligible on the node", "RETRIEVAL_ELIGIBILITY", m(HOME, lambda s: node(s, "features.product-grid").__setitem__("retrievalEligible", False))),
    # ---- generated mode: brand / wordmark / logo
    ("generated: brand name in hero copy", "GENERATED_MODE_BRAND", m(G_HOME, setp(["hero.home-dashboard", "eyebrow"], "Vault for studios"))),
    ("generated: brand with zero-width joiner", "GENERATED_MODE_BRAND", m(G_HOME, setp(["hero.home-dashboard", "eyebrow"], "V​au‍lt ledger"))),
    ("generated: brand in full-width letters (NFKC)", "GENERATED_MODE_BRAND", m(G_HOME, setp(["hero.home-dashboard", "eyebrow"], "ＶＡＵＬＴ books"))),
    ("generated: brand with Cyrillic look-alike letter", "GENERATED_MODE_BRAND", m(G_HOME, setp(["hero.home-dashboard", "eyebrow"], "Vаult books"))),
    ("generated: brand spaced out (squashed token)", "GENERATED_MODE_BRAND", m(G_HOME, setp(["hero.home-dashboard", "eyebrow"], "V.a.u.l.t A.I"))),
    ("generated: brand wordmark in the brand-mark alt", "GENERATED_MODE_BRAND", m(G_HOME, lambda s: node(s, "chrome.navbar")["content"]["brandMark"].__setitem__("alt", "Vault AI home"))),
    ("generated: source legal entity on a legal page", "GENERATED_MODE_BRAND", m(G_LEGAL, setp(["content.legal-header", "operatorLine"], "Overcode Limited"))),
    ("generated: brand in the page route", "GENERATED_MODE_BRAND", m(G_HOME, lambda s: s.__setitem__("route", "/usevault-pricing"))),
    ("generated: source wordmark role (brand-mark) reused", "GENERATED_MODE_ASSET", m(G_HOME, lambda s: node(s, "chrome.navbar")["content"]["brandMark"].__setitem__("role", "brand-mark"))),
    ("generated: source logo file as asset ref", "GENERATED_MODE_ASSET_REF", m(G_HOME, lambda s: node(s, "chrome.navbar")["content"]["brandMark"].__setitem__("ref", "placeholder:vault-logo"))),
    ("generated: real agency logo in the footer credit", "GENERATED_MODE_ASSET", m(G_HOME, lambda s: node(s, "chrome.footer")["content"]["credit"]["mark"].__setitem__("role", "third-party-logo"))),
    ("generated: source brand mark inside a mock scene", "GENERATED_MODE_ASSET", m(G_PART, lambda s: node(s, "hero.partners-split")["content"]["scene"]["parts"][0].__setitem__("role", "brand-mark"))),
    # ---- generated mode: copy and CTA
    ("generated: source marketing sentence (brand removed)", "GENERATED_MODE_COPY", m(G_HOME, setp(["narrative.scroll-statement", "text"], SRC_STATEMENT_NO_BRAND))),
    ("generated: source headline with NBSP and curly quotes", "GENERATED_MODE_COPY", m(G_HOME, setp(["hero.home-dashboard", "headline"], "“Control your Business Finances in One Place”"))),
    ("generated: source copy in a FAQ answer", "GENERATED_MODE_COPY", m(GEN_EXAMPLES["template.pricing"], lambda s: node(s, "support.faq-accordion")["content"]["items"][0]["answer"].__setitem__(0, "After one month, you choose Free or Basic, or keep Pro."))),
    ("generated: source CTA string", "GENERATED_MODE_CTA", m(G_HOME, setp(["features.showcase-automation", "ctaLabel"], "Try it free"))),
    ("generated: source CTA string, other case + curly apostrophe-free", "GENERATED_MODE_CTA", m(G_PART, setp(["hero.partners-split", "ctaLabel"], "BECOME A PARTNER"))),
    ("generated: source CTA string (UK locale)", "GENERATED_MODE_CTA", m(G_PART, setp(["hero.partners-split", "ctaLabel"], "Стати партнером"))),
    # ---- generated mode: URLs and endpoints
    ("generated: source app subdomain in text", "GENERATED_MODE_URL", m(G_HOME, setp(["hero.home-dashboard", "subheadline"], "Sign in at app.usevault.ai/login to see your ledger."))),
    ("generated: source e-mail address", "GENERATED_MODE_URL", m(G_HOME, lambda s: node(s, "chrome.footer")["content"]["social"][0].__setitem__("label", "hello@usevault.ai"))),
    ("generated: source social profile path", "GENERATED_MODE_URL", m(G_HOME, setp(["hero.home-dashboard", "subheadline"], "Follow linkedin.com/company/usevault-ai for updates."))),
    ("generated: source demo/lead form endpoint", "GENERATED_MODE_URL", m(G_PART, setp(["forms.partner-popup", "description"], "Requests are posted to /api/add-lead by the form."))),
    ("generated: builder agency domain", "GENERATED_MODE_URL", m(G_HOME, setp(["hero.home-dashboard", "subheadline"], "Designed with help from overcode.tech partners."))),
    ("generated: real third-party URL in text", "GENERATED_MODE_EXTERNAL_URL", m(G_HOME, setp(["hero.home-dashboard", "subheadline"], "Read more at https://acme-books.com/guide today."))),
    ("generated: real mailbox in text", "GENERATED_MODE_EXTERNAL_URL", m(G_HOME, lambda s: node(s, "chrome.footer")["content"]["social"][0].__setitem__("label", "team@acme-books.com"))),
    # ---- generated mode: people, customers, partners
    ("generated: real person named by the source", "GENERATED_MODE_PERSON", m(G_PART, lambda s: node(s, "hero.partners-split")["content"]["scene"]["parts"][1].__setitem__("alt", "Yurii Brusentsov"))),
    ("generated: source mock customer in a mock part", "GENERATED_MODE_CUSTOMER", m(G_PART, lambda s: node(s, "hero.partners-split")["content"]["scene"]["parts"][2].__setitem__("alt", "Northwind Studio"))),
    ("generated: source mock customer in copy", "GENERATED_MODE_CUSTOMER", m(G_MIGR, setp(["features.migration-explainer", "paragraphs"], ["Harbor Dental moved over in a week.", "Second original paragraph about the offer."]))),
    ("generated: source integration partner", "GENERATED_MODE_PARTNER", m(G_HOME, lambda s: node(s, "features.product-grid")["content"]["cards"][1].__setitem__("description", "Bank lines arrive through Plaid every morning."))),
    ("generated: source chat vendor", "GENERATED_MODE_PARTNER", m(G_MIGR, setp(["hero.migration-split", "subLines"], ["Ask us in Intercom chat.", "We credit the unused months."]))),
    # ---- generated mode: screenshots and media
    ("generated: product screenshot role", "GENERATED_MODE_ASSET", m(G_HOME, setp(["hero.home-dashboard", "media", "role"], "product-screenshot"))),
    ("generated: source screenshot file as ref", "GENERATED_MODE_ASSET_REF", m(G_HOME, setp(["hero.home-dashboard", "media", "ref"], "placeholder:hero-en-q75"))),
    ("generated: source .lottie animation role", "GENERATED_MODE_ASSET", m(G_HOME, lambda s: node(s, "features.product-grid")["content"]["cards"][0]["media"].__setitem__("role", "product-animation"))),
    ("generated: source .lottie file as ref", "GENERATED_MODE_ASSET_REF", m(G_HOME, lambda s: node(s, "features.product-grid")["content"]["cards"][0]["media"].__setitem__("ref", "placeholder:global-financial-ledger"))),
    ("generated: source planet art", "GENERATED_MODE_ASSET", m(G_HOME, setp(["hero.home-dashboard", "backgroundArt", "role"], "background-art"))),
    ("generated: source mock scene", "GENERATED_MODE_ASSET", m(G_MIGR, setp(["hero.migration-split", "scene", "role"], "illustration-mock"))),
    ("generated: recon screenshot as ref", "GENERATED_MODE_ASSET_REF", m(G_PART, setp(["hero.partners-split", "scene", "ref"], "placeholder:partners-1440-full"))),
    # ---- the real-content reference page, flipped to generated
    ("generated: real reference page reused as generated (brand)", "GENERATED_MODE_BRAND", REAL_AS_GENERATED),
    ("generated: real reference page reused as generated (copy)", "GENERATED_MODE_COPY", REAL_AS_GENERATED),
    ("generated: real reference page reused as generated (CTA)", "GENERATED_MODE_CTA", REAL_AS_GENERATED),
    ("generated: real reference page reused as generated (screenshot)", "GENERATED_MODE_ASSET", REAL_AS_GENERATED),
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


def asset_role_case():
    """GENERATED_MODE_ASSET_ROLE: the schema already limits each field's roles, so prove the per-section list by
    removing a role from a section's generatedAssetRoles in memory and running check_generated directly."""
    saved = V.SECTIONS["hero.home-dashboard"]
    V.SECTIONS["hero.home-dashboard"] = dict(saved, generatedAssetRoles=["generated-background-art"])
    try:
        out = []
        V.check_generated(G_HOME, lambda rid, msg: out.append(f"{rid}: {msg}"))
    finally:
        V.SECTIONS["hero.home-dashboard"] = saved
    rule = "GENERATED_MODE_ASSET_ROLE"
    return [x for x in out if x.startswith(rule + ":")]


def patched(target, key, value, fn):
    saved = copy.deepcopy(target[key])
    target[key] = value
    try:
        return fn()
    finally:
        target[key] = saved


def with_extra_role():
    V.ROLES["stock-photo"] = {"availability": "generation-safe"}
    try:
        return V.validate(G_HOME)[0]
    finally:
        V.ROLES.pop("stock-photo")


REGISTRY_CASES = [
    # (label, rule, callable returning the error list)
    ("pin: brand-mark availability loosened in the registry", "PINNED_AVAILABILITY",
     lambda: patched(V.ROLES, "brand-mark", dict(V.ROLES["brand-mark"], availability="generation-safe"), lambda: V.validate(G_HOME)[0])),
    ("pin: third-party-logo moved to reference-only", "PINNED_AVAILABILITY",
     lambda: patched(V.ROLES, "third-party-logo", dict(V.ROLES["third-party-logo"], availability="reference-only"), lambda: V.validate(G_HOME)[0])),
    ("pin: new unpinned generation-safe role in the registry", "PINNED_AVAILABILITY", lambda: with_extra_role()),
    ("pin: substitute that is not generation-safe", "PINNED_AVAILABILITY",
     lambda: patched(V.ROLES, "product-screenshot", dict(V.ROLES["product-screenshot"], generationSafeSubstitutes=["brand-mark"]), lambda: V.validate(G_HOME)[0])),
    ("retrieval: modal contract flipped eligible (PageSpec layer)", "RETRIEVAL_ELIGIBILITY",
     lambda: patched(V.SECTIONS, "forms.partner-popup", dict(V.SECTIONS["forms.partner-popup"], retrievalEligible=True), lambda: V.validate(PARTNERS)[0])),
    ("retrieval: modal contract flipped eligible (contract layer)", "RETRIEVAL_PINNED",
     lambda: V.validate_section_contract({k: v for k, v in V.SECTIONS["forms.partner-popup"].items() if k != "retrievalReason"} | {"retrievalEligible": True})),
    ("retrieval: content contract marked ineligible", "RETRIEVAL_PINNED",
     lambda: V.validate_section_contract(V.SECTIONS["features.product-grid"] | {"retrievalEligible": False, "retrievalReason": "Pretending this content section is runtime UI."})),
    ("retrieval: ineligible without a 30-char reason", "CONTRACT_SCHEMA",
     lambda: V.validate_section_contract(V.SECTIONS["forms.partner-popup"] | {"retrievalReason": "modal"})),
    ("retrieval: utility-looking contract not in the pin", "RETRIEVAL_PINNED",
     lambda: V.validate_section_contract(V.SECTIONS["support.faq-accordion"] | {"id": "support.cookie-banner", "semantic": {"id": "support.cookie-banner", "category": "SUPPORT"}})),
    ("contract: source.id equals semantic.id (closed provenance-id pattern)", "CONTRACT_SCHEMA",
     lambda: V.validate_section_contract(V.SECTIONS["hero.home-dashboard"] | {"source": dict(V.SECTIONS["hero.home-dashboard"]["source"], id="hero.home-dashboard")})),
    ("contract: semantic.category drifts from category", "SOURCE_SEMANTIC",
     lambda: V.validate_section_contract(V.SECTIONS["process.lottie-steps"] | {"semantic": {"id": "process.lottie-steps", "category": "FEATURES"}})),
    ("contract: source.id does not match file/tag/line", "SOURCE_SEMANTIC",
     lambda: V.validate_section_contract(V.SECTIONS["chrome.footer"] | {"source": dict(V.SECTIONS["chrome.footer"]["source"], lines="1-138")})),
    ("contract: extra field (closed contract schema)", "CONTRACT_SCHEMA",
     lambda: V.validate_section_contract(V.SECTIONS["chrome.footer"] | {"aiNotes": "free text"})),
    ("contract: generatedAssetRoles lists a reference-only role", "GENERATED_ROLES",
     lambda: V.validate_section_contract(V.SECTIONS["chrome.navbar"] | {"generatedAssetRoles": ["brand-mark", "placeholder-brand-mark"]})),
    ("contract: conversion form classed as content", "CLASS_POLICY",
     lambda: V.validate_section_contract(V.SECTIONS["forms.partner-popup"] | {"category": "CONTENT", "semantic": {"id": "forms.partner-popup", "category": "CONTENT"}})),
    ("contract: page-opening category on a non-hero section", "CLASS_POLICY",
     lambda: V.validate_section_contract(V.SECTIONS["features.product-grid"] | {"category": "HERO", "semantic": {"id": "features.product-grid", "category": "HERO"}})),
    ("contract: CTA inside FEATURES without a justification", "CLASS_POLICY",
     lambda: V.validate_section_contract({k: v for k, v in V.SECTIONS["features.showcase-reports"].items() if k != "inlineCtaJustification"})),
    ("contract: legal content classed FEATURES", "CLASS_POLICY",
     lambda: V.validate_section_contract(V.SECTIONS["content.legal-section"] | {"category": "FEATURES", "semantic": {"id": "content.legal-section", "category": "FEATURES"}})),
]


# ------------------------------------------------------------------ wrapper gate
GATE_INPUTS = WG.load_inputs(REPO)


def gate(mutate=None, whitelist=None):
    tpls, routes, contracts, heights, wl = copy.deepcopy(GATE_INPUTS)
    if mutate:
        mutate(heights)
    return WG.evaluate(tpls, routes, contracts, heights, wl if whitelist is None else whitelist)


def sec_of(h, route, sid):
    return next(s for s in h["routes"][route]["sections"] if s["section"] == sid)


def grow(route, sid, new):
    def fn(h):
        s = sec_of(h, route, sid)
        h["routes"][route]["pageHeight"] += new - s["heightPx"]
        s["heightPx"] = new
    return fn


def merge_legal(h):
    """Re-create the old whole-page content.legal-article on /terms (header + every part in one section)."""
    r = h["routes"]["/terms"]
    parts = [s for s in r["sections"] if s["section"] in ("content.legal-header", "content.legal-section")]
    total = sum(s["heightPx"] for s in parts)
    r["sections"] = [s for s in r["sections"] if s not in parts]
    r["sections"].insert(2, {"section": "content.legal-header", "heightPx": total, "position": "static", "inFlow": True})


def share_55(h):
    """/migration-offer: grow the conditions block until it holds ~55% of the page."""
    r = h["routes"]["/migration-offer"]
    s = sec_of(h, "/migration-offer", "features.migration-conditions")
    rest = r["pageHeight"] - s["heightPx"]
    new = round(rest * 0.55 / 0.45)
    r["pageHeight"] = rest + new
    s["heightPx"] = new


AGENT = "codex-like reviewer (agent attestation, not a human sign-off)"
WL_OK = [{"route": "/", "section": "hero.home-dashboard", "rules": ["HERO_HEIGHT_FAIL"], "maxHeightPx": 3200, "justification": "Probe entry: a reviewed tall hero that is still one composition.", "reviewedBy": AGENT, "attestation": "agent", "reviewedOn": "2026-10-29"}]
GATE_CASES = [
    # (label, expected code, severity 'error'|'warn', (errors, warnings, info))
    ("gate: HERO 1900px warns", "HERO_HEIGHT_WARN", "warn", lambda: gate(grow("/", "hero.home-dashboard", 1900))),
    ("gate: HERO 3100px fails", "HERO_HEIGHT_FAIL", "error", lambda: gate(grow("/", "hero.home-dashboard", 3100))),
    ("gate: HERO 3100px whitelisted still warns", "HERO_HEIGHT_FAIL_WHITELISTED", "warn", lambda: gate(grow("/", "hero.home-dashboard", 3100), WL_OK)),
    ("gate: whitelisted HERO over its cap fails", "HERO_HEIGHT_FAIL", "error", lambda: gate(grow("/", "hero.home-dashboard", 3300), WL_OK)),
    ("gate: whole-page legal article (majority share) fails", "SECTION_SHARE_FAIL", "error", lambda: gate(merge_legal)),
    ("gate: one section at ~55% warns", "SECTION_SHARE_WARN", "warn", lambda: gate(share_55)),
    ("gate: whitelist entry without justification", "WHITELIST_INVALID", "error", lambda: gate(grow("/", "hero.home-dashboard", 3100), [dict(WL_OK[0], justification="tall")])),
    ("gate: agent whitelist entry posing as human review", "WHITELIST_INVALID", "error", lambda: gate(grow("/", "hero.home-dashboard", 3100), [dict(WL_OK[0], reviewedBy="design lead")])),
    ("gate: stale whitelist entry", "WHITELIST_STALE", "error", lambda: gate(None, WL_OK)),
    ("gate: route measurement missing", "MEASUREMENT_MISSING", "error", lambda: gate(lambda h: h["routes"].pop("/pricing"))),
    ("gate: required node measurement missing", "MEASUREMENT_MISSING", "error", lambda: gate(lambda h: h["routes"]["/partners"]["sections"].__setitem__(slice(None), [s for s in h["routes"]["/partners"]["sections"] if s["section"] != "features.partner-audience"]))),
    ("gate: measured at the wrong viewport", "MEASUREMENT_VIEWPORT", "error", lambda: gate(lambda h: h["viewport"].__setitem__("width", 1280))),
    ("gate: heights do not add up to the page", "MEASUREMENT_INCONSISTENT", "error", lambda: gate(lambda h: sec_of(h, "/pricing", "commerce.compare-table").__setitem__("heightPx", 400))),
]


def main():
    fails = 0
    controls = [("example.pagespec.json [reference]", EXAMPLE)]
    controls += [(f"schema/examples generated {t}", s) for t, s in GEN_EXAMPLES.items()]
    controls += [("reference page with REAL source content", REAL_REF)]
    controls += [(f"control {t} {r} [{mode}]", ctl(t, r, mode)) for t in V.TEMPLATES for r in V.TEMPLATES[t]["routes"] for mode in ("reference", "generated")]
    for name, spec in controls:
        e, w = V.validate(spec)
        ok = not e and not w
        fails += not ok
        print(f"[{'PASS' if ok else 'FAIL'}] CONTROL {name}: {len(e)} errors, {len(w)} warnings" + ("" if ok else f" -> {e[:2]} {w[:2]}"))
    for sid, c in V.SECTIONS.items():
        f = V.validate_section_contract(c)
        fails += bool(f)
        if f:
            print(f"[FAIL] CONTROL contract {sid}: {f[:2]}")
    print(f"[{'PASS' if not fails else 'FAIL'}] CONTROL all {len(V.SECTIONS)} section contracts validate")
    e, w, info = gate()
    # Known, reviewed warnings: /subprocessors is an unspecced placeholder page whose only body is the document header
    # (intro + one table); it holds 51-52% of a short page. A warning, not a failure (R9); see README.
    unexpected = [(c, msg) for c, msg in w if not (c == "SECTION_SHARE_WARN" and msg.split(":")[0] in ("/subprocessors", "/ua/subprocessors"))]
    ok = not e and not unexpected
    fails += not ok
    print(f"[{'PASS' if ok else 'FAIL'}] CONTROL wrapper gate on the real measurements: {len(e)} errors, {len(w)} known warnings" + ("" if ok else f" -> {e[:2]} {unexpected[:2]}"))
    n_ctl = len(controls) + 2
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
    ar = asset_role_case()
    fails += not ar
    print(f"[{'PASS' if ar else 'FAIL'}] REJECT generated: role outside the section's generatedAssetRoles (direct call) -> GENERATED_MODE_ASSET_ROLE {ar[:1]}")
    for name, rule, fn in REGISTRY_CASES:
        e = fn()
        hit = [x for x in e if x.startswith(rule + ":")]
        fails += not hit
        print(f"[{'PASS' if hit else 'FAIL'}] REJECT {name} -> {rule}" + (f" ({hit[0][:110]})" if hit else f" NOT REJECTED; {e[:2]}"))
    for name, code, sev, fn in GATE_CASES:
        e, w, _ = fn()
        pool = e if sev == "error" else w
        hit = [msg for c, msg in pool if c == code]
        ok = bool(hit) and (sev == "error" or not e)
        fails += not ok
        print(f"[{'PASS' if ok else 'FAIL'}] GATE   {name} -> {code}" + (f" ({hit[0][:100]})" if hit else f" NOT RAISED; errors={e[:2]} warnings={w[:2]}"))
    total = n_ctl + len(MUTATIONS) + len(WARN_MUTATIONS) + 2 + len(REGISTRY_CASES) + len(GATE_CASES)
    print(f"\n{total - fails}/{total} checks passed ({n_ctl} controls, {len(MUTATIONS) + 1 + len(REGISTRY_CASES)} rejections, "
          f"{len(WARN_MUTATIONS) + 1} warnings, {len(GATE_CASES)} wrapper-gate cases)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

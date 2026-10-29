#!/usr/bin/env python3
"""Semantic validator for PageSpecs (and section contracts) of this design-repo.

Usage:  python3 schema/semantic_validate.py <pagespec.json> [...]
        python3 schema/semantic_validate.py --contracts          (validate every sections/*.json contract)
Exit 0 when there are no errors (warnings are printed but non-fatal), 1 otherwise.

PageSpec layers:
  1. JSON Schema draft-07 (schema/pagespec.schema.json), incl. the closed `mode` enum.
  2. Registry pins, independent of the JSON registries: PINNED_AVAILABILITY (asset-role availability) and
     RETRIEVAL_INELIGIBLE (runtime UI that a retrieval index must skip). The same pins live, as a second literal,
     in extraction/verify_all.py, so editing a registry (or this file) alone cannot loosen them.
  3. Rules from compatibility/graph.json - each graph rule id is implemented by the function of the same name
     registered in RULES below. extraction/verify_all.py fails if the graph's rule ids and RULES' keys ever differ.
  4. maxWords copy budgets (custom schema keyword, walked here).
  5. mode "generated" only: GENERATED_MODE_* rules (GENERATED_MODE_RULES; listed in graph.json
     `generatedModeRules`): no source brand / CTA / copy / URL / person / customer / partner, generation-safe asset
     roles only, the section's generatedAssetRoles only, no source media file. Patterns come from
     assets/asset-roles.json -> sourceBrand and assets/source-copy-hashes.json, both written by
     extraction/build_source_brand.py from the real source. Mode "reference" keeps layers 1-4 unchanged and accepts
     real brand, copy and reference-only roles (faithful reconstruction).

Section contracts: validate_section_contract() checks the closed meta schema (schema/section-contract.schema.json),
the pinned retrieval eligibility, provenance vs taxonomy (source vs semantic), generatedAssetRoles and category
honesty (CLASS_POLICY).

Detection is string-based (normalised text, regular expressions, hashed 5-word shingles; see schema/textnorm.py).
Paraphrase, translation or text inside an image is not detected. No human has reviewed the derived patterns.

The declared `template` is always cross-referenced against that template's real node list in
templates/templates.json (TEMPLATE_NODE_SEQUENCE) - nodes are never checked in isolation.
Repo root is derived from __file__; no absolute paths.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import textnorm as T  # noqa: E402


def _load(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8") as f:
        return json.load(f)


SCHEMA = _load("schema/pagespec.schema.json")
CONTRACT_SCHEMA = _load("schema/section-contract.schema.json")
TEMPLATES = _load("templates/templates.json")["templates"]
ROUTES = {r["path"]: r for r in _load("templates/routes.json")["routes"]}
GRAPH = _load("compatibility/graph.json")
GRAPH_RULES = {r["id"]: r for r in GRAPH["rules"]}
ASSETS = _load("assets/asset-roles.json")
ROLES = ASSETS["roles"]
SOURCE_BRAND = ASSETS["sourceBrand"]
SOURCE_HASHES = {k: set(v) for k, v in _load("assets/source-copy-hashes.json").items() if isinstance(v, list)}
SECTIONS = {}
for fn in sorted(os.listdir(os.path.join(REPO, "sections"))):
    if fn.endswith(".json"):
        s = _load("sections/" + fn)
        SECTIONS[s["id"]] = s

HERO_CATEGORY = "HERO"

# ---- pins (reviewed by the agent that built this revision: agent attestation, NOT a human sign-off) -------------
# Availability of every asset role. A role missing here, or a registry value that differs, is an error.
PINNED_AVAILABILITY = {
    "product-screenshot": "reference-only",
    "product-animation": "reference-only",
    "illustration-mock": "reference-only",
    "icon": "generation-safe",
    "icon-illustrated": "generation-safe",
    "background-art": "reference-only",
    "background-glow": "generation-safe",
    "brand-mark": "reference-only",
    "social-icon": "generation-safe",
    "flag": "generation-safe",
    "third-party-logo": "blocked-for-generation",
    "placeholder-brand-mark": "generation-safe",
    "generated-product-visual": "generation-safe",
    "generated-product-animation": "generation-safe",
    "generated-background-art": "generation-safe",
    "generated-mock-scene": "generation-safe",
    "fictional-avatar": "generation-safe",
    "generic-partner-placeholder": "generation-safe",
    "placeholder-url": "generation-safe",
    "original-copy": "generation-safe",
}
# Runtime/utility UI a retrieval index must skip. Every other section is retrieval-eligible.
RETRIEVAL_INELIGIBLE = {"forms.partner-popup"}
UTILITY_WORDS = ("cookie", "consent", "modal", "dialog", "drawer", "overlay", "popup", "toast", "preloader", "cursor", "ticker")
MIN_REASON = 30
CTA_FIELDS = {"ctaLabel", "ctaAction", "submitLabel"}
CTA_ALLOWED_CATEGORIES = {"HERO", "CONVERSION", "CHROME"}

GENERATED_MODE_RULES = {
    "GENERATED_MODE_BRAND": "source brand name / wordmark / domain label / legal entity in any text",
    "GENERATED_MODE_CTA": "a source CTA string reused verbatim (after normalisation)",
    "GENERATED_MODE_COPY": "a 5-word run of source copy (hashed shingles)",
    "GENERATED_MODE_URL": "a source domain, profile path, e-mail domain or form endpoint",
    "GENERATED_MODE_EXTERNAL_URL": "any http(s) URL or e-mail host that is not a reserved placeholder host",
    "GENERATED_MODE_PERSON": "a real person named by the source",
    "GENERATED_MODE_CUSTOMER": "a customer / client company the source depicts",
    "GENERATED_MODE_PARTNER": "an integration partner / vendor the source names",
    "GENERATED_MODE_ASSET": "an asset role that is reference-only or blocked-for-generation (source logo, screenshot, animation, art, mock, third-party logo)",
    "GENERATED_MODE_ASSET_ROLE": "a generation-safe role the section does not list in generatedAssetRoles",
    "GENERATED_MODE_ASSET_REF": "an asset ref whose slug names a source media file",
}
# Keys whose string values are the contract's own closed vocabulary, not rendered text.
STRUCTURAL_KEYS = {"type", "variant", "template", "theme", "mode", "role", "ctaAction", "ctaKind", "kind", "default", "pattern",
                   "reducedMotionFallback", "pageSpecVersion", "locale", "separator", "motion"}


def words(s):
    return len([t for t in re.split(r"\s+", s.strip()) if t])


def _resolve(frag):
    while isinstance(frag, dict) and "$ref" in frag:
        ref = frag["$ref"]
        assert ref.startswith("#/definitions/"), ref
        frag = SCHEMA["definitions"][ref[len("#/definitions/"):]]
    return frag


def _walk_words(frag, inst, path, errs):
    frag = _resolve(frag)
    if not isinstance(frag, dict):
        return
    if isinstance(inst, str) and "maxWords" in frag:
        n = words(inst)
        if n > frag["maxWords"]:
            errs.append(f"MAX_WORDS: {path} has {n} words (max {frag['maxWords']})")
    for key in ("oneOf", "anyOf", "allOf"):
        for sub in frag.get(key, []):
            _walk_words(sub, inst, path, errs)
    if isinstance(inst, dict):
        for k, v in inst.items():
            if k in frag.get("properties", {}):
                _walk_words(frag["properties"][k], v, f"{path}.{k}", errs)
    if isinstance(inst, list) and "items" in frag:
        for i, v in enumerate(inst):
            _walk_words(frag["items"], v, f"{path}[{i}]", errs)


def _strings(o):
    if isinstance(o, str):
        yield o
    elif isinstance(o, dict):
        for v in o.values():
            yield from _strings(v)
    elif isinstance(o, list):
        for v in o:
            yield from _strings(v)


def _types(spec):
    return [n.get("type") for n in spec.get("nodes", [])]


def _nodes_of(spec, sid):
    return [n for n in spec.get("nodes", []) if n.get("type") == sid]


def _repeatable(tpl, sid):
    return any(n["section"] == sid and n["repeatable"] for n in tpl["nodes"])


# ------------------------------------------------------------------ rules (ids == graph.json ids)
def TEMPLATE_NODE_SEQUENCE(spec, tpl, E, W):
    expected = [n["section"] for n in tpl["nodes"]]
    spec_nodes = _types(spec)
    allowed = set(expected)
    for t in spec_nodes:
        if t not in allowed:
            E(f"section '{t}' is not part of {tpl['id']} (allowed: {expected})")
    for n in tpl["nodes"]:
        c = spec_nodes.count(n["section"])
        if n["required"] and c == 0:
            E(f"required section '{n['section']}' of {tpl['id']} is missing")
        if not n["repeatable"] and c > 1:
            E(f"section '{n['section']}' is not repeatable in {tpl['id']} but appears {c} times")
    filtered = [t for t in spec_nodes if t in allowed]
    order = {s: i for i, s in enumerate(expected)}
    idx = [order[t] for t in filtered]
    if idx != sorted(idx):
        E(f"node order {filtered} contradicts {tpl['id']} order {expected}")


def DUPLICATE_SECTION_VARIANT(spec, tpl, E, W):
    seen = set()
    for n in spec.get("nodes", []):
        key = (n.get("type"), n.get("variant"))
        if key in seen and not _repeatable(tpl, n.get("type")):
            E(f"duplicate (section, variant) {key}")
        seen.add(key)


def NAV_FIRST(spec, tpl, E, W):
    t = _types(spec)
    if not t or t[0] != "chrome.navbar":
        E("chrome.navbar must be node 0")


def GRID_FRAME_SECOND(spec, tpl, E, W):
    t = _types(spec)
    if len(t) < 2 or t[1] != "chrome.grid-frame":
        E("chrome.grid-frame must be node 1")


def FOOTER_LAST(spec, tpl, E, W):
    t = _types(spec)
    if not t or t[-1] != "chrome.footer":
        E("chrome.footer must be the last node")


def ONE_HERO_PER_PAGE(spec, tpl, E, W):
    heroes = [t for t in _types(spec) if t in SECTIONS and SECTIONS[t]["category"] == HERO_CATEGORY]
    exempt = GRAPH_RULES["ONE_HERO_PER_PAGE"]["exceptions"]["templates"]
    if tpl["id"] in exempt:
        if heroes:
            E(f"{tpl['id']} is heroless but has hero node(s) {heroes}")
    elif len(heroes) != 1:
        E(f"expected exactly one hero, found {len(heroes)}: {heroes}")


def HERO_AFTER_FRAME(spec, tpl, E, W):
    t = _types(spec)
    if len(t) < 3:
        E("page too short to hold a hero slot")
        return
    if tpl["id"] in GRAPH_RULES["HERO_AFTER_FRAME"]["exceptions"]["templates"]:
        if t[2] != "content.legal-header":
            E("on heroless templates content.legal-header must follow chrome.grid-frame")
    elif t[2] not in SECTIONS or SECTIONS[t[2]]["category"] != HERO_CATEGORY:
        E(f"node 2 must be a hero, found '{t[2]}'")


def POPUP_BEFORE_FOOTER(spec, tpl, E, W):
    t = _types(spec)
    if "forms.partner-popup" in t:
        i = t.index("forms.partner-popup")
        if i + 1 >= len(t) or t[i + 1] != "chrome.footer":
            E("forms.partner-popup must be immediately before chrome.footer")


def POPUP_TRIGGER_PARITY(spec, tpl, E, W):
    triggers = [n.get("type") for n in spec.get("nodes", []) for s in _strings(n.get("content", {})) if s == "open-lead-form"]
    has_popup = "forms.partner-popup" in _types(spec)
    if triggers and not has_popup:
        E(f"ctaAction 'open-lead-form' used by {sorted(set(triggers))} but the page has no forms.partner-popup")
    if has_popup and not triggers:
        E("forms.partner-popup present but no node triggers it (ctaAction 'open-lead-form')")


def STATEMENT_REDUCED_MOTION_BY_TEMPLATE(spec, tpl, E, W):
    want = {"template.home": ("scrubbed-always", "scroll-driven-unchanged"),
            "template.partners": ("scrubbed-static-when-reduced", "progress-fixed-at-1")}
    for n in _nodes_of(spec, "narrative.scroll-statement"):
        if tpl["id"] in want:
            v, fb = want[tpl["id"]]
            got = (n.get("variant"), n.get("motion", {}).get("reducedMotionFallback"))
            if got != (v, fb):
                E(f"narrative.scroll-statement on {tpl['id']} must be variant '{v}' with fallback '{fb}', got {got}")


def LOTTIE_STEPS_ANCHOR_HOME_ONLY(spec, tpl, E, W):
    for n in _nodes_of(spec, "process.lottie-steps"):
        a = n.get("content", {}).get("anchorId")
        if tpl["id"] == "template.home" and not a:
            E("process.lottie-steps on template.home must carry an anchorId")
        if tpl["id"] != "template.home" and a is not None:
            E(f"process.lottie-steps anchorId must be null outside template.home (got '{a}')")


def PRICING_ONE_RECOMMENDED(spec, tpl, E, W):
    for n in _nodes_of(spec, "hero.pricing-plans"):
        plans = n.get("content", {}).get("plans", [])
        rec = [p for p in plans if p.get("recommended")]
        if len(rec) != 1:
            E(f"hero.pricing-plans needs exactly one recommended plan, found {len(rec)}")
        for p in rec:
            if not p.get("recommendedLabel"):
                E("recommended plan needs a recommendedLabel")


def UNIQUE_ANCHOR_IDS(spec, tpl, E, W):
    seen = {}
    for n in spec.get("nodes", []):
        a = n.get("content", {}).get("anchorId") if isinstance(n.get("content"), dict) else None
        if a:
            if a in seen:
                E(f"anchorId '{a}' used by both {seen[a]} and {n.get('type')}")
            seen[a] = n.get("type")


def ROUTE_TEMPLATE_BINDING(spec, tpl, E, W):
    r = ROUTES.get(spec.get("route"))
    if r and (r["template"] != spec.get("template") or r["locale"] != spec.get("locale")):
        E(f"route {r['path']} is bound to {r['template']}/{r['locale']}, spec says {spec.get('template')}/{spec.get('locale')}")


def LOCALE_ROUTE_PREFIX(spec, tpl, E, W):
    route, loc = spec.get("route", ""), spec.get("locale")
    if route == "/ru" or route.startswith("/ru/"):
        E("/ru routes are out of scope")
    is_uk = route == "/ua" or route.startswith("/ua/")
    if is_uk != (loc == "uk"):
        E(f"locale '{loc}' does not match route prefix of '{route}'")


def TEMPLATE_LOCALE(spec, tpl, E, W):
    if spec.get("locale") not in tpl["locales"]:
        E(f"{tpl['id']} supports locales {tpl['locales']}, not '{spec.get('locale')}'")


def MAX_WORDS(spec, tpl, E, W):
    errs = []
    _walk_words(SCHEMA["properties"]["meta"], spec.get("meta", {}), "meta", errs)
    for i, n in enumerate(spec.get("nodes", [])):
        d = "content." + str(n.get("type"))
        if d in SCHEMA["definitions"]:
            _walk_words(SCHEMA["definitions"][d], n.get("content"), f"nodes[{i}]({n.get('type')}).content", errs)
    for e in errs:
        E(e.split(": ", 1)[1])


def RETRIEVAL_ELIGIBILITY(spec, tpl, E, W):
    for i, n in enumerate(spec.get("nodes", [])):
        t = n.get("type")
        want = t not in RETRIEVAL_INELIGIBLE
        if "retrievalEligible" in n and n["retrievalEligible"] is not want:
            E(f"nodes[{i}]({t}).retrievalEligible is {n['retrievalEligible']} but {t} is pinned to {want}")
        if t in SECTIONS and SECTIONS[t].get("retrievalEligible") is not want:
            E(f"sections/{t}.json retrievalEligible is {SECTIONS[t].get('retrievalEligible')} but the pin (RETRIEVAL_INELIGIBLE) says {want}")


def NO_ADJACENT_SAME_CATEGORY(spec, tpl, E, W):
    ok = [tuple(p) for p in GRAPH_RULES["NO_ADJACENT_SAME_CATEGORY"]["exceptions"]["pairs"]]
    t = [x for x in _types(spec) if x in SECTIONS]
    for a, b in zip(t, t[1:]):
        if SECTIONS[a]["category"] == SECTIONS[b]["category"] and (a, b) not in ok:
            W(f"adjacent same-category sections {a} -> {b}")


def PROCESS_CLOSES_CONTENT(spec, tpl, E, W):
    t = [x for x in _types(spec) if x in SECTIONS]
    for i, x in enumerate(t):
        if SECTIONS[x]["category"] == "PROCESS":
            after = [y for y in t[i + 1:] if y not in ("forms.partner-popup", "chrome.footer")]
            if after:
                W(f"{x} is followed by content sections {after}")


def MOTION_BUDGET_AUTO_ADVANCE(spec, tpl, E, W):
    ex = GRAPH_RULES["MOTION_BUDGET_AUTO_ADVANCE"]["exceptions"]
    n = sum(1 for x in _types(spec) if x in ex["autoAdvancingSections"])
    if n > ex["max"]:
        W(f"{n} auto-advancing sections (max {ex['max']})")


RULES = {f.__name__: f for f in [
    TEMPLATE_NODE_SEQUENCE, DUPLICATE_SECTION_VARIANT, NAV_FIRST, GRID_FRAME_SECOND, FOOTER_LAST, ONE_HERO_PER_PAGE,
    HERO_AFTER_FRAME, POPUP_BEFORE_FOOTER, POPUP_TRIGGER_PARITY, STATEMENT_REDUCED_MOTION_BY_TEMPLATE,
    LOTTIE_STEPS_ANCHOR_HOME_ONLY, PRICING_ONE_RECOMMENDED, UNIQUE_ANCHOR_IDS, ROUTE_TEMPLATE_BINDING,
    LOCALE_ROUTE_PREFIX, TEMPLATE_LOCALE, MAX_WORDS, RETRIEVAL_ELIGIBILITY, NO_ADJACENT_SAME_CATEGORY,
    PROCESS_CLOSES_CONTENT, MOTION_BUDGET_AUTO_ADVANCE]}


# ------------------------------------------------------------------ registry pins
def check_pins(errors):
    for role, want in PINNED_AVAILABILITY.items():
        got = ROLES.get(role, {}).get("availability")
        if got != want:
            errors.append(f"PINNED_AVAILABILITY: asset role {role} must be '{want}' but assets/asset-roles.json says {got!r}")
    for role, spec in ROLES.items():
        if role not in PINNED_AVAILABILITY:
            errors.append(f"PINNED_AVAILABILITY: asset role {role} ({spec.get('availability')}) has no pin; add it to PINNED_AVAILABILITY here and in extraction/verify_all.py after review")
        elif spec.get("availability") != "generation-safe":
            subs = spec.get("generationSafeSubstitutes") or []
            if not subs or any(PINNED_AVAILABILITY.get(x) != "generation-safe" for x in subs):
                errors.append(f"PINNED_AVAILABILITY: {role} is {spec.get('availability')} and needs generationSafeSubstitutes that are all generation-safe (got {subs})")


# ------------------------------------------------------------------ mode "generated"
def _compile(pats):
    return re.compile("|".join(f"(?:{p})" for p in pats)) if pats else None


SB = SOURCE_BRAND
RX = {
    "GENERATED_MODE_BRAND": _compile(SB["brand"]["patterns"]),
    "GENERATED_MODE_URL": _compile(SB["urls"]["hostPatterns"] + SB["urls"]["pathPatterns"] + SB["urls"]["endpointPatterns"]),
    "GENERATED_MODE_PERSON": _compile(SB["people"]["patterns"]),
    "GENERATED_MODE_CUSTOMER": _compile(SB["customers"]["patterns"]),
    "GENERATED_MODE_PARTNER": _compile(SB["partners"]["patterns"]),
}
URL_HOST = re.compile(r"(?:https?://|mailto:[^\s@]*@|[\w.+-]+@)([a-z0-9-]+(?:\.[a-z0-9-]+)+)", re.I)
RESERVED = tuple(SB["urls"]["reservedHostSuffixes"])


def text_leaves(x, path="", skip=STRUCTURAL_KEYS):
    """Every human-readable string of a PageSpec subtree as (path, text); structural vocabulary keys are skipped."""
    if isinstance(x, dict):
        for k, v in x.items():
            if k in skip:
                continue
            yield from text_leaves(v, f"{path}.{k}" if path else k, skip)
    elif isinstance(x, list):
        for i, v in enumerate(x):
            yield from text_leaves(v, f"{path}[{i}]", skip)
    elif isinstance(x, str):
        yield path, x


def _asset_objs(x, path):
    if isinstance(x, dict):
        if {"role", "ref", "alt"} <= set(x):
            yield path, x
        for k, v in x.items():
            yield from _asset_objs(v, f"{path}.{k}")
    elif isinstance(x, list):
        for i, v in enumerate(x):
            yield from _asset_objs(v, f"{path}[{i}]")


def check_generated(spec, E):
    """GENERATED_MODE_*: a generated page is a different brand and must carry nothing that identifies or reproduces the source."""
    n_sh = SB["copy"]["shingleWords"]
    for path, raw in text_leaves(spec):
        folded = T.fold(raw)
        sq = T.squash(raw)
        hit = RX["GENERATED_MODE_BRAND"].search(folded) or next((t for t in SB["brand"]["squashedTokens"] if t in sq), None)
        if hit:
            E("GENERATED_MODE_BRAND", f"{path}: {raw[:70]!r} names the source brand ({hit.group(0) if hasattr(hit, 'group') else hit!r})")
        for rule in ("GENERATED_MODE_URL", "GENERATED_MODE_PERSON", "GENERATED_MODE_CUSTOMER", "GENERATED_MODE_PARTNER"):
            m = RX[rule].search(folded) if RX[rule] else None
            if m:
                E(rule, f"{path}: {raw[:70]!r} contains {m.group(0)!r} ({GENERATED_MODE_RULES[rule]})")
        for host in URL_HOST.findall(folded):
            host = host.lower().rstrip(".")
            if not (host.endswith(RESERVED) or host in {r.lstrip(".") for r in RESERVED}):
                E("GENERATED_MODE_EXTERNAL_URL", f"{path}: host {host!r} is not a reserved placeholder host ({', '.join(RESERVED)})")
        if T.h16(T.norm(raw).casefold()) in SOURCE_HASHES["ctaStrings"]:
            E("GENERATED_MODE_CTA", f"{path}: {raw!r} is a source CTA string; write an original call to action")
        w = T.words(re.sub(r"[-_/:#.]+", " ", raw) if re.fullmatch(r"[\w/#.:-]+", raw) else raw)
        for i in range(len(w) - n_sh + 1):
            run = " ".join(w[i:i + n_sh])
            if T.h16(run) in SOURCE_HASHES["copyShingles"]:
                E("GENERATED_MODE_COPY", f"{path}: reproduces source copy (5-word run {run!r}); write original copy")
                break
    for i, n in enumerate(spec.get("nodes", [])):
        sec = SECTIONS.get(n.get("type"), {})
        allowed = set(sec.get("generatedAssetRoles", []))
        for path, a in _asset_objs(n.get("content", {}), f"nodes[{i}]({n.get('type')}).content"):
            role, ref = a.get("role"), a.get("ref")
            spec_r = ROLES.get(role)
            if spec_r is not None and spec_r.get("availability") != "generation-safe":
                E("GENERATED_MODE_ASSET", f"{path}: role {role!r} is {spec_r.get('availability')} (source logo / screenshot / media); use {spec_r.get('generationSafeSubstitutes')}")
            elif role not in allowed:
                E("GENERATED_MODE_ASSET_ROLE", f"{path}: role {role!r} is not in {n.get('type')} generatedAssetRoles {sorted(allowed)}")
            if isinstance(ref, str):
                stem = ref.split(":", 1)[-1].rsplit("/", 1)[-1].lower()
                stem = re.sub(r"\.[a-z0-9]{2,5}$", "", stem)
                if T.h16(stem) in SOURCE_HASHES["assetStems"]:
                    E("GENERATED_MODE_ASSET_REF", f"{path}: ref {ref!r} names a source media file (screenshot / media reuse)")


# ------------------------------------------------------------------ section contracts
def _prop_names(x, out):
    if isinstance(x, dict):
        for k, v in x.items():
            if k == "properties" and isinstance(v, dict):
                out.update(v)
            _prop_names(v, out)
    elif isinstance(x, list):
        for v in x:
            _prop_names(v, out)
    return out


def _role_enums(x, out):
    if isinstance(x, dict):
        if set(x.get("properties", {})) >= {"role", "ref", "alt"}:
            out.update(x["properties"]["role"]["enum"])
        for v in x.values():
            _role_enums(v, out)
    elif isinstance(x, list):
        for v in x:
            _role_enums(v, out)
    return out


def validate_section_contract(c):
    """Findings for ONE section contract: list of 'RULE: message' strings (all errors)."""
    from jsonschema import Draft7Validator
    out = []
    sid = c.get("id", "?")
    for e in sorted(Draft7Validator(CONTRACT_SCHEMA).iter_errors(c), key=lambda e: [str(p) for p in e.absolute_path]):
        out.append(f"CONTRACT_SCHEMA: {sid}: {'/'.join(map(str, e.absolute_path)) or '<root>'}: {e.message[:160]}")
    if out:
        return out
    # retrieval eligibility: pinned per section, independent of the flag the contract carries
    want = sid not in RETRIEVAL_INELIGIBLE
    if c["retrievalEligible"] is not want:
        out.append(f"RETRIEVAL_PINNED: {sid}: retrievalEligible is {c['retrievalEligible']} but the pin says {want} (RETRIEVAL_INELIGIBLE = {sorted(RETRIEVAL_INELIGIBLE)})")
    looks_utility = any(w in sid for w in UTILITY_WORDS) or c.get("constraints", {}).get("overlay") is True
    if looks_utility and sid not in RETRIEVAL_INELIGIBLE:
        out.append(f"RETRIEVAL_PINNED: {sid} looks like runtime/utility UI (id or overlay constraint) but is not in RETRIEVAL_INELIGIBLE")
    if c["retrievalEligible"] is False and len(c.get("retrievalReason") or "") < MIN_REASON:
        out.append(f"RETRIEVAL_PINNED: {sid}: retrievalEligible false needs a retrievalReason of {MIN_REASON}+ characters")
    if c["retrievalEligible"] is True and "retrievalReason" in c:
        out.append(f"RETRIEVAL_PINNED: {sid}: retrievalReason is only for ineligible sections")
    # provenance (source) vs taxonomy (semantic)
    sem, src = c["semantic"], c["source"]
    if sem["id"] != sid:
        out.append(f"SOURCE_SEMANTIC: {sid}: semantic.id {sem['id']!r} must equal the contract id")
    if sem["category"] != c["category"]:
        out.append(f"SOURCE_SEMANTIC: {sid}: semantic.category {sem['category']!r} != category {c['category']!r}")
    if src["id"] == sem["id"] or not src["id"].startswith("src."):
        out.append(f"SOURCE_SEMANTIC: {sid}: source.id {src['id']!r} must be a provenance id ('src.<file>.<tag>@L<line>'), never the semantic id")
    want_sid = "src.%s.%s@L%s" % (src["file"].rsplit(".", 1)[0].split("/", 1)[-1].replace("/", "."), src["tag"], src["lines"].split("-")[0])
    if src["id"] != want_sid:
        out.append(f"SOURCE_SEMANTIC: {sid}: source.id {src['id']!r} does not match its file/tag/line ({want_sid!r})")
    if src["file"] not in c["implementedBy"]:
        out.append(f"SOURCE_SEMANTIC: {sid}: source.file {src['file']} is not named in implementedBy")
    # generated-mode asset roles: exactly the generation-safe roles the content schema offers
    offered = _role_enums(c["contentSchema"], set())
    derived = sorted(r for r in offered if PINNED_AVAILABILITY.get(r) == "generation-safe")
    if sorted(c["generatedAssetRoles"]) != derived:
        out.append(f"GENERATED_ROLES: {sid}: generatedAssetRoles {sorted(c['generatedAssetRoles'])} != generation-safe roles of its content schema {derived}")
    for r in offered - set(ROLES):
        out.append(f"GENERATED_ROLES: {sid}: content schema uses unknown role {r!r}")
    # category honesty
    prefix, cat = sid.split(".", 1)[0], c["category"]
    if (prefix == "hero") != (cat == "HERO"):
        out.append(f"CLASS_POLICY: {sid}: HERO category is exactly the hero.* page-opening sections (got {cat})")
    if prefix == "forms" and cat != "CONVERSION":
        out.append(f"CLASS_POLICY: {sid}: lead-capture forms are conversion blocks (CONVERSION), got {cat}")
    if cat == "CONVERSION" and prefix not in ("forms", "cta"):
        out.append(f"CLASS_POLICY: {sid}: CONVERSION is for forms.* / cta.* blocks")
    if cat == "FEATURES" and prefix in ("content", "news", "blog", "editorial"):
        out.append(f"CLASS_POLICY: {sid}: editorial/legal content must not be classed FEATURES")
    ctas = sorted(_prop_names(c["contentSchema"], set()) & CTA_FIELDS)
    if ctas and cat not in CTA_ALLOWED_CATEGORIES and len(c.get("inlineCtaJustification") or "") < MIN_REASON:
        out.append(f"CLASS_POLICY: {sid}: CTA field(s) {ctas} in a {cat} section; class it as a conversion block or give an inlineCtaJustification of {MIN_REASON}+ characters")
    return out


# ------------------------------------------------------------------ entry point
def validate(spec):
    """Return (errors, warnings) - lists of strings prefixed with the rule id."""
    errors, warnings = [], []
    try:
        from jsonschema import Draft7Validator
    except ImportError:  # pragma: no cover
        return (["SCHEMA: python package 'jsonschema' is required (pip install jsonschema)"], [])
    for e in sorted(Draft7Validator(SCHEMA).iter_errors(spec), key=lambda e: list(map(str, e.absolute_path))):
        errors.append(f"SCHEMA: {'/'.join(map(str, e.absolute_path)) or '<root>'}: {e.message[:200]}")
    check_pins(errors)
    tpl = TEMPLATES.get(spec.get("template")) if isinstance(spec, dict) else None
    if tpl is None:
        errors.append(f"TEMPLATE_NODE_SEQUENCE: unknown template {spec.get('template') if isinstance(spec, dict) else None!r}")
        return errors, warnings
    for rid, fn in RULES.items():
        sev = GRAPH_RULES[rid]["severity"]
        sink_e = (lambda m, rid=rid: errors.append(f"{rid}: {m}"))
        sink_w = (lambda m, rid=rid: warnings.append(f"{rid}: {m}"))
        try:
            fn(spec, tpl, sink_e if sev == "error" else sink_w, sink_w)
        except Exception as ex:  # malformed specs must fail loudly, not crash
            errors.append(f"{rid}: could not evaluate ({type(ex).__name__}: {ex})")
    if spec.get("mode") == "generated":
        try:
            check_generated(spec, lambda rid, m: errors.append(f"{rid}: {m}"))
        except Exception as ex:
            errors.append(f"GENERATED_MODE_BRAND: could not evaluate ({type(ex).__name__}: {ex})")
    return errors, warnings


# ------------------------------------------------------------------ control builder (used by tests/verify)
def _merge(a, b):
    out = json.loads(json.dumps(a))
    for k, v in b.items():
        out[k] = _merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out


def _to_generation_safe(x):
    """Swap every reference-only/blocked role for its first generation-safe substitute (same field enum)."""
    if isinstance(x, dict):
        if {"role", "ref", "alt"} <= set(x) and ROLES.get(x["role"], {}).get("availability") != "generation-safe":
            x["role"] = ROLES[x["role"]]["generationSafeSubstitutes"][0]
        for v in x.values():
            _to_generation_safe(v)
    elif isinstance(x, list):
        for v in x:
            _to_generation_safe(v)
    return x


def build_control(template_id, route=None, mode="reference"):
    """A minimal valid PageSpec for any template, synthesized from each section's own
    placeholder example (+ per-template overrides). Covers new templates automatically.
    mode='generated' swaps reference-only roles for their generation-safe substitutes."""
    tpl = TEMPLATES[template_id]
    route = route or tpl["routes"][0]
    nodes = []
    for tn in tpl["nodes"]:
        s = SECTIONS[tn["section"]]
        over = s.get("exampleByTemplate", {}).get(template_id, {})
        pat = next(iter(s["motion"]["patterns"]))
        n = {"type": s["id"]}
        var = over.get("variant") or (s["variants"][0] if s["variants"] else None)
        if var:
            n["variant"] = var
        n["content"] = _merge(s["example"], over.get("content", {}))
        n["motion"] = over.get("motion") or {"pattern": pat, "reducedMotionFallback": s["motion"]["patterns"][pat]["allowedFallbacks"][0]}
        nodes.append(n)
    loc = ROUTES[route]["locale"] if route in ROUTES else "en"
    spec = {"pageSpecVersion": SCHEMA["properties"]["pageSpecVersion"]["const"], "mode": mode,
            "id": "control-" + template_id.split(".", 1)[1], "template": template_id,
            "route": route if route != "/*" else "/missing-page", "locale": loc, "theme": "dark",
            "meta": {"title": "Placeholder page title", "description": "Placeholder description for a control page."}, "nodes": nodes}
    return _to_generation_safe(spec) if mode == "generated" else spec


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    bad = 0
    if argv[1] == "--contracts":
        for sid, c in SECTIONS.items():
            f = validate_section_contract(c)
            for m in f:
                print(f"ERROR {m}")
            bad += bool(f)
        print(f"{len(SECTIONS)} section contracts, {bad} with errors")
        return 1 if bad else 0
    for p in argv[1:]:
        with open(p, encoding="utf-8") as f:
            spec = json.load(f)
        errs, warns = validate(spec)
        for m in errs:
            print(f"ERROR {os.path.basename(p)}: {m}")
        for m in warns:
            print(f"WARN  {os.path.basename(p)}: {m}")
        print(f"{os.path.basename(p)} [{spec.get('mode')}]: {len(errs)} error(s), {len(warns)} warning(s)")
        bad += bool(errs)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

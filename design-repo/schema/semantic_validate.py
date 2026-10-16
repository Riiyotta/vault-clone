#!/usr/bin/env python3
"""Semantic validator for PageSpecs of this design-repo.

Usage:  python3 schema/semantic_validate.py <pagespec.json> [...]
Exit 0 when there are no errors (warnings are printed but non-fatal), 1 otherwise.

Layers:
  1. JSON Schema draft-07 (schema/pagespec.schema.json).
  2. Rules from compatibility/graph.json - each graph rule id is implemented by the
     function of the same name registered in RULES below. extraction/verify_all.py
     fails if the graph's rule ids and RULES' keys ever differ.
  3. maxWords copy budgets (custom schema keyword, walked here).

The declared `template` is always cross-referenced against that template's real node
list in templates/templates.json (TEMPLATE_NODE_SEQUENCE) - nodes are never checked in
isolation.  Repo root is derived from __file__; no absolute paths.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)


def _load(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8") as f:
        return json.load(f)


SCHEMA = _load("schema/pagespec.schema.json")
TEMPLATES = _load("templates/templates.json")["templates"]
ROUTES = {r["path"]: r for r in _load("templates/routes.json")["routes"]}
GRAPH = _load("compatibility/graph.json")
GRAPH_RULES = {r["id"]: r for r in GRAPH["rules"]}
SECTIONS = {}
for fn in sorted(os.listdir(os.path.join(REPO, "sections"))):
    if fn.endswith(".json"):
        s = _load("sections/" + fn)
        SECTIONS[s["id"]] = s

# Source-brand denylist: the design-repo ships the design system only, never the source's copy.
BRAND_PATTERNS = [r"usevault", r"\bvault\s*ai\b", r"overcode", r"app\.usevault"]
HERO_CATEGORY = "HERO"


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
        if key in seen:
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
        if t[2] != "content.legal-article":
            E("on heroless templates content.legal-article must follow chrome.grid-frame")
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


def BRAND_DENYLIST(spec, tpl, E, W):
    for s in _strings(spec):
        for pat in BRAND_PATTERNS:
            if re.search(pat, s, re.I):
                E(f"source-brand reference '{s[:60]}' (pattern {pat})")


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
    LOCALE_ROUTE_PREFIX, TEMPLATE_LOCALE, MAX_WORDS, BRAND_DENYLIST, NO_ADJACENT_SAME_CATEGORY,
    PROCESS_CLOSES_CONTENT, MOTION_BUDGET_AUTO_ADVANCE]}


def validate(spec):
    """Return (errors, warnings) - lists of strings prefixed with the rule id."""
    errors, warnings = [], []
    try:
        from jsonschema import Draft7Validator
    except ImportError:  # pragma: no cover
        return (["SCHEMA: python package 'jsonschema' is required (pip install jsonschema)"], [])
    for e in sorted(Draft7Validator(SCHEMA).iter_errors(spec), key=lambda e: list(e.absolute_path)):
        errors.append(f"SCHEMA: {'/'.join(map(str, e.absolute_path)) or '<root>'}: {e.message[:200]}")
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
    return errors, warnings


# ------------------------------------------------------------------ control builder (used by tests/verify)
def _merge(a, b):
    out = json.loads(json.dumps(a))
    for k, v in b.items():
        out[k] = _merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out


def build_control(template_id, route=None):
    """A minimal valid PageSpec for any template, synthesized from each section's own
    placeholder example (+ per-template overrides). Covers new templates automatically."""
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
    return {"pageSpecVersion": "1.0.0", "id": "control-" + template_id.split(".", 1)[1], "template": template_id,
            "route": route if route != "/*" else "/missing-page", "locale": loc, "theme": "dark",
            "meta": {"title": "Placeholder page title", "description": "Placeholder description for a control page."}, "nodes": nodes}


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    bad = 0
    for p in argv[1:]:
        with open(p, encoding="utf-8") as f:
            spec = json.load(f)
        errs, warns = validate(spec)
        for m in errs:
            print(f"ERROR {os.path.basename(p)}: {m}")
        for m in warns:
            print(f"WARN  {os.path.basename(p)}: {m}")
        print(f"{os.path.basename(p)}: {len(errs)} error(s), {len(warns)} warning(s)")
        bad += bool(errs)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

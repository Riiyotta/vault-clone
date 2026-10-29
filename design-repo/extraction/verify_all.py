#!/usr/bin/env python3
"""Repository-wide consistency checks for this design-repo.

Usage:  python3 extraction/verify_all.py [--source-root PATH]

--source-root defaults to the parent directory of design-repo/ (where the clone lives at
build time). External citation checks run against it when the cited files exist there and
degrade to WARNINGS when they do not (e.g. the folder was unzipped on its own).
Every other check is internal and always fatal. Exit 1 on any error.

Each check below is proven to catch drift by extraction/prove_drift.py, which copies this
repo to a scratch directory, injects one defect per check/pin/gate, and asserts this script fails.

Pins live here as INDEPENDENT literals (PINNED_AVAILABILITY, RETRIEVAL_INELIGIBLE_PIN, the wrapper-gate thresholds,
the source-brand minimum), so editing a registry or schema/semantic_validate.py alone cannot loosen them.
"""
import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, "schema"))

ERRORS, WARNINGS, PASSED = [], [], []
FORBIDDEN_EXT = {".woff", ".woff2", ".ttf", ".otf", ".lottie", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".webm", ".avif", ".svg", ".zip"}
ABS_PATTERNS = ["/" + "Users/", "/" + "home/", "C:" + "\\\\", "/" + "private/" + "tmp", "/" + "var/folders"]


def load(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8") as f:
        return json.load(f)


def check(name):
    def deco(fn):
        def run():
            before = len(ERRORS)
            try:
                fn()
            except Exception as ex:  # a crash is a failure, never a pass
                ERRORS.append(f"[{name}] crashed: {type(ex).__name__}: {ex}")
            if len(ERRORS) == before:
                PASSED.append(name)
        run.__name__ = name
        CHECKS.append(run)
        return fn
    return deco


CHECKS = []


def err(name, msg):
    ERRORS.append(f"[{name}] {msg}")


def json_files():
    for dp, _, fs in os.walk(REPO):
        for f in fs:
            if f.endswith(".json"):
                yield os.path.relpath(os.path.join(dp, f), REPO)


@check("json-parse")
def _():
    for rel in json_files():
        try:
            load(rel)
        except Exception as ex:
            err("json-parse", f"{rel}: {ex}")


@check("schema-draft07")
def _():
    from jsonschema import Draft7Validator
    schema = load("schema/pagespec.schema.json")
    Draft7Validator.check_schema(schema)
    Draft7Validator.check_schema(load("schema/section-contract.schema.json"))
    for rel in example_files():
        for e in Draft7Validator(schema).iter_errors(load(rel)):
            err("schema-draft07", f"{rel}: {'/'.join(map(str, e.absolute_path))}: {e.message[:160]}")


def example_files():
    out = ["schema/example.pagespec.json"]
    d = os.path.join(REPO, "schema", "examples")
    if os.path.isdir(d):
        out += ["schema/examples/" + f for f in sorted(os.listdir(d)) if f.endswith(".pagespec.json")]
    return out


@check("semantic-example")
def _():
    import semantic_validate as V
    gen_tpl = set()
    for rel in example_files():
        spec = load(rel)
        e, w = V.validate(spec)
        for x in e + w:
            err("semantic-example", f"{rel}: {x}")
        if spec.get("mode") == "generated":
            gen_tpl.add(spec.get("template"))
            if not os.path.basename(rel).startswith("generated."):
                err("semantic-example", f"{rel}: generated examples are named generated.<template>.pagespec.json")
    if load("schema/example.pagespec.json").get("mode") != "reference":
        err("semantic-example", "schema/example.pagespec.json must stay the mode 'reference' example")
    for t in sorted(set(V.TEMPLATES) - gen_tpl):
        err("semantic-example", f"no generation-safe (mode generated) example for {t} in schema/examples/")


@check("allowlist-parity")
def _():
    allow = load("tokens/llm/component-allowlist.json")
    for kind, folder in (("sections", "sections"), ("primitives", "primitives"), ("components", "components")):
        listed = allow[kind]
        on_disk = {}
        for f in sorted(os.listdir(os.path.join(REPO, folder))):
            if f.endswith(".json"):
                on_disk[load(f"{folder}/{f}")["id"]] = f"{folder}/{f}"
        for i, path in listed.items():
            if not os.path.isfile(os.path.join(REPO, path)):
                err("allowlist-parity", f"phantom {kind} entry '{i}' -> {path} (no such file)")
            elif load(path).get("id") != i:
                err("allowlist-parity", f"{path} declares id '{load(path).get('id')}', allowlist says '{i}'")
        for i, path in on_disk.items():
            if i not in listed:
                err("allowlist-parity", f"orphan {kind} contract '{i}' ({path}) has no allowlist entry")
    schema = load("schema/pagespec.schema.json")
    node_props = sorted(schema["definitions"]["node"]["properties"].keys())
    if sorted(allow["nodeProperties"]) != node_props:
        err("allowlist-parity", f"nodeProperties {allow['nodeProperties']} != schema node properties {node_props}")


@check("allowlist-version")
def _():
    man, allow = load("registry.manifest.json"), load("tokens/llm/component-allowlist.json")
    if man["allowlistVersion"] != allow["version"]:
        err("allowlist-version", f"manifest allowlistVersion {man['allowlistVersion']} != allowlist version {allow['version']}")


def token_leaves(tree, prefix=""):
    for k, v in tree.items():
        if k.startswith("$"):
            continue
        if isinstance(v, dict) and "$value" in v:
            yield prefix + k, v
        elif isinstance(v, dict):
            yield from token_leaves(v, prefix + k + ".")


def all_tokens():
    out = {}
    for d in ("tokens/00-foundation", "tokens/30-layout"):
        for f in sorted(os.listdir(os.path.join(REPO, d))):
            if f.endswith(".json"):
                out.update(dict(token_leaves(load(f"{d}/{f}"))))
    sem = dict(token_leaves(load("tokens/10-semantic/semantic.json")["semantic"]))
    comp = {"component." + k: v for k, v in token_leaves(load("tokens/20-component/component.json")["component"])}
    loc = {"locale." + k: v for k, v in token_leaves(load("tokens/10-semantic/locale.json")["locale"])}
    return out, sem, comp, loc


@check("manifest-counts")
def _():
    man = load("registry.manifest.json")
    f, s, c, l = all_tokens()
    tpl = load("templates/templates.json")["templates"]
    actual = {"tokens": len(f) + len(s) + len(c) + len(l), "tokensFoundation": len(f), "tokensSemantic": len(s), "tokensComponent": len(c), "tokensLocale": len(l),
              "primitives": len([x for x in os.listdir(os.path.join(REPO, "primitives")) if x.endswith(".json")]),
              "components": len([x for x in os.listdir(os.path.join(REPO, "components")) if x.endswith(".json")]),
              "sections": len([x for x in os.listdir(os.path.join(REPO, "sections")) if x.endswith(".json")]),
              "templates": len(tpl), "routes": len(load("templates/routes.json")["routes"]),
              "assetRoles": len(load("assets/asset-roles.json")["roles"]), "graphRules": len(load("compatibility/graph.json")["rules"]),
              "citations": len(load("extraction/measured-values.json")["citations"]),
              "generatedExamples": len([x for x in example_files() if x.startswith("schema/examples/generated.")]),
              "generatedModeRules": len(load("compatibility/graph.json")["generatedModeRules"]),
              "measuredRoutes": len((load("extraction/measured-values.json").get("sectionHeights") or {}).get("routes", {}))}
    for k, v in actual.items():
        if man["counts"].get(k) != v:
            err("manifest-counts", f"counts.{k} = {man['counts'].get(k)} but disk has {v}")
    for k in man["counts"]:
        if k not in actual:
            err("manifest-counts", f"counts.{k} is not recomputed by any check")
    readme = open(os.path.join(REPO, "README.md"), encoding="utf-8").read()
    for k in ("tokens", "primitives", "components", "sections", "templates", "routes"):
        m = re.search(r"\|\s*" + k + r"\s*\|\s*(\d+)\s*\|", readme)
        if not m or int(m.group(1)) != actual[k]:
            err("manifest-counts", f"README count table row '{k}' is {m.group(1) if m else 'missing'}, disk has {actual[k]}")
    for t in tpl.values():
        if t["routeCount"] != len(t["routes"]):
            err("manifest-counts", f"{t['id']} routeCount {t['routeCount']} != {len(t['routes'])}")


@check("entrypoints-inside-repo")
def _():
    man = load("registry.manifest.json")
    for k, p in man["entryPoints"].items():
        if p.startswith("/") or ".." in p.split("/") or "://" in p:
            err("entrypoints-inside-repo", f"{k}: '{p}' points outside design-repo/")
        elif not os.path.exists(os.path.join(REPO, p)):
            err("entrypoints-inside-repo", f"{k}: '{p}' does not exist")


@check("no-absolute-paths")
def _():
    for dp, _, fs in os.walk(REPO):
        for f in fs:
            p = os.path.join(dp, f)
            try:
                txt = open(p, encoding="utf-8").read()
            except UnicodeDecodeError:
                continue
            for pat in ABS_PATTERNS:
                if pat in txt:
                    err("no-absolute-paths", f"{os.path.relpath(p, REPO)} contains an absolute local path ({pat!r})")


@check("no-source-binaries")
def _():
    for dp, _, fs in os.walk(REPO):
        for f in fs:
            if os.path.splitext(f)[1].lower() in FORBIDDEN_EXT or f in (".DS_Store",) or "__MACOSX" in dp:
                err("no-source-binaries", f"forbidden file {os.path.relpath(os.path.join(dp, f), REPO)} (fonts/animations/images/zips never ship here)")


def collect_evidence(o, acc, where):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == "evidence":
                for e in (v if isinstance(v, list) else [v]):
                    acc.append((e, where))
            else:
                collect_evidence(v, acc, where)
    elif isinstance(o, list):
        for x in o:
            collect_evidence(x, acc, where)


@check("evidence-ids-resolve")
def _():
    ids = {c["id"] for c in load("extraction/measured-values.json")["citations"]}
    acc = []
    for rel in json_files():
        if rel.endswith(".schema.json"):  # meta-schemas declare an 'evidence' PROPERTY, they cite nothing
            continue
        collect_evidence(load(rel), acc, rel)
    for e, where in acc:
        if e not in ids:
            err("evidence-ids-resolve", f"{where}: evidence id '{e}' not in extraction/measured-values.json")
    used = {e for e, _ in acc}
    for i in sorted(ids - used):
        WARNINGS.append(f"[evidence-ids-resolve] citation '{i}' is never referenced")


@check("citation-validity")
def _():
    src = ARGS.source_root
    present = 0
    for c in load("extraction/measured-values.json")["citations"]:
        p = c["path"]
        if p.startswith("/") or ".." in p.split("/"):
            err("citation-validity", f"{c['id']}: path must be relative to the source root, got '{p}'")
            continue
        fp = os.path.join(src, p)
        if not os.path.exists(fp):
            WARNINGS.append(f"[citation-validity] {c['id']}: source file '{p}' not present (no sibling source tree) - skipped")
            continue
        present += 1
        if c["lines"] is None:
            continue
        m = re.fullmatch(r"(\d+)-(\d+)", c["lines"])
        if not m:
            err("citation-validity", f"{c['id']}: malformed line range '{c['lines']}'")
            continue
        a, b = int(m.group(1)), int(m.group(2))
        lines = open(fp, encoding="utf-8").read().split("\n")
        if a < 1 or b < a or b > len(lines):
            err("citation-validity", f"{c['id']}: range {a}-{b} outside {p} ({len(lines)} lines)")
            continue
        if c["anchor"] not in "\n".join(lines[a - 1:b]):
            err("citation-validity", f"{c['id']}: anchor {c['anchor']!r} not found in {p}:{a}-{b} (citation drifted or describes the wrong code)")
    if present == 0:
        WARNINGS.append("[citation-validity] no sibling source tree found - external citations not checked (expected for a standalone copy)")


@check("schema-section-parity")
def _():
    schema = load("schema/pagespec.schema.json")
    defs = schema["definitions"]
    secs = {}
    for f in sorted(os.listdir(os.path.join(REPO, "sections"))):
        if f.endswith(".json"):
            s = load("sections/" + f)
            secs[s["id"]] = s
    enum = defs["node"]["properties"]["type"]["enum"]
    if sorted(enum) != sorted(secs):
        err("schema-section-parity", f"node type enum {sorted(set(enum) ^ set(secs))} differs from sections/")
    for sid, s in secs.items():
        if defs.get("content." + sid) != s["contentSchema"]:
            err("schema-section-parity", f"definitions.content.{sid} differs from sections/{sid}.json contentSchema")
        mo = defs.get("motion." + sid, {}).get("properties", {})
        if sorted(mo.get("pattern", {}).get("enum", [])) != sorted(s["motion"]["patterns"]):
            err("schema-section-parity", f"motion patterns for {sid} differ between schema and contract")
        fbs = sorted({f for p in s["motion"]["patterns"].values() for f in p["allowedFallbacks"]})
        if sorted(mo.get("reducedMotionFallback", {}).get("enum", [])) != fbs:
            err("schema-section-parity", f"reducedMotionFallback enum for {sid} differs between schema and contract")
        if defs.get("motion." + sid, {}).get("additionalProperties") is not False:
            err("schema-section-parity", f"motion.{sid} must be closed (additionalProperties false)")
    if schema["properties"].get("mode", {}).get("enum") != ["reference", "generated"] or "mode" not in schema["required"]:
        err("schema-section-parity", "PageSpec `mode` must be a REQUIRED closed enum ['reference', 'generated']")
    tpl = load("templates/templates.json")["templates"]
    if sorted(schema["properties"]["template"]["enum"]) != sorted(tpl):
        err("schema-section-parity", "schema template enum differs from templates/templates.json")
    for t in tpl.values():
        for n in t["nodes"]:
            if n["section"] not in secs:
                err("schema-section-parity", f"{t['id']} references unknown section {n['section']}")


@check("asset-roles")
def _():
    doc = load("assets/asset-roles.json")
    roles = doc["roles"]
    schema = load("schema/pagespec.schema.json")
    allow = load("tokens/llm/component-allowlist.json")
    if sorted(schema["definitions"]["assetRole"]["enum"]) != sorted(roles):
        err("asset-roles", "schema definitions.assetRole enum != assets/asset-roles.json roles")
    if sorted(allow["assetRoles"]) != sorted(roles):
        err("asset-roles", "allowlist assetRoles != assets/asset-roles.json roles")
    for rid, r in roles.items():
        if r["policy"] not in doc["generationPolicies"]:
            err("asset-roles", f"{rid}: policy '{r['policy']}' not in the closed policy set")
        if not r.get("aiGeneration"):
            err("asset-roles", f"{rid}: missing aiGeneration guidance")
    # pinned values: compliance-critical roles must carry ONE specific policy, not merely a valid one.
    PINNED = {"brand-mark": "must-not-fabricate", "product-screenshot": "must-not-reproduce-source", "product-animation": "must-not-reproduce-source",
              "background-art": "must-not-reproduce-source", "social-icon": "must-reuse-exact", "flag": "must-reuse-exact"}
    if doc.get("pinnedPolicies") != PINNED:
        err("asset-roles", "pinnedPolicies block was edited - compliance pins are fixed in verify_all.py")
    for rid, pol in PINNED.items():
        if roles.get(rid, {}).get("policy") != pol:
            err("asset-roles", f"{rid} must be pinned to '{pol}', found '{roles.get(rid, {}).get('policy')}'")
    # every role used by a schema field is in the vocabulary, and every role is used somewhere
    used = set()

    def walk(o):
        if isinstance(o, dict):
            if set(o.get("properties", {})) >= {"role", "ref", "alt"}:
                used.update(o["properties"]["role"]["enum"])
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(schema["definitions"])
    media = {r for r, v in roles.items() if v.get("kind") == "media"}
    conv = {r for r, v in roles.items() if v.get("kind") == "convention"}
    if media | conv != set(roles):
        err("asset-roles", f"roles without kind media|convention: {sorted(set(roles) - media - conv)}")
    if used - set(roles):
        err("asset-roles", f"schema fields use unknown roles {used - set(roles)}")
    if media - used:
        err("asset-roles", f"media roles never wired to a schema field: {media - used}")
    if conv & used:
        err("asset-roles", f"convention roles must not be asset fields: {conv & used}")
    import semantic_validate as V
    adv = open(os.path.join(REPO, "schema/tests/adversarial_test.py"), encoding="utf-8").read()
    for r in sorted(conv):
        rules = roles[r].get("enforcedBy") or []
        if not rules or any(x not in V.GENERATED_MODE_RULES or f'"{x}"' not in adv for x in rules):
            err("asset-roles", f"convention role {r} must be enforcedBy GENERATED_MODE_* rules that exist in the validator and are proven by the adversarial suite (got {rules})")
    for r, v in roles.items():
        if len(v.get("generatedModeGuidance") or "") < 20:
            err("asset-roles", f"{r}: missing generatedModeGuidance")
    ex_roles = set()
    for rel in example_files():
        ex_roles |= set(re.findall(r'"role": "([a-z-]+)"', open(os.path.join(REPO, rel), encoding="utf-8").read()))
    if not ex_roles or ex_roles - set(roles):
        err("asset-roles", f"examples use roles {ex_roles - set(roles)} outside the vocabulary")
    gen_safe_media = {r for r in media if roles[r]["availability"] == "generation-safe"}
    if gen_safe_media - ex_roles - {"social-icon", "flag", "icon", "icon-illustrated", "background-glow"}:
        err("asset-roles", f"generation-safe roles not exercised by any example: {sorted(gen_safe_media - ex_roles)}")


@check("token-resolution")
def _():
    f, s, c, l = all_tokens()
    allt = {**f, **s, **c, **l}

    def resolve(tid, seen=()):
        v = allt[tid]["$value"]
        if isinstance(v, str) and v.startswith("{") and v.endswith("}"):
            ref = v[1:-1]
            if ref not in allt:
                raise KeyError(f"{tid} -> unknown {ref}")
            if ref in seen:
                raise KeyError(f"cycle at {tid}")
            return resolve(ref, seen + (tid,))
        return v
    theme = load("tokens/themes/dark.json")["resolved"]
    for tid in list(s) + list(c):
        try:
            v = resolve(tid)
        except KeyError as ex:
            err("token-resolution", str(ex))
            continue
        if theme.get(tid) != v:
            err("token-resolution", f"themes/dark.json[{tid}] = {theme.get(tid)!r}, resolves to {v!r}")
    for tid in l:
        try:
            resolve(tid)
        except KeyError as ex:
            err("token-resolution", str(ex))
    catalog = load("tokens/llm/token-catalog.json")
    cat_ids = {t for ids in catalog["categories"].values() for t in ids}
    if cat_ids != set(allt):
        err("token-resolution", f"token-catalog differs from token files: {sorted(cat_ids ^ set(allt))[:6]}")
    for folder in ("primitives", "components"):
        for fn in sorted(os.listdir(os.path.join(REPO, folder))):
            for t in load(f"{folder}/{fn}")["tokens"]:
                if t not in cat_ids:
                    err("token-resolution", f"{folder}/{fn} references unknown token '{t}'")
    pol = load("tokens/llm/token-policy.json")
    for k in pol["rawValueRestrictions"]:
        if k not in catalog["categories"]:
            err("token-resolution", f"token-policy category '{k}' is not a real catalog key")
    for tid, v in allt.items():
        if not v.get("evidence"):
            err("token-resolution", f"token {tid} has no evidence")


@check("graph-validator-parity")
def _():
    import importlib
    import semantic_validate as V
    importlib.reload(V)
    graph_ids = {r["id"] for r in load("compatibility/graph.json")["rules"]}
    code_ids = set(V.RULES)
    if graph_ids != code_ids:
        err("graph-validator-parity", f"graph-only {sorted(graph_ids - code_ids)}, validator-only {sorted(code_ids - graph_ids)}")
    for r in load("compatibility/graph.json")["rules"]:
        if r["severity"] not in ("error", "warn"):
            err("graph-validator-parity", f"{r['id']} severity '{r['severity']}'")
    tpl = load("templates/templates.json")["templates"]
    pairs = [tuple(p) for r in load("compatibility/graph.json")["rules"] if r["id"] == "NO_ADJACENT_SAME_CATEGORY" for p in r["exceptions"]["pairs"]]
    for a, b in pairs:
        seen = any([a, b] == [x["section"] for x in t["nodes"]][i:i + 2] for t in tpl.values() for i in range(len(t["nodes"])))
        rep = a == b and any(n["section"] == a and n["repeatable"] for t in tpl.values() for n in t["nodes"])
        if not (seen or rep):
            err("graph-validator-parity", f"adjacency exception {a}->{b} is not observed in any real template")
    gm = {r["id"] for r in load("compatibility/graph.json")["generatedModeRules"]}
    if gm != set(V.GENERATED_MODE_RULES):
        err("graph-validator-parity", f"generatedModeRules graph-only {sorted(gm - set(V.GENERATED_MODE_RULES))}, validator-only {sorted(set(V.GENERATED_MODE_RULES) - gm)}")
    import inspect
    code = inspect.getsource(V.check_generated)
    adv = open(os.path.join(REPO, "schema/tests/adversarial_test.py"), encoding="utf-8").read()
    for rid in sorted(V.GENERATED_MODE_RULES):
        if f'"{rid}"' not in code:
            err("graph-validator-parity", f"{rid} is never raised by check_generated()")
        if f'"{rid}"' not in adv:
            err("graph-validator-parity", f"{rid} has no adversarial mutation in schema/tests/adversarial_test.py")


@check("route-coverage")
def _():
    tpl = load("templates/templates.json")["templates"]
    routes = load("templates/routes.json")["routes"]
    seen = {}
    for r in routes:
        if r["path"] in seen:
            err("route-coverage", f"route {r['path']} assigned twice")
        seen[r["path"]] = r["template"]
        if r["template"] not in tpl or r["path"] not in tpl[r["template"]]["routes"]:
            err("route-coverage", f"route {r['path']} -> {r['template']} disagrees with templates.json")
    for t in tpl.values():
        if not t["routes"]:
            err("route-coverage", f"{t['id']} has no route")
        for p in t["routes"]:
            if seen.get(p) != t["id"]:
                err("route-coverage", f"{t['id']} route {p} missing from routes.json")


@check("controls-pass")
def _():
    import semantic_validate as V
    for t in V.TEMPLATES:
        for r in V.TEMPLATES[t]["routes"]:
            for mode in ("reference", "generated"):
                e, w = V.validate(V.build_control(t, r, mode))
                for x in e + w:
                    err("controls-pass", f"{t} {r} [{mode}]: {x}")


# ------------------------------------------------------------------ baseline pins (independent literals)
PINNED_AVAILABILITY = {
    "product-screenshot": "reference-only", "product-animation": "reference-only", "illustration-mock": "reference-only",
    "icon": "generation-safe", "icon-illustrated": "generation-safe", "background-art": "reference-only",
    "background-glow": "generation-safe", "brand-mark": "reference-only", "social-icon": "generation-safe", "flag": "generation-safe",
    "third-party-logo": "blocked-for-generation", "placeholder-brand-mark": "generation-safe", "generated-product-visual": "generation-safe",
    "generated-product-animation": "generation-safe", "generated-background-art": "generation-safe", "generated-mock-scene": "generation-safe",
    "fictional-avatar": "generation-safe", "generic-partner-placeholder": "generation-safe", "placeholder-url": "generation-safe",
    "original-copy": "generation-safe",
}
RETRIEVAL_INELIGIBLE_PIN = {"forms.partner-popup"}
UTILITY_WORDS = ("cookie", "consent", "modal", "dialog", "drawer", "overlay", "popup", "toast", "preloader", "cursor", "ticker")
WRAPPER_THRESHOLDS = {"HERO_WARN_PX": 1800, "HERO_FAIL_PX": 3000, "SHARE_WARN_PCT": 50.0, "SHARE_FAIL_PCT": 60.0, "MIN_SECTIONS": 3, "VIEWPORT_WIDTH": 1440}
SOURCE_BRAND_MINIMUM = {"stems": {"vault", "overcode"}, "domains": {"usevault.ai", "overcode.tech"}, "endpoints": {"/api/add-lead"},
                        "min_copy_shingles": 1000, "min_cta_strings": 3, "min_asset_stems": 20}


def sections_on_disk():
    out = {}
    for f in sorted(os.listdir(os.path.join(REPO, "sections"))):
        if f.endswith(".json"):
            c = load("sections/" + f)
            out[c["id"]] = c
    return out


@check("availability-pin")
def _():
    import semantic_validate as V
    roles = load("assets/asset-roles.json")["roles"]
    if V.PINNED_AVAILABILITY != PINNED_AVAILABILITY:
        err("availability-pin", "schema/semantic_validate.py PINNED_AVAILABILITY differs from the pin in verify_all.py")
    for r, want in PINNED_AVAILABILITY.items():
        if roles.get(r, {}).get("availability") != want:
            err("availability-pin", f"asset role {r} must be '{want}', registry says {roles.get(r, {}).get('availability')!r}")
    for r, v in roles.items():
        if r not in PINNED_AVAILABILITY:
            err("availability-pin", f"asset role {r} has no pinned availability")
        if v.get("availability") not in ("reference-only", "generation-safe", "blocked-for-generation"):
            err("availability-pin", f"{r}: availability {v.get('availability')!r} not in the closed set")
        if v.get("availability") != "generation-safe":
            subs = v.get("generationSafeSubstitutes") or []
            if not subs or any(PINNED_AVAILABILITY.get(x) != "generation-safe" for x in subs):
                err("availability-pin", f"{r}: generationSafeSubstitutes {subs} must be non-empty and generation-safe")
    if roles.get("brand-mark", {}).get("policy") == "must-reuse-exact":
        err("availability-pin", "brand-mark (the source wordmark) can never be must-reuse-exact")
    allow = load("tokens/llm/component-allowlist.json")
    want_safe = [r for r in roles if PINNED_AVAILABILITY.get(r) == "generation-safe"]
    if sorted(allow.get("generationSafeAssetRoles", [])) != sorted(want_safe):
        err("availability-pin", "allowlist generationSafeAssetRoles differs from the pinned generation-safe roles")
    for sid, c in sections_on_disk().items():
        offered = set()

        def walk(o):
            if isinstance(o, dict):
                if set(o.get("properties", {})) >= {"role", "ref", "alt"}:
                    offered.update(o["properties"]["role"]["enum"])
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)
        walk(c["contentSchema"])
        want = sorted(r for r in offered if PINNED_AVAILABILITY.get(r) == "generation-safe")
        if sorted(c.get("generatedAssetRoles", [])) != want:
            err("availability-pin", f"{sid}: generatedAssetRoles {c.get('generatedAssetRoles')} != pinned generation-safe roles of its fields {want}")


@check("retrieval-pin")
def _():
    import semantic_validate as V
    if set(V.RETRIEVAL_INELIGIBLE) != RETRIEVAL_INELIGIBLE_PIN:
        err("retrieval-pin", f"schema/semantic_validate.py RETRIEVAL_INELIGIBLE {sorted(V.RETRIEVAL_INELIGIBLE)} differs from the pin in verify_all.py {sorted(RETRIEVAL_INELIGIBLE_PIN)}")
    allow = load("tokens/llm/component-allowlist.json")
    if set(allow.get("retrievalIneligibleSections", [])) != RETRIEVAL_INELIGIBLE_PIN:
        err("retrieval-pin", "allowlist retrievalIneligibleSections differs from the pin")
    for sid, c in sections_on_disk().items():
        want = sid not in RETRIEVAL_INELIGIBLE_PIN
        if c.get("retrievalEligible") is not want:
            err("retrieval-pin", f"{sid}: retrievalEligible {c.get('retrievalEligible')!r}, pinned {want}")
        if (any(w in sid for w in UTILITY_WORDS) or c.get("constraints", {}).get("overlay") is True) and want:
            err("retrieval-pin", f"{sid} looks like runtime/utility UI but is not pinned retrieval-ineligible")
        if not want and len(c.get("retrievalReason") or "") < 30:
            err("retrieval-pin", f"{sid}: ineligible without a 30+ character retrievalReason")
    schema = load("schema/pagespec.schema.json")
    if schema["definitions"]["node"]["properties"].get("retrievalEligible", {}).get("type") != "boolean":
        err("retrieval-pin", "PageSpec node.retrievalEligible must be a closed boolean")


@check("section-contracts")
def _():
    import semantic_validate as V
    secs = sections_on_disk()
    for sid, c in secs.items():
        for f in V.validate_section_contract(c):
            err("section-contracts", f)
    src = ARGS.source_root
    present = 0
    for sid, c in secs.items():
        s = c.get("source") or {}
        fp = os.path.join(src, s.get("file", ""))
        if not s.get("file") or not os.path.isfile(fp):
            WARNINGS.append(f"[section-contracts] {sid}: source file {s.get('file')!r} not present (no sibling source tree) - range not re-read")
            continue
        present += 1
        a, b = (int(x) for x in s["lines"].split("-"))
        lines = open(fp, encoding="utf-8").read().split("\n")
        if a < 1 or b < a or b > len(lines):
            err("section-contracts", f"{sid}: source range {s['lines']} outside {s['file']} ({len(lines)} lines)")
            continue
        if not re.search(r"<" + re.escape(s["tag"]) + r"(\s|>|/|$)", lines[a - 1]):
            err("section-contracts", f"{sid}: tag <{s['tag']}> not at {s['file']}:{a} (found {lines[a - 1].strip()[:60]!r})")
    if present == 0:
        WARNINGS.append("[section-contracts] no sibling source tree - source ranges not re-read (expected for a standalone copy)")
    tpl_secs = {n["section"] for t in load("templates/templates.json")["templates"].values() for n in t["nodes"]}
    for sid in sorted(set(secs) - tpl_secs):
        err("section-contracts", f"{sid} is used by no template")


@check("generated-mode-registry")
def _():
    ar = load("assets/asset-roles.json")
    sb = ar.get("sourceBrand") or {}
    hashes = load("assets/source-copy-hashes.json")
    m = SOURCE_BRAND_MINIMUM
    if not m["stems"] <= set((sb.get("brand") or {}).get("stems", [])):
        err("generated-mode-registry", f"sourceBrand.brand.stems lost pinned stems {sorted(m['stems'])}")
    if not m["domains"] <= set((sb.get("urls") or {}).get("domains", [])):
        err("generated-mode-registry", f"sourceBrand.urls.domains lost pinned domains {sorted(m['domains'])}")
    if not m["endpoints"] <= set((sb.get("urls") or {}).get("endpointPaths", [])):
        err("generated-mode-registry", "sourceBrand.urls.endpointPaths lost the source form endpoint")
    if len(hashes.get("copyShingles", [])) < m["min_copy_shingles"] or len(hashes.get("ctaStrings", [])) < m["min_cta_strings"] or len(hashes.get("assetStems", [])) < m["min_asset_stems"]:
        err("generated-mode-registry", "assets/source-copy-hashes.json fell below the pinned minimum (copy / CTA / asset-stem hashes)")
    for k in ("people", "customers", "partners"):
        if not (sb.get(k) or {}).get("patterns"):
            err("generated-mode-registry", f"sourceBrand.{k} has no patterns")
    if os.path.isdir(os.path.join(ARGS.source_root, "src")) and os.path.abspath(ARGS.source_root) == os.path.dirname(REPO):
        import importlib.util
        spec = importlib.util.spec_from_file_location("build_source_brand", os.path.join(HERE, "build_source_brand.py"))
        B = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(B)
        reg, h = B.build()
        if reg != sb or B.dump(h) != open(os.path.join(REPO, "assets/source-copy-hashes.json"), encoding="utf-8").read():
            err("generated-mode-registry", "sourceBrand / source-copy-hashes.json are OUT OF DATE against the real source (run extraction/build_source_brand.py)")
    else:
        WARNINGS.append("[generated-mode-registry] no sibling src/ - registry not re-derived (pinned minimum checked only)")


@check("wrapper-gate")
def _():
    import importlib.util
    spec = importlib.util.spec_from_file_location("wrapper_gate", os.path.join(HERE, "wrapper_gate.py"))
    WG = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(WG)
    for k, v in WRAPPER_THRESHOLDS.items():
        if getattr(WG, k, None) != v:
            err("wrapper-gate", f"wrapper_gate.{k} = {getattr(WG, k, None)!r}, pinned {v!r}")
    errs, warns, info = WG.evaluate(*WG.load_inputs(REPO))
    for c, msg in errs:
        err("wrapper-gate", f"{c}: {msg}")
    for c, msg in warns:
        WARNINGS.append(f"[wrapper-gate] {c}: {msg}")


def main():
    for run in CHECKS:
        run()
    for p in PASSED:
        print(f"PASS  {p}")
    for w in WARNINGS:
        print(f"WARN  {w}")
    for e in ERRORS:
        print(f"FAIL  {e}")
    print(f"\n{len(PASSED)}/{len(CHECKS)} checks passed, {len(ERRORS)} error(s), {len(WARNINGS)} warning(s)")
    return 1 if ERRORS else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--source-root", default=os.path.dirname(REPO))
    ARGS = ap.parse_args()
    sys.exit(main())

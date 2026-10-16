#!/usr/bin/env python3
"""Repository-wide consistency checks for this design-repo.

Usage:  python3 extraction/verify_all.py [--source-root PATH]

--source-root defaults to the parent directory of design-repo/ (where the clone lives at
build time). External citation checks run against it when the cited files exist there and
degrade to WARNINGS when they do not (e.g. the folder was unzipped on its own).
Every other check is internal and always fatal. Exit 1 on any error.

Each check below is proven to catch drift by extraction/drift_proof.py, which copies this
repo to a scratch directory, injects one defect per check, and asserts this script fails.
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
ABS_PATTERNS = ["/" + "Users/", "/" + "home/", "C:" + "\\\\", "/private/" + "tmp", "/" + "var/folders"]


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
    ex = load("schema/example.pagespec.json")
    errs = list(Draft7Validator(schema).iter_errors(ex))
    for e in errs:
        err("schema-draft07", f"example: {'/'.join(map(str, e.absolute_path))}: {e.message[:160]}")


@check("semantic-example")
def _():
    import semantic_validate as V
    e, w = V.validate(load("schema/example.pagespec.json"))
    for x in e + w:
        err("semantic-example", x)


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
              "citations": len(load("extraction/measured-values.json")["citations"])}
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
    if used - set(roles):
        err("asset-roles", f"schema fields use unknown roles {used - set(roles)}")
    if set(roles) - used:
        err("asset-roles", f"roles never wired to a schema field: {set(roles) - used}")
    ex_roles = set(re.findall(r'"role": "([a-z-]+)"', open(os.path.join(REPO, "schema/example.pagespec.json"), encoding="utf-8").read()))
    if not ex_roles or ex_roles - set(roles):
        err("asset-roles", f"example uses roles {ex_roles} outside the vocabulary")


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
        if not any([a, b] == [x["section"] for x in t["nodes"]][i:i + 2] for t in tpl.values() for i in range(len(t["nodes"]))):
            err("graph-validator-parity", f"adjacency exception {a}->{b} is not observed in any real template")


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
            e, w = V.validate(V.build_control(t, r))
            for x in e + w:
                err("controls-pass", f"{t} {r}: {x}")


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

#!/usr/bin/env python3
"""Prove verify_all.py actually catches drift.

For each check, copy this design-repo into a fresh scratch directory, inject one defect,
run verify_all.py there, and require (a) a non-zero exit and (b) a FAIL line from the
targeted check. Then require the unmodified repo to pass. Citation drift is proven against
a tiny synthetic source tree created next to the scratch copy, so this works even when no
real sibling source exists (self-contained).

Run:  python3 extraction/drift_proof.py     (exit 1 if any defect goes undetected)
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)


def jedit(rel, fn):
    def apply(root):
        p = os.path.join(root, rel)
        with open(p, encoding="utf-8") as f:
            d = json.load(f)
        fn(d)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(d, f, indent=2, ensure_ascii=False)
    return apply


def tedit(rel, old, new):
    def apply(root):
        p = os.path.join(root, rel)
        s = open(p, encoding="utf-8").read()
        assert old in s, (rel, old)
        open(p, "w", encoding="utf-8").write(s.replace(old, new, 1))
    return apply


def add_citation(cid, path, lines, anchor):
    def fn(d):
        d["citations"].append({"id": cid, "path": path, "lines": lines, "anchor": anchor, "claim": "drift probe"})
    return fn


def write_file(rel, text):
    def apply(root):
        p = os.path.join(root, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, "w", encoding="utf-8").write(text)
    return apply


CASES = [
    ("allowlist-parity", "phantom allowlist entry", jedit("tokens/llm/component-allowlist.json", lambda d: d["sections"].__setitem__("features.ticker", "sections/features.ticker.json"))),
    ("allowlist-parity", "orphan contract with no allowlist entry", write_file("primitives/divider.json", json.dumps({"id": "primitive.divider", "kind": "primitive", "tokens": [], "evidence": ["ev.ia"]}))),
    ("allowlist-parity", "allowlist nodeProperties drift", jedit("tokens/llm/component-allowlist.json", lambda d: d["nodeProperties"].append("style"))),
    ("allowlist-version", "manifest allowlistVersion drift", jedit("registry.manifest.json", lambda d: d.__setitem__("allowlistVersion", "1.0.1"))),
    ("manifest-counts", "hand-bumped manifest count", jedit("registry.manifest.json", lambda d: d["counts"].__setitem__("sections", 24))),
    ("manifest-counts", "stale README count", tedit("README.md", "| templates | 6 |", "| templates | 7 |")),
    ("entrypoints-inside-repo", "entry point outside the package", jedit("registry.manifest.json", lambda d: d["entryPoints"].__setitem__("ia", "../ia.json"))),
    ("no-absolute-paths", "absolute local path in manifest", jedit("registry.manifest.json", lambda d: d["source"].__setitem__("path", "/" + "Users/someone/project"))),
    ("no-source-binaries", "font file smuggled in", write_file("assets/display.woff2", "not really a font")),
    ("evidence-ids-resolve", "token cites unknown evidence id", jedit("tokens/00-foundation/radius.json", lambda d: d["radius"]["sm"].__setitem__("evidence", ["ev.made-up"]))),
    ("citation-validity", "citation range past end of file", jedit("extraction/measured-values.json", add_citation("ev.probe.range", "PROBE.md", "2-40", "beta"))),
    ("citation-validity", "in-range citation describing the wrong lines", jedit("extraction/measured-values.json", add_citation("ev.probe.anchor", "PROBE.md", "1-1", "gamma"))),
    ("schema-section-parity", "schema content drifts from section contract", jedit("sections/hero.home-dashboard.json", lambda d: d["contentSchema"]["properties"]["headline"].__setitem__("maxWords", 99))),
    ("schema-section-parity", "motion definition reopened", jedit("schema/pagespec.schema.json", lambda d: d["definitions"]["motion.chrome.footer"].__setitem__("additionalProperties", True))),
    ("asset-roles", "pinned role flipped to a different VALID policy", jedit("assets/asset-roles.json", lambda d: d["roles"]["brand-mark"].__setitem__("policy", "may-generate-new"))),
    ("asset-roles", "schema role enum drift", jedit("schema/pagespec.schema.json", lambda d: d["definitions"]["assetRole"]["enum"].append("stock-photo"))),
    ("token-resolution", "theme value drifts from foundation", jedit("tokens/themes/dark.json", lambda d: d["resolved"].__setitem__("text.secondary", "rgba(255,255,255,.7)"))),
    ("token-resolution", "primitive references unknown token", jedit("primitives/button-outline.json", lambda d: d["tokens"].append("color.brand-purple"))),
    ("token-resolution", "policy category not a catalog key", jedit("tokens/llm/token-policy.json", lambda d: d["rawValueRestrictions"].__setitem__("typography", "x"))),
    ("graph-validator-parity", "graph rule with no enforcing code", jedit("compatibility/graph.json", lambda d: d["rules"].append({"id": "ONE_CTA_BAND", "severity": "error", "description": "probe", "exceptions": None, "enforcedBy": "x", "evidence": ["ev.ia"]}))),
    ("graph-validator-parity", "adjacency exception not observed in real templates", jedit("compatibility/graph.json", lambda d: [r for r in d["rules"] if r["id"] == "NO_ADJACENT_SAME_CATEGORY"][0]["exceptions"]["pairs"].append(["features.partner-audience", "features.partner-value-grid"]))),
    ("route-coverage", "route assigned twice", jedit("templates/routes.json", lambda d: d["routes"].append(dict(d["routes"][0], template="template.legal")))),
    ("semantic-example", "example contradicts its template", jedit("schema/example.pagespec.json", lambda d: d["nodes"].pop(4))),
    ("controls-pass", "section example breaks its own budget", jedit("sections/hero.not-found.json", lambda d: d["example"].__setitem__("headline", "a b c d e f g h"))),
]


def run_verify(root, source_root):
    p = subprocess.run([sys.executable, os.path.join(root, "extraction", "verify_all.py"), "--source-root", source_root], capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


def main():
    tmp = tempfile.mkdtemp(prefix="drift-proof-")
    fake_src = os.path.join(tmp, "fake-source")
    os.makedirs(fake_src)
    open(os.path.join(fake_src, "PROBE.md"), "w").write("alpha\nbeta\n")
    fails = 0
    try:
        for i, (check, label, mutate) in enumerate(CASES):
            root = os.path.join(tmp, f"case{i}", "design-repo")
            shutil.copytree(REPO, root)
            mutate(root)
            code, out = run_verify(root, fake_src)
            caught = code != 0 and f"FAIL  [{check}]" in out
            fails += not caught
            line = next((ln for ln in out.splitlines() if ln.startswith(f"FAIL  [{check}]")), "")
            print(f"[{'CAUGHT' if caught else 'MISSED'}] {check}: {label}" + (f"\n         {line[:150]}" if caught else f" (exit {code})"))
        code, out = run_verify(REPO, os.path.dirname(REPO))
        ok = code == 0
        fails += not ok
        print(f"[{'PASS' if ok else 'FAIL'}] unmodified repo passes verify_all.py (exit {code})")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"\n{len(CASES) - fails + (1 if not fails else 0)}/{len(CASES) + 1} drift probes behaved as required")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

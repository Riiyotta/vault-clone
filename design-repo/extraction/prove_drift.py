#!/usr/bin/env python3
"""Prove verify_all.py actually catches drift - for every check, every pin and every gate.

For each case, copy this design-repo into a fresh scratch directory, inject one defect, run verify_all.py there, and
require (a) a non-zero exit and (b) a FAIL line from the targeted check. Then require the unmodified repo to pass.
Citation and source-range drift are proven against a tiny synthetic source tree created next to the scratch copies,
so this works even when no real sibling source exists (self-contained). The one case that needs the REAL source
(the source-brand registry going out of date against src/) runs only when the clone sits beside this folder, and
says so when it is skipped.

Run:  python3 extraction/prove_drift.py [--scratch DIR]     (exit 1 if any defect goes undetected)
--scratch DIR keeps the scratch copies under DIR (default: a new OS temp dir, removed afterwards).
"""
import argparse
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


def rename_file(rel, new_rel):
    def apply(root):
        os.rename(os.path.join(root, rel), os.path.join(root, new_rel))
    return apply


def remove_file(rel):
    def apply(root):
        os.remove(os.path.join(root, rel))
    return apply


def both(*fns):
    def apply(root):
        for f in fns:
            f(root)
    return apply


def heights(fn):
    return jedit("extraction/measured-values.json", lambda d: fn(d["sectionHeights"]))


def grow(route, sid, new):
    def fn(h):
        s = next(x for x in h["routes"][route]["sections"] if x["section"] == sid)
        h["routes"][route]["pageHeight"] += new - s["heightPx"]
        s["heightPx"] = new
    return heights(fn)


def merge_legal(h):
    r = h["routes"]["/terms"]
    parts = [x for x in r["sections"] if x["section"] in ("content.legal-header", "content.legal-section")]
    r["sections"] = [x for x in r["sections"] if x not in parts]
    r["sections"].insert(2, {"section": "content.legal-header", "heightPx": sum(x["heightPx"] for x in parts), "position": "static", "inFlow": True})


def probe_source(lines, tag):
    """Point chrome.footer's provenance at the synthetic PROBE source file (which has <section at line 2)."""
    def fn(d):
        d["implementedBy"] = "src/probe/Probe.jsx"
        d["source"] = {"id": f"src.probe.Probe.{tag}@L{lines.split('-')[0]}", "file": "src/probe/Probe.jsx", "lines": lines, "tag": tag}
    return jedit("sections/chrome.footer.json", fn)


def gen_leak(d):
    n = next(x for x in d["nodes"] if x["type"] == "hero.home-dashboard")
    n["content"]["eyebrow"] = "Vault for studios"


CASES = [
    ("allowlist-parity", "phantom allowlist entry", jedit("tokens/llm/component-allowlist.json", lambda d: d["sections"].__setitem__("features.ticker", "sections/features.ticker.json"))),
    ("allowlist-parity", "orphan contract with no allowlist entry", write_file("primitives/divider.json", json.dumps({"id": "primitive.divider", "kind": "primitive", "tokens": [], "evidence": ["ev.ia"]}))),
    ("allowlist-parity", "allowlist nodeProperties drift", jedit("tokens/llm/component-allowlist.json", lambda d: d["nodeProperties"].append("style"))),
    ("allowlist-version", "manifest allowlistVersion drift", jedit("registry.manifest.json", lambda d: d.__setitem__("allowlistVersion", "1.0.1"))),
    ("manifest-counts", "hand-bumped manifest count", jedit("registry.manifest.json", lambda d: d["counts"].__setitem__("sections", 25))),
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
    # ---- R1 mode
    ("schema-section-parity", "mode dropped from required", jedit("schema/pagespec.schema.json", lambda d: d["required"].remove("mode"))),
    ("schema-section-parity", "mode enum opened up", jedit("schema/pagespec.schema.json", lambda d: d["properties"]["mode"]["enum"].append("clone"))),
    ("semantic-example", "reference example relabelled generated", jedit("schema/example.pagespec.json", lambda d: d.__setitem__("mode", "generated"))),
    # ---- R2/R4 generated mode
    ("semantic-example", "generated example leaks the source brand", jedit("schema/examples/generated.template.home.pagespec.json", gen_leak)),
    ("semantic-example", "generated example for a template family removed", both(remove_file("schema/examples/generated.template.legal.pagespec.json"), jedit("registry.manifest.json", lambda d: d["counts"].__setitem__("generatedExamples", 5)))),
    ("graph-validator-parity", "generated-mode rule dropped from the graph", jedit("compatibility/graph.json", lambda d: d["generatedModeRules"].pop())),
    ("graph-validator-parity", "generated-mode rule never raised in code", tedit("schema/semantic_validate.py", '"GENERATED_MODE_CUSTOMER", "GENERATED_MODE_PARTNER"):', '"GENERATED_MODE_CUSTOMER"):')),
    ("generated-mode-registry", "brand stem removed from the registry", jedit("assets/asset-roles.json", lambda d: d["sourceBrand"]["brand"]["stems"].remove("vault"))),
    ("generated-mode-registry", "source domain removed from the registry", jedit("assets/asset-roles.json", lambda d: d["sourceBrand"]["urls"]["domains"].remove("usevault.ai"))),
    ("generated-mode-registry", "copy hashes emptied", jedit("assets/source-copy-hashes.json", lambda d: d.__setitem__("copyShingles", d["copyShingles"][:10]))),
    ("generated-mode-registry", "people patterns emptied", jedit("assets/asset-roles.json", lambda d: d["sourceBrand"]["people"].__setitem__("patterns", []))),
    ("asset-roles", "convention role enforced by a rule that does not exist", jedit("assets/asset-roles.json", lambda d: d["roles"]["original-copy"].__setitem__("enforcedBy", ["GENERATED_MODE_NOPE"]))),
    # ---- R3 availability pins
    ("availability-pin", "registry availability loosened (brand-mark generation-safe)", jedit("assets/asset-roles.json", lambda d: d["roles"]["brand-mark"].__setitem__("availability", "generation-safe"))),
    ("availability-pin", "blocked role moved to reference-only", jedit("assets/asset-roles.json", lambda d: d["roles"]["third-party-logo"].__setitem__("availability", "reference-only"))),
    ("availability-pin", "pin removed from the validator only", tedit("schema/semantic_validate.py", '    "brand-mark": "reference-only",\n', "")),
    ("availability-pin", "registry + validator flipped together (verify literal still holds)", both(jedit("assets/asset-roles.json", lambda d: d["roles"]["product-screenshot"].__setitem__("availability", "generation-safe")), tedit("schema/semantic_validate.py", '"product-screenshot": "reference-only"', '"product-screenshot": "generation-safe"'))),
    ("availability-pin", "substitute list emptied", jedit("assets/asset-roles.json", lambda d: d["roles"]["product-animation"].__setitem__("generationSafeSubstitutes", []))),
    ("availability-pin", "allowlist generation-safe roles drift", jedit("tokens/llm/component-allowlist.json", lambda d: d["generationSafeAssetRoles"].append("brand-mark"))),
    ("availability-pin", "section generatedAssetRoles lists a reference-only role", jedit("sections/chrome.navbar.json", lambda d: d["generatedAssetRoles"].append("brand-mark"))),
    # ---- R7 provenance / taxonomy
    ("section-contracts", "semantic.id drifts from the contract id", jedit("sections/hero.pricing-plans.json", lambda d: d["semantic"].__setitem__("id", "hero.pricing"))),
    ("section-contracts", "closed contract schema gets an extra field", jedit("sections/support.faq-accordion.json", lambda d: d.__setitem__("aiHint", "x"))),
    ("section-contracts", "source range moved off its tag", both(write_file("../fake-source/src/probe/Probe.jsx", "export default function P() {\n  return (\n    <section>\n    </section>\n  )\n}\n"), probe_source("2-4", "section"))),
    ("section-contracts", "source range past end of file", both(write_file("../fake-source/src/probe/Probe.jsx", "export default function P() {\n  return (\n    <section>\n    </section>\n  )\n}\n"), probe_source("3-40", "section"))),
    ("section-contracts", "lead-form modal re-classed as CONTENT", jedit("sections/forms.partner-popup.json", lambda d: (d.__setitem__("category", "CONTENT"), d["semantic"].__setitem__("category", "CONTENT")))),
    ("section-contracts", "CTA in FEATURES without justification", jedit("sections/features.showcase-security.json", lambda d: d.pop("inlineCtaJustification"))),
    # ---- R8 retrieval pins
    ("retrieval-pin", "modal contract flipped eligible", jedit("sections/forms.partner-popup.json", lambda d: (d.__setitem__("retrievalEligible", True), d.pop("retrievalReason")))),
    ("retrieval-pin", "contract + allowlist flipped together", both(jedit("sections/forms.partner-popup.json", lambda d: (d.__setitem__("retrievalEligible", True), d.pop("retrievalReason"))), jedit("tokens/llm/component-allowlist.json", lambda d: d.__setitem__("retrievalIneligibleSections", [])))),
    ("retrieval-pin", "pin removed from the validator only", tedit("schema/semantic_validate.py", 'RETRIEVAL_INELIGIBLE = {"forms.partner-popup"}', "RETRIEVAL_INELIGIBLE = set()")),
    ("retrieval-pin", "content section marked ineligible", jedit("sections/features.product-grid.json", lambda d: (d.__setitem__("retrievalEligible", False), d.__setitem__("retrievalReason", "Pretending this content section is runtime UI.")))),
    ("retrieval-pin", "node-level retrievalEligible removed from the schema", jedit("schema/pagespec.schema.json", lambda d: d["definitions"]["node"]["properties"]["retrievalEligible"].__setitem__("type", "string"))),
    # ---- R9 wrapper gate
    ("wrapper-gate", "HERO threshold loosened in code", tedit("extraction/wrapper_gate.py", "HERO_FAIL_PX = 3000", "HERO_FAIL_PX = 9000")),
    ("wrapper-gate", "share threshold loosened in code", tedit("extraction/wrapper_gate.py", "SHARE_FAIL_PCT = 60.0", "SHARE_FAIL_PCT = 95.0")),
    ("wrapper-gate", "HERO measured at 3100px", grow("/", "hero.home-dashboard", 3100)),
    ("wrapper-gate", "whole-page legal article re-created", heights(merge_legal)),
    ("wrapper-gate", "route measurement missing", heights(lambda h: h["routes"].pop("/pricing"))),
    ("wrapper-gate", "measured at the wrong viewport", heights(lambda h: h["viewport"].__setitem__("width", 1280))),
    ("wrapper-gate", "whitelist entry without justification", both(grow("/", "hero.home-dashboard", 3100), jedit("extraction/wrapper-whitelist.json", lambda d: d["entries"].append({"route": "/", "section": "hero.home-dashboard", "rules": ["HERO_HEIGHT_FAIL"], "maxHeightPx": 3200, "justification": "tall", "reviewedBy": "probe (agent attestation, not a human sign-off)", "attestation": "agent", "reviewedOn": "2026-10-29"})))),
    ("wrapper-gate", "stale whitelist entry", jedit("extraction/wrapper-whitelist.json", lambda d: d["entries"].append({"route": "/", "section": "hero.home-dashboard", "rules": ["HERO_HEIGHT_FAIL"], "maxHeightPx": 3200, "justification": "Probe entry for a hero that is not actually tall.", "reviewedBy": "probe (agent attestation, not a human sign-off)", "attestation": "agent", "reviewedOn": "2026-10-29"}))),
    ("manifest-counts", "measured route count hand-bumped", jedit("registry.manifest.json", lambda d: d["counts"].__setitem__("measuredRoutes", 18))),
]


def run_verify(root, source_root):
    p = subprocess.run([sys.executable, os.path.join(root, "extraction", "verify_all.py"), "--source-root", source_root], capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


def real_source_case(tmp):
    """The registry must be re-derived from the REAL source: a scratch copy placed beside links to the real project
    files, with one hash dropped (still above the pinned minimum), must fail generated-mode-registry."""
    project = os.path.dirname(REPO)
    if not os.path.isdir(os.path.join(project, "src")):
        print("[SKIP]   generated-mode-registry: registry out of date vs the real src/ (no sibling source tree)")
        return 0, 0
    case = os.path.join(tmp, "real-source-case")
    os.makedirs(case)
    for name in os.listdir(project):
        if name not in ("design-repo", "node_modules", ".git"):
            os.symlink(os.path.join(project, name), os.path.join(case, name))
    root = os.path.join(case, "design-repo")
    shutil.copytree(REPO, root, ignore=shutil.ignore_patterns("__pycache__"))
    jedit("assets/source-copy-hashes.json", lambda d: d["copyShingles"].pop())(root)
    code, out = run_verify(root, case)
    caught = code != 0 and "FAIL  [generated-mode-registry]" in out and "OUT OF DATE" in out
    line = next((ln for ln in out.splitlines() if ln.startswith("FAIL  [generated-mode-registry]")), "")
    print(f"[{'CAUGHT' if caught else 'MISSED'}] generated-mode-registry: registry out of date vs the real src/" + (f"\n         {line[:150]}" if caught else f" (exit {code})"))
    return 1, 0 if caught else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scratch", help="directory for the scratch copies (kept); default: a temp dir that is removed")
    a = ap.parse_args()
    if a.scratch:
        os.makedirs(a.scratch, exist_ok=True)
        tmp = tempfile.mkdtemp(prefix="prove-drift-", dir=a.scratch)
    else:
        tmp = tempfile.mkdtemp(prefix="prove-drift-")
    fake_src = os.path.join(tmp, "fake-source")
    os.makedirs(fake_src)
    open(os.path.join(fake_src, "PROBE.md"), "w").write("alpha\nbeta\n")
    fails = 0
    try:
        for i, (check, label, mutate) in enumerate(CASES):
            root = os.path.join(tmp, f"case{i}", "design-repo")
            shutil.copytree(REPO, root, ignore=shutil.ignore_patterns("__pycache__"))
            os.makedirs(os.path.join(tmp, f"case{i}", "fake-source"), exist_ok=True)
            open(os.path.join(tmp, f"case{i}", "fake-source", "PROBE.md"), "w").write("alpha\nbeta\n")
            mutate(root)
            code, out = run_verify(root, os.path.join(tmp, f"case{i}", "fake-source"))
            caught = code != 0 and f"FAIL  [{check}]" in out
            fails += not caught
            line = next((ln for ln in out.splitlines() if ln.startswith(f"FAIL  [{check}]")), "")
            print(f"[{'CAUGHT' if caught else 'MISSED'}] {check}: {label}" + (f"\n         {line[:150]}" if caught else f" (exit {code})"))
        n_real, f_real = real_source_case(tmp)
        fails += f_real
        code, out = run_verify(REPO, os.path.dirname(REPO))
        ok = code == 0
        fails += not ok
        print(f"[{'PASS' if ok else 'FAIL'}] unmodified repo passes verify_all.py (exit {code})")
    finally:
        if not a.scratch:
            shutil.rmtree(tmp, ignore_errors=True)
    total = len(CASES) + n_real + 1
    print(f"\n{total - fails}/{total} drift probes behaved as required")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

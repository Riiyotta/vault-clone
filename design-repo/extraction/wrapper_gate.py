#!/usr/bin/env python3
"""Whole-page-wrapper quality gate (a check of extraction/verify_all.py; also runnable alone).

A section contract must describe ONE part of a page, never a whole page or article. The gate reads the rendered heights
recorded at 1440px for EVERY route in extraction/measured-values.json -> sectionHeights (written by the optional
extraction/measure_sections.mjs) and the reviewed exceptions in extraction/wrapper-whitelist.json.

  HERO_HEIGHT_WARN          warn   a section whose contract semantic.category is HERO is taller than 1800px
  HERO_HEIGHT_FAIL          error  ... taller than 3000px, unless a valid whitelist entry covers it (then a warning)
  SECTION_SHARE_WARN        warn   one in-flow, non-CHROME section holds > 50% of its page's document height
  SECTION_SHARE_FAIL        error  ... > 60%, unless whitelisted (then a warning). Pages with fewer than 3 in-flow
                                   sections in total are skipped (reported as INFO, never silently). CHROME sections
                                   count toward that minimum but are never share candidates, so a page that is
                                   navbar + frame + ONE body section + footer is still judged (the old whole-page
                                   legal article held 88% of /terms and is caught).
  MEASUREMENT_MISSING       error  a route, a required template node or a section contract has no usable measurement,
                                   or a measurement names a section/route that does not exist (stale)
  MEASUREMENT_VIEWPORT      error  measured at a viewport width other than 1440px
  MEASUREMENT_INCONSISTENT  error  in-flow heights do not add up to the page's document height (+-1%), a measured
                                   route is bound to the wrong template, or a node repeats that is not repeatable
  WHITELIST_INVALID         error  malformed entry: needs route, section, rules, maxHeightPx (above the measured
                                   height), justification (30+ chars), reviewedBy, attestation ('agent'|'human'),
                                   reviewedOn; an agent attestation must say "agent attestation, not a human sign-off"
  WHITELIST_STALE           error  an entry that exempts nothing (or whose cap the measurement now exceeds)

Fixed/absolute elements (the lead-form modal) take no page height and are excluded from the share and the sum.
The thresholds are pinned HERE and are not read from any data file.

Usage:  python3 extraction/wrapper_gate.py [--root <design-repo dir>]      (exit 1 on any error)
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

HERO_WARN_PX = 1800
HERO_FAIL_PX = 3000
SHARE_WARN_PCT = 50.0
SHARE_FAIL_PCT = 60.0
MIN_SECTIONS = 3
VIEWPORT_WIDTH = 1440
SUM_TOLERANCE = 0.01
MIN_JUSTIFICATION = 30
WHITELISTABLE = {"HERO_HEIGHT_FAIL", "SECTION_SHARE_FAIL"}
AGENT_PHRASE = "agent attestation, not a human sign-off"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _j(root, rel):
    with open(os.path.join(root, rel), encoding="utf-8") as f:
        return json.load(f)


def load_inputs(root=None):
    root = root or ROOT
    contracts = {}
    for fn in sorted(os.listdir(os.path.join(root, "sections"))):
        if fn.endswith(".json"):
            c = _j(root, "sections/" + fn)
            contracts[c["id"]] = c
    return (_j(root, "templates/templates.json")["templates"], _j(root, "templates/routes.json")["routes"], contracts,
            _j(root, "extraction/measured-values.json").get("sectionHeights"), _j(root, "extraction/wrapper-whitelist.json").get("entries", []))


def _num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def evaluate(templates, routes, contracts, heights, whitelist):
    """Returns (errors, warnings, info); errors/warnings are (code, message) tuples."""
    errors, warnings, info = [], [], []
    cat = {sid: (c.get("semantic") or {}).get("category") for sid, c in contracts.items()}

    # ---- whitelist validity
    allowed = {}
    for i, w in enumerate(whitelist or []):
        where = f"whitelist[{i}]"
        need = {"route", "section", "rules", "maxHeightPx", "justification", "reviewedBy", "attestation", "reviewedOn"}
        if not isinstance(w, dict) or not need <= set(w):
            errors.append(("WHITELIST_INVALID", f"{where} needs {sorted(need)}"))
            continue
        bad = []
        if not w["rules"] or not set(w["rules"]) <= WHITELISTABLE:
            bad.append(f"rules must be a non-empty subset of {sorted(WHITELISTABLE)}")
        if not _num(w["maxHeightPx"]) or w["maxHeightPx"] <= 0:
            bad.append("maxHeightPx must be a positive cap")
        if not isinstance(w["justification"], str) or len(w["justification"].strip()) < MIN_JUSTIFICATION:
            bad.append(f"justification must be {MIN_JUSTIFICATION}+ characters")
        if w["attestation"] not in ("agent", "human"):
            bad.append("attestation must be 'agent' or 'human'")
        elif w["attestation"] == "agent" and AGENT_PHRASE not in str(w["reviewedBy"]):
            bad.append(f"an agent reviewer must say '{AGENT_PHRASE}' in reviewedBy")
        if not isinstance(w["reviewedBy"], str) or len(w["reviewedBy"]) < 3:
            bad.append("reviewedBy is required")
        if not isinstance(w["reviewedOn"], str) or not DATE_RE.match(w["reviewedOn"]):
            bad.append("reviewedOn must be YYYY-MM-DD")
        if bad:
            errors.append(("WHITELIST_INVALID", f"{where} ({w.get('route')} {w.get('section')}): " + "; ".join(bad)))
            continue
        allowed[(w["route"], w["section"])] = w
    used = set()

    # ---- measurements present and sane
    if not isinstance(heights, dict) or not isinstance(heights.get("routes"), dict) or not heights["routes"]:
        errors.append(("MEASUREMENT_MISSING", "no sectionHeights.routes in extraction/measured-values.json (run extraction/measure_sections.mjs --write)"))
        return errors, warnings, info
    if (heights.get("viewport") or {}).get("width") != VIEWPORT_WIDTH:
        errors.append(("MEASUREMENT_VIEWPORT", f"measured at viewport width {(heights.get('viewport') or {}).get('width')!r}; the gate requires {VIEWPORT_WIDTH}"))
    measured = heights["routes"]
    route_tpl = {r["path"]: r["template"] for r in routes}
    for p in route_tpl:
        if p not in measured:
            errors.append(("MEASUREMENT_MISSING", f"route {p} ({route_tpl[p]}) has no measurement"))
    for p in measured:
        if p not in route_tpl:
            errors.append(("MEASUREMENT_MISSING", f"measurement for {p} matches no route in templates/routes.json (stale)"))
    seen_sections = set()
    for p, m in measured.items():
        tid = route_tpl.get(p)
        if tid is None:
            continue
        if m.get("template") != tid:
            errors.append(("MEASUREMENT_INCONSISTENT", f"{p}: measured as {m.get('template')} but bound to {tid}"))
        tpl = templates[tid]
        tnodes = {n["section"]: n for n in tpl["nodes"]}
        secs = m.get("sections") or []
        usable = []
        for s in secs:
            sid = s.get("section") if isinstance(s, dict) else None
            if sid not in tnodes:
                errors.append(("MEASUREMENT_MISSING", f"{p}: measured section {sid!r} is not a node of {tid} (stale)"))
                continue
            if not _num(s.get("heightPx")) or s["heightPx"] <= 0 or not isinstance(s.get("inFlow"), bool):
                errors.append(("MEASUREMENT_MISSING", f"{p}: {sid} has no usable measurement (heightPx > 0 and boolean inFlow required)"))
                continue
            usable.append(s)
            seen_sections.add(sid)
        for sid, n in tnodes.items():
            c = sum(1 for s in usable if s["section"] == sid)
            if n["required"] and c == 0:
                errors.append(("MEASUREMENT_MISSING", f"{p}: required node {sid} of {tid} has no measurement"))
            if not n["repeatable"] and c > 1:
                errors.append(("MEASUREMENT_INCONSISTENT", f"{p}: {sid} measured {c} times but is not repeatable in {tid}"))
        ph = m.get("pageHeight")
        inflow = [s for s in usable if s["inFlow"]]
        total = sum(s["heightPx"] for s in inflow)
        if not _num(ph) or ph <= 0 or abs(total - ph) > SUM_TOLERANCE * ph:
            errors.append(("MEASUREMENT_INCONSISTENT", f"{p}: in-flow heights add up to {total:.1f} but pageHeight is {ph!r} (tolerance {SUM_TOLERANCE:.0%})"))
            continue

        def judge(code, sid, msg, hpx):
            w = allowed.get((p, sid))
            if w and code in w["rules"] and hpx <= w["maxHeightPx"]:
                used.add((p, sid))
                warnings.append((code + "_WHITELISTED", f"{msg} (exempted by {w['reviewedBy']}, cap {w['maxHeightPx']}px)"))
            else:
                errors.append((code, msg))

        for s in usable:
            if cat.get(s["section"]) == "HERO":
                h = s["heightPx"]
                if h > HERO_FAIL_PX:
                    judge("HERO_HEIGHT_FAIL", s["section"], f"{p}: {s['section']} is classed HERO but is {h:.0f}px tall (> {HERO_FAIL_PX}): a page wrapper, not a hero", h)
                elif h > HERO_WARN_PX:
                    warnings.append(("HERO_HEIGHT_WARN", f"{p}: {s['section']} is classed HERO and {h:.0f}px tall (> {HERO_WARN_PX})"))
        cands = [s for s in inflow if cat.get(s["section"]) != "CHROME"]
        if len(inflow) < MIN_SECTIONS:
            info.append(f"{p}: share rule skipped ({len(inflow)} in-flow section(s), need {MIN_SECTIONS})")
            continue
        for s in cands:
            pct = 100.0 * s["heightPx"] / ph
            if pct > SHARE_FAIL_PCT:
                judge("SECTION_SHARE_FAIL", s["section"], f"{p}: {s['section']} holds {pct:.0f}% of the page height (> {SHARE_FAIL_PCT:.0f}%): decompose it", s["heightPx"])
            elif pct > SHARE_WARN_PCT:
                warnings.append(("SECTION_SHARE_WARN", f"{p}: {s['section']} holds {pct:.0f}% of the page height (> {SHARE_WARN_PCT:.0f}%)"))
    for sid in sorted(set(contracts) - seen_sections):
        errors.append(("MEASUREMENT_MISSING", f"section contract {sid} is measured on no route"))
    for k in sorted(set(allowed) - used):
        errors.append(("WHITELIST_STALE", f"whitelist entry {k[0]} {k[1]} exempts nothing at its measured height (remove it or re-review)"))
    return errors, warnings, info


def main(argv):
    root = argv[argv.index("--root") + 1] if "--root" in argv else ROOT
    errs, warns, info = evaluate(*load_inputs(root))
    for c, m in errs:
        print(f"ERROR {c}: {m}")
    for c, m in warns:
        print(f"WARN  {c}: {m}")
    for m in info:
        print(f"INFO  {m}")
    print(f"wrapper_gate: {len(errs)} error(s), {len(warns)} warning(s)")
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

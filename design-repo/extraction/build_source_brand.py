#!/usr/bin/env python3
"""Derive the source-identity registry that a `mode: "generated"` PageSpec must not contain.

Writes
  assets/asset-roles.json  -> "sourceBrand"     (brand / URL / endpoint / person / customer / partner patterns,
                                                 derivation notes, evidence ids, counts)
  assets/source-copy-hashes.json                (SHA-256 prefixes of source copy shingles, source CTA strings and
                                                 proprietary source media file stems)

Nothing is invented: every entry is read from the clone project beside this folder: src/ (i18n string tables, JSX,
URL literals, mock data), CLONE_SPEC*.md and ASSET_MANIFEST*.md (measured copy, endpoints, third-party widgets),
public/ and recon/ (media file names) and the saved original page's *_files folder. Copy, CTA strings and file stems
are stored as HASHES, never as text, so this folder does not become a second copy of the source's marketing copy.
Names, hosts and paths are stored as readable patterns because a pattern nobody can read cannot be reviewed.

NO HUMAN HAS REVIEWED THE DERIVED LISTS. They are heuristics over the clone's own files (see each `derivation`).
Matching is string-based (normalised text + regular expressions + hashed word shingles); paraphrase, translation into
a third language or an image of the text is NOT detected. The minimum content is pinned in extraction/verify_all.py,
and `--check` re-derives everything and fails when the stored registry is out of date.

Run (from anywhere):  python3 extraction/build_source_brand.py [--check]
Without the sibling src/ tree (a standalone copy) it prints a notice and exits 0.
"""
import json
import os
import re
import sys

DR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(DR, "schema"))
import textnorm as T  # noqa: E402

PROJECT = os.path.dirname(DR)
SRC = os.path.join(PROJECT, "src")
ROLES = os.path.join(DR, "assets", "asset-roles.json")
HASHES = os.path.join(DR, "assets", "source-copy-hashes.json")
SHINGLE_N = 5
MIN_STRING_WORDS = 5
MEDIA_EXT = (".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg", ".lottie", ".json", ".mp4", ".webm", ".ico")
# Hosts that are not an identity of the source: XML/SVG namespace, the font CDN the original used, the licence page.
IGNORED_HOSTS = {"www.w3.org", "cdnjs.cloudflare.com", "creativecommons.org"}
# Shared platforms: only the source's own profile PATH is an identity, never the platform host.
SHARED_PLATFORM_HOSTS = {"www.linkedin.com", "linkedin.com", "t.me"}
# CTA strings the source uses that are generic UI verbs any product uses. Reviewed by the agent that built this
# registry (agent attestation, NOT a human sign-off). Every other source CTA string is blocked verbatim.
GENERIC_CTA = {"get started", "contact us", "learn more", "talk to us", "send request", "send", "copy", "copied", "import",
               "close", "or", "почати", "зв'язатися з нами", "дізнатися більше", "напишіть нам", "надіслати запит", "надіслати заявку", "детальніше",
               "надіслати", "копіювати", "скопійовано", "імпортувати", "закрити", "або"}
CTA_KEYS = re.compile(r"^(cta|submit|getStarted|startTrial|contact|learnMore|action|send|copy|copied)$")
STR_RE = re.compile(r"""(?P<q>['"`])(?P<t>(?:\\.|(?!(?P=q)).)*)(?P=q)""", re.S)
KEYED_STR_RE = re.compile(r"""\b(?P<k>[A-Za-z_]\w*):\s*(?P<q>['"`])(?P<t>(?:\\.|(?!(?P=q)).)*)(?P=q)""")
JSX_TEXT_RE = re.compile(r">([^<>{}]+)<")
URL_RE = re.compile(r"https?://[A-Za-z0-9./_?=&%#:@~+-]+")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})\b")
ENDPOINT_RE = re.compile(r"`(?:POST|GET|PUT|PATCH)\s+(/[A-Za-z0-9/_-]+)`")
CODEY = re.compile(r"[{}=;<>\\]|=>|\$\{|https?://|\.(png|svg|webp|jpg|jpeg|mp4|css|jsx?|lottie|json)\b")
TW = {"flex", "items", "center", "px", "py", "rounded", "text", "bg", "grid", "gap", "mt", "mb", "md", "lg", "xl", "w", "h", "border"}


def read(p):
    return open(p, encoding="utf-8", errors="replace").read()


def rel(p):
    return os.path.relpath(p, PROJECT).replace(os.sep, "/")


def src_files(exts=(".js", ".jsx")):
    out = []
    for root, _, fs in os.walk(SRC):
        out += [os.path.join(root, f) for f in fs if f.endswith(exts)]
    return sorted(out)


def spec_files():
    return sorted(os.path.join(PROJECT, f) for f in os.listdir(PROJECT) if re.match(r"(CLONE_SPEC|ASSET_MANIFEST).*\.md$", f))


def unesc(s):
    return s.replace("\\'", "'").replace('\\"', '"').replace("\\n", " ").replace("\\u00a0", " ").replace("\\\\", "\\")


def is_copy(c):
    if CODEY.search(c) or "placeholder" in c.lower():  # clone-authored placeholder text is not source copy
        return False
    w = T.words(re.sub(r"<[^>]*>", " ", c))
    if len(w) < MIN_STRING_WORDS:
        return False
    if sum(1 for x in w if x in TW) >= 3:
        return False
    alpha = sum(1 for x in w if re.fullmatch(r"[^\W\d_]+(?:'[^\W\d_]+)*", x))
    return alpha / len(w) >= 0.7


def copy_strings():
    out = []
    for p in src_files():
        t = read(p)
        for c in [m.group("t") for m in STR_RE.finditer(t)] + [m.group(1) for m in JSX_TEXT_RE.finditer(t)]:
            c = unesc(c).strip()
            if is_copy(c):
                out.append(T.words(re.sub(r"<[^>]*>", " ", c)))
    for p in spec_files():
        t = read(p)
        cands = re.findall(r'"([^"\n]{20,})"', t) + re.findall(r"“([^”\n]{20,})”", t)
        cands += [cell.strip() for line in t.splitlines() if line.startswith("|") for cell in line.split("|")]
        for c in cands:
            c = c.strip().strip("`")
            if is_copy(c):
                out.append(T.words(c))
    return out


def shingles(strings):
    s = set()
    for w in strings:
        for i in range(len(w) - SHINGLE_N + 1):
            s.add(T.h16(" ".join(w[i:i + SHINGLE_N])))
    return sorted(s)


def i18n_tables():
    return [p for p in src_files() if os.path.basename(os.path.dirname(p)) == "i18n" and re.match(r"[a-z]{2}\.js$", os.path.basename(p))]


def cta_strings():
    found, blocked = set(), set()
    for p in i18n_tables():
        for m in KEYED_STR_RE.finditer(read(p)):
            if CTA_KEYS.match(m.group("k")):
                v = T.norm(unesc(m.group("t"))).casefold()
                if v and len(v.split()) <= 6 and "<" not in v and "@" not in v:
                    found.add(v)
    for v in found:
        if v not in GENERIC_CTA:
            blocked.add(v)
    return sorted(found), sorted(blocked)


def brand_identity():
    """The source's product name (head title of the home page), its legal entity, and the stems they share with hosts."""
    en = read(os.path.join(SRC, "i18n", "en.js"))
    m = re.search(r"twitterTitle:\s*'([^']+)'", en)
    assert m, "twitterTitle not found in src/i18n/en.js"
    product = m.group(1)
    entities = sorted(set(re.findall(r"\b([A-Z][a-z]+ (?:Limited|Ltd|Inc|LLC|GmbH))\b", " ".join(read(p) for p in src_files()))))
    stems = sorted({product.split()[0].casefold()} | {e.split()[0].casefold() for e in entities})
    variants = set()
    blob = "\n".join(read(p) for p in src_files() + spec_files())
    for s in stems:
        variants |= {v.casefold() for v in re.findall(r"[A-Za-z0-9_.-]*" + s + r"[A-Za-z0-9_-]*", blob, re.I)}
    return product, entities, stems, sorted(variants)


def hosts_paths_emails(stems):
    hosts, paths, emails = set(), set(), set()
    files = src_files() + spec_files()
    for p in files:
        t = read(p)
        for u in URL_RE.findall(t):
            mm = re.match(r"https?://([^/?#]+)(/[^?#)\s`'\"]*)?", u)
            host, path = mm.group(1).lower(), (mm.group(2) or "").rstrip("/.")
            if host in IGNORED_HOSTS:
                continue
            if host in SHARED_PLATFORM_HOSTS:
                if path:
                    paths.add(host.replace("www.", "") + path.lower())
            else:
                hosts.add(host)
        for d in EMAIL_RE.findall(t):
            emails.add(d.lower())
    # registrable domain of every host that carries a brand stem -> block the domain and all of its subdomains
    domains = set()
    for h in hosts | emails:
        parts = h.split(".")
        reg = ".".join(parts[-2:])
        if any(s in reg for s in stems):
            domains.add(reg)
        else:
            domains.add(h)
    endpoints = set()
    for p in spec_files():
        endpoints |= set(ENDPOINT_RE.findall(read(p)))
    return sorted(domains), sorted(paths), sorted(emails), sorted(endpoints)


def mock_customers():
    """Company names the source renders inside its product mocks (workspace / referral rows)."""
    names = set()
    for p in src_files((".jsx",)):
        t = read(p)
        names |= set(re.findall(r'\btitle="([A-Z][^"]{2,40})"', t))
        names |= set(re.findall(r"\['[A-Z]{2}',\s*'([A-Z][^']{2,40})'\]", t))
    spec = "\n".join(read(p) for p in spec_files())
    return sorted(n for n in names if n in spec)  # keep only names the measured spec also records on the original


def people(stems):
    names = set()
    for p in src_files() + spec_files():
        for m in re.finditer(r"(?:\(c\)|©)\s*\d{4}\s+([A-Z][\w'-]+(?:\s+[A-Z][\w'-]+)+)", read(p)):
            if not any(st in m.group(1).casefold() for st in stems):  # '(c) YEAR VAULT AI' is the brand, not a person
                names.add(m.group(1))
    return sorted(names)


def partners():
    names = set()
    for p in i18n_tables():
        names |= set(re.findall(r"providers like ([A-Z][A-Za-z0-9]+)", read(p)))
    for p in spec_files():
        names |= set(re.findall(r"\b([A-Z][a-z]+) (?:launcher|messenger|chat widget)\b", read(p)))
    return sorted(names)


def asset_stems(stems):
    out = set()
    roots = [os.path.join(PROJECT, "public", "assets", d) for d in ("img", "lottie", "favicon")] + [os.path.join(PROJECT, "recon")]
    roots += [os.path.join(PROJECT, d) for d in os.listdir(PROJECT) if d.endswith("_files") and os.path.isdir(os.path.join(PROJECT, d))]
    for base in roots:
        for root, _, fs in os.walk(base):
            for fn in fs:
                if fn.lower().endswith(MEDIA_EXT):
                    out.add(os.path.splitext(fn)[0].lower())
    for root, _, fs in os.walk(os.path.join(PROJECT, "public", "assets", "svg")):
        for fn in fs:
            st = os.path.splitext(fn)[0].lower()
            if any(s in st for s in stems):
                out.add(st)
    return sorted(out)


def name_pattern(n):
    parts = [re.escape(T.fold(x)) for x in n.split()]
    return r"(?<![\w])" + r"[\s._-]*".join(parts) + r"(?![\w])"


def build():
    product, entities, stems, variants = brand_identity()
    assert stems == ["overcode", "vault"], stems  # drift alarm: the source's identity changed, review before re-pinning
    domains, paths, emails, endpoints = hosts_paths_emails(stems)
    found_ctas, blocked_ctas = cta_strings()
    strings = copy_strings()
    customers, persons, partner_names = mock_customers(), people(stems), partners()
    reg = {
        "$comment": "GENERATED by extraction/build_source_brand.py from the clone's src/, CLONE_SPEC*.md, ASSET_MANIFEST*.md, public/ and recon/. NOT human-reviewed. Do not hand-edit; re-run the script (verify_all runs it with --check when the source tree is present).",
        "matching": "Applied only to `mode: generated` PageSpecs. Every human-readable string (id, route, meta, every content string incl. alt text, labels and hrefs; structural enum vocabulary excluded) is normalised with schema/textnorm.py (NFKC, zero-width removal, curly quotes -> straight, Latin look-alike folding) and matched case-insensitively. String-based detection: paraphrase or translation into another language is not detected.",
        "brand": {
            "rule": "GENERATED_MODE_BRAND",
            "productName": product,
            "legalEntities": entities,
            "stems": stems,
            "patterns": stems + [name_pattern(e) for e in entities],
            "squashedTokens": sorted({T.squash(product)} | {T.squash(e) for e in entities} | {d.split(".")[0] for d in domains if any(s in d for s in stems)}),
            "observedVariants": variants,
            "derivation": "productName = the home page twitterTitle in src/i18n/en.js; legalEntities = '<Name> Limited|Ltd|Inc|LLC' in src/ (the operator named in the legal meta descriptions, also the 'Built by' credit host); stems = first word of each, matched as SUBSTRINGS (so wordmark/file/handle spellings such as usevault, vault-ai, vault_ai, VAULT AI, VaultPro, overcode-wordmark are all caught; 'vaulted' is caught too, a deliberate false positive). squashedTokens are matched after removing every separator (V.a.u.l.t-A.I); they are the product name, the legal entity and the first label of each brand domain.",
            "evidence": ["ev.src.i18n-meta", "ev.src.footer-credit"],
        },
        "urls": {
            "rule": "GENERATED_MODE_URL",
            "domains": domains,
            "hostPatterns": [r"(?:[a-z0-9-]+\.)*" + re.escape(d) for d in domains],
            "pathPatterns": [re.escape(p) for p in paths],
            "emails": emails,
            "endpointPaths": endpoints,
            "endpointPatterns": [re.escape(e) + r"(?![\w/-])" for e in endpoints],
            "reservedHostSuffixes": [".example", ".invalid", "example.com", "example.org", "example.net"],
            "derivation": "http(s) URL literals and e-mail addresses in src/ and the specs (namespace/CDN/licence hosts ignored); a host whose registrable domain carries a brand stem is blocked with all subdomains (app./help./status./www.); shared platforms (linkedin.com, t.me) are blocked only on the source's own profile path; endpointPaths = `POST /path` form endpoints the specs record on the original.",
            "note": "Any other http(s) URL or e-mail host in a generated page's text is GENERATED_MODE_EXTERNAL_URL unless it is on a reserved .example/.invalid (or example.com/.org/.net) host. PageSpec href fields are additionally restricted by the schema.",
            "evidence": ["ev.src.footer-links", "ev.spec.pul.form-endpoint"],
        },
        "people": {
            "rule": "GENERATED_MODE_PERSON",
            "names": persons,
            "patterns": [name_pattern(n) for n in persons],
            "derivation": "'(c) YEAR Name' / '© YEAR Name' attributions in src/ and the specs (the country-list author credited in src/components/partners/countries.js). The source has no testimonials, team, founders or reviewer names, so this list is short; first names alone are not matched.",
            "evidence": ["ev.src.countries-credit"],
        },
        "customers": {
            "rule": "GENERATED_MODE_CUSTOMER",
            "names": customers,
            "patterns": [name_pattern(n) for n in customers],
            "derivation": "Company names the source renders in its partner-program mocks (ListItem title=\"...\" and ['XX', 'Name'] rows in src/components/partners/*.jsx), kept only when the measured spec records the same name on the original.",
            "evidence": ["ev.src.partner-mock-rows", "ev.spec.pul.mock-rows"],
        },
        "partners": {
            "rule": "GENERATED_MODE_PARTNER",
            "names": partner_names,
            "patterns": [name_pattern(n) for n in partner_names],
            "derivation": "Integration providers the source's copy names ('trusted providers like X' in src/i18n) and third-party widgets the specs record on the original ('X launcher/messenger'). A generated page is a different brand: it must not borrow the source's named partners/vendors.",
            "evidence": ["ev.src.i18n-providers", "ev.spec.home.third-party"],
        },
        "ctas": {
            "rule": "GENERATED_MODE_CTA",
            "file": "assets/source-copy-hashes.json",
            "sourceCtaStrings": len(found_ctas),
            "blockedCtaStrings": len(blocked_ctas),
            "genericExempt": sorted(GENERIC_CTA),
            "derivation": "Values of cta / submit / getStarted / startTrial / contact / learnMore keys in the src/i18n tables (EN + UK). Generic UI verbs in genericExempt (agent attestation, not a human sign-off) are allowed; every other source CTA string is rejected when a generated text equals it after normalisation, and any CTA-like text containing a brand stem is caught by GENERATED_MODE_BRAND.",
        },
        "copy": {
            "rule": "GENERATED_MODE_COPY",
            "file": "assets/source-copy-hashes.json",
            "shingleWords": SHINGLE_N,
            "minStringWords": MIN_STRING_WORDS,
            "sourceStrings": len(strings),
            "derivation": "String literals and JSX text in src/ (EN + UK i18n tables included) plus quoted strings and table cells in the specs, kept when they have 5+ words, are mostly alphabetic, are not code/class strings and are not clone-authored placeholder text. A generated text is rejected when any 5 consecutive normalised words hash to a source shingle.",
        },
        "assets": {
            "rule": "GENERATED_MODE_ASSET_REF",
            "file": "assets/source-copy-hashes.json",
            "derivation": "Lower-cased file stems of the proprietary media of the source: public/assets/img, public/assets/lottie, public/assets/favicon, recon/ screenshots, the saved original page's *_files media and every svg whose name carries a brand stem. Generic UI glyphs and the open Twemoji flag set are not included. A generated asset ref whose last segment equals one of these stems names a source file (screenshot / media reuse).",
        },
    }
    hashes = {
        "$comment": "GENERATED by extraction/build_source_brand.py. SHA-256 prefixes (16 hex) of normalised text only; no source text is stored.",
        "copyShingles": shingles(strings),
        "ctaStrings": sorted(T.h16(c) for c in blocked_ctas),
        "assetStems": sorted(T.h16(s) for s in asset_stems(stems)),
    }
    reg["counts"] = {"brandPatterns": len(reg["brand"]["patterns"]), "urlDomains": len(domains), "urlPaths": len(paths), "endpoints": len(endpoints),
                     "people": len(persons), "customers": len(customers), "partners": len(partner_names), "copyShingles": len(hashes["copyShingles"]),
                     "ctaStrings": len(hashes["ctaStrings"]), "assetStems": len(hashes["assetStems"])}
    return reg, hashes


def dump(d):
    return json.dumps(d, indent=2, ensure_ascii=False) + "\n"


def main():
    if not os.path.isdir(SRC):
        print("src/ is not beside design-repo/: source brand registry NOT rebuilt (standalone copy)")
        return 0
    reg, hashes = build()
    roles = json.load(open(ROLES, encoding="utf-8"))
    if "--check" in sys.argv:
        cur = open(HASHES, encoding="utf-8").read() if os.path.exists(HASHES) else ""
        ok = roles.get("sourceBrand") == reg and cur == dump(hashes)
        print("source brand registry up to date" if ok else "source brand registry OUT OF DATE (run extraction/build_source_brand.py)")
        return 0 if ok else 1
    roles["sourceBrand"] = reg
    open(ROLES, "w", encoding="utf-8").write(dump(roles))
    open(HASHES, "w", encoding="utf-8").write(dump(hashes))
    print("wrote sourceBrand", reg["counts"])
    return 0


if __name__ == "__main__":
    sys.exit(main())

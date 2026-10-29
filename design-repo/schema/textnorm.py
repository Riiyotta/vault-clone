"""Text normalisation shared by extraction/build_source_brand.py (which hashes the source) and
schema/semantic_validate.py (which checks a generated PageSpec), so both sides see the same words.

norm():   Unicode NFKC (folds full-width letters, ligatures, NBSP and other compatibility forms),
          zero-width / soft-hyphen / BOM characters removed, curly quotes -> straight quotes,
          dash variants -> '-', whitespace collapsed.
fold():   norm() + case-fold + Latin look-alike letters from other scripts (Cyrillic/Greek) mapped to
          Latin. Used for identity matching only (brand, URL, names), never for copy shingles.
words():  lower-cased word tokens of norm(); Unicode-aware, so Ukrainian copy is tokenised too.
squash(): fold() with every non-alphanumeric character removed ("V.a.u.l.t a i" -> "vaultai").
"""
import hashlib
import re
import unicodedata

ZERO_WIDTH = dict.fromkeys(map(ord, "​‌‍‎‏⁠⁡⁢⁣⁤﻿­᠎͏"), None)
QUOTES = {**{ord(c): "'" for c in "‘’‚‛′ʼʻ`´"},
          **{ord(c): '"' for c in "“”„‟″«»"}}
DASHES = {ord(c): "-" for c in "‐‑‒–—―−﹘﹣－"}
# Latin look-alikes (lower case; applied after casefold). Deliberately small: letters that render
# identically to a Latin letter in common UI fonts.
CONFUSABLES = {ord(k): v for k, v in {
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x",
    "і": "i", "ј": "j", "ѕ": "s", "ԁ": "d", "ӏ": "l", "ѵ": "v", "ԛ": "q",
    "ԝ": "w", "ο": "o", "α": "a", "ν": "v", "υ": "u", "ι": "i", "κ": "k",
    "ɡ": "g", "ı": "i",
}.items()}
WORD = re.compile(r"[^\W_]+(?:'[^\W_]+)*")


def norm(s):
    s = unicodedata.normalize("NFKC", s).translate(ZERO_WIDTH).translate(QUOTES).translate(DASHES)
    return re.sub(r"\s+", " ", s).strip()


def fold(s):
    return norm(s).casefold().translate(CONFUSABLES)


def words(s):
    return WORD.findall(norm(s).casefold())


def squash(s):
    return re.sub(r"[\W_]+", "", fold(s))


def h16(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]

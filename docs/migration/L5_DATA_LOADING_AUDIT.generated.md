# Lượt 5 · Data Loading Audit · Generated

This is a static entry-graph policy audit. It does not equate adapter catalog metadata with observed browser startup requests.
A browser/network regression remains the authoritative gate for actual startup payloads.

Large-file gate: **5 MB**.
Very-large gate: **20 MB**.

| Môn | JSON | Catalog | Declared initial | Optional | Entry scripts | Literal JSON fetches | Declared initial MB | Literal fetch MB | JSON >=5 MB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| ai | 7 | 0 | 0 | 0 | 2 | 0 | 0.00 | 0.00 | — |
| foundation | 7 | 0 | 0 | 0 | 2 | 0 | 0.00 | 0.00 | — |
| math | 86 | 58 | 52 | 6 | 21 | 0 | 10.17 | 0.00 | lessons.json (7.46 MB) |
| programming | 18 | 15 | 0 | 2 | 3 | 0 | 0.00 | 0.00 | — |
| research | 7 | 0 | 0 | 0 | 2 | 0 | 0.00 | 0.00 | — |
| russian | 17 | 14 | 0 | 3 | 4 | 0 | 0.00 | 0.00 | dialogue-bauman-az.json (33.43 MB)<br>deep-speaking-bauman.json (26.85 MB)<br>vocab.json (10.69 MB)<br>tests.json (7.56 MB)<br>speaking.json (7.00 MB) |
| signal | 7 | 0 | 0 | 0 | 2 | 0 | 0.00 | 0.00 | — |
| systems | 7 | 0 | 0 | 0 | 2 | 0 | 0.00 | 0.00 | — |

## Warnings

- math/lessons.json: large file is present in legacy initialDataFiles metadata, but no literal startup fetch was found in the current entry graph; treat metadata as catalog until runtime network regression proves otherwise
- programming/deep-speaking-bauman: optional/background source explicitly says lazy=false
- programming/speaking-link-index: optional/background source explicitly says lazy=false

## Failures

- None. Static entry-graph loading policy PASS.

# L23-H1 — Current Consumer Blueprint Materialization

Status: `PASS`

## Why this hardening round exists

B90 requires a current Consumer blueprint. L22 had admitted the Consumer contract/schema, but the historical executable Consumer path depended on quarantined registry/graph/manifest artifacts pinned to the old baseline.

Using the historical 381-plan catalog directly would therefore violate the current-track rule.

## Current source

The blueprint is rebuilt directly from the archived logical syllabus specification:

`recovery/roadmap-v2/historical-l27/roadmap_v2/spec/Bauman_Roadmap_V2_Syllabus_Luot18.md`

Pinned Git blob:

`fd1c3f179d66922faf6ac9363772f3d072851d00`

The historical generated registry is not an input.

## Deterministic result

- chapters: 85
- diagnostic-eligible chapter blueprints: 77
- static chapters: 76
- legacy-preserve chapters: 1
- dynamic chapters blocked: 8
- numbered lessons: 304
- diagnostic targets: 381
- unknown internal prerequisite refs: 0
- generated question items: 0
- executable diagnostic plans: 0

## Dynamic boundary

Dynamic chapters are:

- RU-R4-C09
- RU-R4-C10
- CUR-L4-C01 … CUR-L4-C06

They remain blocked with `DYNAMIC_INSTANCE_REQUIRED` until real syllabus/course instances exist.

## Safety

The builder is read-only and writes only to stdout. CI regenerates the blueprint and compares it byte-for-byte with the committed canonical artifact.


## Full gate evidence

- Roadmap V2 Current Gate — `35331798542` — PASS
- Foundation Domain Model — `35331798431` — PASS
- Windows checkout safety — `35331798483` — PASS
- Russian Reference UI — `35331798439` — PASS
- Cloudflare Preview — `35331798480` — PASS
- Whole System Integration — `35331798429` — PASS

L23-H1-F1 is incorporated and the current blueprint is accepted as B90 input.

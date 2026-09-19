# L24/B94 — Append-only Evidence Stream / Reducer Acceptance

Status: `PASS`

## Purpose

Validate the current Mastery evidence harness as an in-memory, append-only reducer.

No canonical Roadmap executable, manifest, event store or snapshot store is introduced.

## Required behavior

- strict evidence-event schema identity;
- known current target and Diagnostic plan required;
- sequence starts at 1 and is strictly monotonic;
- duplicate event IDs fail closed;
- stream ID, target and phase cannot drift inside one stream;
- payload values are range/type validated per evidence type;
- Diagnostic pass maps to `dat_prerequisite`, never directly to Master-ready;
- Diagnostic gap maps to `gap`;
- replay of identical events is byte/structure deterministic;
- returned snapshots are deeply frozen;
- `persisted` is always false.

## Negative coverage

B94 explicitly rejects:

- duplicate IDs;
- non-monotonic sequence;
- target drift;
- phase drift;
- invalid percentages;
- invalid exercise counts;
- Diagnostic claiming Master-ready;
- Diagnostic claiming persistence;
- unknown target;
- unknown evidence type.

## Write boundary

The validator snapshots all canonical Mastery/Consumer/Diagnostic source files before execution and requires byte-identical files afterward.

Canonical `roadmap_v2/mastery/mastery.mjs` and historical `manifest.json` remain absent.

B95 remains blocked until B94 and all six project gates pass.


## Gate evidence

Accepted B94 head: `af0edd1814527c8066eca81c5de9f29526f05832`

- Roadmap V2 Current Gate — run `35334427442` — PASS
- Foundation Domain Model — run `35334427401` — PASS
- Windows checkout safety — run `35334427410` — PASS
- Russian Reference UI — run `35334427408` — PASS
- Cloudflare Preview — run `35334427464` — PASS
- Whole System Integration — run `35334427411` — PASS

B94 is closed. B95 is now active.

# L7-B2 · Russian Universal Adapter

Status: implementation gate; PASS requires the generated regression report and remote CI.

## Decision

Russian remains owned by its existing specialist runtime. The L7-B2 adapter is a
read-only projection into Universal Lesson Contract v2, not a source rewrite and
not a replacement renderer.

The adapter preserves stable lesson IDs and source order, projects every source
slide to exactly one semantic block, and keeps dialogue, deep speaking, basic
speaking, handwriting, writing, assessment, simulation and speaking-link data as
specialist references. Large specialist datasets are never copied into the
Universal lesson payload.

## Safety boundaries

- `subjects/russian/data/lessons.json` stays authoritative and unchanged.
- Official Bauman metadata keeps `09.04.01`; personalized learner context keeps
  `09.04.01/11`.
- Projection is deterministic, offline-safe and contains no AI inference promoted
  as provided source.
- The existing Russian page, storage key, routes and specialist interactions are
  untouched by L7-B2.

## Gate

Run:

```sh
node --check assets/js/platform/universal-lesson/russian-universal-adapter-v1.js
node --check scripts/academic/l7-b2-russian-universal-adapter-regression.cjs
node scripts/academic/l7-b2-russian-universal-adapter-regression.cjs
git diff --exit-code -- docs/migration/L7_B2_RUSSIAN_UNIVERSAL_ADAPTER.generated.json
```

The regression must validate all 26 projections against the real Universal v2
schema, prove slide-count preservation, source immutability, stable locators,
specialist ownership, deterministic output and offline fallback.

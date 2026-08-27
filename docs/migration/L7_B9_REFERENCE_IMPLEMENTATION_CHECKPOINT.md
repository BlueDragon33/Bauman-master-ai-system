# L7-B9 · Official Reference Implementation Checkpoint

Status: implementation gate. The designation becomes accepted only after the
deterministic B9 gate and the sequential remote L7-B1 through B9 workflow pass.

## Decision

L7-B9 designates exactly two official, capability-specific references:

| Subject | Designation | Stable coverage | Reference responsibility |
|---|---|---:|---|
| Russian | `OFFICIAL_LANGUAGE_REFERENCE_IMPLEMENTATION` | 26 lessons · 1,138 source slides | Specialist language workspaces, read-only Universal projection, source-aligned Russian Twin, evidence/review shape, responsive explicit-pack QA |
| Math | `OFFICIAL_MATHEMATICS_REFERENCE_IMPLEMENTATION` | 347 legacy lessons + 18 reviewed overlays = 365 catalog lessons · 5,852 blocks | Authoritative source routing, typed mathematical representations, non-blocking downstream support graph, evidence/review shape, responsive explicit-pack QA |

“Official reference” means that later subject work must reuse the smallest
registered contract, capability, source-identity rule, evidence semantic or QA
expectation that fits its own lesson type. It does not make either subject a
monolithic page template.

## Downstream cross-reference

Subject Factory remains authoritative for each consumer's engine, route,
lesson types, widgets and offline policy.

| Later subject | Round | Own type profiles | Russian reference | Math `supports` review candidates |
|---|---:|---|---|---:|
| Programming | L8 | programming, database, software-design | 48 source-aligned terminology units; opt-in remains required | 1 domain · 2 targets |
| AI/Data | L9 | ml-data | Declared; reviewed source alignment still missing | 7 domains · 7 targets |
| Signal | L9 | ml-data, mathematics | Declared; reviewed source alignment still missing | 5 domains · 4 targets |
| Systems | L10 | asoiu-system, software-design | Declared; reviewed source alignment still missing | 7 domains · 2 targets |
| Research | L11 | research | Declared; reviewed source alignment still missing | 4 domains · 1 target |

Math links retain the B4 relation `supports`. They are not assessment-blocking
prerequisites and have no Master-ready effect until an objective binding is
reviewed. Missing Russian alignment leaves the downstream source lesson
unchanged.

## Non-copy boundary

Later subjects must keep their own source authority, engine, registered
widgets, storage namespace, learner state, evidence, score and assessment
authority. They may adopt typed contract patterns; they may not copy:

- the Russian or Math learner UI;
- source lessons, course identity or specialist runtime ownership;
- learner attempts, evidence, scores or storage namespaces;
- Russian language widgets outside the registered language type;
- Math prerequisite candidates as active gates without review.

Thus the checkpoint explicitly **không sao chép** UI/source/state. Russian and
Math remain specialist-owned, and their read-only adapters remain projections
rather than cutovers.

## Type-parity correction

The B9 preflight found stale Russian Twin type metadata. Foundation omitted
`programming`, Signal still used `asoiu-system`, and Systems omitted
`software-design`. The registry now mirrors Subject Factory exactly, and the
B3 gate checks every subject's allowed type vocabulary and default instead of
checking Programming alone. This correction changes no lesson source, runtime,
activation or learner state.

## Retained findings and claim limits

Official designation does not hide prior findings:

- `RUSSIAN_BUILD_APPLY_TARGET_ABSENT_IN_B2` remains a missing B2 target that
  B7 represents only as an empty hook; it is not learner evidence.
- Math retains `THEORY_OVERLAY_PARTIAL`, `EXTERNAL_BANKS_EMPTY` and
  `PREREQUISITES_SYSTEM_DERIVED`. The 18 overlays are not replacement coverage,
  external banks remain empty, and 341 prerequisite candidates remain
  inactive and review-required.
- `NO_LEARNER_EVIDENCE_IMPORTED` remains open by design across the reference
  catalog.

Foundation is
`SUPPORTING_PREPARATORY_BRIDGE_AND_SINGLE_REVIEWED_PILOT`, not an official
reference implementation. Its four B8 dispositions remain exact:

- `FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED`;
- `FOUNDATION_ASSESSMENT_NOT_MASTERY_QUALIFIED`;
- `FOUNDATION_SIMULATION_STAGE_DRIFT`;
- `FOUNDATION_B11_SINGLE_REFERENCE_SCOPE`.

The first three stay routed to
`L21_CONTENT_OPERATIONS_AND_CURRICULUM_GOVERNANCE`; the single
`foundation:f_s01_l1` pilot remains limited. B9 grants no academic content
approval, assessment qualification, learner completion, Master-ready state,
runtime cutover, Foundation promotion, whole-repository precache or merge to
`main`.

## Gate and evidence

Local deterministic gate:

```sh
node --check scripts/academic/l7-b9-reference-implementation-checkpoint-regression.cjs
node scripts/academic/l7-b9-reference-implementation-checkpoint-regression.cjs
```

The gate rechecks all committed L7-B1 through B8 reports, exact source counts,
Subject Factory parity, Russian Twin availability, Math downstream targets,
retained findings, evidence digests, claim boundaries and protection
mutations. It writes
`docs/migration/L7_B9_REFERENCE_IMPLEMENTATION_CHECKPOINT.generated.json`.

Remote B9 is deliberately placed after the B8 deterministic and browser steps
in the same workflow. A local run cannot manufacture a browser PASS. L7 is
complete only when both `migration/l7-b9-reference-implementation` and
`migration/l7-reference-subjects-complete` are remotely successful alongside
the current L6 and L5 progression gates.

## Rollback and L8 handoff

Rollback removes the B9 registry, gate, report, decision record and workflow
wiring, and can revert the B3 type-parity metadata correction. B1-B8 artifacts,
all subject source/runtime/state, Service Worker, offline policy and `main`
remain unchanged.

After the final remote progression gate passes, L8 Programming must consume
the registered Programming type profiles, its own specialist engine and the
two reference lanes above. Russian Twin availability is source-aligned for its
48 current lessons, while Math links remain non-blocking review candidates.

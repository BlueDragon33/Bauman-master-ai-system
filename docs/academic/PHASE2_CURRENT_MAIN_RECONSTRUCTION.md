# Academic Phase2 · Current-Main Reconstruction

Status: `A3_IMPLEMENTED · GATE_PENDING`

Baseline: `main@2be2db9ade895d4ec9ba21b0cf1143aef8635e13`

Historical evidence source: PR #38 / Pass14A–14H. The historical branch is not mergeable into current main because it has diverged heavily. This lane forward-ports only capabilities that remain valid against the current runtime.

## Invariants

- Preserve current Hub Reference Home V4 / Precision V5, Roadmap V4, Math, Russian Listen+Write, Foundation, Device Gate and current Academic Pass13 runtime.
- Do not merge historical Phase2 branch history.
- Do not infer semester-specific credits, hours or assessment timing for multi-semester items unless supported by an authoritative source.
- d01 `Иностранный язык` is owned by Л2 English; P0 Technical Russian must not replace or gate d01.
- P0 remains Russian academic/technical support for Russian-medium technical courses, NIR, pedagogy and VKR.
- Runtime/data layers remain read-only unless an existing current-main transaction boundary explicitly owns writes.
- No production deployment or automatic promotion is authorized by this reconstruction lane.

## Reconstruction sequence

1. **A1 · S1 semantic/data contract** — correct d01/P0 ownership, add exact 8-item Semester-1 course architecture, gate all invariants.
2. **A2 · Course Readiness** — forward-port a current-main read-only readiness projector with independent prerequisite/lifecycle/event axes.
3. **A3 · Event + Grade evidence** — add event-readiness and confirmed-grade ledgers without inferring course completion.
4. **A4 · Transcript / honors evidence** — isolate verified transcript evidence from event results and preserve denominator caveats.
5. **A5 · Academic Command Center** — compose lower layers read-only; no evidence ownership or scheduler mutation.
6. **A6 · Full integration / promotion audit** — current-main allowlist, browser regression, source/package/offline checks, no auto-deploy.

Any defect discovered inside a step uses `Ax-Fn`; any missing architecture required to complete that step uses `Ax-Hn`. A later step may open only after the predecessor gate is green.

## A1 implementation

- `assets/data/prerequisite-registry-iu5-2026.json`: d01 critical/support gates cleared and English/L2 ownership recorded.
- `assets/data/prerequisite-packs/p00-technical-russian.json`: d01 removed from P0 targets, explicit d01 exclusion and public Л2 evidence recorded without replacing current Russian content.
- `assets/data/course-learning-architecture-s1-2026.json`: exact Semester-1 set `d01,d02,d03,d04,d05,d06,d15,p02`; multi-semester allocation remains unresolved for d01/d15/p02.
- Validators enforce the separation and course-architecture integrity.
- Academic prerequisite CI invokes the new architecture validator.

A1 remains pending until the current branch passes its triggered gate set.


## A3 implementation

- `assets/js/academic-event-runtime.js`: user-scoped readiness evidence for resolved assessment events; unresolved multi-semester timing remains hard-locked.
- `assets/js/academic-grade-runtime.js`: explicit confirmed-result ledger backed by the locked BMSTU 2024 grading reference; no result is inferred from rehearsal evidence.
- Event and grade controls are exposed only through Course Readiness / Progress modal flow. A3 does not append a new Home ledger.
- Event evidence and grade results do not mutate scheduler entries or course lifecycle and never manufacture `COMPLETED`.
- Grade rows retain `supplementEntryVerified:false` and `supplementEntryCounted:null`; A4 transcript/honors bootstrap remains disabled.
- A3 browser/static gates cover timing locks, user isolation, 89/92 internal-target distinction, pass/fail credit, score/grade mismatch rejection, persistence, mobile layout, and Home-surface non-regression.

A3 remains pending until the current branch passes its triggered gate set.

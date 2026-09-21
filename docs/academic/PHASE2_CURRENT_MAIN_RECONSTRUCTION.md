# Academic Phase2 · Current-Main Reconstruction

Status: `A6_IMPLEMENTED · GATE_PENDING`

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

A3 gate passed on head `76a3182a3e83dbfffe80b20c52fb3bbea6b1878a` with Whole System, Windows checkout, Cloudflare Preview CI and Academic 2026 Prerequisite Gate all SUCCESS.

## A4 implementation

- `assets/js/academic-transcript-runtime.js`: user-scoped verified supplement-entry registry with separate discipline/elective/practice/GIA rows.
- Federal Order 670 rules remain the authoritative baseline; assessment events never auto-promote into diploma-supplement rows.
- The current 27-row / 22 grade-bearing / 17 grade-5 requirement remains explicitly a projection because IU5 local supplement mapping and any additional course-work rows are not yet verified.
- A4-F1 hardens honors evaluation so `finalEligibilityClaimed` cannot become true while the denominator/mapping caveat is active, even when the currently verified projected ledger satisfies federal honors rules.
- A4-H1 adds static and real browser acceptance for user isolation, 17/22 vs 16/22, blocking grade 3, credit-row exclusion, persistence, mobile layout, no Home ledger, and no scheduler/course-completion mutation.
- A4 remains read-only and does not bootstrap A5 automatically.

A4 initially exposed A4-F2 in the browser test harness: its mock device ID/CORS contract drifted from the current Device Gate, so the A4 browser job timed out before product runtime initialization. The mock was aligned to the validated 64-character device identity and current CORS contract; no A4 product semantics changed.

A4 gate passed on head `13c25203939b3cb5bf11b91cc6315c4a8ec36510`: Windows checkout, Cloudflare Preview CI, Academic 2026 Prerequisite Gate including A4 browser acceptance, and Whole System Integration Gate all SUCCESS.

## A5 implementation

- `assets/js/academic-command-center-runtime.js`: read-only decision-support orchestration over prerequisite/course readiness, event readiness, confirmed grade evidence, and transcript/honors evidence.
- Exact Semester-1 scope remains `d01,d02,d03,d04,d05,d06,d15,p02`; severity precedence keeps verified transcript blockers and confirmed assessment failures above lower-confidence readiness gaps.
- A5 does not write diagnostics, event evidence, grade results, transcript evidence, scheduler entries, or course-completion state.
- A5-H1 adapts the historical Pass14F idea to current-main UI ownership: **no Home injection**. The Command Center is lazy-loaded only from the existing Progress/Academic flow so Hub Reference Home V5 remains untouched.
- `assets/js/academic-transcript-runtime.js` exposes the lazy A5 asset bridge without automatic bootstrap; `assets/js/academic-course-runtime.js` exposes the explicit Progress action.
- Static and browser gates cover exact 8-course scope, decision precedence, read-only boundaries, honors projection caveat, user isolation, schedule non-mutation, mobile layout, and Home non-regression.

A5 gate passed on head `8068535b1f81c80061d9f935e350b00ab57b47c4`: Windows checkout, Cloudflare Preview CI, Academic 2026 Prerequisite Gate including A5 browser acceptance, and Whole System Integration Gate all SUCCESS.

## A6 implementation

- Added `assets/data/phase2-current-main-promotion-manifest-2026.json` as the exact current-main promotion allowlist. Historical PR #38 remains evidence/reference only and is not merge authority.
- Added `scripts/validate-phase2-current-main-integration-a6.js` to re-run A1–A5 semantic validators and assert cross-layer separation: d01 English ownership, unresolved multi-semester allocation, no fabricated completion, no event→grade→transcript auto-promotion, read-only Command Center, and complete browser coverage.
- Added `scripts/validate-phase2-current-main-promotion-a6.js` to compare `origin/main...HEAD` against the allowlist, reject deletions/unapproved paths, protect high-risk runtime/deployment boundaries, and require manual preview-only deployment policy.
- Academic CI now checks out full history for the promotion diff audit and runs both A6 validators before browser acceptance.
- A6 does not authorize merge or production deployment. The candidate remains `CANDIDATE_ONLY` until all triggered gates pass on the final head.

# Pass 13D · Scheduler Integration Preview

Status: `SCHEDULER_PREVIEW_VALIDATED_CI_PASS`

Validated branch: `temp/bauman-master-hub-prereq-2026`

Validated code/workflow head: `a8bfb9904d17d0f739a588f1688d9cd51a16466c`

GitHub Actions run: `34551868350` · SUCCESS

## Scope

Pass13D converts Pass13C Course Risk + Active Repair advice into a one-week schedule preview/diff without mutating the real Main schedule.

Runtime module: `assets/js/academic-scheduler-preview.js`

Safety policy:

- `APPLY_ENABLED=false`.
- Preview range is 7 days from the currently viewed schedule week.
- Maximum proposed changes per preview: 6.
- Existing entries with source `manual` or any unknown/external source are protected and cannot be proposed for replacement.
- Only empty slots or existing `auto` / `review` slots can appear as change candidates.
- `MASTERED`, `STOP_BROAD`, and `JIT_ONLY` gates are excluded from broad repair scheduling.
- `REPAIR_MATCHED` can appear only when a concrete repair route exists from failed-node evidence.
- Diagnostic / locate-failed-node actions may be proposed without inventing a repair route.
- A schedule fingerprint is captured when preview is generated. If Main schedule changes, the preview becomes stale.
- Exact originals for changed slots are captured as `rollbackBaseline` for a later apply/rollback implementation.
- Preview state is stored separately under `bauman_academic_2026_schedule_preview_v1`; it does not write `schedule.entries`.
- Pass13D does not call `autoSchedule()`.
- Apply remains locked until Browser/E2E regression acceptance passes in a later gate.

## UI

Home now receives a `Scheduler Integration Preview` panel after the Academic 2026 panels. The preview modal shows current value -> proposed value for every candidate diff, protected-slot counts, matched-repair counts, diagnostic/locate counts, excluded STOP gates, stale state, and the locked Apply control.

Responsive styles are included in `assets/css/academic-2026.css`.

## CI

Validator: `scripts/validate-scheduler-preview-13d.js`

The validator checks fail-closed Apply, absence of schedule mutation, absence of `autoSchedule()` invocation, load order after `academic-main.js`, manual/external protection, stable fingerprint behavior, stale detection prerequisites, STOP/JIT exclusion, repair-route evidence, rollback baseline markers, and preview CSS hooks.

Full Academic 2026 regression passed in run `34551868350`, including curriculum, coverage, P9/P6/P4/P7/P8/P10/P11/J1/P0, Pass13B, Pass13C, Pass13D, JavaScript syntax, and runtime references.

## Remaining gate

Browser/E2E acceptance has not been executed yet. Therefore this pass does not authorize Main merge or schedule Apply.
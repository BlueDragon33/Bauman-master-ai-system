# Prerequisite Assurance · Pass 13C · Course Risk + Active Repair Engine

Date: 2026-09-11
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `RISK_REPAIR_ENGINE_VALIDATED_CI_PASS`
Validated SHA: `677be1abeb494f22f9d333e5503423c4006cbda8`
CI run: `34551453511`

## Goal

Turn the Pass13B diagnostic state into a deterministic, evidence-aware intervention layer that answers four questions without mutating the learner schedule yet:

1. Which competency gate is active in the current academic stage?
2. Which official course is blocked or uncertain because of that gate?
3. Which repair route is justified by failed-node evidence?
4. Which mastered gate must stop broad remediation?

The engine reports readiness risk only. It does not predict the probability of receiving a grade.

## Runtime

`assets/js/academic-main.js` is now `Academic 2026 Runtime · Pass 13C`.

Added runtime APIs:

- `currentStageId()`
- `currentCourseHorizon()`
- `gateActivation(gateId, stageId)`
- `courseRisk(courseId, stageId)`
- `courseRiskBoard(stageId)`
- `gateIntervention(gateId, stageId)`
- `activeRepairPlan(stageId)`
- `schedulerCompatibility(stageId)`
- `stopDecision(gateId)`

Legacy Main stage IDs are read-only mapped as follows:

- `prepare` → `before_stankin`
- `preparatory` → `stankin`
- `bauman` → `pre_bauman_8_weeks`
- `m1..m4` → `semester_1..semester_4`

## Course readiness risk

Course risk is categorical, not a grade probability:

- `REBUILD` → `CRITICAL`
- `REPAIR` → `HIGH`
- `BRIDGE` → `MEDIUM`
- `UNASSESSED` → `UNKNOWN`
- `READY` / `MASTERED` → `CLEAR`

The internal `priorityScore` exists only to sort intervention order. It uses readiness state first, then stage urgency, official assessment type and course credits. It is never displayed as a probability or expected grade.

`UNASSESSED` is deliberately `UNKNOWN`, not `HIGH`, because absence of diagnostic evidence is not proof of weak competence.

## Gate activation

The registry `stageActivationPolicy` remains the source of active/secondary/locked gates.

For actual `semester_n` stages only, an unresolved critical prerequisite of a course in that semester can be marked `CARRYOVER` even if it was expected to have been repaired earlier. This prevents an old prerequisite gap from disappearing merely because the calendar advanced.

Before STANKIN and during STANKIN, the engine does not force all future Semester-1 gates into the active route; it respects the staged preparation policy.

## Intervention actions

The engine can return:

- `DIAGNOSE`
- `LOCATE_FAILED_NODES`
- `REPAIR_MATCHED`
- `REPAIR`
- `REVIEW_DIAGNOSTIC`
- `BRIDGE_TO_READY`
- `MAINTAIN_READY`
- `JIT_ONLY`
- `STOP_BROAD`
- `DEFER`
- `HOLD`

A repair route is selected only when diagnostic evidence includes failed node IDs matching a pack route. A low score without node evidence does not cause the runtime to guess a chapter.

## STOP policy

For ordinary gates, `MASTERED` produces `STOP_BROAD` and removes broad remediation from the active route.

For `P0 Technical Russian`, `MASTERED` produces `JIT_ONLY`: broad generic Russian remediation stops, while small course/event-specific Russian preparation remains available.

## Scheduler safety

`SCHEDULER_MUTATION_ENABLED=false` remains hard-coded in Pass13C.

`schedulerCompatibility()` returns advice only. It may warn when the legacy Main scheduler target score is below the Academic READY minimum, but it does not edit:

- `state.schedule.entries`
- subject priorities
- automatic schedule configuration
- existing manual schedule entries

No call to legacy `app.autoSchedule()` is allowed from the Academic runtime in this pass.

## UI

The Home Academic panel now includes:

- current Academic stage;
- categorical course-risk cards;
- blocker gate IDs;
- active gate interventions;
- scheduler lock state;
- warning when legacy target score is below Academic READY.

Responsive styles were added to `assets/css/academic-2026.css` for risk cards and intervention rows.

## Validation

Added `scripts/validate-risk-engine-13c.js` and kept `validate-diagnostic-runtime-13b.js` forward-compatible while preserving all Pass13B state invariants.

The first strict CI run correctly failed because the new validator omitted the official elective-group ID `e01` from its own official-ID set. This was a validator defect, not a curriculum/runtime defect. The validator was corrected to include both elective groups and elective options.

CI run `34551453511` then passed the complete chain:

- official curriculum and registry;
- content coverage snapshot;
- P9, P6, P4, P7, P8, P10, P11;
- J1 and P0;
- Pass13B diagnostic invariants;
- Pass13C risk/repair invariants;
- Academic/Device Gate JavaScript syntax;
- index runtime references.

## Next

Pass13D should integrate the Academic advice layer with scheduling through an explicit feature gate and preview/diff workflow. It must preserve manual entries, never erase an existing schedule blindly, respect STOP gates, prioritize evidence-backed repairs, and remain reversible until browser/E2E acceptance passes.

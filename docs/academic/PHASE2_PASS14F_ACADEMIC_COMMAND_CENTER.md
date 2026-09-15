# Phase 2 · Pass 14F — Academic Command Center

Status: `ACADEMIC_COMMAND_CENTER_VALIDATED_BROWSER_PASS`

Branch: `phase2/pass14f-academic-command-center`

## Purpose

Pass14F integrates the already validated Phase2 layers without merging their semantics:

1. Course/prerequisite readiness from Pass14B.
2. Assessment-event readiness from Pass14C.
3. Confirmed assessment results from Pass14D.
4. Verified diploma-supplement / honors evidence from Pass14E.

The Command Center answers one operational question per Semester-1 course: **what currently threatens the grade-5 / honors objective, and which existing evidence layer should the learner open next?**

It is a read-only orchestration layer. It does not write diagnostics, event evidence, grade results, transcript evidence, scheduler entries, or course-completion state.

## Covered Semester-1 course architecture

The Command Center covers exactly the corrected Pass14A-R Semester-1 architecture:

- `d01` Foreign Language;
- `d02` Methodology of Scientific Knowledge;
- `d03` Analytical Models of ASOIU;
- `d04` Multivariate Data Analysis in AI;
- `d05` OOP Design of ASOIU;
- `d06` ML Database Optimization;
- `d15` Software Development Technologies;
- `p02` Research Work.

Multi-semester assessment timing remains unresolved where Pass14A-R left it unresolved. Pass14F does not manufacture a semester allocation or event date.

## Evidence precedence

The command decision intentionally uses evidence severity rather than averaging unrelated states.

Highest-priority conditions include:

- verified transcript grade 2/3 or failed credit: `HONORS_BLOCKER`;
- confirmed failed assessment: `ASSESSMENT_FAILED`;
- confirmed grade 3 assessment: `GRADE_3_RISK`;
- verified transcript grade 4: `HONORS_GRADE_4`;
- confirmed grade 4 assessment: `GRADE_4_RISK`;
- unresolved multi-semester event timing: `EVENT_TIMING_LOCKED`;
- assessment event still preparing: `EVENT_PREPARING`;
- prerequisite blocker: `PREREQ_REPAIR`;
- no event-readiness evidence: `EVENT_EVIDENCE_REQUIRED`;
- prerequisite not assessed: `PREREQ_UNASSESSED`;
- official grade 5 below internal safety target 90: `EXCELLENT_BELOW_SAFETY_TARGET`;
- prerequisite and event readiness both clear: `READY_FOR_ASSESSMENT`.

Pass14F does not interpret an individual exam/differentiated-credit result as the final diploma-supplement discipline grade. Pass14D and Pass14E remain separate evidence layers.

## Honors display safety

The Command Center reads `honorsEvaluation()` from Pass14E and surfaces verified-row progress. The `22 graded rows / 17 grade-5 rows` values remain explicitly a **projection** from the locked IU5 curriculum mirror.

The UI states that the 22/17 projection is not a final denominator until the actual BMSTU/IU5 diploma-supplement mapping is verified. No assessment-event count is used as the honors denominator.

## Runtime and UI

New files:

- `assets/js/academic-command-center-runtime.js`
- `assets/css/academic-command-center-2026.css`
- `scripts/validate-academic-command-center-14f.js`
- `tests/academic-command-center-browser-14f.mjs`

Pass14E bootstraps Pass14F additively; the base `index.html` remains untouched.

The Command Center is inserted at the beginning of the Home page so that the current academic threats and next actions are visible before the lower-level ledgers.

Each course card shows four independent evidence axes:

- prerequisite readiness;
- lifecycle state;
- assessment-event readiness;
- transcript evidence.

The action button opens the authoritative lower layer that owns the relevant evidence instead of copying or mutating that evidence in Pass14F.

## Hard boundaries

- `readOnly: true`.
- `schedulerMutation: false`.
- no `localStorage.setItem` in the Pass14F runtime;
- no call to `window.save()`;
- no scheduler-entry assignment;
- no call to lower-layer `recordDiagnostic`, `recordEvidence`, `recordResult`, or `recordEntry`;
- no auto-promotion from assessment result to transcript row;
- no automatic course completion;
- no automatic retake decision.

## Validation

Static validation verifies:

- exact 8-course Semester-1 scope;
- presence and order of the risk/command states;
- integration of prerequisite, event, grade, and transcript runtimes;
- read-only boundaries;
- transcript projection caveat;
- additive Pass14E → Pass14F bootstrap;
- responsive CSS;
- JavaScript syntax.

Browser acceptance verifies:

- one Command Center panel and exactly 8 course cards;
- prerequisite diagnostics can move d04 to `COURSE_READY` without mutating the schedule;
- a confirmed grade-4 assessment produces `GRADE_4_RISK`;
- a verified transcript grade 4 takes precedence as `HONORS_GRADE_4`;
- a verified transcript grade 3 produces `HONORS_BLOCKER` and the global honors state becomes `CURRENT_EVIDENCE_BLOCKS_HONORS`;
- evidence remains isolated by current user;
- repeated Home renders do not duplicate the panel;
- mobile layout has no horizontal overflow;
- Pass14B, Pass14C, Pass14D, and Pass14E Browser regressions remain green.

## Final validation evidence

Validated workflow run:

- Run: `34681839892`
- Validated head: `c86ebdc3bb7745e90ee425cc25942781284e8428`
- Static Phase2 validation: SUCCESS
- Pass14F static validator: SUCCESS
- JavaScript/test syntax: SUCCESS
- Pass14B Browser regression: SUCCESS
- Pass14C Browser regression: SUCCESS
- Pass14D Browser regression: SUCCESS
- Pass14E Browser regression: SUCCESS
- Pass14F Browser acceptance: SUCCESS
- Browser artifact upload: SUCCESS

Browser artifact:

- name: `academic-phase2-browser-14bcdef-34681839892`
- artifact id: `10293493835`
- SHA-256: `c13838102e00b91f464792dc041f695379d077318147777999aa63c234d6f569`

## Promotion state

Pass14F is isolated on `phase2/pass14f-academic-command-center`. It is not merged to `main` by this pass. Promotion remains blocked until the branch is checked against current `main` and the next phase-level integration gate is explicitly approved.

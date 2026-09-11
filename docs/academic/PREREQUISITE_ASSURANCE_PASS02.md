# Prerequisite Assurance · Pass 02

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `READ_ONLY_RUNTIME_INTEGRATED_CI_PASS_BROWSER_PENDING`

## Added runtime layer

Files:

- `assets/js/academic-main.js`
- `assets/css/academic-2026.css`
- `index.html` loads both files after the existing Main/PlanningBridge runtime.

The runtime is additive and does not replace `assets/js/data.js`, `assets/js/main.js`, `assets/js/planning-main.js`, or any subject app.

## Behavior

Home now receives a read-only Academic 2026 block with:

- official 120-credit program summary;
- Semester 1 readiness cards for the high-risk/core items;
- prerequisite gate labels;
- no fabricated diagnostic scores.

Roadmap now receives an official 2026 semester view built from the locked curriculum mirror.

Course modals show:

- exact official credits/hours/semester/assessment from the locked mirror;
- critical competency gates;
- support gates;
- readiness state.

Gate modals show:

- gate target;
- home subject;
- priority;
- required topic list.

## Readiness safety rules

- Untested gates remain `Chưa chẩn đoán`.
- Missing scores never become zero automatically.
- Course readiness is not averaged across critical prerequisites.
- If any critical prerequisite is unassessed, the official course remains `Chưa chẩn đoán đủ`.
- Once diagnostics exist, course readiness uses the worst critical prerequisite state/minimum critical score.
- No scheduler action is taken from prerequisite data in Pass 02.

## CI gate

Workflow run `34448827686`, job `validate-academic-registry`:

- official curriculum/prerequisite registry validation: PASS;
- `node --check assets/js/academic-main.js`: PASS;
- index runtime references: PASS.

## Browser gate

Not executed in this pass because the connected GitHub workspace does not expose the private branch as a local browser-served working tree.

Therefore:

- do not merge to `main` yet;
- do not enable diagnostics/scheduler mutation yet;
- next pass should add a controlled diagnostic data model and browser-testable acceptance path before any automatic study-route changes.

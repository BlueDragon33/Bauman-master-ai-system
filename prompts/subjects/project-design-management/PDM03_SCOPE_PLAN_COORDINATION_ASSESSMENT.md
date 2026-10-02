# PDM03 — SCOPE · PLAN · DEPENDENCY · COORDINATION · ASSESSMENT

Mode:

`SCOPE-FIRST · DELIVERABLE-FIRST · DEPENDENCY-AWARE · MULTIPLE-VALID-PLAN-AWARE`

# ENTRY

Requires PDM02.

# REASONING LOOP

Context
→ objective
→ scope
→ deliverables
→ work decomposition
→ dependencies
→ responsibilities
→ milestones/reviews
→ constraints/resources
→ plan baseline
→ progress evidence
→ change/replan.

# ASSESSMENT DIMENSIONS

Separate:
- objective;
- scope;
- deliverable definition;
- decomposition;
- dependencies;
- milestones;
- responsibility;
- constraints/resources;
- plan feasibility;
- progress evidence;
- change impact;
- risk;
- review/acceptance.

# OBJECTIVE QUALITY

Reject vague “complete project successfully”.

# SCOPE

Known cases:
- missing boundary;
- ambiguous inclusion;
- undocumented assumption;
- scope creep.

# DELIVERABLE VS ACTIVITY

“Design database schema” may be activity;
approved schema artifact is deliverable.
Use actual course semantics.

# DECOMPOSITION

Work package/activity should support a deliverable.
Avoid arbitrary micro-tasking.

# DEPENDENCY

Learner identifies true prerequisites rather than ordering everything serially.

# MILESTONE

Milestone must mean something observable/reviewable.

# RESPONSIBILITY

Critical work cannot be ownerless.
Avoid assigning every role to everyone.

# ESTIMATION

If in scope:
record assumptions/range/method.
Estimate ≠ commitment certainty.

# SCHEDULE

If in scope:
dependency logic first; dates second.

# RESOURCE / CAPACITY

If in scope:
over-allocation and capability mismatch must be detectable.

# COST

If in scope:
cost assumptions and basis explicit.

# PROGRESS

Closed task count alone is insufficient.
Use deliverable/evidence state.

# % COMPLETE

If used, method must be defined.
Reject fabricated precision.

# REVIEW / ACCEPTANCE

Deliverable “done” only when acceptance criterion/evidence is satisfied.

# STATUS REPORT

Must agree with canonical project state.

# CHANGE

Learner analyzes:
scope,
plan,
dependencies,
risk,
review,
technical artifact impact.

# RISK

Project risk:
cause → uncertain event → consequence.

# ISSUE

Known event/problem distinct from risk.

# MULTIPLE VALID PLANS

Different decompositions/plans may be defensible.
Grade objective/scope/dependency/evidence.

# ERROR TAXONOMY

`OBJECTIVE_ERROR`
`SCOPE_AMBIGUITY`
`SCOPE_CREEP`
`DELIVERABLE_ACTIVITY_CONFUSION`
`WORK_BREAKDOWN_ERROR`
`DEPENDENCY_ERROR`
`MILESTONE_ERROR`
`RESPONSIBILITY_GAP`
`RESOURCE_OVERALLOCATION`
`ESTIMATE_OVERCLAIM`
`PLAN_BASELINE_ERROR`
`FAKE_PROGRESS`
`STATUS_EVIDENCE_MISMATCH`
`CHANGE_IMPACT_GAP`
`RISK_ISSUE_CONFUSION`
`REVIEW_ACCEPTANCE_GAP`

# HINT LADDER

H1 clarify objective/scope  
H2 identify deliverables  
H3 decompose work  
H4 inspect dependencies  
H5 assign responsibilities  
H6 define milestones/reviews  
H7 inspect progress/change/risk  
H8 full case if allowed

# TEST-OF-TESTS

Known invalid solutions must fail:
- dates without dependencies;
- every task marked 90% complete;
- task closed but deliverable rejected;
- new scope added without baseline change;
- critical activity unowned;
- status green while blocker exists;
- project risk treated as already-occurred issue.

# DELIVERABLES

Create:
- `PDM_SCOPE_REASONING_CONTRACT.md`
- `PDM_DELIVERABLE_BREAKDOWN_ASSESSMENT.md`
- `PDM_DEPENDENCY_PLAN_ASSESSMENT.md`
- `PDM_RESPONSIBILITY_RESOURCE_ASSESSMENT.md`
- `PDM_PROGRESS_CHANGE_RISK_ASSESSMENT.md`
- `PDM_ERROR_TAXONOMY.json`
- `PDM_GOLDEN_VALID_PROJECT_CASES.json`
- `PDM_GOLDEN_INVALID_PROJECT_CASES.json`
- `PDM04_INPUT_CONTRACT.md`

# PASS

PASS when grader distinguishes a plausible timeline from an evidence-grounded, dependency-correct design plan.

# FINAL PRINCIPLE

**A PLAN IS A MODEL OF HOW DELIVERABLES WILL BE PRODUCED AND ACCEPTED, NOT A DECORATIVE CALENDAR.**

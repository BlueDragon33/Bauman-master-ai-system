# MIVAR05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION

Mode:

`SHARED-DESIGN-SYSTEM · TRACE-VISIBLE · NO-CODE-FIRST · ACCESSIBLE`

# ENTRY

Requires MIVAR02–MIVAR04.

# PRIMARY SURFACES

Possible:
- concept lesson;
- domain/formalization workspace;
- fact explorer/editor;
- rule editor;
- variable/domain inspector;
- query workspace;
- inference-step viewer;
- dependency/proof graph;
- contradiction panel;
- explanation panel;
- scenario runner;
- consistency checker;
- AI tutor;
- logical-AI project/report.

# FACT WORKSPACE

Show:
predicate/relation,
arguments,
types/domains,
source/provenance.

# RULE WORKSPACE

Show:
conditions,
variables,
bindings,
conclusion,
priority only if supported.

# VARIABLE INSPECTOR

Display domains/type constraints.

# QUERY WORKSPACE

User selects/enters target query.
Result includes status and proof.

# INFERENCE STEP VIEWER

For each step:
- rule;
- matched facts;
- bindings;
- new fact.

# PROOF GRAPH

Graphical view + structured text/tree alternative.

# CONTRADICTION PANEL

Surface conflicts; do not silently choose winner.

# EXPLANATION PANEL

Rendered from engine trace.

# SCENARIO RUNNER

Temporary facts clearly labeled.

# CONSISTENCY CHECKER

Author/learner can inspect:
invalid rules,
cycles,
contradictions,
domain mismatches.

# AI TUTOR UX

Advisory and trace-aware.
Candidate reasoning clearly distinguished from verified engine trace.

# ERROR NOTEBOOK

Recurring:
fact,
variable,
rule,
binding,
cycle,
contradiction,
negation,
hidden premise,
explanation.

# RESPONSIVE

Mobile:
- fact/rule cards;
- focused proof steps;
- graph alternative list;
- query/result tabs.

# ACCESSIBILITY

- proof graph has structured alternative;
- rule/fact tables semantic;
- color not sole signal;
- keyboard navigation;
- large text;
- reduced motion.

# AUTHORING

Use shared content lifecycle.

MIVAR-specific authoring can create:
- knowledge base;
- fact;
- rule;
- scenario;
- query;
- expected answer;
- expected proof/property;
- contradiction case;
- debugging task.

# FACT AUTHORING

Structured fields; no raw JSON as only UI.

# RULE AUTHORING

Validate:
scope,
bindings,
domains,
conclusion safety.

# QUERY AUTHORING

Specify acceptable:
answer bindings,
proof properties,
termination status.

# MULTIPLE VALID PROOFS

Author can register property-based acceptance instead of exact step order when appropriate.

# GOLDEN INVALID TRACES

Used for test-of-tests.

# PREVIEW

Author runs:
KB → query → inference → trace → explanation → grader.

# VALIDATION

Before review:
- schema valid;
- all rules safe;
- no accidental hidden facts;
- cycles handled;
- expected queries pass;
- invalid fixtures fail.

# SUBJECT MANIFEST

Register through Subject Factory.

# SUBJECT PACK

Canonical content + safe KBs + scenarios + queries + proof fixtures.
No duplicate engine implementations per lesson.

# OFFLINE

Logical engine and KB packs should support offline use where practical.

# ANALYTICS

Track:
formalization attempt,
rule edit,
query,
inference trace,
hint,
contradiction resolution,
submission.

Do not equate number of fired rules with mastery.

# DELIVERABLES

Create:
- `MIVAR_SUBJECT_MANIFEST.md`
- `MIVAR_LEARNING_BLOCK_REGISTRY.json`
- `MIVAR_FACT_RULE_WORKSPACE_UX_CONTRACT.md`
- `MIVAR_QUERY_TRACE_UX_CONTRACT.md`
- `MIVAR_PROOF_GRAPH_ACCESSIBILITY_CONTRACT.md`
- `MIVAR_AUTHORING_SCHEMA_CONTRACT.md`
- `MIVAR_KB_VALIDATION_AUTHORING_CONTRACT.md`
- `MIVAR_RESPONSIVE_ACCESSIBILITY_MATRIX.md`
- `MIVAR_SUBJECT_PACK_CONTRACT.md`
- `MIVAR06_INPUT_CONTRACT.md`

# PILOTS

A — facts + one rule

B — multi-step inference

C — variable-binding task

D — contradiction case

E — cycle/termination

F — multiple valid proofs

G — author creates normal logical-AI task without app-code change.

# PASS

PASS when inference trace stays visible and ordinary KB/rule/query tasks are authorable without application-code edits.

# FINAL PRINCIPLE

**DO NOT TURN LOGICAL AI INTO A CHAT BOX THAT HIDES THE RULES AND PROOF.**

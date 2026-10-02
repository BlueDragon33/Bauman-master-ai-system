# REL05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION

Mode:

`SHARED-DESIGN-SYSTEM · FAILURE-MODEL-CENTERED · NO-CODE-FIRST · ACCESSIBLE`

# ENTRY

Requires REL02–REL04.

# PRIMARY SURFACES

Possible:
- concept lesson;
- failure/mission workspace;
- reliability measure panel;
- distribution explorer;
- RBD editor/view;
- fault-tree view;
- state/Markov view;
- availability/repair view;
- calculation workspace;
- reliability/hazard curves;
- Monte Carlo/sensitivity;
- reliability report;
- AI tutor;
- error notebook.

# FAILURE / MISSION WORKSPACE

Keep visible:
- required function;
- failure criterion;
- mission time;
- operating assumptions.

# MEASURE PANEL

Separate:
R(t),
availability,
MTTF,
MTBF,
MTTR,
hazard,
other actual measures.

# DISTRIBUTION EXPLORER

Show:
parameters,
support,
hazard behavior,
fit context.

# RBD UX

Support series/parallel/redundancy structures in actual scope.

Diagram is a view of canonical structure.

# FAULT TREE UX

If in scope:
top/basic events, gates, logical paths.

# STATE MODEL UX

If in scope:
states/transitions/failure/repair labels.

# CURVE UX

Axes, units and measure names explicit.

# MONTE CARLO UX

Show sample count/seed/uncertainty.

# SENSITIVITY UX

Component/parameter and effect visible.

# AI TUTOR UX

Advisory and grounded.
No hidden auto-answer.

# ERROR NOTEBOOK

Recurring:
failure definition,
independence,
distribution,
repairability,
availability,
MTBF,
units,
probability,
validation.

# RESPONSIVE

Mobile:
- structured model panels;
- focus one diagram/plot;
- tabbed calculation/results.

# ACCESSIBILITY

- formulas semantic where possible;
- diagrams have structured alternatives;
- plots have text/table summaries;
- color not sole cue;
- keyboard controls;
- reduced motion.

# AUTHORING

Use shared lifecycle.

REL-specific authoring creates:
- system/mission;
- failure event;
- component parameters;
- distribution model;
- RBD;
- fault tree;
- state reliability model;
- dataset;
- simulation;
- assessment;
- validation case.

# DATA AUTHORING

Track provenance and censoring.

# ASSUMPTION AUTHORING

Independence/repair/distribution assumptions first-class.

# GOLDEN VALID/INVALID MODELS

Authors can register both for test-of-tests.

# PREVIEW

Author runs:
model → calculation → visualization → grader.

# SUBJECT MANIFEST

Register through Subject Factory.

# SUBJECT PACK

Package:
canonical content,
safe fixtures,
model structures,
datasets,
precomputed results.

No duplicate Math/Python runtime.

# OFFLINE

Cached theory/precomputed/local calculations as supported.

# ANALYTICS

Track:
model selection,
calculation,
hint,
simulation,
error category,
submission.

Do not equate plot viewing with mastery.

# DELIVERABLES

Create:
- `REL_SUBJECT_MANIFEST.md`
- `REL_LEARNING_BLOCK_REGISTRY.json`
- `REL_FAILURE_MODEL_WORKSPACE_UX_CONTRACT.md`
- `REL_RBD_FAULTTREE_STATE_UX_CONTRACT.md`
- `REL_RELIABILITY_CURVE_UX_CONTRACT.md`
- `REL_AUTHORING_SCHEMA_CONTRACT.md`
- `REL_DATA_PROVENANCE_AUTHORING_CONTRACT.md`
- `REL_RESPONSIVE_ACCESSIBILITY_MATRIX.md`
- `REL_SUBJECT_PACK_CONTRACT.md`
- `REL06_INPUT_CONTRACT.md`

# PILOTS

A — simple non-repairable component

B — series/parallel structure

C — reliability vs availability

D — exponential vs non-exponential assumption

E — repairable state model if in scope

F — Monte Carlo/reference comparison if in scope

G — author creates normal reliability task without app-code change.

# PASS

PASS when reliability assumptions and failure definitions remain visible throughout learning and ordinary authoring is no-code.

# FINAL PRINCIPLE

**DO NOT HIDE THE FAILURE MODEL BEHIND A SINGLE “RELIABILITY %” NUMBER.**

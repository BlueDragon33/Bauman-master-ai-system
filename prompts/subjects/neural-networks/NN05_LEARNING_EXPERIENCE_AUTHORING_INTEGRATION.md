# NN05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION

Mode:

`SHARED-DESIGN-SYSTEM · TRAINING-TRANSPARENT · NO-CODE-FIRST · ACCESSIBLE`

# ENTRY

Requires NN02–NN04.

# PRIMARY SURFACES

Possible:
- concept lesson;
- tensor/shape explorer;
- architecture workspace;
- forward-pass lab;
- backprop/gradient lab;
- code lab;
- training dashboard;
- diagnostics;
- model comparison;
- checkpoint/inference explorer;
- AI tutor;
- project/report.

# TENSOR / SHAPE UX

Show dimensions semantically, not raw tuples only.

# ARCHITECTURE VIEW

Structured canonical layers/operations drive view.

# NETWORK BUILDER

If author/learner editing is in scope:
constrained structured graph, not arbitrary code as sole representation.

# FORWARD LAB

Layer-by-layer:
input → operation → output shape/value summary.

# BACKPROP LAB

Show selected gradients and chain relationships for educational-sized networks.

# LOSS UX

Output representation + target + loss shown together.

# TRAINING DASHBOARD

Train and validation clearly separated.

# DIAGNOSTIC UX

Can show:
- gradient norms;
- activation distributions;
- LR;
- overfit/underfit signals;
- warnings.

# MODEL COMPARISON

Compare under compatible experiment protocols.

# CHECKPOINT UX

Show architecture/config/run identity.

# INFERENCE UX

Preprocess → model → output decode.

# AI TUTOR UX

Advisory, grounded, and not hidden auto-training.

# ERROR NOTEBOOK

Recurring:
shape,
loss,
gradient,
LR,
overfit,
train/eval,
checkpoint,
reproducibility.

# RESPONSIVE

Mobile:
- stacked architecture/loss/training;
- focused chart;
- code/metrics tabs;
- architecture structured list alternative.

# ACCESSIBILITY

- charts have summaries/tables;
- network graph has structured alternative;
- color not sole signal;
- keyboard operation;
- reduced motion;
- large text.

# AUTHORING

Use shared lifecycle.

NN-specific authoring can create:
- architecture concept;
- tensor-shape task;
- forward-pass task;
- backprop task;
- training experiment;
- diagnostic task;
- architecture comparison;
- checkpoint/inference task;
- project rubric.

# ARCHITECTURE AUTHORING

Structured:
layers/operations,
shape rules,
parameters,
activations,
output head.

# EXPERIMENT AUTHORING

Reference:
dataset version,
split,
baseline,
architecture,
loss,
optimizer,
training budget,
metric,
hidden evaluation.

# GOLDEN RUNS

Authors can register deterministic/small reference runs.

# INVALID RUNS

Known flawed training configs strengthen test-of-tests.

# PREVIEW

Author runs:
architecture → forward → train → diagnostics → grader.

# VALIDATION

Before review:
- shape validity;
- output/loss compatibility;
- hidden data protection;
- runtime resource limit;
- test-of-tests.

# SUBJECT MANIFEST

Register through Subject Factory.

# SUBJECT PACK

Canonical content + small safe datasets/models/configs/precomputed runs.
No duplicate Python/ML runtime.

# OFFLINE

Theory/small local examples/precomputed training where supported.

# ANALYTICS

Track:
shape task,
forward/backprop attempt,
training run,
diagnostic,
hint,
submission.

Do not treat epochs/run count as mastery.

# DELIVERABLES

Create:
- `NN_SUBJECT_MANIFEST.md`
- `NN_LEARNING_BLOCK_REGISTRY.json`
- `NN_ARCHITECTURE_WORKSPACE_UX_CONTRACT.md`
- `NN_TRAINING_DASHBOARD_UX_CONTRACT.md`
- `NN_DIAGNOSTIC_VISUALIZATION_ACCESSIBILITY_CONTRACT.md`
- `NN_AUTHORING_SCHEMA_CONTRACT.md`
- `NN_EXPERIMENT_AUTHORING_CONTRACT.md`
- `NN_RESPONSIVE_ACCESSIBILITY_MATRIX.md`
- `NN_SUBJECT_PACK_CONTRACT.md`
- `NN06_INPUT_CONTRACT.md`

# PILOTS

A — small MLP forward pass

B — shape mismatch

C — backprop/gradient check

D — learning-rate diagnosis

E — overfit vs validation

F — train/eval checkpoint/inference

G — author creates normal NN task without app-code change.

# PASS

PASS when the training process remains visible and ordinary neural-network tasks can be authored without application-code edits.

# FINAL PRINCIPLE

**DO NOT TURN NEURAL-NETWORK LEARNING INTO A BLACK BOX WITH ONLY “TRAIN” AND “ACCURACY” BUTTONS.**

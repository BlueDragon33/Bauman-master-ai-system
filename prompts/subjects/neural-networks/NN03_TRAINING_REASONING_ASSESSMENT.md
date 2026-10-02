# NN03 — ARCHITECTURE · TRAINING · DIAGNOSTICS · ASSESSMENT

Mode:

`TRAINING-PROTOCOL-FIRST · MULTIPLE-VALID-ARCHITECTURE-AWARE · DIAGNOSTIC-AWARE`

# ENTRY

Requires NN02.

# REASONING LOOP

Task/data
→ representation
→ baseline
→ architecture/capacity
→ loss
→ initialization
→ optimizer/LR
→ training
→ validation
→ diagnostics
→ adjustment/regularization
→ comparison
→ interpretation.

# ASSESSMENT DIMENSIONS

Separate:
- data/task understanding;
- tensor/shape reasoning;
- architecture;
- forward computation;
- output/loss;
- backprop/gradient;
- initialization;
- optimizer/LR;
- training loop;
- validation;
- diagnostics;
- regularization;
- reproducibility;
- implementation.

# SHAPE TASKS

Critical:
detect incompatible dimensions before execution.

# FORWARD PASS

Small deterministic networks can be manually traced.

# LOSS/OUTPUT PAIRING

Known invalid combinations must be tested where in scope.

# BACKPROP

Assess:
- local derivative;
- chain;
- parameter gradient;
- gradient flow.

# GRADIENT CHECK

If in scope:
compare analytical/autograd gradient with finite difference on small fixture.

# INITIALIZATION

Learner reasons about symmetry/scale where applicable.

# LEARNING RATE

Diagnose:
too low,
too high,
unstable/divergent,
reasonable.

# OPTIMIZER

Multiple optimizers may be valid.
Grade trade-off/context.

# TRAINING LOOP

Correct order/semantics:
zero/clear gradients,
forward,
loss,
backward,
update,
validation.

Adapt to actual framework.

# TRAIN / EVAL MODE

Known dropout/batchnorm fixture if supported.

# OVERFIT

High train performance + degraded validation.
Do not diagnose from training loss alone.

# UNDERFIT

Poor train and validation.

# REGULARIZATION

Assess effect/context.
More regularization is not automatically better.

# EARLY STOPPING

If in scope:
validation-based criterion, not test-set tuning.

# BATCH SIZE

If in scope:
optimization/memory/noise trade-offs.

# CLASS IMBALANCE

Inherit ML metric/data rules.

# BASELINE

Neural net should not be automatically preferred to simple baseline.

# MULTIPLE VALID ARCHITECTURES

Critical policy:
different sound architectures can satisfy task.

# PARAMETER COUNT

Not a universal quality score.

# CNN TASKS

If scope:
shape/kernel/stride/padding/receptive-field reasoning.

# RNN TASKS

If scope:
sequence/state shapes and gradient issues.
Do not replace Time Series methodology.

# ATTENTION TASKS

If scope:
Q/K/V shapes, masks, normalization, attention weights interpretation cautions.

# CHECKPOINT TASKS

Architecture/config compatibility.

# INFERENCE TASKS

Preprocessing/eval-mode/output interpretation.

# REPRODUCIBILITY

Record framework/device/seed/config.
Do not promise bitwise equivalence universally.

# ERROR TAXONOMY

`TENSOR_SHAPE_ERROR`
`REPRESENTATION_ERROR`
`ARCHITECTURE_MISMATCH`
`OUTPUT_LOSS_MISMATCH`
`FORWARD_COMPUTATION_ERROR`
`BACKPROP_ERROR`
`GRADIENT_FLOW_ERROR`
`INITIALIZATION_ERROR`
`LEARNING_RATE_ERROR`
`OPTIMIZER_ERROR`
`TRAINING_LOOP_ERROR`
`TRAIN_EVAL_MODE_ERROR`
`OVERFIT_ERROR`
`UNDERFIT_ERROR`
`REGULARIZATION_ERROR`
`LEAKAGE_ERROR`
`CHECKPOINT_ERROR`
`REPRODUCIBILITY_ERROR`
`INTERPRETATION_ERROR`.

# PARTIAL CREDIT

Separate conceptual/training reasoning from code syntax.

# HINT LADDER

H1 inspect task/representation
H2 check tensor shapes
H3 inspect output/loss
H4 inspect gradient/training loop
H5 inspect LR/optimizer
H6 inspect train vs validation diagnostics
H7 suggest regularization/architecture adjustment
H8 full walkthrough only when allowed.

# TEST-OF-TESTS

Known flawed systems must fail:
- shape mismatch;
- wrong output/loss pairing;
- missing gradient reset where relevant;
- training in eval mode or inference in train mode;
- leakage;
- extreme LR;
- invalid checkpoint;
- overfit presented as success;
- test set used for tuning.

# AI BOUNDARY

AI may coach.
It cannot invent loss curves, metrics or experiment outcomes.

# DELIVERABLES

Create:
- `NN_TRAINING_REASONING_CONTRACT.md`
- `NN_ASSESSMENT_GRADER_CONTRACT.md`
- `NN_TENSOR_SHAPE_ASSESSMENT.md`
- `NN_BACKPROP_ASSESSMENT_CONTRACT.md`
- `NN_TRAINING_DIAGNOSTIC_CONTRACT.md`
- `NN_MULTIPLE_VALID_ARCHITECTURE_POLICY.md`
- `NN_ERROR_TAXONOMY.json`
- `NN_GOLDEN_VALID_EXPERIMENTS.json`
- `NN_GOLDEN_INVALID_EXPERIMENTS.json`
- `NN04_INPUT_CONTRACT.md`

# PASS

PASS when assessment can distinguish:
- correct architecture with bad training protocol;
- good training code with invalid task/loss setup;
- overfit vs generalization;
- valid alternative architectures;
- framework bug vs conceptual bug.

# FINAL PRINCIPLE

**GRADE THE TRAINING SYSTEM, NOT WHETHER THE CODE RESEMBLES ONE REFERENCE NOTEBOOK.**

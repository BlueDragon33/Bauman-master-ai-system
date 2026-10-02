# NN04 — RUNTIME · VISUALIZATION · EXPERIMENT · AI NEURAL INTELLIGENCE

Mode:

`REUSE-PYTHON-ML · FRAMEWORK-PROFILED · RESOURCE-BOUNDED · AI-BOUNDED`

# ENTRY

Requires NN02/NN03.

# CAPABILITIES

Possible:
- `nn.model.run`
- `nn.train.run`
- `nn.gradient.check`
- `nn.tensor.inspect`
- `nn.graph.visualize`
- `nn.activation.visualize`
- `nn.gradient.visualize`
- `nn.training.visualize`
- `nn.checkpoint.compare`
- `nn.inference.run`
- `nn.ai.tutor`

Only actual scope.

# RUNTIME

Reuse Python runtime.

Framework profile records:
- framework;
- version;
- device;
- deterministic settings;
- dependency versions.

# MODEL RUN

Bind:
architecture revision,
input spec,
parameter state,
mode.

# TRAINING RUN

Bind:
dataset version,
split,
preprocessing,
architecture,
loss,
optimizer,
LR,
regularization,
seed,
device,
framework profile.

# TENSOR INSPECTOR

Show:
shape,
dtype,
semantic axes,
device.

# COMPUTATIONAL GRAPH

Projection of canonical forward model / framework trace where available.
Not canonical truth itself.

# FORWARD TRACE

Small educational model can expose layer-by-layer shape/value summaries.

# GRADIENT CHECK

Finite-difference/reference check on small safe fixtures where supported.

# GRADIENT VISUALIZATION

Norm/distribution/selected parameters.
Do not imply color plot alone proves health.

# ACTIVATION VISUALIZATION

Distribution/saturation/dead-unit signals where relevant.

# TRAINING DASHBOARD

Show:
train loss,
validation loss,
metrics,
LR,
epoch/step,
warnings.

# TRAIN/VAL LABELS

Must never be visually conflated.

# CHECKPOINT

Store identity and compatibility metadata.

# INFERENCE

Explicit eval mode/preprocessing/output decoding.

# CNN VISUALS

If in scope:
feature maps/filter/shape views with caution.

# RNN/ATTENTION VISUALS

Only if scope.
Do not overinterpret attention weights as explanation automatically.

# RESOURCE LIMITS

Bound:
GPU/CPU,
memory,
epochs/steps,
batch size,
output,
checkpoint size.

# CANCELLATION

Long training can stop safely.

# STALE RUN

Old training result cannot overwrite newer config/model.

# MULTI-TAB

Experiment state isolated.

# AI TUTOR MODES

`SHAPE_COACH`
`FORWARD_COACH`
`BACKPROP_COACH`
`LOSS_COACH`
`OPTIMIZER_COACH`
`DIAGNOSTIC_COACH`
`ARCHITECTURE_COACH`
`CHECKPOINT_COACH`
`INFERENCE_COACH`.

# AI GROUNDING

Canonical model + actual experiment record + learner attempt + allowed hints.

# AI RESULT SAFETY

No fabricated metrics/curves/checkpoint performance.

# AI ARCHITECTURE SAFETY

No “bigger/deeper is always better”.

# AI INTERPRETATION SAFETY

No causal/explanatory overclaim from activations/attention/importance.

# AI HIDDEN DATA

No protected test data or hidden grading labels.

# AI OFFICIAL GRADING

Forbidden by default.

# OFFLINE

Small local models/precomputed runs where feasible.
Heavy GPU training degrades honestly.

# SECURITY

No unrestricted filesystem/network/secrets.
Downloaded model artifacts treated as untrusted unless validated.

# OBSERVABILITY

Track:
OOM,
NaN/Inf,
training divergence,
stale run,
checkpoint error,
framework error,
AI failure.

# DELIVERABLES

Create:
- `NN_FRAMEWORK_PROFILE_REGISTRY.json`
- `NN_RUNTIME_PROVIDER_CONTRACT.md`
- `NN_TRAINING_RUN_SCHEMA.json`
- `NN_TENSOR_GRAPH_VISUALIZATION_CONTRACT.md`
- `NN_GRADIENT_DIAGNOSTIC_CONTRACT.md`
- `NN_CHECKPOINT_INFERENCE_CONTRACT.md`
- `NN_AI_TUTOR_CONTRACT.md`
- `NN_SECURITY_RESOURCE_BOUNDARY.md`
- `NN05_INPUT_CONTRACT.md`

# GOLDEN FIXTURES

At minimum where supported:
- small deterministic forward pass;
- gradient check;
- shape mismatch;
- exploding/vanishing gradient diagnostic;
- overfit training curve;
- train/eval behavior difference;
- checkpoint compatibility failure;
- stale-run cancellation.

# PASS

PASS when runtime/visualizations consume canonical models, experiment identity is explicit, and AI uses actual run evidence.

# FINAL PRINCIPLE

**THE FRAMEWORK EXECUTES THE NETWORK; THE EXPERIMENT RECORD EXPLAINS WHAT ACTUALLY HAPPENED.**

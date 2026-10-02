# TS05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION

Mode:

`SHARED-DESIGN-SYSTEM · TEMPORAL-PROTOCOL-VISIBLE · NO-CODE-FIRST · ACCESSIBLE`

# ENTRY

Requires TS02–TS04.

# PRIMARY SURFACES

Possible:
- series explorer;
- time-index/data-quality panel;
- decomposition workspace;
- lag/ACF/PACF explorer;
- transformation/differencing workspace;
- forecast task builder;
- model configuration;
- rolling backtest;
- forecast chart;
- residual diagnostics;
- model comparison;
- neural forecast panel if in scope;
- AI tutor;
- project/report.

# SERIES EXPLORER

Show:
timestamp,
frequency,
missingness,
duplicates,
target,
covariates,
time range.

# FORECAST TASK PANEL

Keep visible:
forecast origin,
horizon,
frequency,
available exogenous variables,
backtest protocol.

# DECOMPOSITION UX

Trend/seasonal/residual views aligned in time.

# LAG UX

Lag measured in meaningful time steps.

# ACF/PACF UX

Interactive but not presented as automatic order-selection oracle.

# TRANSFORMATION UX

Display:
transformation,
fit scope,
inverse-transform requirement.

# DIFFERENCING UX

Show original vs differenced series and order/seasonal lag.

# MODEL CONFIG

Framework-neutral where possible.

# BACKTEST UX

Show:
train window,
validation/forecast window,
origins,
horizon,
refit policy.

# LEAKAGE WARNINGS

Visible when an operation would consume future information.

# FORECAST CHART

Mark:
history,
forecast origin,
future timestamps,
point forecast,
interval.

# METRIC UX

Display by:
overall,
horizon,
fold/origin where useful.

# RESIDUAL UX

Time plot + ACF/diagnostics as supported.

# MODEL COMPARISON

Only compare compatible protocol.
Protocol differences visible.

# NEURAL FORECAST UX

If scope:
reuse NN training dashboard.
Keep temporal window/horizon controls in TS.

# AI TUTOR UX

Advisory, grounded in actual time-series evidence.

# ERROR NOTEBOOK

Recurring:
leakage,
frequency,
horizon,
differencing,
baseline,
metric,
residual,
interval,
exogenous availability.

# RESPONSIVE

Mobile:
- stacked series/task/model/backtest;
- focused charts;
- table summaries.

# ACCESSIBILITY

Charts have:
- text summaries;
- accessible data tables;
- non-color cues;
- keyboard navigation;
- reduced motion.

# AUTHORING

Use shared lifecycle.

TS-specific authoring can create:
- series dataset manifest;
- time-index rules;
- forecast task;
- temporal feature;
- model task;
- backtest;
- metric task;
- residual diagnostic task;
- anomaly/spectral task only if scope;
- neural forecast task only if scope.

# DATASET AUTHORING

Validate:
timestamps,
frequency,
duplicates,
missingness,
timezone,
provenance.

# FORECAST TASK AUTHORING

Specify:
target,
origin policy,
horizon,
frequency,
available covariates,
backtest,
metric,
baseline,
hidden future evaluation.

# TEMPORAL FEATURE AUTHORING

Must declare availability time and lag/window semantics.

# BACKTEST AUTHORING

Structured folds/window policy.
Reject shuffled CV for forecasting tasks unless explicitly nonforecast temporal task.

# GOLDEN VALID/INVALID PROTOCOLS

Authors register both.

# PREVIEW

Author runs:
dataset → feature pipeline → baseline/model → backtest → residuals → grader.

# VALIDATION

Before review:
- timestamp/frequency valid;
- no future leakage;
- horizon aligned;
- hidden future protected;
- inverse transformations tested;
- test-of-tests passes.

# SUBJECT MANIFEST

Register through Subject Factory.

# SUBJECT PACK

Canonical content + safe series datasets/configs/precomputed forecasts.
No duplicate Python/ML/NN runtime.

# OFFLINE

Theory/small local backtests/precomputed examples as supported.

# ANALYTICS

Track:
data audit,
model task,
backtest,
diagnostic,
hint,
submission.

Do not treat number of forecasts run as mastery.

# DELIVERABLES

Create:
- `TS_SUBJECT_MANIFEST.md`
- `TS_LEARNING_BLOCK_REGISTRY.json`
- `TS_SERIES_EXPLORER_UX_CONTRACT.md`
- `TS_BACKTEST_WORKSPACE_UX_CONTRACT.md`
- `TS_FORECAST_DIAGNOSTIC_UX_CONTRACT.md`
- `TS_AUTHORING_SCHEMA_CONTRACT.md`
- `TS_TEMPORAL_LEAKAGE_AUTHORING_GUARDRAILS.md`
- `TS_RESPONSIVE_ACCESSIBILITY_MATRIX.md`
- `TS_SUBJECT_PACK_CONTRACT.md`
- `TS06_INPUT_CONTRACT.md`

# PILOTS

A — naive seasonal baseline

B — random split leakage

C — differencing/inverse transform

D — rolling-origin backtest

E — one-step vs multi-step

F — residual autocorrelation

G — author creates normal forecasting task without app-code change.

# PASS

PASS when temporal causality/backtest/horizon stay visible to learner and ordinary authoring is no-code.

# FINAL PRINCIPLE

**DO NOT TURN FORECASTING INTO A BLACK BOX WITH ONLY “FIT” AND “SCORE”.**

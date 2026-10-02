# TS04 — RUNTIME · BACKTEST · VISUALIZATION · AI TIME-SERIES INTELLIGENCE

Mode:

`REUSE-PYTHON-ML-NN · TEMPORAL-SAFE · REPRODUCIBLE · AI-BOUNDED`

# ENTRY

Requires TS02/TS03.

# CAPABILITIES

Possible:
- `ts.index.parse`
- `ts.resample.run`
- `ts.decompose.run`
- `ts.acf.compute`
- `ts.pacf.compute`
- `ts.stationarity.test`
- `ts.model.fit`
- `ts.forecast.run`
- `ts.backtest.run`
- `ts.residual.analyze`
- `ts.interval.compute`
- `ts.spectral.run`
- `ts.neural.forecast`
- `ts.ai.tutor`

Only actual scope.

# RUNTIME

Reuse Python runtime.

Potential libraries only if actually used:
pandas, numpy, scipy, statsmodels, sklearn, sktime, darts, prophet, pytorch/tensorflow.

# TIME INDEX PARSER

Normalize/validate:
ordering,
timezone,
frequency,
duplicates,
gaps.

# RESAMPLING

Method/frequency/aggregation/interpolation assumptions explicit.

# DECOMPOSITION

Method/version/period explicit.

# ACF/PACF

Use canonical lag units.
Confidence bands are contextual.

# STATIONARITY TEST

If used:
test name,
null hypothesis,
assumptions,
p-value interpretation.
Do not turn into automatic transformation oracle.

# MODEL PROVIDER

Fit canonical model config against explicit training window.

# FORECAST RUN

Bind:
model run,
origin,
horizon,
timestamps,
covariates,
point forecast,
interval.

# BACKTEST ENGINE

Must enforce temporal windows.

Record:
origins,
window,
horizon,
refit/update,
metrics,
aggregation.

# PARALLEL BACKTEST

Allowed only if fold independence/runtime permits; preserve exact fold identity.

# BASELINE PROVIDER

Naive/seasonal naive/etc actual baselines.

# RESIDUAL ENGINE

Compute residuals aligned to forecast timestamps.

# INTERVAL ENGINE

Method/coverage/assumptions explicit.

# EXOGENOUS VALIDATOR

Verify feature availability for forecast horizon.

# NEURAL FORECAST PROVIDER

If in scope:
reuse NN model/training runtime.
TS adds temporal window/backtest contract.

# SPECTRAL PROVIDER

Only if actual scope.

# VISUALIZATIONS

Possible:
- raw series;
- decomposition;
- lag plot;
- ACF/PACF;
- forecast + interval;
- rolling backtest;
- residuals;
- metric by horizon;
- spectral plot if scope.

# FORECAST CHART

History and future forecast clearly separated.
Forecast origin marked.

# INTERVAL CHART

Coverage level and meaning visible.

# MULTI-HORIZON VIEW

Score/forecast by horizon step.

# STALE RUN

Changing data/model/window invalidates old results.

# RESOURCE LIMITS

Bound:
series length,
model search,
backtest folds,
parallel workers,
neural training,
plot size.

# AI TUTOR MODES

`TIME_INDEX_COACH`
`LEAKAGE_COACH`
`DECOMPOSITION_COACH`
`STATIONARITY_COACH`
`MODEL_SELECTION_COACH`
`BACKTEST_COACH`
`RESIDUAL_COACH`
`INTERVAL_COACH`
`HORIZON_COACH`.

# AI GROUNDING

Canonical series/task + actual backtest + model + residuals + learner attempt.

# AI FORECAST SAFETY

AI must not invent future values or performance.
Use actual model run when numerical output is claimed.

# AI CAUSALITY SAFETY

Temporal correlation/lag does not establish causation.

# AI OFFICIAL GRADING

Forbidden by default.

# SECURITY

No unrestricted filesystem/network/secrets.
External model/data files validated.

# OFFLINE

Local/precomputed time-series labs where feasible.
Heavy/remote runs degrade honestly.

# OBSERVABILITY

Track:
parse error,
frequency ambiguity,
backtest failure,
forecast error,
NaN/Inf,
stale run,
AI failure.

# DELIVERABLES

Create:
- `TS_RUNTIME_PROVIDER_CONTRACT.md`
- `TS_TIME_INDEX_VALIDATION_CONTRACT.md`
- `TS_BACKTEST_ENGINE_CONTRACT.md`
- `TS_FORECAST_RUN_SCHEMA.json`
- `TS_RESIDUAL_INTERVAL_CONTRACT.md`
- `TS_VISUALIZATION_CONTRACT.md`
- `TS_NEURAL_FORECAST_INTEGRATION_CONTRACT.md`
- `TS_AI_TUTOR_CONTRACT.md`
- `TS_SECURITY_RESOURCE_BOUNDARY.md`
- `TS05_INPUT_CONTRACT.md`

# GOLDEN FIXTURES

At minimum where supported:
- regular seasonal series;
- random-split rejection;
- temporal scaler leakage rejection;
- naive baseline;
- one-step vs multi-step;
- backtest fold alignment;
- exogenous feature unavailable at forecast time;
- residual autocorrelation fixture;
- interval coverage fixture.

# PASS

PASS when all runtime/backtest/visualization/AI capabilities preserve temporal causality and explicit forecast identity.

# FINAL PRINCIPLE

**THE BACKTEST ENGINE ENFORCES TIME. THE MODEL DOES NOT GET TO SEE THE FUTURE.**

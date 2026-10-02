# TS06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS

Mode:

`TEMPORAL-LEAKAGE-RED-TEAMED · BACKTEST-REGRESSION · NO-KNOWN-BLOCKER`

# MISSION

Prove Time Series Analysis is temporally correct, leakage-safe, uncertainty-aware, accessible and exact-RC ready.

# GATES

A canonical temporal truth
B reasoning/assessment
C runtime/backtest
D visualization/AI
E UX/a11y/offline/performance/security
F legacy/RC.

# TIME INDEX MATRIX

Test:
- unsorted timestamps;
- duplicates;
- missing timestamps;
- timezone mismatch if relevant;
- wrong frequency;
- irregular sampling if supported.

# TEMPORAL LEAKAGE MATRIX

Reject:
- shuffled random split;
- centered rolling features with future values;
- scaler fit on full dataset;
- imputer fit on future observations;
- target-derived future feature;
- future exogenous value unavailable at origin;
- feature computation crossing fold boundary.

# FORECAST ORIGIN / HORIZON

Test:
- timestamp alignment;
- one-step;
- multi-step;
- horizon gaps;
- multiple origins.

# BASELINE

Require baseline comparison where appropriate.

# DIFFERENCING

Test:
- wrong lag/order;
- over-differencing case where in scope;
- inverse transform;
- seasonal differencing.

# STATIONARITY

Known misuse:
automatic differencing solely from a p-value without model/context.

# ACF/PACF

Known overinterpretation fixture.

# MODEL FAMILY

Only actual supported models.
Check valid config/parameter domains.

# ARIMA / ETS / STATE-SPACE

If supported:
known synthetic/reference fixtures.

# EXOGENOUS VARIABLES

Future availability enforced.

# BACKTEST

Test:
- rolling;
- expanding;
- refit/no-refit policy;
- correct fold boundaries;
- horizon aggregation.

# METRICS

Test:
- scale-dependent vs scale-free;
- zero/near-zero behavior for percentage metrics;
- horizon aggregation;
- fold aggregation.

# RESIDUALS

Known autocorrelated residual fixture.
Do not force white-noise assumptions beyond model/task scope, but diagnostics must be honest.

# FORECAST INTERVALS

Check:
coverage label,
horizon alignment,
lower <= upper,
method context.

# MULTIPLE VALID MODELS

Known alternate models pass when task permits.

# NEURAL FORECAST

If in scope:
reuse NN acceptance plus temporal leakage/horizon tests.

# MULTIVARIATE

If in scope:
cross-series alignment, lag availability, temporal split.

# ANOMALY/CHANGE POINT

Only if scope:
false positive/threshold/reference semantics.

# SPECTRAL

Only if scope:
sampling frequency/aliasing/unit checks.

# NUMERICAL SAFETY

Detect:
NaN,
Inf,
failed model fit,
singular/invalid configuration.

# AI ACCEPTANCE

AI must:
- preserve time order;
- reject future leakage;
- ask/identify origin/horizon;
- not fabricate future values;
- not fabricate forecast scores;
- distinguish correlation from causation;
- not reveal hidden future test data;
- not write official mastery.

# RUNTIME SECURITY

Shared Python sandbox boundaries hold.

# HIDDEN FUTURE DATA

Protected from learner/AI until evaluation policy allows.

# OFFLINE

Actual supported matrix verified.

# PERFORMANCE

Measure:
subject load,
series parsing,
decomposition,
backtest,
forecast,
visualization,
authoring.

# MEMORY

Repeated model/backtest/chart use does not leak unbounded memory.

# RESPONSIVE / A11Y

Series/backtest/forecast/residual views usable on mobile/tablet/desktop with accessible alternatives.

# AUTHORING ACCEPTANCE

Author creates:
- dataset;
- temporal feature;
- forecast task;
- backtest;
- model task;
- residual task

without app-code edits for ordinary cases.

# LEGACY

Resolve duplicate:
- temporal split engine;
- backtest runner;
- metric calculator;
- feature generator;
- forecast registry;
- model runner;
- plot state;
- old routes/flags.

# FOUNDATION OWNER GATE

No duplicate generic ML metric/split owner beyond temporal specialization.
No duplicate NN/Python runtime.
No copied Math truth.

# MIGRATION

If canonical IDs/schema changed:
aliases,
content migration,
learner evidence,
forecast experiment history,
rollback.

# RC FREEZE

Freeze:
SHA,
content snapshot,
subject pack,
dataset versions,
time-index profiles,
library/runtime profile,
forecast fixtures,
config,
lockfile.

# PRODUCTION SMOKE PROFILE

1. open Time Series subject;
2. open one canonical forecasting lesson;
3. inspect time index/frequency/origin/horizon;
4. run one safe baseline forecast;
5. run one bounded rolling backtest;
6. verify forecast + interval + residual view;
7. verify active subject pack/dataset revision;
8. verify Python/model provider profile;
9. verify optional AI grounded/fallback;
10. offline cached lesson/precomputed forecast if supported.

# BLOCKERS

- any systematic future leakage;
- hidden future values exposed;
- wrong horizon alignment;
- invalid backtest accepted;
- forecast interval mislabeled;
- AI fabricates forecast results;
- runtime can escape sandbox;
- duplicate canonical temporal owner;
- migration corrupts learner evidence.

# DELIVERABLES

Create:
- `TS_ACCEPTANCE_MATRIX.md`
- `TS_TIME_INDEX_REGRESSION.json`
- `TS_TEMPORAL_LEAKAGE_REGRESSION.json`
- `TS_BACKTEST_ACCEPTANCE.md`
- `TS_FORECAST_METRIC_INTERVAL_ACCEPTANCE.md`
- `TS_RESIDUAL_DIAGNOSTIC_ACCEPTANCE.md`
- `TS_RUNTIME_SECURITY_REPORT.md`
- `TS_AI_ACCEPTANCE_REPORT.md`
- `TS_ACCESSIBILITY_RESPONSIVE_REPORT.md`
- `TS_OFFLINE_PERFORMANCE_REPORT.md`
- `TS_LEGACY_CLOSURE_REPORT.md`
- `TS_RC_MANIFEST.json`
- `TS_PRODUCTION_SMOKE_PROFILE.md`
- `TS06_EVIDENCE_INDEX.md`

# PASS

PASS only when canonical time index, temporal features, model, forecast horizon, backtest, metrics, intervals, runtime and AI all agree; leakage/security gates pass; exact RC exists.

# FINAL PRINCIPLE

**THE RELEASE CANDIDATE MUST PROVE THAT NO FORECAST HAS SEEN INFORMATION THAT WAS UNAVAILABLE AT ITS FORECAST ORIGIN.**

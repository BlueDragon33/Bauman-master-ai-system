# TS03 — TEMPORAL REASONING · FORECASTING · BACKTESTING · ASSESSMENT

Mode:

`FUTURE-LEAKAGE-INTOLERANT · HORIZON-AWARE · MULTIPLE-VALID-MODEL-AWARE`

# ENTRY

Requires TS02.

# REASONING LOOP

Problem
→ time index
→ forecast origin/horizon
→ data audit
→ temporal structure
→ transformations
→ baseline
→ model family
→ fit on past
→ forecast
→ backtest
→ residual diagnosis
→ comparison
→ uncertainty
→ interpretation.

# ASSESSMENT DIMENSIONS

Separate:
- time-index understanding;
- horizon definition;
- leakage prevention;
- trend/seasonality/lag reasoning;
- transformation;
- baseline;
- model selection;
- fit/forecast;
- backtest;
- residuals;
- uncertainty;
- metric interpretation;
- reproducibility.

# TIME ORDER

Learner must preserve chronological causality.

# RANDOM SPLIT

Known invalid fixture when it leaks future information.

# FEATURE AVAILABILITY

Assess whether a feature exists at forecast origin for the target horizon.

# LAG FEATURE

Lag must reference only known past values.

# ROLLING FEATURE

Window direction matters.
Centered future-containing windows are leakage for forecasting.

# IMPUTATION

Temporal imputation must respect forecast-time availability.

# SCALING

Fit on training/history only.

# TREND / SEASONALITY

Learner identifies/justifies components without overclaim.

# DECOMPOSITION

Method assumptions/context.

# STATIONARITY

Assess concept/model need, not ritual “must always stationarize”.

# DIFFERENCING

Assess:
- order;
- seasonal lag;
- inverse transform;
- over-differencing risk where taught.

# ACF/PACF

Interpret cautiously.
Do not grade exact visual pattern as automatic model oracle.

# BASELINE

Simple baseline required where meaningful.

# AR/MA/ARIMA

If in scope:
order reasoning, residuals, stability/invertibility concepts only to syllabus depth.

# ETS

If in scope:
trend/seasonality/error structure.

# STATE-SPACE

If in scope:
state/filter/forecast semantics.

# EXOGENOUS REGRESSION

Future exogenous values must be available or themselves forecast/assumed.

# MULTI-STEP

Distinguish one-step performance from h-step forecast.

# FORECAST HORIZON

Metric aligned to correct horizon timestamps.

# BACKTEST

Learner chooses:
rolling/expanding,
window length,
origins,
refit policy,
horizon.

# BACKTEST LEAKAGE

Known invalid fold definitions must fail.

# MODEL COMPARISON

Only under compatible backtest/horizon/metric protocol.

# RESIDUAL DIAGNOSTICS

Residual temporal dependence indicates remaining structure.
Interpret, not merely plot.

# FORECAST INTERVAL

Assess coverage/meaning/context.

# METRIC SELECTION

MAE/RMSE/MAPE/sMAPE/MASE/etc only as scope supports.

# ZERO VALUES

Percentage metric pitfalls.

# SCALE COMPARISON

Scale-dependent metrics not directly comparable across unrelated series without context.

# MULTIPLE VALID MODELS

Different models can be valid under same task.
Grade evidence/backtest/trade-offs.

# NEURAL FORECASTING

If in scope:
reuse NN training assessment.
TS separately grades sequence windows, temporal splits, horizon and backtest.

# ANOMALY/CHANGE POINT

Only if scope:
detection threshold/reference and false-positive trade-offs explicit.

# SPECTRAL

Only if scope:
sampling/frequency/aliasing/context.

# ERROR TAXONOMY

`TIME_INDEX_ERROR`
`FREQUENCY_ERROR`
`FORECAST_ORIGIN_ERROR`
`HORIZON_ERROR`
`FUTURE_LEAKAGE`
`ROLLING_WINDOW_LEAKAGE`
`EXOGENOUS_AVAILABILITY_ERROR`
`TREND_SEASONALITY_ERROR`
`STATIONARITY_MISUSE`
`DIFFERENCING_ERROR`
`INVERSE_TRANSFORM_ERROR`
`LAG_ORDER_ERROR`
`BASELINE_OMISSION`
`BACKTEST_ERROR`
`METRIC_ERROR`
`INTERVAL_INTERPRETATION_ERROR`
`RESIDUAL_DIAGNOSTIC_ERROR`
`MULTISTEP_ERROR`
`REPRODUCIBILITY_ERROR`.

# PARTIAL CREDIT

Separate temporal protocol from model arithmetic/code.

# HINT LADDER

H1 define origin/horizon
H2 inspect time index/frequency
H3 check leakage
H4 inspect trend/seasonality/lag
H5 choose baseline/model family
H6 inspect backtest
H7 inspect residuals/intervals
H8 full walkthrough only when allowed.

# TEST-OF-TESTS

Known invalid solutions must fail:
- random shuffled split;
- future-centered rolling feature;
- scaler fit on all data;
- wrong forecast horizon alignment;
- exogenous future unavailable;
- no baseline;
- metric invalid near zero;
- one-step result claimed as multi-step;
- model comparison across incompatible windows.

# AI BOUNDARY

AI may coach.
It cannot invent future observations, hidden test values, forecast metrics or official mastery.

# DELIVERABLES

Create:
- `TS_TEMPORAL_REASONING_CONTRACT.md`
- `TS_FORECAST_ASSESSMENT_CONTRACT.md`
- `TS_BACKTEST_ASSESSMENT_CONTRACT.md`
- `TS_TEMPORAL_LEAKAGE_MATRIX.md`
- `TS_METRIC_INTERVAL_ASSESSMENT.md`
- `TS_ERROR_TAXONOMY.json`
- `TS_GOLDEN_VALID_FORECASTS.json`
- `TS_GOLDEN_INVALID_FORECASTS.json`
- `TS04_INPUT_CONTRACT.md`

# PASS

PASS when grader can distinguish model quality from temporal protocol validity and accepts valid alternative models under the same backtest contract.

# FINAL PRINCIPLE

**A HIGH FORECAST SCORE FROM A LEAKY TEMPORAL PROTOCOL IS A FAILED FORECASTING EXPERIMENT.**

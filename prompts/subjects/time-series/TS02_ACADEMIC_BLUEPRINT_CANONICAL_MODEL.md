# TS02 — ACADEMIC BLUEPRINT & CANONICAL TIME-SERIES MODEL

Mode:

`TIME-INDEX-FIRST · FORECAST-ORIGIN-EXPLICIT · LEAKAGE-SAFE · CANONICAL-OWNER`

# ENTRY

Requires TS01.

# MISSION

Define one canonical time-series ontology consumed by lessons, runtime, backtesting, graders, visualizers, AI and authoring.

# OUTCOMES

Learner can:
- inspect temporal data;
- define sampling/time index;
- identify trend/seasonality/dependence;
- transform safely;
- establish baseline;
- select model family;
- forecast at explicit horizon;
- backtest;
- diagnose residuals;
- quantify uncertainty;
- compare models;
- explain limitations;
- reproduce forecasting experiment.

# CANONICAL ENTITIES

`TimeSeriesDataset`
`TimeIndex`
`SamplingProfile`
`Series`
`TemporalFeature`
`TemporalStructure`
`Transformation`
`Decomposition`
`LagDefinition`
`AutocorrelationProfile`
`StationarityContext`
`ForecastTask`
`ForecastOrigin`
`ForecastHorizon`
`BaselineForecast`
`TimeSeriesModel`
`ModelConfig`
`BacktestPlan`
`BacktestFold`
`Forecast`
`ForecastInterval`
`ResidualSeries`
`ForecastMetric`
`ExogenousVariable`
`ExperimentRun`
`ModelClaim`
`Misconception`
`Remediation`.

# TIME INDEX

Store:
timestamp,
timezone where relevant,
ordering,
frequency,
calendar semantics.

# REGULARITY

Regular vs irregular sampling explicit.

# DUPLICATE TIMESTAMPS

Policy explicit.

# MISSING TIMESTAMPS

Distinguish missing observation from no expected observation.

# SERIES IDENTITY

Target series separated from grouping/entity key for panel/grouped data.

# TEMPORAL FEATURE

Feature declares:
- source;
- lag;
- window;
- availability time;
- transformation.

# FUTURE AVAILABILITY

Exogenous feature must specify whether known at forecast origin for target horizon.

# TREND

Contextual long-term component, not universal deterministic law.

# SEASONALITY

Period/calendar context explicit.

# CYCLE

Separate from fixed seasonality if actually taught.

# DECOMPOSITION

Method/assumptions tied to series.

# LAG

Lag unit tied to sampling/time units.

# AUTOCOVARIANCE / AUTOCORRELATION

Math owner supplies generic statistics.
TS owns temporal interpretation.

# PACF

Only if actual scope.

# STATIONARITY

Represent type/context:
weak/covariance stationarity etc only as actual curriculum supports.

# TRANSFORMATION

Log/power/scaling/differencing as transformations with invertibility metadata where relevant.

# DIFFERENCING

Lag/order explicit.

# SEASONAL DIFFERENCING

Season period explicit.

# BASELINE

Naive/seasonal naive/drift/other actual baselines.

# FORECAST TASK

Bind:
target series,
forecast origin,
horizon,
frequency,
available covariates,
evaluation protocol.

# ONE-STEP VS MULTI-STEP

First-class distinction.

# DIRECT / RECURSIVE / MULTI-OUTPUT

Only if actual scope.

# MODEL FAMILY

Framework-neutral representation.

Potential supported families:
- smoothing;
- AR;
- MA;
- ARMA/ARIMA;
- seasonal ARIMA;
- ETS;
- state-space;
- dynamic regression;
- VAR;
- neural forecasting.

Only actual scope becomes active.

# AR MODEL

If scope:
lag order/coefficient/noise assumptions.

# MA MODEL

If scope:
innovation representation.

# ARIMA

If scope:
orders p,d,q and seasonal orders explicitly.

# ETS / EXPONENTIAL SMOOTHING

If scope:
error/trend/seasonality structure.

# STATE-SPACE

If scope:
reuse Analytical Models math/state concepts while TS owns forecast/filtering context.

# EXOGENOUS REGRESSION

Future availability assumptions explicit.

# VAR / MULTIVARIATE

If scope:
series vector, lag order, cross-series dependence.

# NEURAL FORECAST MODEL

If scope:
architecture references NN canonical entity.
TS owns temporal window/horizon/backtest semantics.

# FORECAST

Bind:
origin,
horizon timestamps,
point estimate,
model run.

# INTERVAL

Bind:
coverage level,
method/assumptions,
forecast horizon.

Do not call every interval a confidence interval.

# BACKTEST PLAN

Store:
initial train window,
origins,
window type,
refit/update policy,
horizon,
gap,
metric,
aggregation.

# ROLLING / EXPANDING

First-class temporal validation.

# METRIC

Metric semantics include scale sensitivity, zero behavior, direction, aggregation.

# MAPE

If used:
zero/near-zero limitation explicit.

# MASE

If used:
scaling baseline/seasonality explicit.

# RESIDUAL

Observed minus forecast or model innovation definition explicit.

# RESIDUAL DIAGNOSTICS

Bias/autocorrelation/variance/distribution as actual curriculum supports.

# REPRODUCIBILITY

Bind dataset version, split/backtest, transformations, model config, software profile.

# PROVENANCE

Forecast claims traceable to data, origin, model, backtest and metric.

# ADJACENT ML BOUNDARY

Reuse generic metrics/leakage/experiment concepts.
TS specializes temporal validation.

# NN BOUNDARY

Neural architecture/training owned by NN.
Temporal windows/horizon/backtest owned by TS.

# DELIVERABLES

Create:
- `TS_ACADEMIC_BLUEPRINT.md`
- `TS_COMPETENCY_GRAPH.json`
- `TS_PREREQUISITE_GRAPH.json`
- `TS_CANONICAL_ENTITY_SCHEMA.json`
- `TS_TIME_INDEX_DATA_CONTRACT.md`
- `TS_TEMPORAL_FEATURE_AVAILABILITY_CONTRACT.md`
- `TS_MODEL_FAMILY_CONTRACT.md`
- `TS_FORECAST_HORIZON_CONTRACT.md`
- `TS_BACKTEST_CONTRACT.md`
- `TS_METRIC_INTERVAL_RESIDUAL_CONTRACT.md`
- `TS03_INPUT_CONTRACT.md`

# PASS

PASS when one canonical model can express actual time-series data, forecasting, validation and uncertainty without duplicate ML/NN truth.

# FINAL PRINCIPLE

**A TIME-SERIES MODEL IS NOT COMPLETE UNTIL ITS TEMPORAL INDEX, ORIGIN, HORIZON AND VALIDATION PROTOCOL ARE EXPLICIT.**

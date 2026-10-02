# TS01 — FORENSIC BASELINE
## Audit current Time Series Analysis reality before redesign

Mode:

`AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST`

# MISSION

Map actual time-series content, data, models, backtests, runtime, assessments and AI usage.

# DISCOVERY

Search for:
- time series;
- forecasting;
- timestamp/date index;
- trend;
- seasonality;
- decomposition;
- lags;
- autocorrelation;
- PACF;
- stationarity;
- differencing;
- transformations;
- smoothing;
- AR/MA/ARIMA/SARIMA;
- exponential smoothing/ETS;
- state-space;
- dynamic regression;
- VAR/multivariate models;
- spectral/frequency analysis;
- anomaly/change points;
- RNN/LSTM/transformer forecasting;
- forecast intervals;
- backtesting;
- rolling/expanding windows;
- time-series metrics.

Do not assume all are in scope.

# FOUNDATION OVERLAP

Map ownership by:
- Math;
- ML/Data Analysis;
- Neural Networks;
- Analytical Models;
- Python.

Do not duplicate generic owners.

# DATASET INVENTORY

For each dataset:
- timestamp field;
- timezone if relevant;
- frequency;
- regular/irregular;
- duplicates;
- missing timestamps;
- target;
- covariates;
- exogenous variables;
- entity/group key if panel data;
- provenance;
- version.

# TIME INDEX AUDIT

Find:
- sorting;
- parsing;
- timezone;
- resampling;
- frequency inference;
- duplicate timestamps.

# TEMPORAL SPLIT AUDIT

Find:
- train/validation/test dates;
- rolling origin;
- expanding/sliding windows;
- random split misuse;
- future leakage.

# FEATURE AUDIT

Inspect:
- lags;
- rolling statistics;
- expanding statistics;
- calendar features;
- target-derived features;
- future-known vs future-unknown exogenous features.

# LEAKAGE AUDIT

Flag:
- future-derived rolling windows;
- centered rolling statistics;
- scaler/imputer fit on all data;
- future target leakage;
- shuffled CV;
- look-ahead in feature engineering.

# TRANSFORMATION AUDIT

Find:
- log/Box-Cox-like;
- differencing;
- seasonal differencing;
- scaling;
- inverse transforms.

# DECOMPOSITION AUDIT

Find classical/STL/other decomposition only if present.

# ACF/PACF AUDIT

Map usage and overclaim risks.

# STATIONARITY AUDIT

Find tests/assumptions and whether learners are taught to interpret rather than mechanically transform.

# MODEL FAMILY INVENTORY

Record actual:
- naive/seasonal naive;
- moving average/smoothing;
- AR/MA;
- ARIMA/SARIMA;
- ETS/exponential smoothing;
- state-space;
- dynamic regression;
- VAR;
- neural models;
- other.

# BASELINE AUDIT

Check whether complex models are compared with simple baselines.

# FORECAST HORIZON AUDIT

Check explicit one-step/multi-step/direct/recursive semantics.

# METRIC AUDIT

Inventory:
MAE,
RMSE,
MAPE,
sMAPE,
MASE,
other actual metrics.

Flag undefined/misleading percentage metrics around zero.

# INTERVAL AUDIT

Find prediction/forecast intervals and semantics.

# RESIDUAL AUDIT

Check:
- mean/bias;
- autocorrelation;
- distribution;
- heteroscedasticity where relevant.

# BACKTEST AUDIT

Record:
- folds/origins;
- window type;
- horizon;
- refit policy;
- metric aggregation.

# EXOGENOUS VARIABLE AUDIT

Check whether future values are actually available at forecast time.

# IRREGULAR SERIES AUDIT

If present, map interpolation/resampling assumptions.

# MISSING DATA AUDIT

Temporal imputation must respect causality where required.

# OUTLIER AUDIT

Determine whether outliers are data errors, events, anomalies, or legitimate extremes.

# ANOMALY / CHANGE-POINT AUDIT

Only if content exists.

# SPECTRAL AUDIT

Only if content exists:
frequency/periodogram/spectral density, assumptions.

# MULTIVARIATE AUDIT

Only if content exists:
multiple series, cross-dependence, VAR/state-space, panel/grouped series.

# NEURAL FORECAST AUDIT

If present:
map reuse of NN runtime/training, sequence-window generation, leakage, horizon semantics.

# RUNTIME AUDIT

Map:
pandas,
statsmodels,
scikit-learn,
sktime,
darts,
prophet,
PyTorch/TensorFlow,
other actual libraries.

# NOTEBOOK AUDIT

Check stale execution state.

# ASSESSMENT AUDIT

Classify:
- temporal reasoning;
- decomposition;
- lag;
- model selection;
- forecasting;
- backtest;
- residual diagnosis;
- uncertainty;
- code;
- report.

# GRADER AUDIT

Check:
- exact forecast arrays;
- tolerance;
- multiple valid models;
- temporal split correctness;
- hidden future test data.

# AI AUDIT

Check whether AI:
- fabricates forecasts;
- leaks hidden future values;
- recommends random split;
- claims causality from seasonality/correlation;
- writes mastery.

# DUPLICATE OWNER

Find duplicate:
- split/backtest engine;
- metric calculator;
- feature generator;
- forecast registry;
- model runner;
- plotter.

# LEGACY

KEEP / MIGRATE / RETIRE / UNKNOWN.

# RISK REGISTER

At minimum:
- future leakage;
- random split;
- wrong horizon alignment;
- inverse-transform error;
- metric misuse;
- baseline omission;
- one-holdout overclaim;
- exogenous feature unavailable in future;
- duplicate runtime;
- AI fabricated forecast.

# DELIVERABLES

Create:
- `TS01_EXECUTIVE_SUMMARY.md`
- `TS01_REPOSITORY_MAP.md`
- `TS01_DATASET_TIME_INDEX_INVENTORY.json`
- `TS01_MODEL_FAMILY_INVENTORY.json`
- `TS01_TEMPORAL_LEAKAGE_AUDIT.md`
- `TS01_BACKTEST_METRIC_AUDIT.md`
- `TS01_RUNTIME_LIBRARY_AUDIT.md`
- `TS01_ASSESSMENT_GRADER_AUDIT.md`
- `TS01_DUPLICATE_OWNER_MAP.md`
- `TS01_RISK_REGISTER.json`
- `TS02_INPUT_CONTRACT.md`

# PASS

PASS only when actual TS scope, time-index semantics, data, model families, validation, runtime and graders are evidenced.

# FINAL PRINCIPLE

**AUDIT THE TIMELINE AND VALIDATION PROTOCOL BEFORE AUDITING THE FORECASTING MODEL.**

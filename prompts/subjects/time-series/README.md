# TIME SERIES ANALYSIS PROMPT SYSTEM
## Bauman IU5 · Анализ временных рядов
## Constitution-routed subject architecture + execution runbook

Repository:

`BlueDragon33/Bauman-master-ai-system`

Primary subject scope:

`subjects/time-series/`

or the actual repository scope discovered by TS01.

---

# 0. PURPOSE

This package defines the subject architecture for the Bauman IU5 course:

**Анализ временных рядов — Time Series Analysis**

It reuses the shared constitutions:

- C1 — Extensible Platform Architecture
- C2 — Future Professional UI/UX
- C3 — Professional QA + Auto-Fix
- C4 — Real Learning & Outcome System

This README is the single execution runbook.

No separate execution cheat sheet is required.

---

# 1. FOUNDATION DEPENDENCIES

Reuse:

- Mathematics
- Probability & Statistics portions of Mathematics
- Python
- Multivariate Data Analysis & Machine Learning
- Neural Network Systems where neural sequence models are actually in scope
- Analytical Models where state-space/time-dynamic modeling is relevant
- Database / Advanced Database for data ingestion/storage only when needed

Do not duplicate foundational statistics, generic ML evaluation, generic neural-network training, Python runtime, or database truth.

---

# 2. SUBJECT OWNERSHIP

TS owns subject-specific:

- temporal ordering;
- sampling interval and time index;
- regular vs irregular time observations where supported;
- trend / seasonality / cycle / residual reasoning;
- lag and temporal dependence;
- autocovariance / autocorrelation;
- partial autocorrelation where supported;
- stationarity concepts;
- transformations/differencing;
- decomposition;
- smoothing;
- autoregressive/moving-average model families where supported;
- ARIMA/SARIMA-like models where supported;
- exponential-smoothing / ETS-like models where supported;
- state-space forecasting models only to actual course depth;
- exogenous regressors / dynamic regression where supported;
- temporal train/validation/test design;
- rolling/expanding-window validation;
- forecasting horizons;
- multi-step forecasting;
- forecast uncertainty / intervals;
- residual diagnostics;
- temporal leakage;
- missing timestamps/gaps/outliers;
- change-point/anomaly concepts only if actual syllabus/repository supports;
- frequency/spectral analysis only if actual scope supports;
- multivariate time-series models only if actual scope supports;
- neural/deep time-series forecasting only if actual scope supports;
- forecast comparison and model selection;
- time-series experiment reproducibility;
- time-series engineering evidence.

TS does not automatically own:

- generic regression/classification/clustering — ML;
- generic neural architecture/backprop — NN;
- generic probability/statistics — Mathematics;
- generic signal processing — only spectral concepts proven by TS01;
- generic database storage — Database;
- generic control-system dynamics — Analytical Models;
- generic business application/decision analytics — AI in Business Analytics.

---

# 3. ACTIVE MODULES

- `TS_MASTER_PROMPT.md` — TS00 orchestration
- `TS01_FORENSIC_BASELINE.md`
- `TS02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`
- `TS03_TEMPORAL_REASONING_FORECAST_ASSESSMENT.md`
- `TS04_RUNTIME_BACKTEST_VISUALIZATION_AI.md`
- `TS05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`
- `TS06_ACCEPTANCE_HARDENING_RC_READINESS.md`
- `TS_CONSTITUTION_ROUTER.json`
- `TS_ARCHITECTURE_MAP.md`
- `STATUS.md`

---

# 4. EXECUTION COMMAND

Work/Codex may be instructed:

> Thực thi môn Time Series Analysis theo `TIME_SERIES_ANALYSIS_PROMPT_SYSTEM/00_README.md`. Đọc STATUS, xác định module active, chỉ nạp điều khoản Hiến pháp do router chỉ định, tiếp tục từ evidence hiện tại, không re-audit toàn hệ nếu diff không yêu cầu, chỉ chuyển bước khi exit gate PASS.

---

# 5. EXECUTION ORDER

`TS00 context`

→ `TS01 forensic baseline`

→ `TS02 academic/canonical foundation`

→ `TS03 temporal reasoning + forecasting assessment`

→ `TS04 runtime/backtest/visualization/AI`

→ `TS05 learning experience + authoring + integration`

→ `TS06 acceptance + hardening + RC`

→ shared production release.

---

# 6. STARTING PROCEDURE FOR EVERY SESSION

1. Read this README.
2. Read `STATUS.md`.
3. Read only the active TS module.
4. Read `TS_CONSTITUTION_ROUTER.json`.
5. Load only routed constitution clauses.
6. Inspect current-main diff / affected files.
7. Continue from current evidence.
8. Run targeted tests first.
9. Run required regression second.
10. Move forward only after current exit gate PASS.

Token rule:

`README → STATUS → ACTIVE MODULE → ROUTER → DIFF → TESTS`

not:

`all prompts → all constitutions → whole repository`.

---

# 7. STEP 1 — TS01

Open:

`TS01_FORENSIC_BASELINE.md`.

Goal:

**discover the actual Time Series scope before redesign.**

Audit:

- current time-series lessons;
- datasets and timestamp formats;
- temporal splitting;
- plots/decomposition;
- ACF/PACF;
- stationarity;
- transformations;
- differencing;
- smoothing;
- AR/MA/ARIMA/SARIMA;
- ETS/exponential smoothing;
- state-space models;
- dynamic regression;
- spectral/frequency methods;
- multivariate time-series models;
- anomaly/change-point content;
- neural sequence models;
- forecast metrics;
- backtesting;
- prediction intervals;
- runtime libraries;
- assessments;
- AI tutor;
- legacy/duplicate owners.

Important:

Later prompts contain slots for possible model families. They are not claims that every method is part of the exact Bauman syllabus.

### TS01 exit gate

Move to TS02 only when:

- actual course/repository scope is known;
- dataset/time-index conventions are mapped;
- current model families are inventoried;
- temporal-validation logic is mapped;
- runtime/tool ownership is known;
- assessment/grader paths are known;
- adjacent-subject overlap is mapped;
- duplicate/legacy risks are known;
- TS02 input contract exists.

---

# 8. STEP 2 — TS02

Open:

`TS02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`.

Goal:

**build one canonical time-series ontology.**

Canonical chain:

`Observed phenomenon`

→ `Time index`

→ `Sampling / frequency`

→ `Series`

→ `Temporal structure`

→ `Transformation`

→ `Model family`

→ `Parameters / state`

→ `Forecast origin`

→ `Forecast horizon`

→ `Forecast`

→ `Uncertainty`

→ `Backtest`

→ `Residual diagnostics`

→ `Model comparison`

→ `Claim / limitation`.

After PASS:

`TIME SERIES ACADEMIC FOUNDATION LOCKED`.

---

# 9. STEP 3 — TS03

Open:

`TS03_TEMPORAL_REASONING_FORECAST_ASSESSMENT.md`.

Goal:

**build temporal reasoning and forecasting assessment.**

Learner workflow:

`Problem`

→ `inspect time index`

→ `identify horizon`

→ `visualize/decompose`

→ `check temporal structure`

→ `choose transformation`

→ `establish baseline`

→ `choose model`

→ `fit only on past data`

→ `forecast`

→ `backtest`

→ `diagnose residuals`

→ `compare`

→ `interpret uncertainty`.

Critical rule:

> Random train/test splitting of temporally ordered data is invalid whenever it leaks future information into the past.

After PASS:

`TIME SERIES REASONING & ASSESSMENT CONTRACT LOCKED`.

---

# 10. STEP 4 — TS04

Open:

`TS04_RUNTIME_BACKTEST_VISUALIZATION_AI.md`.

Goal:

**provide capability-based time-series labs without creating another Python/ML platform.**

Potential capabilities:

- time-index parser;
- resampling/regularization tools;
- decomposition;
- ACF/PACF;
- stationarity-test provider where supported;
- ARIMA/ETS/state-space provider where supported;
- rolling-origin/expanding-window backtest;
- forecast interval visualization;
- residual diagnostics;
- spectral visualization only if supported;
- multivariate forecasting only if supported;
- neural forecasting via NN provider only if supported;
- AI Time Series Tutor.

Rules:

- future leakage is a correctness failure;
- backtest protocol is part of model evidence;
- prediction interval ≠ confidence interval automatically;
- one holdout result ≠ universal performance;
- ACF/PACF plots are evidence, not automatic model selection;
- AI cannot invent future observations or forecast scores.

---

# 11. STEP 5 — TS05

Open:

`TS05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`.

Goal:

**turn temporal reasoning into a usable subject.**

Possible UI:

- series explorer;
- time-index/data-quality panel;
- decomposition workspace;
- lag/ACF/PACF explorer;
- transformation/differencing workspace;
- forecast-origin/horizon selector;
- model configuration;
- rolling backtest;
- forecast/interval chart;
- residual diagnostics;
- model comparison;
- anomaly/change-point view only if in scope;
- neural forecast integration only if in scope;
- AI tutor;
- project/report.

Reuse:

- shared App Shell;
- Python runtime;
- ML metrics/evaluation;
- NN provider for neural models;
- Math statistics/formulas;
- shared authoring/mastery/evidence.

---

# 12. STEP 6 — TS06

Open:

`TS06_ACCEPTANCE_HARDENING_RC_READINESS.md`.

Must test at least:

- timestamps out of order;
- duplicate timestamps;
- missing timestamps/gaps;
- wrong sampling frequency;
- random-split leakage;
- future-derived feature leakage;
- rolling-window leakage;
- scaler/imputer fit on future data;
- differencing/inverse-transform errors;
- trend/seasonality confusion;
- stationarity misuse;
- ACF/PACF overinterpretation;
- wrong forecast horizon alignment;
- one-step vs multi-step mismatch;
- residual autocorrelation;
- forecast interval semantics;
- metric misuse;
- zero/near-zero denominator issues for percentage metrics where relevant;
- naive baseline omission;
- backtest window mismatch;
- exogenous-feature availability mismatch;
- neural sequence leakage if in scope;
- framework/runtime failure;
- AI fabricated forecast claims;
- exact RC readiness.

---

# 13. STEP 7 — SHARED PRODUCTION RELEASE

After TS06 PASS:

Do not create TS07.

Use:

`../../constitution/C3_RELEASE_ANNEX_SHARED.md`

with TS06 production smoke profile.

---

# 14. FAILURE ROUTING

Wrong canonical time-series concept:

→ TS02.

Wrong temporal reasoning/grader/backtest logic:

→ TS03.

Runtime/backtest/visualization/AI:

→ TS04.

UX/authoring:

→ TS05.

Regression/security/RC:

→ TS06.

Generic ML/NN/Math/Python defect:

→ corresponding foundation owner.

---

# 15. REVALIDATION

TS02 change:

→ revalidate affected TS03–TS06.

TS03 change:

→ revalidate TS04–TS06.

TS04 provider/protocol change:

→ revalidate TS05–TS06.

TS05 interaction change:

→ revalidate TS06 affected UX/a11y.

TS06 semantic defect:

→ route upstream.

---

# 16. DEFINITION OF COMPLETE

Prompt architecture complete when TS00–TS06 exist.

Repository implementation complete only after:

`TS01 PASS`

→ `TS02 PASS`

→ `TS03 PASS`

→ `TS04 PASS`

→ `TS05 PASS`

→ `TS06 PASS`

→ shared production verification.

---

# 17. FINAL PRINCIPLE

**TIME ORDER BEFORE RANDOM SPLIT.**
**FORECAST ORIGIN BEFORE FORECAST SCORE.**
**BASELINE BEFORE COMPLEX MODEL.**
**BACKTEST BEFORE CLAIM.**
**RESIDUALS BEFORE CONFIDENCE.**
**UNCERTAINTY BEFORE CERTAINTY LANGUAGE.**
**ONE CANONICAL TEMPORAL MODEL · MANY FORECASTING ENGINES.**

---

# NORMAL CHAT / WORK / CODEX ENTRY

This prompt system is channel-neutral. It may be used from an ordinary ChatGPT chat, ChatGPT Work, or Codex.

For a new ordinary chat, read only:

1. `prompts/CONSTITUTION.md`;
2. exact C1–C4 clauses routed by this subject's Constitution Router;
3. this `README.md`;
4. the subject Master Prompt;
5. `PROJECT_STATE.json`;
6. the active module prompt;
7. current repository diff/evidence only when repository work is requested.

Chat history is context, not project authority. Repository state is the durable handoff.

If the task is discussion/planning only, do not pretend repository changes were executed. If repository modification is explicitly requested and GitHub access is available, use the same state/evidence rules.

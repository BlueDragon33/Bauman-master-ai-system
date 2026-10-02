# AIBA04 — DATA · MODEL · DASHBOARD · SCENARIO · AI BUSINESS ANALYTICS INTELLIGENCE

Mode: `REUSE-DB-ML-TS · SEMANTIC-LAYER-AWARE · DECISION-CONTEXTUAL · AI-BOUNDED`

# ENTRY
Requires AIBA02/AIBA03.

# CAPABILITIES
Possible:
- `aiba.semantic.metric`
- `aiba.data.query`
- `aiba.model.score`
- `aiba.forecast.consume`
- `aiba.threshold.evaluate`
- `aiba.costvalue.compute`
- `aiba.segment.explore`
- `aiba.scenario.run`
- `aiba.dashboard.render`
- `aiba.explain.render`
- `aiba.monitor.evaluate`
- `aiba.ai.tutor`

# SEMANTIC KPI LAYER
Central canonical KPI IDs and formulas. UI/dashboard must not duplicate formulas.

# DATA / MODEL / FORECAST
Reuse Database, ML/NN and Time Series providers. AIBA interprets outputs for decisions.

# THRESHOLD / COST ENGINE
Evaluate candidate thresholds under explicit costs, capacity and action rules.

# SCENARIO ENGINE
Record base assumptions vs changed assumptions. Label conditional results honestly.

# DASHBOARD
Display KPI definitions, time windows, filters, segments and freshness. Prevent denominator drift and average-of-averages errors.

# EXPLANATION
Display model explanation with method/limitations. Never relabel predictive feature importance as causal impact.

# MONITORING
Track data freshness, KPI, model/forecast, decision and outcome.

# AI MODES
`BUSINESS_PROBLEM_COACH`, `KPI_COACH`, `METHOD_COACH`, `THRESHOLD_COACH`, `SCENARIO_COACH`, `IMPACT_COACH`, `DASHBOARD_COACH`, `MONITORING_COACH`.

# AI SAFETY
AI may not invent revenue, cost, customer counts, conversion, ROI, market facts or experiment results. It may not upgrade a predictive relationship into a causal claim.

# SECURITY / PRIVACY
Business datasets use least privilege, masking and authorized access. Sensitive commercial/customer data is not exposed in learner artifacts without authorization.

# DELIVERABLES
Create:
- `AIBA_SEMANTIC_KPI_PROVIDER_CONTRACT.md`
- `AIBA_DATA_QUERY_INTEGRATION_CONTRACT.md`
- `AIBA_MODEL_FORECAST_REFERENCE_CONTRACT.md`
- `AIBA_THRESHOLD_COST_ENGINE_CONTRACT.md`
- `AIBA_SCENARIO_ENGINE_CONTRACT.md`
- `AIBA_DASHBOARD_MONITORING_CONTRACT.md`
- `AIBA_EXPLAINABILITY_CONTRACT.md`
- `AIBA_AI_TUTOR_CONTRACT.md`
- `AIBA_SECURITY_PRIVACY_BOUNDARY.md`
- `AIBA05_INPUT_CONTRACT.md`

# GOLDEN FIXTURES
Canonical KPI, wrong denominator, threshold/cost trade-off, forecast/action mismatch, stale dashboard, scenario-vs-forecast distinction, causal-overclaim rejection and invented-ROI refusal.

# PASS
PASS when data/model/forecast/dashboard/scenario all consume canonical business semantics and AI cannot manufacture evidence.

# FINAL PRINCIPLE
**ANALYTICAL TOOLS PRODUCE EVIDENCE; THE BUSINESS DECISION MODEL EXPLAINS WHAT THAT EVIDENCE MEANS.**

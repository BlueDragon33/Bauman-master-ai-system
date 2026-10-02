# AIBA03 — BUSINESS DECISION REASONING · KPI · COST · IMPACT · ASSESSMENT

Mode: `DECISION-QUALITY-FIRST · MULTIPLE-VALID-SOLUTION-AWARE · IMPACT-SKEPTICAL`

# ENTRY
Requires AIBA02.

# REASONING LOOP
Business problem → stakeholder/decision → KPI → data → baseline → analysis/model → validation → threshold/action → cost/benefit → scenario → recommendation → monitoring → limitations.

# ASSESSMENT DIMENSIONS
Grade separately business framing, decision definition, KPI semantics, data suitability, analytical-method choice, model/forecast evidence, threshold/action logic, cost/benefit, scenario reasoning, impact claim, uncertainty, monitoring and communication.

# KPI DESIGN
Test denominator, time window, segment, aggregation, unit and relation to objective.

# MODEL METRIC VS BUSINESS METRIC
Known fixture required where technically better model produces worse business cost/value.

# THRESHOLD
Do not default to 0.5 when business costs/capacity imply otherwise.

# FORECAST TO ACTION
Forecast horizon must align with procurement/staffing/planning/action lead time.

# SEGMENTATION
Cluster quality does not establish actionability or causal meaning.

# SCENARIO / WHAT-IF
Conditional scenario ≠ causal intervention unless supported by design.

# ROI
Reject conversion of accuracy/AUC/RMSE improvement directly into revenue without validated value path.

# EXPLAINABILITY
Feature importance/local explanation ≠ intervention effect.

# MONITORING
Learner proposes monitoring across data, KPI, model, decision and outcome.

# MULTIPLE VALID STRATEGIES
Different models/thresholds/actions can be valid under same objective; grade evidence and trade-offs.

# ERROR TAXONOMY
`BUSINESS_PROBLEM_ERROR`, `DECISION_UNDEFINED`, `KPI_DEFINITION_ERROR`, `KPI_AGGREGATION_ERROR`, `DATA_SEMANTIC_ERROR`, `METHOD_MISMATCH`, `MODEL_METRIC_BUSINESS_METRIC_CONFUSION`, `THRESHOLD_ERROR`, `COST_MATRIX_ERROR`, `FORECAST_ACTION_MISMATCH`, `SEGMENT_OVERINTERPRETATION`, `SCENARIO_CAUSALITY_ERROR`, `ROI_OVERCLAIM`, `CAUSAL_OVERCLAIM`, `MONITORING_GAP`, `GOVERNANCE_GAP`, `AI_FABRICATED_BUSINESS_CLAIM`.

# TEST-OF-TESTS
Known invalid cases must fail:
- optimize accuracy with no defined decision;
- wrong KPI denominator;
- default threshold under asymmetric cost;
- forecast/action horizon mismatch;
- feature importance used as causal effect;
- ROI invented from model metric;
- segment labels treated as immutable truth;
- dashboard change presented as business impact.

# DELIVERABLES
Create:
- `AIBA_DECISION_REASONING_CONTRACT.md`
- `AIBA_KPI_ASSESSMENT_CONTRACT.md`
- `AIBA_THRESHOLD_COST_ASSESSMENT.md`
- `AIBA_SCENARIO_IMPACT_ASSESSMENT.md`
- `AIBA_RECOMMENDATION_MONITORING_CONTRACT.md`
- `AIBA_ERROR_TAXONOMY.json`
- `AIBA_GOLDEN_VALID_CASES.json`
- `AIBA_GOLDEN_INVALID_CASES.json`
- `AIBA04_INPUT_CONTRACT.md`

# PASS
PASS when analytically impressive but decision-invalid recommendations fail, while multiple defensible strategies can pass.

# FINAL PRINCIPLE
**GRADE THE QUALITY OF THE DECISION SUPPORT, NOT JUST THE QUALITY OF THE MODEL.**

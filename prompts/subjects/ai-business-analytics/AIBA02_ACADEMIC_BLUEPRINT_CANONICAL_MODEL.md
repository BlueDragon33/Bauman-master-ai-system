# AIBA02 — ACADEMIC BLUEPRINT & CANONICAL BUSINESS-DECISION ANALYTICS MODEL

Mode: `DECISION-FIRST · KPI-EXPLICIT · EVIDENCE-TRACEABLE · CANONICAL-OWNER`

# ENTRY
Requires AIBA01 evidence.

# MISSION
Define one canonical ontology connecting business problems, metrics, analytical evidence and actions.

# CANONICAL ENTITIES
`BusinessContext`, `Stakeholder`, `BusinessProblem`, `Decision`, `ActionOption`, `BusinessObjective`, `KPI`, `MetricDefinition`, `Dimension`, `Segment`, `BusinessConstraint`, `AnalyticalQuestion`, `DataSource`, `AnalyticalMethod`, `ModelReference`, `ForecastReference`, `Insight`, `Prediction`, `DecisionThreshold`, `CostMatrix`, `Scenario`, `Recommendation`, `BusinessExperiment`, `BusinessImpact`, `MonitoringRule`, `Explanation`, `GovernanceConstraint`, `HumanReviewRule`, `BusinessClaim`, `Misconception`, `Remediation`.

# BUSINESS PROBLEM
“Build a model” is not a business problem. Define unresolved business decision/need.

# DECISION
Store decision-maker, choices, timing, capacity/constraints and consequences.

# KPI CONTRACT
Every KPI has precise formula, unit, direction, time window, population/segment, aggregation, source, refresh and owner.

# ANALYTICS LEVELS
Descriptive = what happened. Diagnostic = associated factors/context. Predictive = likely outcomes under model assumptions. Prescriptive = recommended action under objective/constraints/costs.

# MODEL REFERENCE
Reference ML/NN model identity; do not duplicate algorithm truth.

# FORECAST REFERENCE
Reference Time Series origin, horizon, interval and backtest identity.

# THRESHOLD
Connect score to action and capacity/cost context.

# COST MATRIX
Represent error/action costs and benefits explicitly.

# BASELINE DECISION
Represent current/simple process for comparison.

# SEGMENTATION
Store definition, stability/actionability evidence and limitations.

# SCENARIO
Explicit assumption set; scenario is not automatically a forecast or causal effect.

# RECOMMENDATION
Store action, target, timing, evidence, expected effect, uncertainty, constraints, owner and monitoring.

# BUSINESS EXPERIMENT
If in scope, reference Research Methodology experimental-design semantics.

# BUSINESS IMPACT
Observed, estimated and projected impacts are distinct.

# ROI
If used, bind benefits/costs/time horizon/assumptions; never infer directly from ML metric uplift.

# EXPLAINABILITY
Audience and decision purpose explicit. Feature importance ≠ causality.

# MONITORING
Data freshness → KPI → model/forecast → decision rate → business outcome.

# PROVENANCE
Every business claim traces to data, model/forecast, decision rule, scenario/experiment and KPI.

# DELIVERABLES
Create:
- `AIBA_ACADEMIC_BLUEPRINT.md`
- `AIBA_COMPETENCY_GRAPH.json`
- `AIBA_PREREQUISITE_GRAPH.json`
- `AIBA_CANONICAL_ENTITY_SCHEMA.json`
- `AIBA_BUSINESS_PROBLEM_DECISION_CONTRACT.md`
- `AIBA_KPI_SEMANTIC_CONTRACT.md`
- `AIBA_ANALYTICS_METHOD_REFERENCE_CONTRACT.md`
- `AIBA_THRESHOLD_COST_VALUE_CONTRACT.md`
- `AIBA_SCENARIO_RECOMMENDATION_CONTRACT.md`
- `AIBA_MONITORING_GOVERNANCE_CONTRACT.md`
- `AIBA03_INPUT_CONTRACT.md`

# PASS
PASS when one canonical model connects decision, KPI, analytical evidence and impact without duplicating ML/DB/TS truth.

# FINAL PRINCIPLE
**THE MODEL MUST EXPLAIN HOW ANALYTICAL EVIDENCE CHANGES A BUSINESS DECISION.**

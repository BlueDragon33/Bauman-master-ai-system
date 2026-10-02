# AIBA01 — FORENSIC BASELINE

Mode: `AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST`

# MISSION
Map actual business-analytics content, data, metrics, dashboards, models, decisions and assessments.

# AUDIT TARGETS
Search actual repository for:
- business analytics / BI;
- business cases;
- KPI/metric registries;
- dashboards/reports;
- semantic layers;
- SQL/data sources;
- predictive/scoring models;
- forecasts;
- segmentation;
- threshold/cost logic;
- scenario/what-if;
- recommendation/prescriptive logic;
- experiments/A-B testing if present;
- ROI/impact claims;
- explainability;
- monitoring/drift;
- AI business assistant.

# BUSINESS CASE INVENTORY
For each case record stakeholder, decision, objective, KPI, data, analysis/model, action, claimed impact and assessment.

# KPI AUDIT
Record exact formula, numerator, denominator, unit, time window, population, segment, aggregation, source and owner. Flag same-name/different-definition metrics.

# DECISION AUDIT
Check decision-maker, action options, timing, constraints, capacity and error costs.

# DATA AUDIT
Map physical sources vs business semantics. Check missingness, duplicates, freshness, dimensional consistency and late-arriving data.

# DASHBOARD AUDIT
Map metrics, filters, segment semantics, refresh timestamps and duplicated formulas.

# MODEL/FORECAST AUDIT
Reference actual ML/TS artifacts rather than reclassifying their internal theory.

# THRESHOLD/COST AUDIT
Find how scores turn into actions and whether costs/capacity are explicit.

# IMPACT/ROI AUDIT
Trace any claimed revenue, cost reduction, retention or uplift to actual evidence and assumptions.

# CAUSALITY AUDIT
Flag causal wording unsupported by research design.

# EXPLAINABILITY AUDIT
Flag feature importance or local explanation presented as causal proof.

# MONITORING AUDIT
Map data freshness, KPI, model, decision and business-outcome monitoring.

# AI AUDIT
Check whether AI invents figures, ROI, market facts, model performance or actions without evidence.

# ASSESSMENT AUDIT
Classify tasks: framing, KPI, data/SQL, model evidence, threshold, scenario, dashboard, recommendation and report.

# DUPLICATE OWNERS
Find duplicate KPI registry, semantic layer, cost/value calculator, dashboard metric logic, scenario engine and explanation layer.

# LEGACY
KEEP / MIGRATE / RETIRE / UNKNOWN.

# DELIVERABLES
Create:
- `AIBA01_EXECUTIVE_SUMMARY.md`
- `AIBA01_REPOSITORY_MAP.md`
- `AIBA01_BUSINESS_CASE_INVENTORY.json`
- `AIBA01_KPI_SEMANTIC_AUDIT.md`
- `AIBA01_DATA_MODEL_DASHBOARD_AUDIT.md`
- `AIBA01_DECISION_IMPACT_AUDIT.md`
- `AIBA01_ASSESSMENT_GRADER_AUDIT.md`
- `AIBA01_ADJACENT_SUBJECT_MAP.md`
- `AIBA01_DUPLICATE_OWNER_MAP.md`
- `AIBA01_RISK_REGISTER.json`
- `AIBA02_INPUT_CONTRACT.md`

# PASS
PASS only when actual business cases, KPI semantics, data/model/decision flow, assessment and owners are evidenced.

# FINAL PRINCIPLE
**AUDIT HOW ANALYTICS CHANGES A DECISION, NOT JUST WHICH DASHBOARDS AND MODELS EXIST.**

# LSE01 — FORENSIC BASELINE

Mode:
`AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST`

# MISSION

Discover actual lifecycle/systems-engineering reality before canonicalization.

# AUDIT TARGETS

Audit:
- lifecycle/process terminology;
- stakeholder needs;
- requirements;
- requirement hierarchy;
- architecture allocation;
- interfaces;
- integration;
- verification;
- validation;
- acceptance;
- traceability;
- configuration items;
- baselines;
- revision/change workflow;
- impact analysis;
- risk;
- technical decisions/trade studies;
- reviews/gates;
- operation/maintenance;
- migration/evolution;
- retirement if present;
- assessments;
- authoring;
- duplicate owners;
- legacy.

# REQUIREMENT AUDIT

Record:
ID, text, type, source, owner, rationale, revision, status, parent, allocation, verification method.

Flag:
- ambiguity;
- compound statements;
- missing quantity/unit;
- unverifiable wording;
- missing owner/source;
- solution bias.

# TRACEABILITY AUDIT

Map:
need→requirement,
requirement→architecture,
requirement→interface,
requirement→implementation,
requirement→verification,
need→validation,
change→affected artifacts.

Find orphan/stale/wrong links.

# V&V AUDIT

For verification:
requirement, method, procedure/case, environment, expected, actual, evidence, baseline.

For validation:
stakeholder/context, scenario, acceptance need, evidence, baseline.

# CONFIGURATION / BASELINE AUDIT

Find configuration items, revision rules, baseline identity and mutation risks.

# CHANGE / IMPACT AUDIT

Map change request → impact → approval → implementation → re-verification/re-validation → closure.

# RISK AUDIT

Find cause/event/consequence/likelihood/impact/owner/treatment/status.

# BOUNDARY AUDIT

Separate lifecycle engineering from:
- OOPSE;
- Reliability;
- HCI;
- Security;
- Project Management.

# DELIVERABLES

Create:
- `LSE01_EXECUTIVE_SUMMARY.md`
- `LSE01_REPOSITORY_MAP.md`
- `LSE01_LIFECYCLE_ARTIFACT_INVENTORY.json`
- `LSE01_REQUIREMENT_TRACEABILITY_AUDIT.md`
- `LSE01_VV_INTEGRATION_AUDIT.md`
- `LSE01_CONFIGURATION_CHANGE_RISK_AUDIT.md`
- `LSE01_PROJECT_MANAGEMENT_BOUNDARY_MAP.md`
- `LSE01_ASSESSMENT_GRADER_AUDIT.md`
- `LSE01_DUPLICATE_OWNER_MAP.md`
- `LSE01_RISK_REGISTER.json`
- `LSE02_INPUT_CONTRACT.md`

# PASS

PASS only when actual lifecycle artifacts, ownership, evidence paths and overlaps are evidenced.

# FINAL PRINCIPLE

**AUDIT THE TECHNICAL LIFECYCLE, NOT JUST THE DOCUMENT FOLDER.**

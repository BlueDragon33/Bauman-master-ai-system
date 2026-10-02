# SEC05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION

Mode:

`SHARED-DESIGN-SYSTEM · THREAT-TRACEABLE · DEFENSIVE · NO-CODE-FIRST · ACCESSIBLE`

# ENTRY

Requires SEC02–SEC04.

# PRIMARY SURFACES

Possible:
- system/asset canvas;
- data-flow/trust-boundary view;
- threat model;
- risk register;
- security-requirement editor;
- control matrix;
- identity/access matrix;
- secure-architecture review;
- data-protection workspace;
- audit/monitoring view;
- incident tabletop;
- recovery scenario;
- AI tutor;
- security report.

# ASSET / MISSION CANVAS

Show:
asset,
owner,
criticality,
security objectives,
dependencies.

# TRUST-BOUNDARY VIEW

Data-flow/security-boundary relationships.
Structured alternative required.

# THREAT MODEL UX

Threat scenario fields are explicit.
Avoid dramatic “hacker” aesthetics that obscure engineering reasoning.

# RISK REGISTER UX

Threat → impact → control → residual risk.

# SECURITY REQUIREMENT UX

Trace to asset/threat/control/verification.

# CONTROL MATRIX

Preventive/detective/corrective/recovery functions as actual taxonomy supports.

# IDENTITY / ACCESS UX

Subject × resource × action × policy.

# DATA SECURITY UX

Classification, storage, transit, access, retention, backup.

# AUDIT / MONITORING UX

Events and detection logic with redaction context.

# INCIDENT TABLETOP UX

Decision cards:
detect,
contain,
recover,
communicate/escalate,
evidence,
post-incident action.

# AI TUTOR UX

Advisory and defensive.
Never presents an unverified vulnerability as confirmed.

# ERROR NOTEBOOK

Recurring:
asset omission,
trust boundary,
risk,
authn/authz,
overprivilege,
secret handling,
logging,
recovery,
evidence overclaim.

# RESPONSIVE / ACCESSIBILITY

Security diagrams have structured alternatives.
Risk severity not color-only.
Keyboard/focus/text scaling supported.

# AUTHORING

No-code authoring can create:
- asset/threat scenario;
- risk task;
- access-control case;
- secure-data case;
- configuration review;
- logging/audit case;
- incident tabletop;
- recovery exercise;
- defensive code-review task.

# SAFETY VALIDATION

Before publish:
- no live target;
- no real credentials;
- no deployable malicious artifact;
- no hidden secret;
- no uncontrolled network access;
- expected learner actions remain defensive.

# MULTIPLE VALID DEFENSES

Rubrics accept different defensible controls if requirements/evidence are satisfied.

# SUBJECT PACK

Canonical content + safe synthetic cases + defensive fixtures.
Never package real secrets/credentials.

# DELIVERABLES

Create:
- `SEC_SUBJECT_MANIFEST.md`
- `SEC_LEARNING_BLOCK_REGISTRY.json`
- `SEC_THREAT_RISK_WORKSPACE_UX_CONTRACT.md`
- `SEC_IDENTITY_ACCESS_UX_CONTRACT.md`
- `SEC_SECURITY_VERIFICATION_UX_CONTRACT.md`
- `SEC_INCIDENT_RECOVERY_UX_CONTRACT.md`
- `SEC_AUTHORING_SCHEMA_CONTRACT.md`
- `SEC_SAFE_CASE_PACK_CONTRACT.md`
- `SEC_RESPONSIVE_ACCESSIBILITY_MATRIX.md`
- `SEC_SUBJECT_PACK_CONTRACT.md`
- `SEC06_INPUT_CONTRACT.md`

# PILOTS

A — asset/threat model  
B — authn vs authz  
C — least-privilege policy  
D — secret/config review  
E — audit/monitoring gap  
F — backup/restore incident  
G — no-code defensive case authoring

# PASS

PASS when threat/risk/control/evidence remain visible and ordinary defensive security cases are authorable without app-code changes.

# FINAL PRINCIPLE

**DO NOT TURN THE SECURITY COURSE INTO A BAG OF ATTACK DEMOS; KEEP THE ENGINEERING CHAIN VISIBLE.**

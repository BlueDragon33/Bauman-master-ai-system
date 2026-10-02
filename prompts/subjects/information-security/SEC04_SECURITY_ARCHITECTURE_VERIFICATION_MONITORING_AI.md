# SEC04 — SECURITY ARCHITECTURE · VERIFICATION · MONITORING · AI

Mode:

`DEFENSIVE-LAB · ISOLATED-FIXTURES · TRACEABLE-EVIDENCE · AI-BOUNDED`

# ENTRY

Requires SEC02/SEC03.

# CAPABILITIES

Possible:
- `sec.asset.map`
- `sec.trustboundary.map`
- `sec.threatmodel.validate`
- `sec.accesspolicy.evaluate`
- `sec.config.review`
- `sec.secret.check`
- `sec.dependency.inspect`
- `sec.code.review`
- `sec.securitytest.run`
- `sec.auditlog.inspect`
- `sec.incident.tabletop`
- `sec.restore.verify`
- `sec.ai.tutor`

Only actual scope.

# SAFE LAB BOUNDARY

Use:
- local mock systems;
- prebuilt fixtures;
- static snippets;
- synthetic logs;
- controlled authorization matrices;
- deliberately safe misconfiguration examples.

Do NOT create a live exploitation environment against external systems.

# SECURITY ARCHITECTURE VIEW

Show:
assets,
components,
trust boundaries,
data flows,
security controls.

# ACCESS POLICY EVALUATOR

Given subject/resource/action/context:
return allow/deny + policy rationale.

# CONFIGURATION REVIEW

Compare configuration against explicit security requirement/profile.

# SECRET CHECKER

Detect unsafe secret placement in controlled artifacts.
Never display real secrets.

# DEPENDENCY INSPECTION

If supported:
package identity,
version,
advisory reference,
update path,
provenance.

# SECURE CODE REVIEW

Defensive pattern identification.
No exploit generation required.

# SECURITY TEST RUN

Safe negative/positive tests:
authn/authz,
data access,
configuration,
logging,
recovery.

# SCANNER OUTPUT

Label:
potential,
confirmed,
false positive,
needs review
according evidence.

# AUDIT LOG VIEW

Inspect:
actor/action/resource/result/time,
redaction,
integrity context.

# INCIDENT TABLETOP

Scenario-based decision exercise.
No destructive execution.

# RESTORE VERIFICATION

Use isolated fixture:
backup identity,
restore target,
integrity checks,
RTO/RPO concepts only if actual scope.

# AI TUTOR MODES

`ASSET_COACH`
`THREAT_MODEL_COACH`
`RISK_COACH`
`ACCESS_CONTROL_COACH`
`DATA_SECURITY_COACH`
`SECURE_ARCHITECTURE_COACH`
`MONITORING_COACH`
`INCIDENT_COACH`
`RECOVERY_COACH`

# AI GROUNDING

Canonical system context + requirements + safe evidence + learner attempt.

# AI SAFETY

AI must:
- distinguish hypothetical/potential from confirmed vulnerability;
- never fabricate breach evidence;
- never expose secrets;
- never convert defensive case into unauthorized live action;
- not write official security PASS.

# SECURITY OF THE SECURITY LAB

Isolate learner fixtures.
No production credentials.
No unrestricted outbound control path.

# OBSERVABILITY

Track:
policy-evaluator mismatch,
stale config,
test failure,
scanner disagreement,
audit-log failure,
restore failure,
AI unsupported claim.

# DELIVERABLES

Create:
- `SEC_SECURITY_ARCHITECTURE_CONTRACT.md`
- `SEC_ACCESS_POLICY_EVALUATOR_CONTRACT.md`
- `SEC_SAFE_SECURITY_LAB_CONTRACT.md`
- `SEC_CONFIGURATION_SECRET_CHECK_CONTRACT.md`
- `SEC_DEPENDENCY_CODE_REVIEW_CONTRACT.md`
- `SEC_AUDIT_MONITORING_CONTRACT.md`
- `SEC_INCIDENT_RECOVERY_LAB_CONTRACT.md`
- `SEC_AI_TUTOR_CONTRACT.md`
- `SEC_SECURITY_LAB_BOUNDARY.md`
- `SEC05_INPUT_CONTRACT.md`

# GOLDEN FIXTURES

At minimum:
- overprivileged access;
- missing authorization;
- exposed fake secret;
- insecure config;
- missing audit event;
- false-positive scanner result;
- backup/restore mismatch;
- AI refuses unsupported breach claim.

# PASS

PASS when all labs are defensive/isolated and security findings remain evidence-qualified.

# FINAL PRINCIPLE

**SECURITY LABS SHOULD TEACH HOW TO FIND, VERIFY AND FIX RISK WITHOUT TEACHING UNAUTHORIZED REAL-WORLD COMPROMISE.**

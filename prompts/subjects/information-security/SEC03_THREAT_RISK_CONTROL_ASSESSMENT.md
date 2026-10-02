# SEC03 — THREAT · RISK · CONTROL · SECURITY ASSESSMENT

Mode:

`DEFENSIVE · THREAT-MODEL-FIRST · RISK-CONTEXTUAL · MULTIPLE-VALID-CONTROL-AWARE`

# ENTRY

Requires SEC02.

# REASONING LOOP

`System/Mission`
→ `Asset`
→ `Trust Boundary`
→ `Security Objective`
→ `Threat Scenario`
→ `Weakness/Exposure`
→ `Risk`
→ `Security Requirement`
→ `Control`
→ `Verification`
→ `Residual Risk`
→ `Monitoring/Recovery`

# ASSESSMENT DIMENSIONS

Grade separately:
- asset identification;
- trust boundary;
- security objective;
- threat scenario;
- weakness/exposure;
- risk reasoning;
- requirement quality;
- control selection;
- defense in depth;
- verification;
- residual risk;
- monitoring/recovery.

# AUTHENTICATION VS AUTHORIZATION

Known confusion fixture required.

# LEAST PRIVILEGE

Learner identifies overprivileged role/policy.

# ACCESS CONTROL

Evaluate permitted/denied actions from explicit policy.
Do not reward security through obscurity.

# DATA PROTECTION

Separate:
at rest,
in transit,
in use/access,
backup,
retention.

# ENCRYPTION MISUSE

Reject:
“encrypted therefore secure” without key/access/endpoint context.

# PASSWORD / SECRET HANDLING

Conceptual secure storage/rotation/access.
No credential harvesting tasks.

# SESSION

If scope:
expiration,
revocation,
replay/stale assumptions.

# INPUT / OUTPUT SECURITY

Defensive validation/encoding concepts where supported.
Do not turn into exploit payload training.

# DEPENDENCY SECURITY

If scope:
version/provenance/advisory/update reasoning.

# LOGGING / AUDIT

Security events must support accountability without leaking unnecessary secrets.

# INCIDENT SCENARIO

Assess:
detection,
containment,
recovery,
evidence preservation,
lessons learned
at conceptual level.

# BACKUP / RESTORE

Backup existence does not prove recoverability.

# MULTIPLE VALID CONTROLS

Different defense sets may be valid.
Grade risk reduction/evidence/trade-offs.

# ERROR TAXONOMY

`ASSET_OMISSION`
`TRUST_BOUNDARY_ERROR`
`SECURITY_OBJECTIVE_ERROR`
`THREAT_SCENARIO_ERROR`
`RISK_CONTEXT_ERROR`
`REQUIREMENT_GAP`
`CONTROL_THREAT_MISMATCH`
`AUTHN_AUTHZ_CONFUSION`
`OVERPRIVILEGE`
`SECRET_HANDLING_ERROR`
`DATA_PROTECTION_GAP`
`LOGGING_GAP`
`RECOVERY_GAP`
`SCANNER_OVERCLAIM`
`RESIDUAL_RISK_OVERCLAIM`
`AI_SECURITY_EVIDENCE_FABRICATION`

# HINT LADDER

H1 identify asset  
H2 identify trust boundary/objective  
H3 formulate threat scenario  
H4 identify weakness/risk  
H5 derive requirement  
H6 select layered controls  
H7 define verification  
H8 analyze residual risk/recovery

# TEST-OF-TESTS

Known invalid recommendations must fail:
- “install firewall” with no threat model;
- authenticate user but never authorize resource;
- admin role for convenience;
- secrets in source/config exposed to learner;
- encryption with unmanaged keys;
- audit logs containing secrets;
- backup never restore-tested;
- scanner warning presented as confirmed breach.

# AI BOUNDARY

AI may coach.
AI cannot generate or validate an offensive real-world exploit workflow.

# DELIVERABLES

Create:
- `SEC_SECURITY_REASONING_CONTRACT.md`
- `SEC_THREAT_RISK_ASSESSMENT_CONTRACT.md`
- `SEC_IDENTITY_ACCESS_ASSESSMENT.md`
- `SEC_DATA_SECURITY_ASSESSMENT.md`
- `SEC_INCIDENT_RECOVERY_ASSESSMENT.md`
- `SEC_ERROR_TAXONOMY.json`
- `SEC_GOLDEN_VALID_SECURITY_CASES.json`
- `SEC_GOLDEN_INVALID_SECURITY_CASES.json`
- `SEC04_INPUT_CONTRACT.md`

# PASS

PASS when grader requires threat→requirement→control→evidence traceability and accepts multiple defensible control sets.

# FINAL PRINCIPLE

**GRADE RISK REDUCTION AND EVIDENCE, NOT THE NUMBER OF SECURITY PRODUCTS NAMED.**

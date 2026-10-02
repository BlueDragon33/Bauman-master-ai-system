# SEC01 — FORENSIC BASELINE
## Resolve elective profile and audit current security reality

Mode:

`AUDIT-ONLY · NO-REDESIGN · DEFENSIVE · REPOSITORY-TRUTH-FIRST`

# MISSION

Determine the exact Bauman elective/security profile and map actual repository security content before canonicalization.

# 1. ELECTIVE PROFILE RESOLUTION

Determine:

`PROFILE_A_INFORMATION_PROTECTION`

or

`PROFILE_B_INFORMATION_SECURITY`

or retain:

`PROFILE_SHARED_UNRESOLVED`

if evidence is insufficient.

Record evidence source.

Do not infer detailed syllabus from course title alone.

# 2. DISCOVERY

Search for:
- information security;
- information protection;
- CIA;
- threat;
- vulnerability;
- risk;
- access control;
- authentication;
- authorization;
- encryption;
- key management;
- network security;
- database security;
- application security;
- secure coding;
- secrets;
- logging;
- audit;
- incident;
- backup/recovery;
- privacy;
- dependency/supply chain;
- security testing;
- policy/governance.

# 3. ASSET INVENTORY

Map actual protected:
- data;
- credentials;
- accounts;
- services;
- models;
- code;
- configuration;
- devices;
- logs;
- business/learning records.

# 4. TRUST BOUNDARY AUDIT

Map:
- client/server;
- public/private;
- learner/admin;
- app/plugin;
- runtime/host;
- internal/external service;
- network zones where applicable.

# 5. THREAT MODEL AUDIT

Find existing:
- assets;
- actors;
- threat scenarios;
- attack surfaces;
- assumptions.

Stay conceptual/defensive.

# 6. SECURITY REQUIREMENT AUDIT

Find:
confidentiality,
integrity,
availability,
authentication,
authorization,
audit,
retention,
recovery,
other actual requirements.

# 7. AUTHENTICATION AUDIT

Map:
identity lifecycle,
login,
session,
MFA if present,
password/token handling,
recovery.

# 8. AUTHORIZATION AUDIT

Map:
roles,
permissions,
resource ownership,
policy enforcement points.

# 9. DATA SECURITY AUDIT

Map:
classification,
storage,
transit,
access,
retention,
deletion,
backup.

# 10. CRYPTOGRAPHY AUDIT

Inventory conceptual use:
encryption,
hash/MAC/signature,
key/token,
certificates.

Do not treat implementation detail as mathematically verified cryptography.

# 11. APPLICATION SECURITY AUDIT

Map safe defensive topics:
input validation,
output handling,
authz,
sessions,
secrets,
dependencies,
secure configuration,
error handling.

# 12. DATABASE SECURITY AUDIT

Map:
least privilege,
credentials,
row/resource access,
injection prevention concepts,
audit,
backup.

# 13. NETWORK SECURITY AUDIT

If present:
segmentation,
firewall policy,
TLS,
service exposure,
remote access.

# 14. LOGGING / MONITORING AUDIT

Map:
security events,
actor/action/resource/result,
tamper/audit expectations,
alerting.

# 15. INCIDENT / RECOVERY AUDIT

Find:
detection,
containment,
eradication/recovery at conceptual level,
restore,
lessons learned.

# 16. SECURITY TESTING AUDIT

Map defensive:
static review,
dependency scan,
configuration scan,
authz tests,
safe negative tests,
security regression.

# 17. PRIVACY / GOVERNANCE AUDIT

Only actual scope.
Separate law/policy source from implementation assumptions.

# 18. HUMAN FACTORS AUDIT

Map phishing/social-engineering awareness only at a preventive/educational level.

# 19. ASSESSMENT AUDIT

Classify:
threat modeling,
risk,
security requirement,
control selection,
architecture review,
access-control reasoning,
incident scenario,
secure code/config critique.

# 20. GRADER AUDIT

Check exact-control bias:
multiple defenses may be valid.

# 21. AI AUDIT

Check whether AI:
- invents exploitability;
- invents breach evidence;
- suggests unsafe real-world actions;
- writes security PASS without evidence;
- exposes hidden fixtures.

# 22. DUPLICATE OWNER AUDIT

Find duplicate:
security policy registry,
role/permission registry,
secret validator,
security scanner,
risk registry,
audit-event model.

# 23. LEGACY

KEEP / MIGRATE / RETIRE / UNKNOWN.

# 24. DELIVERABLES

Create:
- `SEC01_EXECUTIVE_SUMMARY.md`
- `SEC01_ELECTIVE_PROFILE_RESOLUTION.md`
- `SEC01_REPOSITORY_MAP.md`
- `SEC01_ASSET_TRUST_BOUNDARY_INVENTORY.json`
- `SEC01_SECURITY_REQUIREMENT_CONTROL_AUDIT.md`
- `SEC01_IDENTITY_ACCESS_DATA_AUDIT.md`
- `SEC01_SECURITY_TESTING_MONITORING_AUDIT.md`
- `SEC01_ADJACENT_SUBJECT_MAP.md`
- `SEC01_DUPLICATE_OWNER_MAP.md`
- `SEC01_RISK_REGISTER.json`
- `SEC02_INPUT_CONTRACT.md`

# PASS

PASS only when actual elective profile/scope, security artifacts, tooling and ownership are evidenced.

# FINAL PRINCIPLE

**DO NOT BUILD A GENERIC CYBERSECURITY COURSE AROUND A COURSE TITLE; RESOLVE THE ACTUAL ASOIU SECURITY SCOPE FIRST.**

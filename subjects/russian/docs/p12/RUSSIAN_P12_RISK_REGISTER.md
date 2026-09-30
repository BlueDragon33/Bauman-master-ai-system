# Russian P12 Risk Register

| ID | Severity | Risk | Control |
|---|---|---|---|
| P12-R001 | BLOCKER | Editor/import bypasses P3 owner registry | Candidate validator resolves exact canonical owner and rejects derived/unowned targets |
| P12-R002 | CRITICAL | Content Review becomes a second content database | Metadata-only invariant retained and validated |
| P12-R003 | CRITICAL | Generated output is promoted without P7 verification | Canonical promotion requires verified provenance |
| P12-R004 | HIGH | Approval is confused with canonical publish | Lifecycle separates APPROVED from CANONICAL_PATCHED/PUBLISHED |
| P12-R005 | HIGH | Bulk import overwrites canonical datasets | Staging-only + per-item validation |
| P12-R006 | HIGH | Review replay/duplicate revision corrupts workflow | Existing idempotent/CAS Content Review service retained |
| P12-R007 | MEDIUM | Derived index becomes a fact owner | Direct authoring of derived responsibilities is forbidden |

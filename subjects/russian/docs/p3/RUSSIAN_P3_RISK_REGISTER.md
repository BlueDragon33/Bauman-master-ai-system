# Russian P3 Risk Register

| ID | Severity | Risk | P3 control | Later owner |
|---|---|---|---|---|
| P3-R001 | BLOCKER | Multiple files become owners of the same linguistic fact | unique target owner topology + derived classification | P3/P16 |
| P3-R002 | BLOCKER | Stable IDs change and orphan learner references | immutable ID constitution + legacy aliases | P3 migration |
| P3-R003 | CRITICAL | P3 fabricates stress/morphology/POS/government while normalizing vocab | schema permits unknown; migration explicitly forbids inference | P7 linguistic validation |
| P3-R004 | CRITICAL | Assessment schema changes scoring/mastery persistence before P4 | assessment content owner preserved; scoring/state explicitly deferred | P4 |
| P3-R005 | HIGH | knowledge-index/speaking-link-index become shadow canonical sources | classify as DERIVED and require regeneration path | P12/P14 |
| P3-R006 | HIGH | New canonical files are created with fake/empty authority | planned owners may remain absent until verified content exists | P7/P12 |
| P3-R007 | HIGH | Migration is non-idempotent or silently resets state | read→validate→map→write→validate, run-twice invariant, rollback | P3/P4 |
| P3-R008 | HIGH | Unit/micro-lesson embeds full canonical facts and duplicates truth | reference IDs only; no full canonical embedding | P3 |
| P3-R009 | MEDIUM | Package/chunk becomes mistaken for canonical owner | pack ≠ owner | P14 |
| P3-R010 | MEDIUM | schemaVersion and contentRevision are conflated | separate technical schema version from content revision | P3 |

## Exit rule

P3 may PASS when every canonical entity type has one resolved target owner, derived outputs are explicitly non-authoritative, schema/ID/graph/migration invariants validate, current runtime owners remain compatible, and no state/mastery migration is performed prematurely.

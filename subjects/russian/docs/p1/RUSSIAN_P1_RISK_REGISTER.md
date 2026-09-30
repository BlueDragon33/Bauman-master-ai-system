# Russian P1 Risk Register

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`
P1 exit state: **PASS**

| ID | Severity | Risk | Owner / must fix before | P1 disposition |
|---|---|---|---|---|
| P1-R001 | BLOCKER | Oversize learner state may be deleted without backup | P4 state migration / P14 | discovered, evidenced, assigned; outside P1 audit-only change scope |
| P1-R002 | CRITICAL | ASR transcript similarity is exposed as speaking score/pass evidence | P4/P6 PASS | discovered, evidenced, assigned; outside P1 audit-only change scope |
| P1-R003 | HIGH | 8,000-word bank lacks canonical stress authority | P2/P3 lexical exit | becomes P2/P3 entry work |
| P1-R004 | HIGH | Legacy CSS cascade ownership ambiguity | P13/P16 | ownership map captured; no bulk deletion in P1 |
| P1-R005 | HIGH | `core.js` still spans many responsibilities | P16 | preserve until owner-phase refactor is evidenced |
| P1-R006 | HIGH → MITIGATED | Russian diffs did not trigger whole-system browser CI | P1 exit | fixed; run `36689384878` PASS |
| P1-R007 | MEDIUM | Source/package parity risk for >60 MB optional datasets | P14/P15 | baseline captured; later hardening/acceptance owner |

## Exit interpretation
P1 is an audit/tooling phase. P1 PASS means risks are truthfully discovered, evidenced and assigned to their canonical future owner; it does **not** mean product-level risks P1 is forbidden to modify are prematurely patched.

See machine-readable `RUSSIAN_P1_RISK_REGISTER.json` for detailed evidence and mitigation fields.

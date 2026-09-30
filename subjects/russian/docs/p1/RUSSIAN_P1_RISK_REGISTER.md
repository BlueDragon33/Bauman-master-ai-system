# Russian P1 Risk Register

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

| ID | Severity | Risk | Must fix before |
|---|---|---|---|
| P1-R001 | BLOCKER | Oversize learner state may be deleted without backup | P4 state migration / P14 |
| P1-R002 | CRITICAL | ASR transcript similarity is exposed as speaking score/pass evidence | P4/P6 PASS |
| P1-R003 | HIGH | 8,000-word bank lacks canonical stress authority | P2/P3 lexical exit |
| P1-R004 | HIGH | Legacy CSS cascade ownership ambiguity | P13/P16 |
| P1-R005 | HIGH | `core.js` still spans many responsibilities | P16 |
| P1-R006 | HIGH → mitigated in audit tooling | Russian diffs did not trigger whole-system browser CI | P1 exit |
| P1-R007 | MEDIUM | Source/package parity risk for >60 MB optional datasets | P14/P15 |

See machine-readable `RUSSIAN_P1_RISK_REGISTER.json` for evidence and mitigation fields.

# Russian P4 Risk Register

| ID | Severity | Risk | P4 control | Exit status |
|---|---|---|---|---|
| P4-R001 | BLOCKER → FIXED | Oversize core learner state was deleted automatically | preserve raw state, recovery metadata, block auto-overwrite | PASS · source/package |
| P4-R002 | BLOCKER → FIXED | Malformed state could silently fall back and later be overwritten | fail-closed recovery block, explicit replacement only | PASS · source/package |
| P4-R003 | CRITICAL → FIXED | Retry/reset could lose canonical first-attempt detail | additive immutable canonical attempt store | PASS · immutable/idempotent browser test |
| P4-R004 | CRITICAL → FIXED | Manual speaking confirmation wrote fake `score:100` | self-confirmation signal with `score:null` | PASS · truthful signal semantics |
| P4-R005 | CRITICAL → FIXED | ASR similarity may be misread as pronunciation/mastery score | label transcript similarity as signal only; canonical mastery owner excludes ASR direct write | PASS · non-authoritative evidence test |
| P4-R006 | HIGH | 1,320-question bank is entirely multiple-choice and may overclaim mastery | classify as recognition-heavy gate component | documented |
| P4-R007 | HIGH | Legacy 100 questions / 80% may be treated as total mastery | preserve only as assessment component | documented |
| P4-R008 | HIGH → CONTROLLED | General review queue and vocab SRS look like duplicate schedulers | explicit non-overlapping scope ownership | PASS · ownership contract |
| P4-R009 | HIGH → FIXED | AI/presentation could write official mastery | canonical owner API only; presentation/AI non-authoritative | PASS · render-purity/browser |
| P4-R010 | HIGH | Historical summaries may be backfilled as fake first attempts | migration forbids fabricated item-level history | documented |
| P4-R011 | MEDIUM | Stage gate may average away a critical speaking/writing failure | critical competency gate matrix | P5/P6 integration |
| P4-R012 | MEDIUM → FIXED | Offline/package behavior may diverge from source | source + packaged browser acceptance | PASS |

## Exit rule

P4 exit gate satisfied at validated runtime head `3d0bca33babae6054b187b3c3a6b9a0585685083`. Remaining P4-R011 is a MEDIUM downstream integration obligation for P5/P6, not an unresolved P4 blocker/critical.

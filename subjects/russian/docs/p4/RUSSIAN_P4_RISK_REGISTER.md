# Russian P4 Risk Register

| ID | Severity | Risk | P4 control | Exit status |
|---|---|---|---|---|
| P4-R001 | BLOCKER → FIXED | Oversize core learner state was deleted automatically | preserve raw state, recovery metadata, block auto-overwrite | validate runtime |
| P4-R002 | BLOCKER → FIXED | Malformed state could silently fall back and later be overwritten | fail-closed recovery block, explicit replacement only | validate runtime |
| P4-R003 | CRITICAL → FIXED | Retry/reset could lose canonical first-attempt detail | additive immutable canonical attempt store | validate runtime |
| P4-R004 | CRITICAL → FIXED | Manual speaking confirmation wrote fake `score:100` | self-confirmation signal with `score:null` | validate UI/runtime |
| P4-R005 | CRITICAL | ASR similarity may be misread as pronunciation/mastery score | label transcript similarity as signal only; canonical mastery owner excludes ASR direct write | validate UI |
| P4-R006 | HIGH | 1,320-question bank is entirely multiple-choice and may overclaim mastery | classify as recognition-heavy gate component | documented |
| P4-R007 | HIGH | Legacy 100 questions / 80% may be treated as total mastery | preserve only as assessment component | documented |
| P4-R008 | HIGH | General review queue and vocab SRS look like duplicate schedulers | explicit non-overlapping scope ownership | validate contract |
| P4-R009 | HIGH | AI/presentation could write official mastery | canonical owner API only; presentation/AI non-authoritative | validate static/browser |
| P4-R010 | HIGH | Historical summaries may be backfilled as fake first attempts | migration forbids fabricated item-level history | documented |
| P4-R011 | MEDIUM | Stage gate may average away a critical speaking/writing failure | critical competency gate matrix | P5/P6 integration |
| P4-R012 | MEDIUM | Offline/package behavior may diverge from source | source + packaged browser acceptance | pending |

## Exit rule

P4 cannot PASS until the runtime fixes marked “validate runtime” are proven in source and packaged browser acceptance, the canonical attempt/mastery owner is single-owner, and existing Russian regression remains green.

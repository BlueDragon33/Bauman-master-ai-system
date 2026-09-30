# Russian P7 Risk Register

| ID | Severity | Risk | Control / owner |
|---|---|---|---|
| P7-R001 | HIGH | 8,000-word bank lacks explicit stress authority | keep stress fail-closed; no auto-inference; P7 provenance workflow |
| P7-R002 | HIGH | lexical POS/forms/government/aspect depth is sparse | no fabricated enrichment; verify field-by-field |
| P7-R003 | HIGH | large speaking/dialogue corpora may contain unnatural/register-mismatched phrases | mark dataset confidence partial until sampled/reviewed |
| P7-R004 | MEDIUM | technical terms can drift by domain | require domain + source provenance; P8 consumes policy |
| P7-R005 | CRITICAL if violated | generated content promoted as canonical truth | validator forbids VERIFIED without sourceRefs + reviewer + reviewedAt |
| P7-R006 | CRITICAL if violated | P7 writes mastery/SRS/audio state | forbidden by foundation lock; regression gates |

# Russian P7 Linguistic Confidence Policy

| State | Meaning | May teach as canonical truth? | Required evidence |
|---|---|---:|---|
| VERIFIED | reviewed linguistic claim | yes | sourceRefs + reviewer + reviewedAt + claim/value |
| SOURCE_ASSERTED | identifiable source, review incomplete | no | source reference |
| PARTIAL | only named fields supported | only supported fields | per-field evidence |
| UNVERIFIED | legacy/import/generated content without sufficient authority | no | none/insufficient |
| REJECTED | invalid/contradicted/malformed | no | rejection reason |

## Per-field confidence
Confidence is attached to a **claim**, not blindly to an entire record. A vocabulary row may have verified orthography but unverified stress or morphology.

## Fail-closed projection
When authority is missing:
- keep the original value if needed for legacy learning flow;
- label/represent it as unverified where authority matters;
- never synthesize a missing stress, case government, aspect pair or morphology field;
- never derive linguistic confidence from mastery, ASR score, SRS state or learner success.

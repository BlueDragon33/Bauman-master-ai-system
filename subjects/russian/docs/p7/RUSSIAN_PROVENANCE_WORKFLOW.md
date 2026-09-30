# Russian P7 Provenance Workflow

`OBSERVE → TRACE OWNER → IDENTIFY CLAIM → COLLECT SOURCE → REVIEW → ASSIGN CONFIDENCE → VALIDATE → PROMOTE`

## Candidate record
Every promotion candidate must identify:
- canonical owner and canonical ID;
- claim type (stress/morphology/government/aspect/collocation/register/naturalness/terminology);
- proposed canonical value;
- source references;
- reviewer;
- review timestamp;
- confidence;
- previous value and rollback note.

## Promotion rules
1. Never rewrite a canonical dataset from generated output directly.
2. No bulk stress/morphology inference from transliteration or TTS.
3. A reviewer can promote only the named claim/field supported by evidence.
4. Derived indexes must be regenerated from canonical IDs; they do not become fact owners.
5. Conflicting sources remain `PARTIAL`/review-required until resolved.
6. Every batch must be rollbackable by canonical IDs.

## Generated-content workflow
`GENERATED_CANDIDATE → UNVERIFIED → SOURCE_ATTACHED → REVIEWED → VERIFIED`

Skipping a state is prohibited.

# RU03 — Linguistic Authority & Content Validation Policy

State: **PASS (authority architecture / fail-closed truth model)**

## Rule
**No source · no authoritative claim.** Schema validity, learner success, TTS, ASR, frequency and AI output are not linguistic authority.

## Two independent dimensions
1. Trust/provenance: AUTHORITATIVE, CURATED, CORPUS_SOURCE_SUPPORTED, GENERATED_MACHINE_SUGGESTED, LEGACY_UNVERIFIED, UNKNOWN.
2. Validation result: VERIFIED, VERIFIED_WITH_VARIANTS, CONTEXT_DEPENDENT, DISPUTED, UNVERIFIED, INCORRECT.

A record can be structurally valid and still be UNVERIFIED.

## Source hierarchy
Use the strongest applicable evidence and preserve source identity.

1. authoritative primary/domain source;
2. curated institutional/reference source;
3. reputable corpus or source-supported technical reference;
4. reviewed internal curriculum material;
5. generated or machine-suggested candidate;
6. legacy/unverified/unknown.

Lower tiers may propose or support review but may not silently override a higher-tier conflict. AI/TTS/ASR, learner success, frequency and schema validity are never promoted into linguistic authority by themselves.

## Sense-level rule
Stress, morphology, government, register, technical meaning and translation are validated at the semantic owner/sense where necessary. Never promote an entire lemma because one sense is supported.

## Accepted variants
Genuine accepted variants remain explicit with their context/register constraints. A validator must not collapse them into one artificial answer merely to simplify grading.

## Safe automation
Allowed: meaning-preserving normalization, deterministic metadata repair, regeneration of derived indexes.
Human/source review required: meaning, stress, morphology, government, aspect, register, naturalness, technical terminology, answer keys and translation nuance.

## Revision impact
A material truth change must trace lessons, examples, assessment, evidence interpretation, audio/transcripts, derived indexes and learner-facing references. Historical learner evidence is never silently rewritten.

## Change / revalidation matrix
| Changed owner/fact | Mandatory revalidation |
|---|---|
| lexical sense, stress, morphology, government | vocab consumers, lesson examples, speaking/dialogue references, assessment items |
| grammar rule or accepted variant | lessons, exercises, tests, writing feedback and derived indexes |
| technical term/definition | technical concepts, academic functions, reading/writing tasks, performance tasks, RU06 production fixtures |
| answer key/distractor | assessment alignment, first-attempt interpretation boundary, affected evidence mappings |
| transcript/pronunciation-relevant text | audio pairing, listening tasks, speaking/scenario references |
| source/provenance status | every downstream consumer that presents the claim as authoritative |
| generated candidate promoted/rejected | RU07 temporary-content boundary and RU08 authoring/review evidence |

Revalidation is selective by canonical ID and affected consumers. Do not bulk-rewrite unrelated Russian content.

## Exit invariant
Active authority-sensitive content must have a known canonical owner and explicit trust/validation status. UNVERIFIED/PARTIAL content may remain available only where the consumer is fail-closed and does not present it as VERIFIED authoritative truth or silently use it as an official answer key.

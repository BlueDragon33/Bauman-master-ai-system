# RU03 — Linguistic Authority & Content Validation Policy

State: **PASS (authority architecture / fail-closed truth model)**

## Rule
**No source · no authoritative claim.** Schema validity, learner success, TTS, ASR, frequency and AI output are not linguistic authority.

## Two independent dimensions
1. Trust/provenance: AUTHORITATIVE, CURATED, CORPUS_SOURCE_SUPPORTED, GENERATED_MACHINE_SUGGESTED, LEGACY_UNVERIFIED, UNKNOWN.
2. Validation result: VERIFIED, VERIFIED_WITH_VARIANTS, CONTEXT_DEPENDENT, DISPUTED, UNVERIFIED, INCORRECT.

A record can be structurally valid and still be UNVERIFIED.

## Sense-level rule
Stress, morphology, government, register, technical meaning and translation are validated at the semantic owner/sense where necessary. Never promote an entire lemma because one sense is supported.

## Safe automation
Allowed: meaning-preserving normalization, deterministic metadata repair, regeneration of derived indexes.
Human/source review required: meaning, stress, morphology, government, aspect, register, naturalness, technical terminology, answer keys and translation nuance.

## Revision impact
A material truth change must trace lessons, examples, assessment, evidence interpretation, audio/transcripts, derived indexes and learner-facing references. Historical learner evidence is never silently rewritten.

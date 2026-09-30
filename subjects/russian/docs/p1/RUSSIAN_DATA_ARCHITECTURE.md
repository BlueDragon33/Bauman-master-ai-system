# Russian P1 Data Architecture

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## Inventory
- Russian subject files: **305**
- Data/external-data files: **33**
- Manifest-declared datasets: **17**

## Largest datasets
- `subjects/russian/data/dialogue-bauman-az.json` — 35049608 bytes
- `subjects/russian/data/deep-speaking-bauman.json` — 28156378 bytes
- `subjects/russian/external-data/bauman_russian_vocab_8000_full_by_stage_v2.json` — 11643310 bytes
- `subjects/russian/data/vocab.json` — 11212921 bytes
- `subjects/russian/data/tests.json` — 7923057 bytes
- `subjects/russian/external-data/bauman_russian_test_bank_template_A0_to_graduation_v1.json` — 7922931 bytes
- `subjects/russian/external-data/bauman_russian_test_bank_template_A0_to_graduation_v2.json` — 7922931 bytes
- `subjects/russian/data/speaking.json` — 7343576 bytes
- `subjects/russian/external-data/bauman_russian_speaking_full_1220_by_stage_v3.json` — 6871340 bytes
- `subjects/russian/external-data/bauman_russian_vocab_5000_full_by_stage_v1.json` — 6695080 bytes
- `subjects/russian/data/lessons.json` — 1418252 bytes
- `subjects/russian/external-data/bauman_russian_speaking_full_by_stage_v1.json` — 986329 bytes
- `subjects/russian/data/exercises.json` — 476196 bytes
- `subjects/russian/data/speaking-link-index.json` — 385702 bytes
- `subjects/russian/data/mindmap.json` — 110754 bytes
- `subjects/russian/data/writing.json` — 79470 bytes
- `subjects/russian/data/handwriting.json` — 48141 bytes
- `subjects/russian/external-data/bauman_russian_ai_simulation_template_v1.json` — 47355 bytes
- `subjects/russian/data/handwriting-listen-write.json` — 45581 bytes
- `subjects/russian/data/grammar-path.json` — 29371 bytes

## Manifest-declared data
- `curriculum`
- `exercises`
- `grammar`
- `grammar-path`
- `mindmap`
- `handwriting`
- `knowledge-index`
- `lessons`
- `simulations`
- `speaking`
- `tests`
- `videos`
- `vocab`
- `writing`
- `dialogue-bauman-az`
- `deep-speaking-bauman`
- `speaking-link-index`

## Current evidence
- Large dialogue/deep-speaking/vocabulary/test datasets exist as separate source files.
- File size alone does not prove startup loading. Startup/lazy behavior remains a runtime question.
- Existing Cloudflare preview packaging workflow checks chunk manifests for `dialogue-bauman-az` and `deep-speaking-bauman`; package parity must still be verified by CI/browser evidence for this P1 branch.

## Status
`VALIDATING` — static inventory complete; runtime request/memory measurements pending browser gate.

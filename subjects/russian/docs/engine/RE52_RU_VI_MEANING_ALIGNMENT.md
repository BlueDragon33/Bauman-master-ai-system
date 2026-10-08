# RE52 — Russian/Vietnamese meaning alignment

Status: **AI EDITORIAL CANDIDATE · RU03 PENDING · NO RELEASE**

A targeted professional QA pass found a cross-language semantic contradiction in the RE48 dormitory shower candidate.

- Russian candidate: `Душевая в конце коридора справа.` (the shower room is at the end of the corridor, on the right).
- Old Vietnamese hint: `Quản lý hướng dẫn đi cuối hành lang rồi rẽ phải.` (go down the corridor, then turn right).
- Corrected Vietnamese hint: `Quản lý cho biết phòng tắm ở cuối hành lang, bên phải.`

`справа` expresses a position on the right; `поверните направо` would be a right-turn instruction. Do not teach the latter action from the former utterance.

Implementation is non-destructive: the r1 dialogue fixture, original RE46 overlay and default runtime remain unchanged. The derived reviewable dialogue revision advances from `repair-dialogues-ai-draft-r3` to `repair-dialogues-ai-draft-r4`; any earlier REVIEW fingerprints are stale. The RE49 reviewer packet now binds the exact scene's `replyHint` in `situationVi.directionHint` for all dialogue replies, so semantic mismatches cannot be hidden from reviewer context. Tests assert the exact Russian/Vietnamese location meaning.

This is **AI_ADVISORY_ONLY**, NOT a qualified human Russian TEXT or AUDIO approval, and it does not enable RE44 candidate in regular learning, claim phonetic mastery, write RU04 or publish Production.

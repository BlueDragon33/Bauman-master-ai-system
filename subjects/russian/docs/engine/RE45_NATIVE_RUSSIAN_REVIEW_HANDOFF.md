# RE45 — Human Russian linguist review handoff (R2 and repair dialogues)

**Authority:** RU03 HUMAN ONLY.  
**Current state:** HUMAN_REVIEW_REQUIRED. **0/19 approvals. Not canonically published.**

RE41/RE42/RE43/RE44 engineering revisions are on `main`; RE44 was merged as PR #311 (`15f2c2ed`). This RE45 review handoff adds **no automatic content approval**, no default activation and no production speech model.

## Context and responsibility

The learner starts from zero Russian. It is **not** the learner's job to know the language, judge grammar, confirm polite idioms, detect wrongly mapped objects or certify TTS accuracy. The engineering team produces reviewable candidates; a competent independent Russian-speaking human checks and signs **the exact sentences, speaker roles, meaning, visuals and audio**. Neither the assistant nor an automated test may impersonate that reviewer.

This handoff is separate from the 15 original R1 `FIXTURE_NONCANONICAL_PENDING_RU03` reviews. No original fixture, its fingerprint, packet, or historical evidence was rewritten.

## Review pack contents

Generate current 19 exact-fingerprint packets without changing files:

```sh
node subjects/russian/engine/review/export-r2-human-review-queue.mjs > r2-human-review-queue.json
```

The exporter validates source candidate schemas first, then produces 15 `spatial-scene` packets and 4 `repair-dialogue` packets. Every packet includes source/revision/fingerprint, exact Russian text (or a five-turn script plus repeat/slower repair lines), scenario map and expected action, Vietnamese orientation (for the dialogues), high-risk editorial flags, and explicit phonetics/audio checks. All have `reviewDecision: null`, `audioStatus: HUMAN_PHONETIC_AUDIO_REVIEW_REQUIRED`, and `linguisticCorrectness: REVIEW_REQUIRED`.

| Editorial group | Scenes | Priority inspection |
|---|---|---|
| Room peer requests | `rl-01`–`rl-03` | familiar register, correct handover versus locating objects |
| Grocery shop | `rl-04`–`rl-06` | stranger politeness, actual bottle of water, bread/shelf/milk/fridge |
| Moscow metro | `rl-07`–`rl-09` | buying a ticket, schematic route map not Troika payment card, entrance from the street |
| Dormitory | `rl-10`–`rl-12` | room 12 not a generic door, shower facility not a shower head, location vs key |
| University | `rl-13`–`rl-15` | lecture room not building, library location, peer notebook handover |
| Stranger dialogues | `repair-shop-milk`, `repair-metro-entrance`, `repair-dorm-shower`, `repair-university-room` | polite opening, factual direction, correct two-way repairs, natural closure |

## What independent RU03 human review must assess

1. Russian semantics and idiomatic grammar, natural address `ты/вы` and politeness for peers, strangers, staff and administrators.
2. Dialogue roles, both sides of conversation, what is requested and exactly where it is located, including whether direction text and diagram can coexist logically.
3. Pronunciation (stress, palatalization, consonant clusters, vowel reduction, rhythm and intonation) against genuinely reviewed native recordings, not just synthetic speech.
4. Vietnamese learner hints and safe Pre-A0 pedagogical sequence; translation is support, not guess-the-answer grading.
5. Revisions and accepted Russian variants, reject or request changes to each problematic draft. Human signatures cannot be fabricated.

## Exact-revision integrity

`stableContentFingerprint` binds each packet to the **entire scene and its spatial world**; dialogue packets additionally bind to common repeat/slower repair phrases. A changed room label, destination coordinate, Russian phrase, register or repair phrase invalidates the previous fingerprint. Do not carry human decisions between fingerprints or revisions.

The existing RU03 human decision registry rejects a `reviewerType: AI` request. RE45 tests prove that, and prove all 19 stay pending without human decisions. All work is a **review queue**, not a new publication pipeline or an approval mechanism.

## Release blockers

- **No qualified HUMAN RU03 decisions recorded.** Require a real reviewer, independently authorized and identifiable in the repository's human-review process.
- **No reviewed native audio or precise bilingual approval.** Do not market AI TTS as native teacher audio.
- **No canonical compiler or release approval for R2 or repair dialogues.** Do not route these AI drafts into official lessons; opt-in preview remains explicitly unreviewed.
- Actual speech grading requires validated microphone/ASR/phonetics distinct from self-report; never infer pronunciation mastery from a button click.

Only after authentic HUMAN RU03 sign-off for an exact revision may a separate future phase implement canonical publication with verify-at-build gating and production rollback. In the absence of human approval, stop at this honest boundary rather than fabricating a decision.

**RE45 engineering checks**: fast suite `node subjects/russian/engine/tests/run-engine-suite.mjs`; exact-HEAD four required GitHub Actions gates, including source and packaged browser acceptance, and immutable revision/negative tests.

# RE45 — Zero-Russian learner: independent linguistic + audio quality gate

Status: IMPLEMENTATION SPECIFICATION / NOT HUMAN APPROVAL / NOT RELEASE AUTHORIZATION
Parent: RE40 #307 → RE41 #308 → RE42 #309 → RE43 #310 → RE44 #311. Base main SHA: 15f2c2ed18476f8ceea98678a4360107e0307260.

## Product contract (non-negotiable)

The learner is **Pre-A0**: cannot be asked to diagnose Russian grammar, evaluate Russian naturalness, read Cyrillic, validate pronunciations, or sign off linguistic quality. The app/team owns quality control. The learner's role is listening, acting, speaking and optionally reporting confusing UX in Vietnamese. An approval by the repository owner who does not speak Russian does not equal linguistic approval.

For each lesson: Vietnamese one-line scenario orientation → listen to carefully reviewed Russian with meaningful world picture → act physically in world → hear reply → request repeat/slower if needed → try speaking → receive honest skill-specific feedback. Cyrillic and translation are optional/on-demand; do not force reading before listening. One situation per screen; no dashboard clutter. Map/station entrance, auditorium, room 12/door, shower room/showerhead, metro diagram/transit card remain distinct.

## Authoritative input inventory

Retain byte-for-byte existing r1 source, its 15 review packets and decisions. Identify separate candidate sources `real-life-spatial.r2-ai-proposal.json`, `repair-dialogues.r1-ai-proposal.json` and world graphs by discovery, not guesses. Audit their actual file paths and schemas before creating derived artifacts. No duplicate canonical learner storage or new parallel scoring system.

## RE45-A: extract an immutable, deterministic inventory

Implement a read-only CLI that enumerates **all** candidate utterances (including replies, greetings, repair, thank-yous), their scene ID, speaker/recipient, relationship/register, action, location, textual source, VN situation hint, expected visual object/location, TTS/audio references if any. Deterministic JSON export; stable per-item SHA-256 fingerprint over canonicalized reviewed fields, with explicit schema/version. Preserve UTF-8 and Unicode; avoid accidentally normalizing distinct text invisibly. Detect duplicates and stale revision/fingerprint dependencies. Never mutate old review packets in this step.

## RE45-B: AI editorial audit, advisory only

For every utterance validate spelling, case/aspect/government, collocations, intent, pragmatics, `ты/вы` relationship, politeness, spatial truth, comprehension difficulty for A0, and Vietnamese explanation congruence. Compare variants and choose the smallest safe beginner default; do NOT assume grammatical correctness implies naturalness. Label `AI_ADVISORY_ONLY`; provide issue severity, exact quote, corrected suggestion, rationale in Vietnamese, interaction implications. Flag unresolved/ambiguous cases instead of inventing Russian certainty. A corrected candidate triggers new revision/fingerprint and fresh review packet.

## RE45-C: independent qualified HUMAN RU03 linguistic review

Only a separately authorized qualified Russian-language reviewer (ideally native/near-native with pedagogical capability) may make `APPROVE`, `CHANGES_REQUESTED` or `REJECT` decisions **per exact fingerprint** after reading contextual scenes and listening to each real audio sample. The user/student is NOT this reviewer, and AI is not its substitute. Provenance: reviewer identity/role, date, exact revision/fingerprint, context, rationale, accepted phrase, audio identity/hash. Missing reviewer or review → PENDING, never auto-approve. No self-attestation, approval placeholders or fabricated signature.

## RE45-D: audio and speech fidelity gate

Separate textual review from audio review. For each approved phrase validate correct word stress, vowel reduction, palatalization, rhythm, pauses, intonation, intelligibility and consistency of speaker role. Browser TTS is explicitly sample-only until qualified listening review; never badge `native` or `verified` without real evidence. Verify replay/slower works offline; no newly required paid external service. For speaking assessment, transcript match from ASR is NOT a phonetic score; `I repeated` is never proof of proficiency. Absent objective evidence, show `practiced`, not `mastered`.

## RE45-E: content promotion gates

Make a deterministic content-readiness report with per-item: `draft`, `linguistic_review_pending`, `audio_review_pending`, `approved`, `rejected`, `stale`; derive `approved` only from valid authorized decisions for exactly matching content+audio fingerprints. Fail closed on stale source, changed geometry, broken semantic map, unreviewed polite speech, missing audio provenance or CI failure. All pending content stays isolated behind existing flags and excluded from RU04 mastery. Do not turn on default, publish production, or alter existing history as a side-effect of generating reports.

## RE45-F: tests, observability and acceptance

Unit: unchanged fingerprint deterministic; tamper/stale decision rejected; anonymous/AI approval rejected; one unreviewed utterance blocks candidate promotion; reviewed text with changed audio blocks promotion; `room ≠ door`, `metro diagram ≠ transit card`, `lecture room ≠ whole university building`, `shower room ≠ showerhead`, `entrance ≠ already inside station`; no false RU04 write.

Browser source+packaged/offline: no-Russian learner completes 4 RE44 rehearsal loops with optional Vietnamese help, audio repeat/slower, keyboard map selection, wrong/right location, optional script reveal; status and no-mastery claims remain truthful. Test default page unchanged and strict triple opt-in preserved. Stress accessibility, mobile, graceful unsupported microphone/browser speech API fallback, reentrant taps/loading lock, responsive layout and no extra UI clutter.

Run existing engine suite plus Development Fast CI, Russian Reference UI Gate, Universal Constitution Compliance and Whole System Integration Gate on the **same exact head SHA**. Capture evidence links and compare against base; no repo-wide scan or mass CSS rewrites.

## Sequencing and stop conditions

1. Inspect only main HEAD, RE40–RE44 touched files, current project state, and candidate inventory (diff-first and targeted reads).
2. Implement inventory generator, per-item review-packet output and negative verification tests on a feature branch; preserve original fixtures/history.
3. Validate exact-head gates; merge engineering-only RE45 tooling if green under previously authorized ordinary engineering merge workflow. Clearly label that merge is NOT RU03 approval.
4. Wait for **external, genuinely qualified language/audio sign-off** before canonical release. If no reviewer connected, record `RU03_PENDING_EXTERNAL_REVIEW` and continue safe engineering tasks rather than involving the learner in Russian review.
5. Only after authentic external review, checked exact fingerprints, all gates and explicit production authorization may content be default-enabled/published.

## Decision responsibilities

AI: audit, propose and test; cannot certify itself. CI: confirms software invariants, cannot certify conversational naturalness. Qualified independent RU03 reviewer: certifies Russian text and audio. Learner: tests usability and learns; never required to approve Russian. Release owner: explicit production authorization after trustworthy evidence; never inferred from merged docs.

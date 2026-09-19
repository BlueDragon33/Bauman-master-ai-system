# CODEX_TASK

Task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Mode: `FROZEN_PROMOTION_CANDIDATE`

## Canonical plan

Use only:

`subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

for Russian rebuild turn status.

## Current work

All canonical Turns 1–24 are GREEN.

There is no active implementation turn and no justified Turn 25 at this point.

The rebuild is frozen on:

`work/russian-listen-speak-literacy-visual-semantics`

## Promotion boundary

Do not merge to `main` without an explicit promotion decision.

If future QA reveals a defect inside an already accepted responsibility, reopen the owning turn/substep, fix it, rerun its gate and then restore GREEN. Do not create a new turn merely to patch an existing responsibility.

Create Turn 25+ only if a genuinely new responsibility appears that cannot safely fit Turns 1–24.

## Frozen requirements

- Listening/speaking remain the recurring priority.
- Print and handwriting recognition remain distinct.
- Cursive uses 66 distinct OFL-derived vector outlines, not font-only rendering.
- Vocabulary meaning remains direct-semantic; Vietnamese/English translation is not learner semantic authority.
- Dialogue remains translation-free by default.
- AI remains Russian-first/direct-semantic and read-only.
- Skill-gate aggregation remains advisory.
- Weakness repair remains additive and evidence-gated.
- Offline ready remains cache-verified.
- Browser speech failure remains explicit.
- Storage, Review Queue, SRS, Foundation and bridge authority remain unchanged.
- User-facing module identity remains `Tiếng Nga Bauman` without legacy build/version labels.

## Post-freeze rule

Continue auditing the frozen candidate. If a defect belongs to an existing responsibility, reopen/add a numbered substep inside that owning turn, fix it, extend the relevant negative/promotion gate, and restore GREEN. Create Turn 25+ only for a genuinely new responsibility.

Current post-freeze additions accepted: Turn 1.1, Turn 2.1, Turn 2.2, Turn 3.1, Turn 8.1, Turn 8.2, Turn 9.1, Turn 9.2, Turn 9.3, Turn 9.4, Turn 9.5, Turn 9.6, Turn 9.7, Turn 10.1, Turn 10.2, Turn 11.1, Turn 11.2, Turn 13.1, Turn 13.2, Turn 16.1, Turn 16.2, Turn 16.3, Turn 16.4, Turn 16.5, Turn 16.6, Turn 18.1, Turn 18.2, Turn 21.7, Turn 22.7, Turn 22.8, Turn 23.8, Turn 23.9, Turn 23.10, Turn 23.11, Turn 23.12, Turn 24.7, Turn 24.8, Turn 24.9, Turn 24.10, Turn 24.11, Turn 24.12, Turn 24.13, Turn 24.14, Turn 24.15 and Turn 24.16.


## Post-freeze gate status

Turn 24.5/24.8 now include:

- 14 promotion-freeze negative cases;
- stale translation-shortcut rejection;
- dead translation-era helper rejection;
- CI execution of the promotion-freeze negative suite;
- full workflow proof at executable checkpoint `ae26de6b1f2d24f1e1b5bc4874ea705b68f1d5bf`, run `35416011837`, with both architecture and existing-regression jobs successful;
- post-freeze gate-regression repairs remain assigned to their existing owning turns.
- CI maintenance is also owned by Turn 23: both workflow jobs now use Node-24-based `actions/checkout@v7` and `actions/setup-node@v7`; run `35416194155` is GREEN.
- Visual-semantics quality audit is owned by Turns 11/13/22: the old 8,000/8,000 “visual ready” result was decomposed into 0 concrete images and 8,000 symbolic `image_emoji` entries; verified Russian-semantic Commons enrichment plus online-only/offline fallback guards are GREEN, with final trusted-host proof at run `35416968142` / `a9a813bb788c23775ee0b55356a27931d8d950c4`.

No Turn 25 is justified by these fixes because none introduces a genuinely new responsibility.


## Latest evidence-fidelity checkpoint

Run `35417808764` at `a7e60fac48d4da654894b4b82480f0dbcb60713a` is GREEN for both architecture and existing regression.

Current invariants additionally require:
- hear-before-see unlock only after completed normal playback;
- listening evidence only after playback completion;
- speaking attempt evidence only after non-empty recognition result;
- Russian TTS lifecycle metadata preserved through start and completion callbacks.


## Latest self-assessment/cancellation checkpoint

Run `35418330563` at `eb01610a6de4e0c849832a55591b8d272b1afbd8` is GREEN for both architecture and existing regression.

Additional invariants:
- subjective `mark-line-ok` remains separate from recognized speaking evidence;
- learning-flow speaking attempts are recognition-result driven only;
- interrupted/cancelled TTS playback cannot emit listening-completion evidence.


## Latest translation-isolation checkpoint

Run `35418691089` at `15e7b4f61198c5d268ea03f7fdd68d0b8d48cfa9` is GREEN for both architecture and existing regression.

Additional invariants:
- vocab semantic adapter/new-item templates cannot use Vietnamese/English translation authority;
- dialogue, Deep Speaking and AI dialogue context cannot read learner-facing `*_vi` semantic fields;
- legacy translation fields may remain only as migration/source compatibility data or explicit sanitizer inputs.


## Latest Deep Speaking checkpoint

Run `35420972649` at `f5b49e56f276752ee2db9a3c5c33011574b0d3ba` is GREEN for both architecture and existing regression.

Additional invariants:
- Deep Speaking learner text fails closed to Russian-labelled semantics; generic object/string fallbacks are forbidden.
- Deep Speaking attempts require a non-empty Russian recognition result.
- Deep Speaking self-assessment remains separate from recognized speaking evidence and cannot create mastery.


## Latest recognition-race / oral-first checkpoint

Run `35422110343` at `b4922ae73c292de4c3129c1fdb2c484789ff3057` is GREEN for both architecture and existing regression.

Additional invariants:
- stale SpeechRecognition callbacks cannot create speaking evidence or alter a newer recorder session;
- recognition evidence is written to the practice/dialogue store captured at recorder start;
- delayed auto-next cannot advance a different surface/dialogue/line;
- learner-facing Học tập navigation and failure recovery put `Nghe/Nói` before theory/exercises;
- the accepted post-freeze substep inventory is maintained as one deduplicated canonical list.


## Latest oral-first CTA checkpoint

Run `35422236260` at `7c730fed3b3b0b3970a05ed4a3e9910252c894c1` is GREEN for both architecture and existing regression.

Additional invariant:
- primary overview/route-focus start CTAs enter `practice`/Nghe-Nói; `theory` is supporting/review context rather than the default learner start action.


## Latest recognition / vocabulary-SRS semantic checkpoint

Run `35422889144` at `c0e2413b5ec34e86e6ad83fb0c907dcea1417aa4` is GREEN for both architecture and existing regression.

Additional invariants:
- one SpeechRecognition session cannot create duplicate speaking attempts from repeated callbacks;
- Deep Speaking `Cần ôn` resolution requires a newer recognition-backed attempt;
- vocabulary search cannot use Vietnamese/English meaning fields or raw source JSON fallback;
- Sentence Mining source context must contain Cyrillic;
- SRS speaking-link labels cannot use Vietnamese title metadata;
- learner-facing exported route/database filenames contain no build/version labels.


## Latest dialogue semantic-routing/sanitizer checkpoint

Post-freeze audit extended Turn 16/24 without creating Turn 25:

- dialogue search/group/deep-link/scene routing is constrained to Russian-labelled direct context or inert IDs;
- stale legacy dialogue-group state recovers to `all`;
- dialogue turn projection now strips the complete prohibited Vietnamese/English translation-field set rather than only four legacy fields;
- the dedicated dialogue negative suite now contains 28 cases, including incomplete-sanitizer, generic difficulty fallback, object-turn bypass and non-Cyrillic generic-text rejection.
- dialogue difficulty/filter routing is inert-ID/Russian-label only.
- both `utterances` and fallback `turns` use the same sanitizer projector; generic fallback text must contain Cyrillic.

Latest source-level checkpoint before documentation sync: `ecc984d1c057c9bd75da8e0e67fbeab68a0613df`; static invariant recheck PASS.

The last full GitHub Actions checkpoint remains `c0e2413b5ec34e86e6ad83fb0c907dcea1417aa4` / workflow `35422889144` until the newer post-freeze commits receive equivalent full CI evidence.

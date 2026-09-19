# CODEX_STATE

Current task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Status: `ALL_24_TURNS_GREEN_PROMOTION_CANDIDATE_FROZEN`

Date: 2026-09-19
Branch: `work/russian-listen-speak-literacy-visual-semantics`
Russian accepted full-CI head: `c0e2413b5ec34e86e6ad83fb0c907dcea1417aa4`

## Single source of truth

The authoritative development/status document for the Russian subject is:

- `subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

Architecture principles and ownership remain in:

- `subjects/russian/RUSSIAN_LEARNING_ARCHITECTURE.md`

Freeze compatibility is documented in:

- `subjects/russian/MIGRATION_FREEZE.md`

## Accepted status

All canonical Turns 1–24 are GREEN.

The final rebuild preserves:

- oral-first learning priority;
- print + handwriting recognition;
- sound↔letter mapping;
- handwriting motor evidence;
- listening and speaking ladders;
- 8,000-item direct-semantic visual vocabulary authority;
- reading and dictation bridges;
- translation-free dialogue scaffold;
- grammar-from-patterns;
- modality-isolated SRS/review evidence;
- six independent advisory skill gates;
- Russian-first direct-semantic AI help;
- evidence-gated weakness repair;
- truthful offline readiness;
- browser/accessibility/responsive/performance gates;
- 66 distinct uppercase/lowercase Cyrillic handwriting outlines for 33 pairs;
- migration/storage/bridge compatibility.

## Important Turn 23 correction

The first explicit cursive renderer used one hand-authored path per letter pair and only transformed it for uppercase/lowercase. Final QA correctly rejected that as pedagogically unsafe.

The accepted renderer is now:

- `RUSSIAN_CURSIVE_GLYPH_SHAPES_V2`;
- 33 uppercase + 33 lowercase outlines;
- every upper/lower pair has a distinct path;
- outlines are derived from an OFL Cyrillic handwriting source;
- provenance and license are stored beside the runtime;
- no font binary is bundled;
- no installed OS handwriting font is required.

Deferred obligation `RUS-CURSIVE-VISUAL-001` is CLOSED.

## Frozen compatibility

Preserve:

- `BAUMAN_SUBJECT_BRIDGE_V1`;
- `BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS`;
- primary learner storage key `bauman_russian_survival_master_v11_clean_skeleton`;
- canonical Learning State mastery/Review Queue ownership;
- Vocab SRS scheduling ownership;
- Foundation identity authority;
- Hub/Device Access boundaries.

Legacy translation fields may remain in source/editor data and old saved-state snapshots for compatibility, but they have no learner-facing semantic authority.

## Promotion policy

This branch is a promotion candidate only.

Do not merge to `main` automatically. A separate explicit promotion decision is required.

Observable GitHub Actions evidence is now available. Workflow run `35416011837` completed successfully on commit `ae26de6b1f2d24f1e1b5bc4874ea705b68f1d5bf`: both `russian-learning-contract` and `russian-existing-regression` passed. Later documentation-only commits must preserve the same gates before any explicit promotion decision.

## Post-freeze defect fixes

The frozen candidate was re-audited after Turn 24 and two defects were found inside existing responsibilities, so no Turn 25 was created:

- Turn 23.8: modal accessibility lifecycle now sets `aria-hidden=false` on open, restores `true` on close, moves focus into the dialog and restores the opener. Browser QA, migration freeze and promotion gates all enforce this.
- Turn 24.7: versioned learner-facing fallback labels were removed directly from `subject-adapter.js` and `core.js`; the UI no longer relies only on cleanup overrides to hide legacy build labels.
- Turn 24.8: post-freeze source validation confirms the new assertions are wired into negative/promotion gates.

All canonical Turns 1–24 remain GREEN after these fixes.


## Post-freeze hardening

The frozen candidate was re-audited after Turn 24 acceptance.

Fixed inside existing Turn 24 responsibility:

- added `tests/russian-promotion-freeze.test.mjs` with 14 explicit negative cases and wired it into CI;
- removed stale learner guidance `V ẩn/hiện nghĩa`;
- removed unused translation-era helpers from `core.js` so Vietnamese/English legacy semantic helpers cannot be accidentally reconnected;
- preserved `dialogueHideVi` and `practiceHideVi` only as inert saved-state compatibility fields;
- folded the hardening into canonical Turn 24.5/24.8 rather than creating a duplicate substep or unjustified Turn 25.

The promotion candidate remains frozen and must not merge to `main` without an explicit promotion decision.


## Post-freeze gate-regression repair — 2026-09-19

A full branch-push audit exposed stale/over-broad gate logic inside already-owned responsibilities. No Turn 25 was created.

- Turn 8.1: corrected the listening tokenizer validator and negative mutation to match the real whitespace tokenizer.
- Turn 18.1: narrowed multimodal authority-token detection to executable references while preserving strict scheduler/mastery isolation.
- Turn 21.7: aligned the opened-state assertion with the real repair lifecycle and added a dedicated negative case.
- Turn 22.7: separated asset-runtime existence from the required `missing_visual_asset` fallback invariant.
- Turn 23.9: hardened Browser/Package negative tests for all 760px breakpoints and made load-order diagnostics precede shell-inventory masking.
- Turn 23.10: upgraded both Russian CI jobs to `actions/checkout@v7` and `actions/setup-node@v7`; workflow `35416194155` passed both architecture and existing-regression jobs at `0609c85f512909374fc0ba346a71a9e65f3c061d`.
- Turn 24.9: hardened the promotion-freeze bridge negative case across both READY and PROGRESS contract markers.

Accepted executable checkpoint before this documentation update:

- commit: `ae26de6b1f2d24f1e1b5bc4874ea705b68f1d5bf`
- workflow: `35416011837`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

The promotion candidate remains frozen. Do not merge to `main` automatically.


## Post-freeze visual-semantics quality repair — 2026-09-19

A deeper audit of the frozen candidate found that the old visual-coverage gate was too coarse: all 8,000 vocabulary rows were classified as visual-ready, but CI evidence showed `concreteVisual=0` and `symbolicVisual=8000`, entirely through `image_emoji`.

The repair remained inside existing responsibilities, so no Turn 25 was created:

- Turn 11.1: split concrete image/illustration evidence from symbolic emoji/pictogram/scene/gesture evidence.
- Turn 11.2: added corpus-shape profiling; all 8,000 rows have Russian term/phrase, `meaning_ru`, example, tags, stage, pronunciation and `image_emoji`.
- Turn 13.1: added verified, on-demand Wikimedia Commons image enrichment using Russian-only semantic queries and relevance ranking; no Vietnamese/English translation fields participate in lookup.
- Turn 13.2: added stale-request cancellation, in-flight deduplication, listener-before-`src` ordering, attribution including artist when available, and fallback preservation.
- Turn 22.8: bound external image enrichment to online/non-Save-Data operation and kept it outside offline package-asset claims.

Executable checkpoint before this documentation update:

- commit: `4f76eba50f1c10a4308e86c4f5104d7d90769e4e`
- workflow: `35416859395`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

The promotion candidate remains frozen and must not merge to `main` automatically.


### Trusted-host image enrichment proof

The verified-image path now accepts thumbnails only from `https://upload.wikimedia.org/` and source pages only from `https://commons.wikimedia.org/`. Untrusted image hosts are rejected by the ranking layer before rendering.

Final executable checkpoint for this repair:

- commit: `a9a813bb788c23775ee0b55356a27931d8d950c4`
- workflow: `35416968142`
- architecture job: SUCCESS
- existing regression job: SUCCESS


## Post-freeze listen/speak evidence fidelity — 2026-09-19

A deeper runtime audit found that successful API start was being treated as completed learner evidence in places where the pedagogy requires completed listening or actual recognized speech. The fixes remain inside Turns 1/3/8/9/23, so no Turn 25 was created.

- Turn 1.1: baseline audit now separates source-asset gaps from executable runtime readiness and recognizes TTS/listening/speaking evidence from the current runtime contracts.
- Turn 3.1: hear-before-see unlock requires normal-speed playback completion, not playback start.
- Turn 8.2: listening evidence uses `russian:listening-playback-completed`; interrupted/failed playback does not count.
- Turn 9.1: speaking attempts require a non-empty SpeechRecognition result; recorder `onstart` alone is not evidence.
- Turn 23.11: Russian voice selection and start/end playback lifecycle are both verified by Browser/Package QA.

Executable checkpoint:

- commit: `a7e60fac48d4da654894b4b82480f0dbcb60713a`
- workflow: `35417808764`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

The promotion candidate remains frozen and must not merge to `main` automatically.


## Post-freeze evidence-isolation and cancellation repair — 2026-09-19

Two additional defects were found inside existing responsibilities; no Turn 25 was created.

- Turn 9.2: manual `mark-line-ok` no longer writes a synthetic score/transcript into speaking results, no longer clears pronunciation repair, and no longer marks an active speaking session attempted. Learning-flow speaking attempts are now driven only by non-empty `russian:speaking-recording-result` evidence; listening buttons and recorder clicks do not count as speaking attempts.
- Turn 23.12: Russian TTS now uses an active speech token. When a newer utterance cancels an older one, any late/cancelled `onend` from the old utterance is ignored and cannot become listening-completion evidence.

Executable checkpoint:

- commit: `eb01610a6de4e0c849832a55591b8d272b1afbd8`
- workflow: `35418330563`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

The promotion candidate remains frozen and must not merge to `main` automatically.


## Post-freeze translation-path isolation — 2026-09-19

A deeper learner-runtime audit found live legacy translation fallbacks outside the canonical visual/dialogue helpers. The repair remains inside Turns 10/16/24; no Turn 25 was created.

- Turn 10.1: `subject-adapter.vocabMeaning()` no longer falls back to `vi/meaning/clue_en`; vocabulary search inherits Russian/direct-semantic meaning only; newly created vocabulary records use Russian explanation plus visual/context evidence and never generate translation fields.
- Turn 16.1: dialogue titles/subtitles and turn projection are Russian/direct-context only; legacy turn translation properties are sanitized; Deep Speaking no longer reads Vietnamese titles/prompts/tags; AI dialogue context no longer falls back to Vietnamese dialogue metadata.
- Turn 24.10: migration/dialogue/vocabulary gates and negative tests now prove that legacy translation fields may remain in archive/source data for compatibility but cannot flow into learner runtime semantic authority.

Executable checkpoint:

- commit: `15e7b4f61198c5d268ea03f7fdd68d0b8d48cfa9`
- workflow: `35418691089`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

Targeted runtime scan at this checkpoint found no prohibited translation tokens in the learner-facing vocab, Deep Speaking, dialogue or AI-context slices. Adapter dialogue references to `translation_vi/gloss_vi` remain only in an explicit destructuring sanitizer that discards them.

The promotion candidate remains frozen and must not merge to `main` automatically.


## Post-freeze Deep Speaking semantic/evidence repair — 2026-09-19

A deeper Deep Speaking audit found two defects inside existing responsibilities, so no Turn 25 was created:

- Turn 16.2: `deepLines()` previously had permissive generic-object fallbacks (`Object.values`, `JSON.stringify`, generic `question/answer/domain`) that could surface non-Russian legacy text. Deep learner rendering now fails closed to Russian-labelled fields/collections, and learner metadata uses `scenario_ru` rather than generic `domain`.
- Turn 9.3: Deep Speaking had `attempts/lastMode` storage but no runtime writer; “Đã nói ổn” was only self-marking. Rapid/Substitution/Shadowing/Monologue/Q&A now provide real `ru-RU` SpeechRecognition. Attempts increment only after a non-empty transcript; self-assessment remains separate.
- Turn 24.11: dialogue/migration/speaking gates and negative tests freeze both properties.

Executable checkpoint:

- commit: `f5b49e56f276752ee2db9a3c5c33011574b0d3ba`
- workflow: `35420972649`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

Targeted Deep Speaking learner-slice scan at this checkpoint contains no generic `.domain`, `p.question`, `p.answer`, `JSON.stringify`, `Object.values` or prohibited `*_vi` semantic fallback.

The promotion candidate remains frozen and must not merge to `main` automatically.


## Post-freeze recognition-race and oral-first navigation repair — 2026-09-19

Further runtime/UX audit found issues inside existing responsibilities; no Turn 25 was created.

- Turn 9.4: normal and Deep Speaking SpeechRecognition now share a monotonically increasing session token. Starting a new recorder invalidates callbacks from the previous recorder before `stop()`, so stale `onstart/onresult/onerror/onend` cannot write evidence or clear the active recorder state.
- Turn 9.5: normal speaking captures its result store, dialogue identity and lesson identity when recording starts. Recognition results write to the original store even if the learner changes surface before the callback arrives; delayed auto-next is guarded by token + surface + dialogue + line identity.
- Turn 2.1: visible Học tập navigation is now oral-first (`Nghe/Nói` first), and invalid-tab/render-recovery/action fallbacks return to `practice` instead of `theory`, while valid stored tabs remain preserved.
- Turn 24.12: continuation state/documentation is normalized so repeated resume cycles do not accumulate duplicated accepted-substep text.

Executable checkpoint before documentation normalization:

- commit: `b4922ae73c292de4c3129c1fdb2c484789ff3057`
- workflow: `35422110343`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

The promotion candidate remains frozen and must not merge to `main` automatically.


## Post-freeze oral-first primary CTA repair — 2026-09-19

Turn 2.2 closes the remaining learner-entry inconsistency: overview and route-focus primary CTAs no longer hard-code `theory`; they enter `practice`/Nghe-Nói first. Theory routes remain available for explicit review/repair/supporting contexts.

Executable checkpoint:

- commit: `7c730fed3b3b0b3970a05ed4a3e9910252c894c1`
- workflow: `35422236260`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

No Turn 25 was created. The promotion candidate remains frozen and must not merge to `main` automatically.


## Post-freeze recognition de-duplication and vocabulary/SRS semantic isolation — 2026-09-19

A broader runtime audit found additional defects inside existing responsibilities; no Turn 25 was created.

- Turn 9.6: each SpeechRecognition session now consumes one result/error path only. Duplicate callbacks cannot increment Learning Flow or Deep Speaking attempts multiple times.
- Turn 9.7: Deep Speaking stores `lastAttemptAt`; a `Cần ôn` flag cannot be cleared by self-assessment unless a newer recognition-backed attempt exists after the weak timestamp.
- Turn 10.2: vocabulary search no longer indexes `meaningVi/english` and cannot fall back to raw `JSON.stringify(source)`; content-contract examples/definitions are Russian/Cyrillic filtered.
- Turn 18.2: SRS Sentence Mining rejects non-Cyrillic source context; exact speaking-link titles use Russian-labelled metadata or inert IDs, never `context_title_vi`.
- Turn 24.13: learner-facing route/database export filenames are version-free while internal compatibility metadata remains intact.
- Turn 24.14: visual-vocabulary and migration gates freeze the new search/SRS semantic boundaries.

During this repair CI correctly caught two issues and they were repaired before the final checkpoint: the speaking validator initially failed to count combined stale/session-consumption guards, and the Sentence Mining runtime initially missed the intended Cyrillic source guard. A migration-bundle patch was also inspected and corrected before CI after an accidental self-reference (`srs:bundle.srs`) was found during source verification.

Executable checkpoint before documentation update:

- commit: `c0e2413b5ec34e86e6ad83fb0c907dcea1417aa4`
- workflow: `35422889144`
- `russian-learning-contract`: SUCCESS
- `russian-existing-regression`: SUCCESS

The broader runtime scan found Vietnamese writing-task metadata in academic writing helpers; it was retained because it is task/instruction metadata rather than vocabulary/dialogue translation-answer authority. Internal package/version identifiers also remain where non-visual compatibility requires them.

The promotion candidate remains frozen and must not merge to `main` automatically.


## Post-freeze dialogue routing/sanitizer repair — 2026-09-19

A continuation audit after the last full-CI checkpoint found further defects inside existing Turn 16/24 responsibilities; no Turn 25 was created.

- Turn 16.3 / 24.15: learner-facing dialogue search, grouping, deep-link tags and scene-icon selection are constrained to Russian-labelled direct context or inert IDs; stale legacy group filters recover safely.
- Turn 16.4 / 24.16: `dialogueTurns()` previously stripped only `vi/vi_text/translation_vi/gloss_vi`, leaving other prohibited translation fields in the projected runtime object. It now strips `meaning_vi`, `purpose_vi`, `clue_en`, `meaning_en`, `translation_en` and `en` as well.
- Dialogue negative coverage increased to 22 cases and now rejects regression to the incomplete sanitizer.

Targeted validation after the runtime/gate repair: PASS at `cb0bcd6b9fe01ccf11adabbccae1bcd0ca58473c`.

Full GitHub Actions proof is still anchored at `c0e2413b5ec34e86e6ad83fb0c907dcea1417aa4` / workflow `35422889144` until equivalent CI evidence is available for the newer post-freeze commits.

The promotion candidate remains frozen and must not merge to `main` automatically.


## Post-freeze dialogue difficulty/turn-shape hardening — 2026-09-19

Continuation audit found two additional defects inside existing Turn 16/24 responsibilities; no Turn 25 was created.

- Turn 16.5 / 24.17: dialogue difficulty/filter routing no longer falls back to generic `difficulty/level` metadata. Learner-facing routing accepts only inert `difficulty_id` or Russian `difficulty_ru`.
- Turn 16.6 / 24.18: both `utterances` and fallback `turns` now pass through the same sanitizer projector; generic string/text fallback must contain Cyrillic before becoming a learner-facing Russian line.
- Dialogue negative coverage increased from 22 to 28 cases, including generic difficulty fallback, fallback-turn sanitizer bypass and non-Cyrillic generic-text regressions.

Source-level executable checkpoint before documentation sync:

- commit: `ecc984d1c057c9bd75da8e0e67fbeab68a0613df`
- static invariant recheck: PASS
- GitHub combined status for the new head exposed no check/status records through the connector, so the last independently observed full Actions proof remains `c0e2413b5ec34e86e6ad83fb0c907dcea1417aa4` / workflow `35422889144`.

The promotion candidate remains frozen. Do not merge to `main` automatically.

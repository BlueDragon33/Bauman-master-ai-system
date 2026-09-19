# Russian Learning Rebuild — Canonical 24-Turn Plan

**This file is the single source of truth for Russian development status.**

Branch: `work/russian-listen-speak-literacy-visual-semantics`

Architecture: `Russian Subject — Listen, Speak, Literacy & Visual Semantics`

## Status vocabulary

- **GREEN** — the turn-specific contract/gate and existing Russian regression pass on an accepted head.
- **ACTIVE** — current implementation turn; not accepted yet.
- **PLANNED** — not started.
- **BLOCKED** — cannot proceed because a required prior gate is red.

A turn may have a **deferred obligation** only when the obligation belongs to a later explicit cross-layer gate. Deferred obligations are listed below and must be closed before Turn 24 freeze.

## Sequential rule

Only one turn is ACTIVE at a time.

Each turn follows:

`contract → validator → negative tests → minimal runtime/data change → turn gate → existing regression → status update`

If a gate fails, repair it before continuing. Never weaken an assertion merely to make CI green.

## Status table

| Turn | Responsibility | Status | Acceptance / next constraint |
| --- | --- | --- | --- |
| 1 | Baseline audit & pedagogy contract | GREEN | Real data measured; direct-semantic target frozen |
| 2 | Learning-route priority | GREEN | Fresh Vietnam-stage route is oral-first; saved state preserved |
| 3 | Oral-first warm-up | GREEN | Normal listen unlocks text; slow-listen cannot unlock first |
| 4 | Print Cyrillic recognition | GREEN | Exact 33 letters; case/confusable recognition; additive evidence |
| 5 | Handwritten Cyrillic recognition | GREEN | Print↔cursive runtime + contract green; visual glyph proof deferred to Turn 23 |
| 6 | Sound ↔ letter mapping | GREEN | 33-letter curated sound map; ru-RU audio; listen-gated sound→letter evidence |
| 7 | Handwriting motor practice | GREEN | Existing canvas reused; trace→copy→connect→free; per-letter motor evidence |
| 8 | Listening ladder | GREEN | Normal→focused→repair-slow→gist/detail; slow gated after two normal plays |
| 9 | Speaking & shadowing ladder | GREEN | Recorder-backed imitation→shadowing→memory→role-play→repair; Turn 8 retains listening ownership |
| 10 | Visual vocabulary contract | GREEN | Direct-semantic target locked; translation fields migration-only; authority switch deferred to Turn 13 |
| 11 | Visual asset coverage | GREEN | 8,000/8,000 explicit source visual assets; classifier ignores translation fields |
| 12 | Direct-semantic explanation | GREEN | 8,000/8,000 direct-semantic ready via visual/category/Russian-definition/audio; gesture/contrast/analogy remain source-gated |
| 13 | Visual vocabulary runtime | GREEN | Learner-facing authority switched to visual/Russian direct semantics; translation flip removed; SRS/mastery authority preserved |
| 14 | Reading bridge | GREEN | 20 chunks + 16 real words + 8 short texts; self-read before audio check; Russian-only evidence |
| 15 | Dictation & listen-to-write | GREEN | 33 letters + 16 words + 8 short texts; answer reveal after two attempts; Russian-only |
| 16 | Translation-free dialogue scaffolding | GREEN | Active dialogue/practice surfaces use scene/role/Russian context; hear-before-see preserved; legacy gloss fields source-only |
| 17 | Grammar from patterns | GREEN | Heard pattern → spoken practice → Russian contrast → tiny rule → immediate reuse; no translation answer or mastery mutation |
| 18 | Multimodal SRS & review | GREEN | Scheduler/Review Queue/mastery preserved; behavioral gate proves modality-isolated evidence writes only |
| 19 | Skill-gated assessment | GREEN | Six read-only evidence gates remain isolated; aggregate ready only when all six meet explicit criteria |
| 20 | AI mentor direct explanation | GREEN | Russian-first direct-semantic helper; translation fallback blocked; AI context remains read-only |
| 21 | Weakness repair routing | GREEN | Unified additive repair router; focused routes; evidence-gated resolution; legacy click-equals-complete removed |
| 22 | Offline media & asset reliability | GREEN | Entry-derived shell + 17 required data sources verified; false-ready blocked; external media/visual failures explicit |
| 23 | Browser/package/accessibility/performance QA | GREEN | 64 entry dependencies / 66 shell entries exact; accessibility/responsive/performance/browser fallbacks gated; cursive obligation closed by 66 distinct OFL upper/lower outlines |
| 24 | Migration freeze & promotion candidate | GREEN | 24-turn rebuild frozen; compatibility/promotion gates pass at source level; explicit promotion decision required before main merge |

## Turn definitions

### Turn 1 — Baseline audit & pedagogy contract

Measure real runtime/data gaps and freeze the target learning policy.

Post-freeze quality substep:

- **1.1 — Source-gap vs runtime-readiness audit:** keep source asset gaps separate from learner-facing runtime readiness; Russian TTS, playback-completed listening and recognition-confirmed speaking are measured from executable runtime evidence rather than raw source-asset presence.

### Turn 2 — Learning-route priority

Make the fresh Vietnam-stage route prioritize listening, speaking and literacy. Existing saved learner state must remain authoritative.

### Turn 3 — Oral-first warm-up

Hear before see: hide Russian text/hints/gloss until the learner completes the first normal-speed listen.

Post-freeze quality substep:

- **3.1 — Completed-listen unlock:** first-listen text/scaffold unlock now requires successful normal-speed playback completion (`onEnd`), not merely playback start or button click; failed/interrupted playback remains locked.

### Turn 4 — Print Cyrillic recognition

Cover all 33 uppercase/lowercase letters and confusable-letter discrimination.

### Turn 5 — Handwritten Cyrillic recognition

Cover print→cursive and cursive→print recognition for all 33 letters using the subject's handwriting rendering layer.

### Turn 6 — Sound ↔ letter mapping

Connect every letter to Russian sound examples and usable real-word anchors. Distinguish letter name from sound behavior where needed. No Vietnamese vocabulary translation.

### Turn 7 — Handwriting motor practice

Improve trace/free-write/copy flow, stroke guidance, letter connections and practice evidence.

### Turn 8 — Listening ladder

Standardize normal-speed listening, focused replay, slow replay only after need is established, and gist/detail tasks.

Post-freeze regression substep:

- **8.1 — Listening tokenizer gate fidelity:** align the static validator/negative mutation with the real `.split(/\s+/)` tokenizer so valid whitespace tokenization passes while broken tokenization still fails.
- **8.2 — Playback-completion evidence:** normal/focused/slow listening evidence is emitted only after TTS playback completes; two completed normal listens are required before slow repair, and interrupted playback cannot unlock hear-before-see.

### Turn 9 — Speaking & shadowing ladder

Standardize imitation, shadowing, memory speaking, role-play and pronunciation repair evidence.

Post-freeze quality substep:

- **9.1 — Recognition-confirmed speaking evidence:** recorder start only indicates microphone readiness; imitation/shadowing/memory/role-play/repair attempts are counted only after SpeechRecognition returns a non-empty Russian transcript, so failed/no-speech sessions do not become speaking evidence.
- **9.2 — Self-assessment/evidence isolation:** `✓ Đã nói ổn` remains a subjective self-rating only; it cannot fabricate `score:100`/transcript evidence, clear pronunciation-repair flags, mark a speaking session attempted, or increment learning-flow speaking attempts. Learning-flow speaking evidence now comes only from `russian:speaking-recording-result`.
- **9.3 — Deep Speaking recognition evidence:** Rapid/Substitution/Shadowing/Monologue/Q&A deep modes now expose an actual Russian SpeechRecognition action. `deepSpeakingProgress.attempts` increments only after a non-empty recognition result; manual “Tự đánh giá: ổn” remains separate and cannot create recognition evidence or mastery.

### Turn 10 — Visual vocabulary contract

Define a visual semantic schema and prohibit Vietnamese/English meaning answers on vocabulary learning surfaces.

Post-freeze quality substep:

- **10.1 — Adapter/new-item direct-semantic freeze:** `subject-adapter.vocabMeaning()` now returns only Russian/direct-semantic fields; vocabulary search inherits the same authority; `storageSkeleton('vocab')` creates Russian explanation + visual/context evidence and cannot create `vi/clue_en/translation_*` fields.

### Turn 11 — Visual asset coverage

Measure and validate photo/illustration/pictogram/scene coverage with explicit missing-visual states instead of translation fallback.

Post-freeze quality substeps:

- **11.1 — Visual evidence tier audit:** distinguish concrete image/illustration fields from symbolic evidence such as emoji/pictogram/scene/gesture instead of reporting both as one undifferentiated “visual ready” number.
- **11.2 — Corpus-shape audit:** profile the 8,000-item corpus before enrichment. CI proved `concreteVisual=0`, `symbolicVisual=8000`, with all 8,000 rows carrying Russian term/phrase, `meaning_ru`, example, tags, stage, pronunciation and `image_emoji`; therefore the old 100% visual-ready metric was technically true but too weak for the intended image-first pedagogy.

### Turn 12 — Direct-semantic explanation

Use scene, gesture, contrast, category, examples and analogy to communicate meaning directly.

### Turn 13 — Visual vocabulary runtime

Replace translation-style “flip meaning” behavior with image/context discovery, audio recall and Russian usage.

Post-freeze quality substeps:

- **13.1 — Verified image enrichment:** when a source row has no concrete image, perform an on-demand Wikimedia Commons lookup using only Russian term/semantic context; rank candidates through a relevance gate, preserve emoji/Russian-context fallback, expose source/license/artist attribution, and never mutate mastery or SRS authority.
- **13.2 — Image hydration race/network hardening:** cancel stale lookups when the learner changes cards, deduplicate in-flight requests, attach load/error listeners before assigning `img.src`, skip lookup offline or under Save-Data, restrict thumbnails/source pages to trusted Wikimedia hosts, and retain the original symbolic/Russian fallback whenever lookup fails or relevance is insufficient. Final proof: workflow `35416968142` GREEN at `a9a813bb788c23775ee0b55356a27931d8d950c4`.

### Turn 14 — Reading bridge

Move from letter recognition to chunks, high-frequency words and short real-world reading.

### Turn 15 — Dictation & listen-to-write

Add sound→letter, sound→word and short dictation activities before longer composition.

### Turn 16 — Translation-free dialogue scaffolding

Default beginner dialogue support to scene/cue/gesture/role context instead of Vietnamese gloss.

Post-freeze quality substep:

- **16.1 — Adapter/Deep/AI translation isolation:** dialogue adapter titles/subtitles are Russian/direct-context first, legacy turn translation fields are sanitized instead of exposed, Deep Speaking no longer reads `*_vi` titles/prompts/tags, custom dialogue creation no longer emits `vi_turns`, and AI dialogue context receives only Russian/direct scaffold metadata.
- **16.2 — Deep Speaking semantic allowlist:** remove generic `question/answer/domain`, `Object.values(...)` and `JSON.stringify(...)` fallback paths from learner-facing Deep Speaking. Object extraction now fails closed to Russian-labelled semantic fields and nested Russian collections only.

### Turn 17 — Grammar from patterns

Use `heard pattern → spoken pattern → noticed contrast → tiny rule → immediate reuse`.

### Turn 18 — Multimodal SRS & review

Schedule review using audio, image, recognition, speaking and writing evidence rather than translation flashcards alone.

Post-freeze regression substep:

- **18.1 — Authority-token guard fidelity:** scope scheduler/mastery authority checks to executable references rather than learner-facing prose, while negative tests still reject `dueAt` property access/declarations and review-queue mutations.

### Turn 19 — Skill-gated assessment

Assess listening, speaking, print recognition, cursive recognition, reading and writing separately before aggregate readiness.

### Turn 20 — AI mentor direct explanation

Constrain AI help to Russian-first, visual/contextual and analogy-based explanation before optional meta-language explanation.

### Turn 21 — Weakness repair routing

Route missed sounds, letters, words and dialogue turns to focused repair without silently changing mastery.

Turn 21 execution substeps:

- **21.1 — Weakness signal contract:** normalize exam, listening, speaking, literacy, dictation, multimodal and skill-gate weakness signals without changing source authority.
- **21.2 — Focused target APIs:** add explicit open/repair targeting for Cyrillic, reading and dictation surfaces.
- **21.3 — Additive repair router:** derive active signals, persist only repair-session lifecycle, and map each signal to a focused route.
- **21.4 — Evidence-gated resolution:** distinguish detected → opened → attempted → repair evidence present → resolved; opening a card never resolves it.
- **21.5 — Legacy remedial migration:** remove click-equals-complete behavior from the old exam remedial panel and route exam failures through the new repair layer.
- **21.6 — Behavioral/negative gates:** prove repair routing cannot mutate mastery, completion, SRS due dates or canonical Review Queue authority.
- **21.7 — Opened-state gate fidelity:** lock the actual `item.status='opened'` lifecycle transition in the validator and add a negative mutation proving that opening remains distinct from attempted/evidence/resolved.

### Turn 22 — Offline media & asset reliability

Ensure audio/visual/literacy assets work in PWA/offline packaging with explicit missing-resource behavior.

Turn 22 execution substeps:

- **22.1 — Runtime dependency inventory:** derive app-shell dependencies from the actual Russian entry page and fail if a required local JS/CSS dependency is not cacheable.
- **22.2 — Required learning-data inventory:** include all data fetched by literacy, reading, dictation and grammar-pattern runtimes in offline readiness.
- **22.3 — External media policy:** mark YouTube/external sources as network-only and show an explicit offline-unavailable state instead of a blank/broken embed.
- **22.4 — Asset failure UX:** provide explicit fallback for failed learner-facing visual assets without switching to Vietnamese/English translation.
- **22.5 — Offline readiness truthfulness:** report ready only when both package shell and required learning data are actually present in Cache Storage.
- **22.6 — Behavioral/package gates:** validate shell/data coverage, navigation-only HTML fallback, explicit 503 JSON for missing required data and no false offline-ready state.
- **22.7 — Asset-fallback diagnostic fidelity:** separate asset API existence from the required `missing_visual_asset` fallback value so negative tests fail for the precise broken invariant without weakening runtime behavior.
- **22.8 — Network visual enrichment boundary:** treat verified Commons thumbnails as network-only enrichment, require explicit offline/Save-Data guards, and forbid claiming external images as packaged offline assets.

### Turn 23 — Browser/package/accessibility/performance QA

Test desktop/tablet/mobile, keyboard, audio controls, packaged runtime, state persistence, large-data performance, and real cursive-vs-print glyph difference.

Turn 23 execution substeps:

- **23.1 — Package/static dependency QA:** verify entry/runtime/package dependencies, load order, local paths and no malformed markup/runtime wiring.
- **23.2 — Keyboard & accessibility QA:** verify focusable controls, accessible names, keyboard operation, live/status semantics and modal/panel behavior.
- **23.3 — Responsive containment QA:** verify desktop 16:9, tablet 3:2 and phone 19.5:9 layouts do not overflow critical learning surfaces.
- **23.4 — State/persistence/performance QA:** stress large vocabulary/test data, local-state bounds, render-loop guards and storage recovery behavior.
- **23.5 — Audio/media browser QA:** verify speech/audio controls, network-sensitive media behavior and browser capability fallbacks.
- **23.6 — Cursive visual proof:** close `RUS-CURSIVE-VISUAL-001` with real browser glyph-difference evidence, or replace font-dependent cursive with an explicit handwriting asset/shape representation.
- **23.7 — Integrated browser/package gate:** run combined package/accessibility/performance checks and update deferred-obligation status only after evidence is green.
- **23.8 — Modal accessibility lifecycle regression:** require `aria-hidden=false` on open, `aria-hidden=true` on close, move focus into the dialog and restore the opener after close; negative gates prevent regression.
- **23.9 — Browser/package negative-test fidelity:** mutate every phone breakpoint declaration when proving the 760px guard and prioritize dependency load-order diagnostics before shell-inventory diagnostics, so the negative suite tests the intended invariant rather than a partial mutation or masking error.
- **23.10 — CI action runtime compatibility:** upgrade the Russian architecture/regression workflow from `actions/checkout@v4` and `actions/setup-node@v4` to current Node-24-based v7 majors after runner deprecation warnings; workflow `35416194155` passed both jobs at commit `0609c85f512909374fc0ba346a71a9e65f3c061d`.
- **23.11 — Russian speech lifecycle integrity:** select a Russian TTS voice when available, preserve voice proof through playback start and completion callbacks, and require browser/package QA to prove completion-based listening evidence.
- **23.12 — Interrupted-playback exclusion:** guard TTS callbacks with an active speech token so an utterance cancelled by a newer playback request cannot emit completion evidence; Browser/Package behavior tests simulate cancellation and require interrupted completion count to remain zero.

### Turn 24 — Migration freeze & promotion candidate

Remove obsolete translation-first runtime authority, document compatibility, close all deferred obligations, run cross-system gates and freeze a promotion candidate.


Turn 24 execution substeps:

- **24.1 — Migration freeze contract:** preserve storage/bridge compatibility while prohibiting legacy translation state from regaining learner-facing authority.
- **24.2 — Legacy-runtime audit:** remove dead translation-toggle execution paths while retaining inert saved-state fields for old snapshots.
- **24.3 — Package/load-order freeze:** retain exact entry-derived app shell and freeze ordering for direct-semantic, browser-capability, cursive, literacy, repair and offline runtimes.
- **24.4 — Authority/bridge freeze:** preserve `BAUMAN_SUBJECT_BRIDGE_V1`, planning protocol, Learning State mastery/Review Queue ownership and Vocab SRS scheduler ownership.
- **24.5 — Negative/promotion gates:** reject automatic main merge, destructive storage reset, translation fallback, invalid bridge/storage changes, cursive upper/lower collapse, stale translation shortcuts and reintroduction of dead translation-era helpers; current freeze suite includes 14 explicit negative cases.
- **24.6 — Promotion candidate documentation:** record compatibility, version-free display policy, OFL cursive provenance and the requirement for a separate promotion decision.
- **24.7 — Version-free fallback freeze:** remove versioned learner-facing fallback labels from the adapter/core themselves, not only from the cleanup override; internal protocol/build metadata may remain non-visual.
- **24.8 — Post-freeze regression revalidation:** rerun Turn 23/24 source gates after any frozen-candidate defect fix; the post-freeze audit removed stale `V ẩn/hiện nghĩa` guidance and unused translation-era vocab/dialogue helpers, with promotion assertions updated before retaining GREEN.
- **24.9 — Promotion negative-test fidelity:** mutate every `BAUMAN_SUBJECT_BRIDGE_V1` marker in the negative case so both READY and PROGRESS bridge paths must remain contract-correct; full workflow run `35416011837` passed at commit `ae26de6b1f2d24f1e1b5bc4874ea705b68f1d5bf`, including existing-regression checks.
- **24.10 — Translation-path migration freeze:** extend migration/dialogue/vocabulary negative gates across adapter helpers, Deep Speaking, AI context and new-item templates so legacy Vietnamese/English fields may remain in archived source data but cannot regain learner-facing semantic authority. Final executable proof: workflow `35418691089` GREEN at `15e7b4f61198c5d268ea03f7fdd68d0b8d48cfa9`.
- **24.11 — Deep semantic/evidence freeze:** migration/dialogue/speaking negative gates now reject generic-language Deep Speaking fallback and reject click/self-rating as recognition evidence. Workflow `35420972649` is GREEN for architecture and existing regression at commit `f5b49e56f276752ee2db9a3c5c33011574b0d3ba`.

Result: all canonical 24 turns are GREEN. No further turn is created because no new responsibility remains unresolved inside this rebuild. Promotion to `main` is deliberately outside automatic execution.

## Deferred obligations

### RUS-CURSIVE-VISUAL-001 — CLOSED

Created by: Turn 5.

Closed by: Turn 23.

Resolution: the literacy and handwriting-motor surfaces now use `RUSSIAN_CURSIVE_GLYPH_SHAPES_V2`, with 66 distinct uppercase/lowercase SVG outline glyphs derived from an OFL Cyrillic handwriting source and loaded before Cyrillic literacy. Recognition no longer depends on an installed handwriting font, and upper/lower forms cannot collapse to the same path.

Evidence: Turn 23 integrated browser/package gate verifies 33/33 pairs, 66/66 glyph outlines, distinct upper/lower paths for every letter, SVG path rendering without `<text>`, literacy/motor integration, package load order and offline-shell inclusion. Provenance/OFL files are stored beside the runtime.

Due: Turn 23 — satisfied.

Blocks Turn 24: no.

## Expansion rule

A turn may create smaller substeps when a real defect or missing capability is discovered. Substeps stay inside the owning turn unless they establish a genuinely new responsibility.

The plan may increase beyond 24 turns only when the new responsibility cannot safely fit an existing turn. Do not create turns merely for cosmetic refactoring.

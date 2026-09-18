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
| 15 | Dictation & listen-to-write | ACTIVE | Source-backed sound→letter→word→short dictation; answer hidden until attempts |
| 16 | Translation-free dialogue scaffolding | PLANNED | Scene/cue/role replaces default Vietnamese gloss |
| 17 | Grammar from patterns | PLANNED | Heard/spoken pattern before minimal rule |
| 18 | Multimodal SRS & review | PLANNED | Audio/image/recognition/speaking/writing evidence |
| 19 | Skill-gated assessment | PLANNED | Separate skill readiness before aggregate readiness |
| 20 | AI mentor direct explanation | PLANNED | Russian-first/visual/analogy before meta-language help |
| 21 | Weakness repair routing | PLANNED | Focused repair without silent mastery changes |
| 22 | Offline media & asset reliability | PLANNED | Explicit offline/missing-resource behavior |
| 23 | Browser/package/accessibility/performance QA | PLANNED | Includes cursive visual-difference proof |
| 24 | Migration freeze & promotion candidate | PLANNED | Cannot freeze with open deferred obligations |

## Turn definitions

### Turn 1 — Baseline audit & pedagogy contract

Measure real runtime/data gaps and freeze the target learning policy.

### Turn 2 — Learning-route priority

Make the fresh Vietnam-stage route prioritize listening, speaking and literacy. Existing saved learner state must remain authoritative.

### Turn 3 — Oral-first warm-up

Hear before see: hide Russian text/hints/gloss until the learner completes the first normal-speed listen.

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

### Turn 9 — Speaking & shadowing ladder

Standardize imitation, shadowing, memory speaking, role-play and pronunciation repair evidence.

### Turn 10 — Visual vocabulary contract

Define a visual semantic schema and prohibit Vietnamese/English meaning answers on vocabulary learning surfaces.

### Turn 11 — Visual asset coverage

Measure and validate photo/illustration/pictogram/scene coverage with explicit missing-visual states instead of translation fallback.

### Turn 12 — Direct-semantic explanation

Use scene, gesture, contrast, category, examples and analogy to communicate meaning directly.

### Turn 13 — Visual vocabulary runtime

Replace translation-style “flip meaning” behavior with image/context discovery, audio recall and Russian usage.

### Turn 14 — Reading bridge

Move from letter recognition to chunks, high-frequency words and short real-world reading.

### Turn 15 — Dictation & listen-to-write

Add sound→letter, sound→word and short dictation activities before longer composition.

### Turn 16 — Translation-free dialogue scaffolding

Default beginner dialogue support to scene/cue/gesture/role context instead of Vietnamese gloss.

### Turn 17 — Grammar from patterns

Use `heard pattern → spoken pattern → noticed contrast → tiny rule → immediate reuse`.

### Turn 18 — Multimodal SRS & review

Schedule review using audio, image, recognition, speaking and writing evidence rather than translation flashcards alone.

### Turn 19 — Skill-gated assessment

Assess listening, speaking, print recognition, cursive recognition, reading and writing separately before aggregate readiness.

### Turn 20 — AI mentor direct explanation

Constrain AI help to Russian-first, visual/contextual and analogy-based explanation before optional meta-language explanation.

### Turn 21 — Weakness repair routing

Route missed sounds, letters, words and dialogue turns to focused repair without silently changing mastery.

### Turn 22 — Offline media & asset reliability

Ensure audio/visual/literacy assets work in PWA/offline packaging with explicit missing-resource behavior.

### Turn 23 — Browser/package/accessibility/performance QA

Test desktop/tablet/mobile, keyboard, audio controls, packaged runtime, state persistence, large-data performance, and real cursive-vs-print glyph difference.

### Turn 24 — Migration freeze & promotion candidate

Remove obsolete translation-first runtime authority, document compatibility, close all deferred obligations, run cross-system gates and freeze a promotion candidate.

## Deferred obligations

### RUS-CURSIVE-VISUAL-001

Created by: Turn 5.

Requirement: browser/package QA must prove the selected handwriting font stack produces a visibly different cursive/handwritten glyph presentation from print for the literacy experience, or replace it with an explicit handwriting asset/shape representation.

Due: Turn 23.

Blocks: Turn 24 freeze.

## Expansion rule

A turn may create smaller substeps when a real defect or missing capability is discovered. Substeps stay inside the owning turn unless they establish a genuinely new responsibility.

The plan may increase beyond 24 turns only when the new responsibility cannot safely fit an existing turn. Do not create turns merely for cosmetic refactoring.

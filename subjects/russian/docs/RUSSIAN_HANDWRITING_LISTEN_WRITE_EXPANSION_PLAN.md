# Russian Handwriting Listen+Write — Implementation & Expansion Plan

Status: RHW1-RHW7_COMPLETE · TERMINAL_MARKER_ACTIVE
Track rounds: RHW1-RHW7
Total planned steps: 38
Defects: RHWx-Fy
Architecture hardening: RHWx-Hy

## Source-learning pattern

The attached writing workbook is treated as a pedagogical reference, not copied verbatim. The implementation pattern is:
- recognize print and cursive forms;
- hear letter name / sound / syllable / word;
- trace and copy cursive;
- write from listening;
- mark stress and discriminate spelling vs pronunciation where appropriate;
- progress from letter -> syllable -> word -> short sentence.

The first pilot is the Alphabet / Handwriting lesson. Only after full acceptance is the architecture generalized.

## RHW1 — Learning specification + pronunciation data contract (5 steps)

S01. Audit current handwriting.json, writing.json, renderWriting(), canvas and current Russian speech helper.
S02. Define pronunciation schema for letterName, soundExamples, slow/normal playback, context notes and no-sound letters.
S03. Define exercise schema: hear-select, hear-trace, hear-write, syllable-write, word-dictation, stress-mark, sound-spelling-discrimination.
S04. Define special Russian rules: Ь/Ъ no independent phoneme; Е/Ё/Ю/Я contextual values; hard/soft consonant context; stress-aware words.
S05. Contract validator + zero-runtime-regression gate.

## RHW2 — Alphabet pronunciation layer (5 steps)

S06. Add reusable pronunciation service over existing ru-RU speech path with cancel/replay and normal/slow rates.
S07. Add Letter name / Sound / Example controls to handwriting card.
S08. Add keyboard/mobile-accessible playback controls and active-playing state.
S09. Add fallback behavior when speech synthesis/voice is unavailable; never block writing.
S10. Unit/static validation for all alphabet items and special letters.

## RHW3 — Listen + Write exercise engine modeled on workbook patterns (6 steps)

S11. Exercise 1: hear a letter -> choose matching print/cursive form.
S12. Exercise 2: hear letter/sound -> trace or write it on canvas.
S13. Exercise 3: hear syllable -> write connected cursive syllable.
S14. Exercise 4: hear word -> copy/dictate full word with cursive practice.
S15. Exercise 5: listen -> mark stress / discriminate sound-vs-spelling patterns.
S16. Exercise sequence, retry, reveal-after-attempt and deterministic answer validation.

## RHW4 — Progress, adaptive review and lesson UX (5 steps)

S17. Per-letter listen/write mastery state and mistake history.
S18. Adaptive queue prioritizing confusable letters/sounds and failed dictation.
S19. Session modes: Learn / Practice / Dictation / Review.
S20. Preserve handwriting-first layout: sample left, writing canvas right, audio integrated without clutter.
S21. Progress UI and resume state across reload/offline shell.

## RHW5 — Hardening and full-system closeout for the pilot (6 steps)

S22. Adversarial audio tests: rapid taps, cancel/replay, slow/normal switching, unsupported voice.
S23. Handwriting state tests: undo/clear/guide toggles while audio is playing.
S24. Mobile/tablet/pointer/keyboard accessibility acceptance.
S25. Offline/PWA acceptance and no-network writing fallback.
S26. Russian Reference UI + Whole System regression with no impact on Speaking/Vocab/Grammar.
S27. Pilot final-state marker. Alphabet Listen+Write is frozen as reference implementation.

## RHW6 — Reusable Lesson Factory / schema for future lessons (5 steps)

S28. Extract generic ListenWriteLesson schema independent of alphabet.
S29. Map content types: letter, syllable, word, phrase, sentence, dictation.
S30. Build generic renderer/player/scoring adapter from schema.
S31. Add authoring validator: missing audio target, answer, stress, handwriting sample, or unsupported mode fails closed.
S32. Factory acceptance using two non-alphabet fixture lessons.

## RHW7 — Expansion to later lessons (6 steps)

S33. Convert lesson vocabulary/syllable writing tasks into ListenWriteLesson data. **PASS**
S34. Convert sentence-level handwriting/dictation tasks. **PASS**
S35. Add automatic lesson binding so each lesson loads only its own writing/listening material. **PASS**
S36. Add level rules A0/A1/A2 and future preparatory-course content without code duplication. **PASS**
S37. Cross-lesson regression + migration audit; no Vietnamese translation injected into image-first vocabulary. **PASS**
S38. Expansion final marker + documentation for adding future lessons by data only. **PASS after H1 documentation closeout**

## Completion criteria

The feature is complete only when:
1. RHW1-RHW5 pilot passes all relevant Russian/UI/offline/whole-system gates.
2. RHW6 proves the same engine can render at least two different lesson types without custom runtime code.
3. RHW7 proves expansion is data-driven and future lessons do not require duplicating pronunciation/writing logic.
4. Any discovered defect creates an Fx step; any missing reusable architecture creates an Hx step before the next round opens.

## RHW7-H1 — Authoring documentation hardening

**PASS.** Added and gated a canonical data-only authoring guide for future lesson expansion. This is documentation/validation hardening only; it does not widen runtime capabilities or change scoring/playback behavior.

## Terminal completion

RHW1–RHW7 and S01–S38 are complete. Post-RHW7 audit found no additional round required for the requested feature. Future ordinary lessons are data-only; a new RHW round is opened only for a genuinely new capability outside the accepted schema/factory.

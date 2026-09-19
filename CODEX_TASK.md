# CODEX_TASK

Task: `RUSSIAN_LISTEN_SPEAK_LITERACY_VISUAL_SEMANTICS`

Mode: `SEQUENTIAL_GATED_DEVELOPMENT`

## Canonical plan

Use only:

`subjects/russian/RUSSIAN_DEVELOPMENT_PLAN.md`

for turn status and substeps.

## Current work

Turns 1–22 are accepted.

Next: **Turn 23 — Browser/package/accessibility/performance QA**.

Turn 23 must:

- verify packaged runtime/static dependencies and load order;
- verify keyboard operation and accessible names/status semantics on critical controls;
- verify responsive containment for desktop, tablet and phone target ratios;
- stress state persistence, large vocabulary/test data, storage guards and render-loop protections;
- verify speech/audio/media browser-capability fallbacks;
- close `RUS-CURSIVE-VISUAL-001` with actual browser evidence that cursive/handwritten rendering differs from print, or replace font-dependent cursive with an explicit handwriting asset/shape representation;
- add integrated regression gates and keep all earlier authority boundaries intact.

## Automatic expansion rule

If a defect or missing capability appears, create a numbered substep inside Turn 23 and fix it immediately. Add a new turn beyond the canonical 24 only if the responsibility genuinely cannot fit Turn 23 or Turn 24.

## Gate rule

For each substep:

1. freeze the assertion;
2. create/extend validator;
3. add negative coverage;
4. make the smallest runtime/package change;
5. run available behavioral/browser verification;
6. preserve prior regression;
7. update canonical status only after green.

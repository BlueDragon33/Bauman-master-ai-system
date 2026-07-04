# CODEX_STATE

Current task: E201 C02 Level C deck data completed, runtime untouched.

Status: DATA_READY_NOT_WIRED

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack remains stable:
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132-content-fix-E171.js`

Compatibility files:
- `theory-slideshow-C02-deck-pack-E190.js` reports `active:false`.
- `theory-slideshow-C02-level-c-E192.js` reports `active:false`.
- `theory-slideshow-C03-deck-pack-E191.js` reports `active:false`.
- `theory-slideshow-C03-level-c-E193.js` is not loaded by `index.html`.
- `theory-slideshow-C03-level-c-enhancer-E195.js` is not loaded by `index.html`.

Routing:
- `theory-learning-path-E186.js?v=195` remains active.
- C02 and C03 static lesson lists remain in E186 so the picker can show real lessons.

Deck length policy:
- 16 slides is the minimum acceptable lesson deck size, not a maximum.
- Do not introduce `MAX_SLIDES=16`, `slice(0,16)`, or any equivalent truncation.
- Dense Level C lessons may use 18-28 slides when needed.

Files added for C02 Level C data:
- `subjects/math/data/theory_slideshow_c02_level_c.json`
  - C02 §2.1: 20 slides.
  - C02 §2.2: 20 slides.
- `subjects/math/data/theory_slideshow_c02_level_c_part_2_3_6.json`
  - C02 §2.3: 18 slides.
  - C02 §2.4: 18 slides.
  - C02 §2.5: 18 slides.
  - C02 §2.6: 18 slides.

Implementation decision:
- This pass intentionally created data only.
- No runtime was added.
- No wrapper was added.
- No observer was added.
- No override of `window.BAUMAN_MATH_THEORY_E132` was added.
- This avoids reintroducing the slideshow jumping bug.

C02 Level C coverage includes:
- 2x2 and 3x3 matrix visuals by data keys.
- Matrix as data vs operator.
- Row/column interpretation.
- Matrix multiplication with full 2x2 expansion.
- Shape contracts and pipeline order.
- Rank, column space, row space, null space, singular values.
- Inverse, solve, augmented matrix, consistency, condition number, regularization.
- Geometry transforms: identity, scale, rotation, shear, projection, reflection, determinant, basis change.
- PCA and linear models: centering, covariance, SVD, explained variance, projection, reconstruction, ridge.

Next safe task:
- Build one stable renderer path that consumes the C02 Level C data files.
- Do not use stacked wrappers.
- Do not use DOM post-render mutation.
- Browser smoke required before marking runtime PASS.

Required local smoke before wiring runtime:
1. Confirm current baseline still stable: C01, C02, C03 slideshow no repeated movement.
2. Confirm new JSON files are present after `git pull origin main`.
3. Do not load these JSON files in the browser until renderer is deliberately implemented.

Next actor:
- ChatGPT or Codex can wire C02 data later, but only with one stable renderer and browser smoke.

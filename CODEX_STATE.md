# CODEX_STATE

Purpose: persistent handoff log for GitHub/Codex/ChatGPT work on `BlueDragon33/Bauman-master-ai-system`.

## Rules for future work

- Do not scan the whole repo.
- Use Inspect-only, Contract-only, Patch-only, Verify-only phases.
- Do not rewrite large files when a local patch is enough.
- Do not hard-code the academic/program tree into UI.
- Do not make `lessons.json` primary for new Math Theory content.
- Keep `theory_lecture_frame.json` as the Theory frame source and `theory_lecture_content.json` as the Theory content source.
- Treat `lessons.json` as legacy compatibility only.
- Do not rewrite `subject-manifest.json` casually.
- Record files read/changed/tested here.

## Current focus

Subject: `subjects/math`

Current task:

`E132 · Theory UI + Slideshow Standardization`

Task status:

Complete, 7/7 rounds, plus visible C01 seed content applied after user reported slides did not visibly change.

Current target version:

`E132_THEORY_UI_SLIDESHOW`

Final handoff:

- `subjects/math/E132_THEORY_UI_FINAL_HANDOFF.md`

E132 contract:

- `subjects/math/THEORY_UI_SLIDESHOW_CONTRACT_E132.md`

E132 design/runtime assets:

- `subjects/math/assets/theory_skin/theory-ui-tokens-E132.css`
- `subjects/math/assets/theory_skin/theory-reader-E132.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/E132_CANVA_THEORY_STYLE_GUIDE.md`
- `subjects/math/E132_CANVA_TO_RUNTIME_MAPPING.md`

## Stable source rules

Theory content source-of-truth:

- Frame: `subjects/math/data/theory_lecture_frame.json`
- Content: `subjects/math/data/theory_lecture_content.json`
- Legacy fallback only: `subjects/math/data/lessons.json`

E130 program-frame sources:

- `subjects/math/data/math_program_frame.json`
- `subjects/math/data/math_program_map.json`

E129 runtime files:

- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`

E130 assets:

- `subjects/math/assets/program_frame/program-frame-E130.js`
- `subjects/math/assets/program_frame/program-view-E130.js`
- `subjects/math/assets/program_frame/program-frame-E130.css`

## Completed summary

### E129 · Theory source split and importer

Status: complete.

Meaning:

- E129 owns the Theory shell and Theory storage route.
- E129 reads frame from `theory_lecture_frame`.
- E129 imports/reads content from `theory_lecture_content`.
- E126 is suppressed when `window.BAUMAN_MATH_E129_OWNS_THEORY` is true.
- E128 remains legacy and should not be used for new Theory content.
- `lessons.json` is compatibility fallback only.

### E130 · Integrated Math Program Frame

Status: complete, 10/10 rounds.

Final handoff:

- `subjects/math/E130_PROGRAM_FRAME_FINAL_HANDOFF.md`

Meaning:

- E130 is an overlay, not a replacement.
- Bauman route remains `stage -> discipline -> chapter -> lesson/content`.
- E130 adds `block -> section -> program lecture anchor -> mapped chapters/content`.
- The 21 anchors are organizing containers, not a 21-lesson limit.
- Active chapters 1-40 are mapped in `math_program_map.json`.
- E130 UI route exists as `Lộ trình Bauman` / `Khung bài giảng Bauman`.
- E130 sample content bundle exists as source material.

E130 sample bundle:

- `subjects/math/content_bundles/theory/e130_c01_vector_as_engineering_data_bundle.json`

## Completed E132 rounds

### E132 Round 1 · Inspect + Design Contract

Status: complete.

Changed:

- Created `subjects/math/THEORY_UI_SLIDESHOW_CONTRACT_E132.md`.
- Updated this `CODEX_STATE.md` file.
- Opened a Canva design-generation recommendation widget for a 6-slide E132 visual reference deck.

Commit:

- `2a6ccd48acc3904d678cf987fc7e35ec4fff76dd`

Findings:

- E129 already normalizes slides and preserves 16 preferred slide roles.
- E129 already supports import/export for `theory_lecture_content`.
- Current CSS had a basic presenting mode that hides sidebar/topbar, but slides still rendered as a vertical article list rather than a real deck.
- E132 should add an enhancer layer rather than rewrite E129.

### E132 Round 2 · Design tokens + Canva style guide

Status: complete.

Changed:

- Created `subjects/math/assets/theory_skin/theory-ui-tokens-E132.css`.
- Created `subjects/math/E132_CANVA_THEORY_STYLE_GUIDE.md`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `f80f138b421e2f8b5030325985a4c607486a1e93`
- `adb29b485e7814e4c7c015363762965be3e9da31`
- `f9417fba00e96667e30dd5a0d68a470a4557f43a`

Purpose:

- Add E132 design tokens.
- Define Canva-inspired academic-tech style language for Theory UI and slideshow.
- Keep Canva as design reference, not runtime source.

### E132 Round 3 · Slideshow enhancer shell

Status: complete by repository inspection. Browser runtime still needs user-side Live Server confirmation.

Changed:

- Created `subjects/math/assets/theory_skin/theory-slideshow-E132.css`.
- Created `subjects/math/assets/theory_skin/theory-slideshow-E132.js`.
- Updated `subjects/math/index.html` to load E132 tokens, slideshow CSS, and slideshow JS after E129.
- Updated this `CODEX_STATE.md` file.

Commits:

- `2dccf9e2ef9df511e33df03b574c7a55eded14d2`
- `f168a7f4bfd6ec9d486faf654430eb330a26776e`
- `a8ddad17aa4cd5b0a585e23d0b9db546ac2f5e61`
- `b3b200f8fb0b5088e8bae550b52fef5b81d63c2d`

Purpose:

- Convert E129 presenting mode from a vertical article list into a deck shell with one active slide.
- Add previous/next/exit controls and a progress bar.
- Add keyboard navigation with ArrowLeft, ArrowRight, PageUp, PageDown, and Escape.
- Add semantic role classes for formula, lab, warning, and Q&A slides based on slide text.
- Expose `window.BAUMAN_MATH_THEORY_E132.selfCheck()`.

### E132 Round 4 · Theory reader polish

Status: complete by repository inspection. Browser runtime still needs user-side Live Server confirmation.

Changed:

- Created `subjects/math/assets/theory_skin/theory-reader-E132.css`.
- Updated `subjects/math/index.html` to load `theory-reader-E132.css` after E132 tokens and before E132 slideshow CSS.
- Updated this `CODEX_STATE.md` file.

Commits:

- `b50dfa757f836b3273a93e7f22ad1e9e0fa03d72`
- `abaec5436630d05da9201feda2c7674627aa3772`
- `e73994a333d87292c21d184f8d2d74c6b2cca0ef`

Purpose:

- Polish the non-presentation Theory reader with a CSS-only enhancer.
- Make the Theory reader header, cards, slide preview grid, stats, and presentation entry button clearer.
- Keep presentation mode isolated by using `body:not(.e129-presenting)` selectors.
- Keep E129 JS/importer untouched.

### E132 Round 5 · Canva mapping + self-check refinement

Status: complete by repository inspection. Browser runtime still needs user-side Live Server confirmation.

Changed:

- Created `subjects/math/E132_CANVA_TO_RUNTIME_MAPPING.md`.
- Updated `subjects/math/assets/theory_skin/theory-slideshow-E132.js` self-check.
- Updated this `CODEX_STATE.md` file.

Commits:

- `0f94c1d78540fe6846b307eb1706a88519539fb2`
- `039ffb266f69bd5fd29483fc50f4bac0e0b9a890`
- `4f5e21d4ab966eb1f46f9590309bcc27fd416812`

Purpose:

- Lock the boundary between Canva visual reference and repo runtime implementation.
- Map Theory slide roles to Canva layout names and runtime treatments.
- Improve `BAUMAN_MATH_THEORY_E132.selfCheck()` so it reports tokens CSS, reader CSS, and slideshow CSS load status.

### E132 Round 6 · Regression verification

Status: complete by repository inspection. Browser runtime still needs user-side Live Server confirmation.

Changed:

- Updated this `CODEX_STATE.md` file only.

Commit:

- `61f06565bf1fd5d5520e9b5cd30c4101ec1f7440`

Purpose:

- Verify E132 load order, E132 self-check shape, E129 import/storage route, E130 Program Frame route, and E126 suppression.
- Patch only if a concrete regression is found.

Verification performed:

- Confirmed `index.html` load order: E129 CSS -> E132 tokens -> E132 reader CSS -> E132 slideshow CSS -> E130 CSS -> E128 CSS.
- Confirmed script load order: `subject-adapter.js` -> E130 metadata -> E129 -> E130 Program View -> E132 slideshow enhancer -> core -> E126 -> E128.
- Confirmed E132 self-check reports `tokensCssLoaded`, `readerCssLoaded`, `slideshowCssLoaded`, `importTargetUnchanged: theory_lecture_content`, `keyboard`, and `escapeToExit`.
- Confirmed E129 storage/importer still targets `theory_lecture_content` and still exports `theory_lecture_content`.
- Confirmed E129 self-check still reports `importerTarget: theory_lecture_content` and `legacyImporterSuppressedOnTheoryStorage: true`.
- Confirmed E130 Program View still fetches `math_program_frame.json` and `math_program_map.json` and still reports `importTargetUnchanged: theory_lecture_content`.
- Confirmed E130 chapter pills still sync `e129ChapterId/e129Stage` before returning to E129 Bauman route.
- Confirmed E126 adapter returns early when E129 owns Theory and its self-check reports `suppressedBy: E129`.
- No code patch was needed in Round 6.

### E132 Round 7 · Final handoff

Status: complete.

Changed:

- Created `subjects/math/E132_THEORY_UI_FINAL_HANDOFF.md`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `2357bdaffc402900c4b6c70ca59a28eb4f0b32d9`
- `81d532ca691baa6d1fd6773f6b4ca0fe024a6293`

Purpose:

- Lock final E132 source-of-truth, runtime behavior, self-check commands, manual smoke test, rollback, Canva boundary, and next production path.
- Confirm no more UI should be added before browser testing.

### E132 Visible Seed Content · C01

Status: complete after user reported slides did not visibly change.

Changed:

- Updated `subjects/math/data/theory_lecture_content.json` from empty to one real C01 lesson record with 16 slides.

Commit:

- `7edcb4d895bee99a008c375a52eb0c41d68e0433`

Reason:

- E132 reader/slideshow UI had been implemented, but `theory_lecture_content.json` was empty.
- Without a record in the E129 content source, there are no slides for E132 to display.
- The C01 seed keeps the correct source-of-truth: `theory_lecture_content.json`.
- This does not use `lessons.json`.

Visible test target:

- Stage: `vn`
- Chapter: `MATH-VN-C01-vector_trong_khong_gian_`
- Lesson: `§1.1 · Vector như dữ liệu kỹ thuật`
- Slide count: 16
- Roles include: problem framing, essence, counter intuition, bridge, notation, formula, assumption gate, mini case, interpretation, simulation, mistakes, application, practice, professor QA, bridge, takeaway.

## Current runtime notes

- E132 implementation is complete, 7/7 rounds.
- E132 runtime is loaded for both reader and slideshow presentation mode.
- `theory_lecture_content.json` now contains one visible C01 lesson record, so slide changes should appear after pulling and hard-refreshing.
- E132 only enhances E129 UI.
- E129 still owns Theory reading/importing.
- Canva is visual reference only; no runtime content is stored in Canva.
- No content was moved to `lessons.json`.

## Recommended next work

1. Pull origin and hard-refresh browser cache.
2. Open `subjects/math/index.html` with Live Server.
3. Open Lý thuyết, stage `vn`, chapter C01.
4. Confirm `§1.1 · Vector như dữ liệu kỹ thuật` appears.
5. Click `Trình chiếu` and confirm 16 slides are navigable.
6. If still not visible, check browser console and whether localStorage overlay is overriding `theory_lecture_content.json`.

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

Current target version:

`E132_THEORY_UI_SLIDESHOW`

E132 contract:

- `subjects/math/THEORY_UI_SLIDESHOW_CONTRACT_E132.md`

E132 design direction:

- Dedicated Theory UI polish.
- True slideshow/deck experience for Theory lessons.
- Canva used as visual reference and style-guide companion, not as runtime source-of-truth.
- Runtime implementation stays in repo assets so the module works locally/offline.

E132 design/runtime assets:

- `subjects/math/assets/theory_skin/theory-ui-tokens-E132.css`
- `subjects/math/assets/theory_skin/theory-reader-E132.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/E132_CANVA_THEORY_STYLE_GUIDE.md`

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
- E130 sample content bundle exists but is not auto-imported into `data/theory_lecture_content.json`.

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

Files inspected:

- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `CODEX_STATE.md`

Findings:

- E129 already normalizes slides and preserves 16 preferred slide roles.
- E129 already supports import/export for `theory_lecture_content`.
- Current CSS has a basic presenting mode that hides sidebar/topbar, but slides still render as a vertical article list rather than a real deck.
- E132 should add an enhancer layer rather than rewrite E129.

Design contract decisions:

- Add E132 as an enhancer layer, not a replacement.
- Canva is used for moodboard/design reference only.
- Future assets should prefer:
  - `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
  - `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
  - optional `subjects/math/assets/theory_skin/theory-ui-tokens-E132.css`
- E132 must expose `BAUMAN_MATH_THEORY_E132.selfCheck()`.
- E132 must preserve E129 import target: `theory_lecture_content`.
- E132 must not break E130 program route.

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

- Add E132 design tokens without activating runtime yet.
- Define Canva-inspired academic-tech style language for Theory UI and slideshow.
- Keep Canva as design reference, not runtime source.

Verification performed:

- Confirmed token CSS defines deep navy backgrounds, glass panels, cyan/violet/emerald/amber/red semantic accents, formula/code cards, radius, shadows, typography, and responsive rules.
- Confirmed style guide maps Canva visual ideas to repo implementation.
- Confirmed no `index.html` patch was made in Round 2.
- Confirmed no E129/E130 JS was modified.

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

Verification performed:

- Confirmed `index.html` loads `theory-ui-tokens-E132.css`, `theory-slideshow-E132.css`, and `theory-slideshow-E132.js`.
- Confirmed E132 JS detects E129 presenting mode and does not change import/storage routes.
- Confirmed E132 self-check reports `importTargetUnchanged: theory_lecture_content`.
- Confirmed no `theory-tab-E129.js`, `chapter_spine.json`, `subject-manifest.json`, or E130 source file was modified.

### E132 Round 4 · Theory reader polish

Status: complete by repository inspection. Browser runtime still needs user-side Live Server confirmation.

Changed:

- Created `subjects/math/assets/theory_skin/theory-reader-E132.css`.
- Updated `subjects/math/index.html` to load `theory-reader-E132.css` after E132 tokens and before E132 slideshow CSS.
- Updated this `CODEX_STATE.md` file.

Commits:

- `b50dfa757f836b3273a93e7f22ad1e9e0fa03d72`
- `abaec5436630d05da9201feda2c7674627aa3772`

Purpose:

- Polish the non-presentation Theory reader with a CSS-only enhancer.
- Make the Theory reader header, cards, slide preview grid, stats, and presentation entry button clearer.
- Keep presentation mode isolated by using `body:not(.e129-presenting)` selectors.
- Keep E129 JS/importer untouched.

Verification performed:

- Confirmed `theory-reader-E132.css` only targets non-presenting reader state.
- Confirmed the file styles `.e129-reader`, `.e129-reader-head`, `.e129-grid`, `.e129-card`, `.e129-slide-list`, `.e129-slide`, `.e129-action`, and stats without changing data logic.
- Confirmed `index.html` load order: E129 CSS -> E132 tokens -> E132 reader polish -> E132 slideshow -> E130 CSS.
- Confirmed no DataVault source, E129 JS, E130 JS, `chapter_spine.json`, or `subject-manifest.json` was modified.

## Current runtime notes

- E132 runtime is now loaded for both reader and slideshow presentation mode.
- E132 only enhances E129 UI.
- E129 still owns Theory reading/importing.
- E130 program route should remain intact, but browser regression test is required.
- No durable Theory content was changed.

## Recommended next round

E132 Round 5: Add Canva-ready template notes and refinement hooks.

Tasks:

- Add final Canva-to-runtime mapping notes if needed.
- Add optional small metadata/self-check improvement so E132 can report reader CSS loaded.
- Do not create new content.
- Do not modify DataVault import logic.

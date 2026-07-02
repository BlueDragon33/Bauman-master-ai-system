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

E132 design assets:

- `subjects/math/assets/theory_skin/theory-ui-tokens-E132.css`
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

Purpose:

- Add E132 design tokens without activating runtime yet.
- Define Canva-inspired academic-tech style language for Theory UI and slideshow.
- Keep Canva as design reference, not runtime source.

Verification performed:

- Confirmed token CSS defines deep navy backgrounds, glass panels, cyan/violet/emerald/amber/red semantic accents, formula/code cards, radius, shadows, typography, and responsive rules.
- Confirmed style guide maps Canva visual ideas to repo implementation.
- Confirmed no `index.html` patch was made in Round 2.
- Confirmed no E129/E130 JS was modified.

## Current runtime notes

- E132 has not patched runtime yet.
- `index.html` is not changed in E132 Round 2.
- Browser runtime still reflects E129/E130 as before.
- The E132 token CSS exists but is not loaded until a later round.

## Recommended next round

E132 Round 3: Add slideshow enhancer shell.

Tasks:

- Create `subjects/math/assets/theory_skin/theory-slideshow-E132.css`.
- Create `subjects/math/assets/theory_skin/theory-slideshow-E132.js`.
- Patch `subjects/math/index.html` to load E132 tokens + slideshow assets after E129.
- Add `BAUMAN_MATH_THEORY_E132.selfCheck()`.
- Keep E129 importer target unchanged.
- Keep E130 program route working.

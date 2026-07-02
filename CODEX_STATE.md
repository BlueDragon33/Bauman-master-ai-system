# CODEX_STATE

Purpose: persistent handoff log for GitHub/Codex/ChatGPT work on `BlueDragon33/Bauman-master-ai-system`.

Rules for future work:

- Do not scan the whole repo.
- Use Inspect-only, Patch-only, Verify-only phases.
- Do not rewrite large files when a local patch is enough.
- Do not hard-code the academic tree into UI.
- Do not make `lessons.json` primary for new Math Theory content.
- Keep `theory_lecture_frame.json` as the Theory frame source and `theory_lecture_content.json` as the Theory content source.
- Treat `lessons.json` as legacy compatibility only.
- Record every file read/changed/tested here.

## Current focus

Subject: `subjects/math`

Task: Clean and unify the Math `Lý thuyết` tab after mixed E112/E126/E128 versions.

Current target version:

`E129_THEORY_CONTENT_IMPORTER`

## Contract

Primary contract file:

`subjects/math/THEORY_TAB_CONTRACT_E129.md`

Key source rule:

1. `data/theory_lecture_frame.json` = frame/navigation/academic shell.
2. `data/theory_lecture_content.json` = real lecture records/slides.
3. `data/lessons.json` = legacy compatibility fallback only.

## Completed rounds

### Round 1 · Inspect-only

Status: complete.

Findings:

- `theory-main-adapter-E126.js` rendered from `DB.lessons`.
- `content_vault_manifest.json` already defined the split frame/content architecture.
- `theory_lecture_content.json` and `lessons.json` were effectively empty/currently not usable as full content sources.
- E126 self-check expected old 347+ lessons, conflicting with the newer clean-empty DataVault architecture.

Files inspected:

- `subjects/math/index.html`
- `subjects/math/subject-manifest.json`
- `subjects/math/assets/subject-adapter.js`
- `subjects/math/assets/core.js`
- `subjects/math/assets/math.js`
- `subjects/math/assets/planning-bridge.js`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`
- `subjects/math/assets/datavault_importer/datavault-importer-E128.js`
- `subjects/math/data/content_vault_manifest.json`
- `subjects/math/data/content-manifest.json`
- `subjects/math/data/theory_lecture_frame.json`
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/data/lessons.json`
- `subjects/math/data/chapter_spine.json`
- `subjects/math/data/discipline_spine.json`
- `subjects/math/data/curriculum.json`

### Round 2 · Contract-only

Status: complete.

Changed:

- Created `subjects/math/THEORY_TAB_CONTRACT_E129.md`

Commit:

- `f679f1b73ad6746bd0e718e7c9383f3976d84a6f`

Purpose:

- Lock the E129 Theory source-of-truth and cleanup rules before runtime patching.

### Round 3 · Version cleanup + route decision

Status: complete.

Changed:

- Created `subjects/math/assets/theory_skin/theory-tab-E129.js` as a lightweight contract bridge.
- Updated `subjects/math/index.html` to load the E129 bridge after `subject-adapter.js`.

Commits:

- `266f0a4ff98441b88c3368c2a561e15b557cc748`
- `1c6c475953172b572d5925c7cb58470f2ea86dd4`

Purpose:

- Mark E129 as current Theory contract while leaving E126/E128 as compatibility layers.

### Round 4 · E129 Theory shell

Status: complete.

Changed:

- Created `subjects/math/assets/theory_skin/theory-tab-E129.css`.
- Replaced the lightweight E129 bridge with a frame/content shell renderer.
- Updated `subjects/math/index.html` to load E129 CSS.
- Renamed entry title/header to `E129 Theory Shell`.

Commits:

- `5f737fbc4ee08fa93d836f5e51be9b5213945ff5`
- `d77a13367b7cf0865289416a08b0c8c0a1d90845`
- `f25cbe06653476dcc6d3247eaeca464c31d162d2`
- `9d24d566c69fccabbdd30eb3476a644fc8190ab8`

Purpose:

- Render the Theory tab from `theory_lecture_frame` and `theory_lecture_content`.
- Show a frame-only placeholder instead of a blank page when content is empty.
- Keep E126/E128 for compatibility.

### Round 5 · E129 content importer route

Status: complete.

Changed:

- Updated `subjects/math/assets/theory_skin/theory-tab-E129.js`.
- Updated `subjects/math/assets/theory_skin/theory-tab-E129.css`.
- Created this `CODEX_STATE.md` file.

Commits:

- `0fa6d8530314737c31b8e6c564be93918f1fa420`
- `82d41a7ceef3df5c39e744bffb49b11c5461c218`
- `228ebb159c255b5f6cc429b76d0e6965b9a14233`

Purpose:

- Add E129 importer controls for `theory_lecture_content`.
- Validate imported packages against `target: theory_lecture_content`.
- Store runtime overlay under `bauman_math_e129_theory_content_overlay_v1`.
- Export `theory_lecture_content` JSON for later durable repo updates.
- Suppress the old E128 `lessons` importer panel inside E129 Theory storage.

Verification performed:

- GitHub fetch verification of updated E129 JS and CSS snippets after commit.

### Round 6 · Verify/regression + E126 override guard

Status: complete.

Changed:

- Updated `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`.
- Updated this `CODEX_STATE.md` file.

Commit:

- `b744ff020da9032806e0d63817879a85fad2186d`

Finding:

- During verification, E126 still had a MutationObserver and could override `#view` if `DB.lessons` contained legacy theory lessons.
- This conflicted with the E129 ownership rule.

Fix:

- Added `e129OwnsTheory()` guard in E126.
- E126 now returns without rendering, click handling, input handling, or observer rendering when `window.BAUMAN_MATH_E129_OWNS_THEORY` is true.
- E126 self-check now returns compatibility/suppressed status when E129 owns Theory.

Verification performed:

- Confirmed `index.html` loads E129 before E126/E128.
- Confirmed E126 previously rendered from `DB.lessons` and observed `#view`.
- Confirmed E126 now has guard points for render, click, input, observer, and self-check.

## Current runtime notes

- `subjects/math/index.html` still loads E126 and E128 after E129 for compatibility.
- E129 owns the Theory shell and Theory storage route.
- E126 is suppressed when E129 ownership flag is active.
- E128 importer remains available outside E129 Theory storage but should not be used for new Theory content.
- E129 importer overlay is local/browser runtime storage, not a durable GitHub file write. Export JSON and commit to `data/theory_lecture_content.json` when content is approved.

## Next recommended round

Round 7: Browser/runtime smoke test and UI polish patch.

Checklist:

- Pull origin in GitHub Desktop.
- Open `subjects/math/index.html` through Live Server.
- Confirm `BAUMAN_MATH_THEORY_E129.selfCheck()` returns:
  - `importerTarget: "theory_lecture_content"`
  - `legacyImporterSuppressedOnTheoryStorage: true`
  - `renderReplacement: true`
- Confirm `BAUMAN_MATH_E126_SELF_CHECK()` returns suppressed compatibility when E129 owns Theory.
- Open `Lý thuyết E129`.
- Open `Kho Lý thuyết`.
- Confirm no E128 lessons importer panel appears inside E129 Theory storage.
- Download Form mẫu E129.
- Re-import the sample JSON.
- Confirm content appears in Theory shell and is labeled `theory_lecture_content`.
- Confirm legacy `lessons` remains fallback only.

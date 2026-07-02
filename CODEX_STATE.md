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

Task: Add E130 Math Taxonomy layer while preserving E129 Theory and the Bauman route.

Current target version:

`E130_MATH_TAXONOMY_LAYER`

Latest contract file:

`subjects/math/MATH_TAXONOMY_CONTRACT_E130.md`

Previous final handoff file:

`subjects/math/THEORY_E129_FINAL_HANDOFF.md`

## Active contracts

Theory contract:

`subjects/math/THEORY_TAB_CONTRACT_E129.md`

Taxonomy contract:

`subjects/math/MATH_TAXONOMY_CONTRACT_E130.md`

Key source rule:

1. `data/theory_lecture_frame.json` = Theory frame/navigation shell.
2. `data/theory_lecture_content.json` = real Theory lecture records/slides.
3. `data/lessons.json` = legacy compatibility fallback only.
4. E130 taxonomy must be an overlay: `domain -> branch -> topic -> linked chapters`.
5. Existing `stageId`, `disciplineId`, `chapterId`, and `lessonId` values must remain stable.

## Completed E129 rounds

### E129 Round 1 · Inspect-only

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

### E129 Round 2 · Contract-only

Status: complete.

Changed:

- Created `subjects/math/THEORY_TAB_CONTRACT_E129.md`

Commit:

- `f679f1b73ad6746bd0e718e7c9383f3976d84a6f`

### E129 Round 3 · Version cleanup + route decision

Status: complete.

Changed:

- Created `subjects/math/assets/theory_skin/theory-tab-E129.js` as a lightweight contract bridge.
- Updated `subjects/math/index.html` to load the E129 bridge after `subject-adapter.js`.

Commits:

- `266f0a4ff98441b88c3368c2a561e15b557cc748`
- `1c6c475953172b572d5925c7cb58470f2ea86dd4`

### E129 Round 4 · E129 Theory shell

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

### E129 Round 5 · E129 content importer route

Status: complete.

Changed:

- Updated `subjects/math/assets/theory_skin/theory-tab-E129.js`.
- Updated `subjects/math/assets/theory_skin/theory-tab-E129.css`.
- Created this `CODEX_STATE.md` file.

Commits:

- `0fa6d8530314737c31b8e6c564be93918f1fa420`
- `82d41a7ceef3df5c39e744bffb49b11c5461c218`
- `228ebb159c255b5f6cc429b76d0e6965b9a14233`

### E129 Round 6 · Verify/regression + E126 override guard

Status: complete.

Changed:

- Updated `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `b744ff020da9032806e0d63817879a85fad2186d`
- `c88a92f670bc7d39461128c7899d663724acafad`

Finding/fix:

- E126 could override `#view` through MutationObserver when `DB.lessons` existed.
- Added guard so E126 is suppressed when `window.BAUMAN_MATH_E129_OWNS_THEORY` is true.

### E129 Round 7 · Smoke verify + label polish

Status: complete by repository inspection. Browser runtime still needs user-side Live Server confirmation.

Changed:

- Updated `subjects/math/index.html`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `3130036f04247b7f9be4d08782aa9f7b65809dfb`
- `193cbc3f5dc2b1f9c2052389a6ce74e43eeaf310`

### E129 Round 8 · Final cleanup/handoff

Status: complete.

Changed:

- Created `subjects/math/THEORY_E129_FINAL_HANDOFF.md`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `660d5b58f07a8f22af8354312dcf73779dc4752e`
- `c3973ed56e58cffc7674869443ccd18e355a7e7a`

## Completed E130 rounds

### E130 Round 1 · Inspect-only taxonomy impact

Status: complete.

No runtime changes. No commit.

Findings:

- `discipline_spine.json` already contains `pureLayer` and `appliedLayer`, but they are attributes inside disciplines, not a top-level Pure/Applied taxonomy.
- `chapter_spine.json` contains stable anchors: `chapterId`, `stageId`, `disciplineId`, `pureLayer`, `appliedLayer`, `timelineRole`, `contentImportMode`.
- `theory-tab-E129.js` currently renders by `stage -> discipline -> chapter`.
- `content_vault_manifest.json` supports frame/content separation and reinforces that taxonomy should be metadata/navigation, not content.
- `math_taxonomy_frame.json` did not exist before E130.

Files inspected:

- `subjects/math/data/discipline_spine.json`
- `subjects/math/data/chapter_spine.json`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/data/content_vault_manifest.json`
- `subjects/math/assets/subject-adapter.js`
- `subjects/math/data/math_taxonomy_frame.json` checked as missing.

### E130 Round 2 · Contract-only

Status: complete.

Changed:

- Created `subjects/math/MATH_TAXONOMY_CONTRACT_E130.md`.
- Updated this `CODEX_STATE.md` file.

Commit:

- `f1fa9f24394a588c9c7e149c115a5b5ba0ea0cce`

Purpose:

- Lock the E130 taxonomy rules before creating taxonomy JSON files or changing UI.
- Define Pure/Applied taxonomy as an overlay, not a replacement for the Bauman route.
- Define future sources: `data/math_taxonomy_frame.json` and `data/math_taxonomy_map.json`.
- Forbid changing existing `chapterId`, deleting Bauman route, hard-coding taxonomy into JS, or making `lessons.json` primary again.

## Current runtime notes

- `subjects/math/index.html` still loads E126 and E128 after E129 for compatibility.
- E129 owns the Theory shell and Theory storage route.
- E126 is suppressed when E129 ownership flag is active.
- E128 importer remains available outside E129 Theory storage but should not be used for new Theory content.
- E129 importer overlay is local/browser runtime storage, not a durable GitHub file write. Export JSON and commit to `data/theory_lecture_content.json` when content is approved.
- `subject-manifest.json` still contains older historical labels/counts. Do not rewrite it casually. Clean it only in a dedicated manifest cleanup round.
- E130 taxonomy is not yet runtime-active. It is currently contract-only.

## Recommended next round

E130 Round 3: Create draft taxonomy sources.

Tasks:

- Create `subjects/math/data/math_taxonomy_frame.json`.
- Create `subjects/math/data/math_taxonomy_map.json`.
- Include full Pure/Applied tree from the E130 contract.
- Add a small draft mapping sample for active chapters, especially C01/C02/C03/C04, without modifying `chapter_spine.json`.
- Do not patch UI yet.
- Do not register in `subject-adapter.js` yet unless needed for JSON visibility only.

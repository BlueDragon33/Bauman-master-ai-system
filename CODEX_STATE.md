# CODEX_STATE

Purpose: persistent handoff log for GitHub/Codex/ChatGPT work on `BlueDragon33/Bauman-master-ai-system`.

## Rules for future work

- Do not scan the whole repo.
- Use Inspect-only, Patch-only, Verify-only phases.
- Do not rewrite large files when a local patch is enough.
- Do not hard-code the academic/program tree into UI.
- Do not make `lessons.json` primary for new Math Theory content.
- Keep `theory_lecture_frame.json` as the Theory frame source and `theory_lecture_content.json` as the Theory content source.
- Treat `lessons.json` as legacy compatibility only.
- Record files read/changed/tested here.

## Current focus

Subject: `subjects/math`

Task: Add E130 integrated Math Program Frame while preserving E129 Theory and the Bauman route.

Current target version:

`E130_MATH_PROGRAM_FRAME_INTEGRATED`

Active contracts:

- Theory: `subjects/math/THEORY_TAB_CONTRACT_E129.md`
- E130 program frame: `subjects/math/MATH_TAXONOMY_CONTRACT_E130.md`

Program-frame sources:

- `subjects/math/data/math_program_frame.json`
- `subjects/math/data/math_program_map.json`

Program-frame assets:

- `subjects/math/assets/program_frame/program-frame-E130.js`
- `subjects/math/assets/program_frame/program-view-E130.js`
- `subjects/math/assets/program_frame/program-frame-E130.css`

Key source rule:

1. `data/theory_lecture_frame.json` = Theory frame/navigation shell.
2. `data/theory_lecture_content.json` = real Theory lecture records/slides.
3. `data/lessons.json` = legacy compatibility fallback only.
4. E130 program frame is an overlay: `block -> section -> program lecture anchor -> mapped existing chapters/lessons/content`.
5. The 21 anchors are organizing containers, not the full content limit.
6. Existing `stageId`, `disciplineId`, `chapterId`, and `lessonId` values must remain stable.

## E129 completed summary

E129 cleaned and unified the Math Theory tab.

Key files:

- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`
- `subjects/math/THEORY_TAB_CONTRACT_E129.md`
- `subjects/math/THEORY_E129_FINAL_HANDOFF.md`

Current E129 status:

- E129 owns the Theory shell and Theory storage route.
- E126 is suppressed when `window.BAUMAN_MATH_E129_OWNS_THEORY` is true.
- E128 remains legacy and should not be used for new Theory content.
- E129 imports Theory content into `theory_lecture_content`, not `lessons`.

## Completed E130 rounds

### E130 Round 1 · Inspect-only taxonomy/program impact

Status: complete.

No runtime changes. No commit.

Findings:

- `discipline_spine.json` already contains `pureLayer` and `appliedLayer`, but they are not a top-level program frame.
- `chapter_spine.json` contains stable anchors: `chapterId`, `stageId`, `disciplineId`, `pureLayer`, `appliedLayer`, `timelineRole`, `contentImportMode`.
- `theory-tab-E129.js` currently renders by `stage -> discipline -> chapter`.
- `content_vault_manifest.json` supports frame/content separation and reinforces that new organization layers should be metadata/navigation, not content.

### E130 Round 2 · Contract-only

Status: complete, then corrected after user clarification.

Changed:

- Created `subjects/math/MATH_TAXONOMY_CONTRACT_E130.md`.
- Revised it from generic Pure/Applied taxonomy into an integrated Bauman-oriented program frame.

Commits:

- `f1fa9f24394a588c9c7e149c115a5b5ba0ea0cce`
- `fac7a3181904115b42e92eddfe13cdc30cc36704`
- `b1b61fb58d01f86b1c169c8e4c5b7b3ad21eace6`

Meaning:

- E130 is an integrated program frame, not a 21-lesson limit.
- The 21 lecture anchors aggregate existing chapters, lessons, theory records, formulas, exercises, simulations, applications, professor QA, question banks, review packs, and future bundles.
- Future sources should be `data/math_program_frame.json` and `data/math_program_map.json`.

### E130 Round 3 · Create draft program-frame sources

Status: complete.

Changed:

- Created `subjects/math/data/math_program_frame.json`.
- Created `subjects/math/data/math_program_map.json`.

Commits:

- `69b1bc6c6b69a89d2b1931d78e073f928ff8a220`
- `1ef63cee8eb311366de30cb2718e1c48eb0a12db`
- `04aa481b24e29e693757f804045d57771e352c7c`

Purpose:

- Add E130 source files without changing runtime UI.
- `math_program_frame.json` contains the full 2-block, A-G, 21-anchor program frame, Bauman focus, Lab Work requirements, and aggregation policy.
- `math_program_map.json` initially contained draft seed mappings for C01-C04.

### E130 Round 4 · Expand program map coverage

Status: complete.

Changed:

- Updated `subjects/math/data/math_program_map.json`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `ff7e5c3387680aa599ce8749d008d32209cab05d`
- `fd16c6520778abdcd8156c3f8c1004b4f596fe6d`

Purpose:

- Expand `math_program_map.json` from seed mapping to draft full active coverage for chapters 1-40.
- Keep every existing `chapterId` stable.
- Keep mapping by ID only, no large content copied into the map.
- Keep runtime untouched: no UI patch, no adapter registration, no `chapter_spine` modification.

Verification performed:

- Confirmed `math_program_map.json` declares `coverageStatus: active_chapters_1_40_mapped_draft`.
- Confirmed `chapterMappings` contains active chapter numbers 1-40.
- Confirmed verification block records `activeChapterCountMapped: 40` and `noChapterIdRenamed: true`.

### E130 Round 5 · Add source metadata bridge

Status: complete.

Changed:

- Created `subjects/math/assets/program_frame/program-frame-E130.js`.
- Updated `subjects/math/index.html` to load the E130 bridge after `subject-adapter.js` and before `theory-tab-E129.js`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `1a142f85c548a05b2fec3ebfc6009d2fccec3f42`
- `4388c71ffe68e3d6e5b71c5ec6df60be2876065e`
- `bdf2151b05bfd3f6b66fa7f466ce449bd89294ac`

Purpose:

- Expose `math_program_frame` and `math_program_map` as discoverable adapter data sources.
- Avoid rewriting the large `subject-adapter.js` and avoid touching `subject-manifest.json`.
- Keep E130 metadata-only: no renderer, no route toggle, no content import, no chapterId migration.

Verification performed:

- Confirmed `program-frame-E130.js` registers `math_program_frame` and `math_program_map` in adapter metadata.
- Confirmed `program-frame-E130.js` exposes `window.BAUMAN_MATH_E130_PROGRAM_FRAME.selfCheck()`.
- Confirmed `index.html` script order: `subject-adapter.js` -> `program-frame-E130.js` -> `theory-tab-E129.js` -> core/E126/E128.

### E130 Round 6 · Add program-frame UI route

Status: complete by repository inspection. Browser runtime still needs user-side Live Server confirmation.

Changed:

- Created `subjects/math/assets/program_frame/program-view-E130.js`.
- Created `subjects/math/assets/program_frame/program-frame-E130.css`.
- Updated `subjects/math/index.html` to load E130 CSS and program-view script.
- Updated this `CODEX_STATE.md` file.

Commits:

- `6a5c4d03db48a020c7251f7f89d6b1456637465d`
- `b6f99ccee18e3ba26298a7ef99474ca10781580d`
- `6f14ed252fb340c8bc67d83b4c15ec78954b7ab6`
- `32afffb3dd0f63e53c0d9857e4b15fc2bc227a25`

Purpose:

- Add a UI route behind toggle: `Lộ trình Bauman` / `Khung bài giảng Bauman`.
- Keep Bauman route as default.
- Render E130 program frame by reading `data/math_program_frame.json` and `data/math_program_map.json`.
- Show 21 lecture anchors, Bauman focus, Lab Work tasks, and mapped chapter pills.
- Preserve import target: Theory content still goes to `theory_lecture_content`.
- Avoid editing the large E129 renderer directly by adding an independent E130 UI bridge.

Verification performed:

- Confirmed `index.html` loads E130 CSS.
- Confirmed script order: `subject-adapter.js` -> `program-frame-E130.js` -> `theory-tab-E129.js` -> `program-view-E130.js` -> core/E126/E128.
- Confirmed `program-view-E130.js` fetches `data/math_program_frame.json` and `data/math_program_map.json`.
- Confirmed it exposes `window.BAUMAN_MATH_E130_PROGRAM_VIEW.selfCheck()`.

### E130 Round 7 · Verify/regression

Status: complete by repository inspection. Browser runtime still needs user-side Live Server confirmation.

Changed:

- Updated `subjects/math/assets/program_frame/program-view-E130.js`.
- Updated this `CODEX_STATE.md` file.

Commit:

- `d860060b824e4b7ee95aa2d91c8ae05a266faa46`

Purpose:

- Verify E130 program route, E129 Bauman route, E129 import target, and E126 compatibility suppression by static repository inspection.
- Fix one small regression risk: E130 chapter pills previously set only `chapterId`, while E129 route selection uses `e129ChapterId` and `e129Stage`.

Fix:

- E130 chapter buttons now store `data-e130-chapter` and `data-e130-stage`.
- Clicking a mapped chapter now sets `chapterId`, `e129ChapterId`, `stage`, and `e129Stage` before returning to the E129 Bauman route.
- E130 self-check now reports `e129SelectionSync: e129ChapterId/e129Stage`.

Verification performed:

- Confirmed `index.html` script order still loads E130 metadata bridge before E129 and E130 view after E129.
- Confirmed E130 view fetches `math_program_frame.json` and `math_program_map.json`.
- Confirmed E130 route toggle remains optional and default route remains Bauman.
- Confirmed E129 still validates Theory imports against `theory_lecture_content`, not `lessons`.
- Confirmed the E129 selection state names are `e129ChapterId` and `e129Stage`, and E130 now syncs them.

## Current runtime notes

- E129 owns the Theory shell and Theory storage route.
- E126 is suppressed when E129 ownership flag is active.
- E128 importer remains available outside E129 Theory storage but should not be used for new Theory content.
- E130 is source-visible and UI-route-visible, but browser runtime needs user-side Live Server verification.
- `subject-manifest.json` still contains older historical labels/counts. Do not rewrite it casually. Clean it only in a dedicated manifest cleanup round.

## Remaining E130 rounds

After Round 7, 3 rounds remain in the 10-round plan:

8. Add content-authoring/import guidance for program-linked lessons and Lab Work.
9. Add one real sample content bundle through `theory_lecture_content`, mapped to a program lecture anchor.
10. Final handoff and manifest cleanup decision.

## Recommended next round

E130 Round 8: Add content-authoring/import guidance for program-linked lessons and Lab Work.

Tasks:

- Add a guide/template explaining how a real Theory content record should reference a `programLectureId` while still importing into `theory_lecture_content`.
- Include Lab Work guidance for Python/NumPy/SciPy and C++.
- Do not import real content yet. Round 9 will create one sample bundle.

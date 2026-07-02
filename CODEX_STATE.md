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

Task status: E130 integrated Math Program Frame is complete as a 10-round overlay implementation.

Current target version:

`E130_MATH_PROGRAM_FRAME_INTEGRATED`

Final handoff:

- `subjects/math/E130_PROGRAM_FRAME_FINAL_HANDOFF.md`

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

Authoring guidance and sample content:

- `subjects/math/E130_PROGRAM_CONTENT_AUTHORING_GUIDE.md`
- `subjects/math/templates/theory_content/e130_program_linked_theory_template.json`
- `subjects/math/content_bundles/theory/e130_c01_vector_as_engineering_data_bundle.json`

Key source rule:

1. `data/theory_lecture_frame.json` = Theory frame/navigation shell.
2. `data/theory_lecture_content.json` = real Theory lecture records/slides.
3. `data/lessons.json` = legacy compatibility fallback only.
4. E130 program frame is an overlay: `block -> section -> program lecture anchor -> mapped existing chapters/lessons/content`.
5. The 21 anchors are organizing containers, not the full content limit.
6. Existing `stageId`, `disciplineId`, `chapterId`, and `lessonId` values must remain stable.

## E129 completed summary

E129 cleaned and unified the Math Theory tab.

Current E129 status:

- E129 owns the Theory shell and Theory storage route.
- E126 is suppressed when `window.BAUMAN_MATH_E129_OWNS_THEORY` is true.
- E128 remains legacy and should not be used for new Theory content.
- E129 imports Theory content into `theory_lecture_content`, not `lessons`.

Key E129 files:

- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`
- `subjects/math/THEORY_TAB_CONTRACT_E129.md`
- `subjects/math/THEORY_E129_FINAL_HANDOFF.md`

## Completed E130 rounds

### E130 Round 1 · Inspect-only taxonomy/program impact

Status: complete.

No runtime changes. No commit.

Findings:

- `discipline_spine.json` already contains `pureLayer` and `appliedLayer`, but they are not a top-level program frame.
- `chapter_spine.json` contains stable anchors: `chapterId`, `stageId`, `disciplineId`, `pureLayer`, `appliedLayer`, `timelineRole`, `contentImportMode`.
- `theory-tab-E129.js` rendered by `stage -> discipline -> chapter` before E130 route work.
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

### E130 Round 7 · Verify/regression

Status: complete by repository inspection. Browser runtime still needs user-side Live Server confirmation.

Changed:

- Updated `subjects/math/assets/program_frame/program-view-E130.js`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `d860060b824e4b7ee95aa2d91c8ae05a266faa46`
- `b72b15ad66c9a6e69a6a14daabc9373ddfc85e2a`

Purpose:

- Verify E130 program route, E129 Bauman route, E129 import target, and E126 compatibility suppression by static repository inspection.
- Fix one small regression risk: E130 chapter pills previously set only `chapterId`, while E129 route selection uses `e129ChapterId` and `e129Stage`.

Fix:

- E130 chapter buttons now store `data-e130-chapter` and `data-e130-stage`.
- Clicking a mapped chapter now sets `chapterId`, `e129ChapterId`, `stage`, and `e129Stage` before returning to the E129 Bauman route.
- E130 self-check now reports `e129SelectionSync: e129ChapterId/e129Stage`.

### E130 Round 8 · Content authoring/import guidance

Status: complete.

Changed:

- Created `subjects/math/E130_PROGRAM_CONTENT_AUTHORING_GUIDE.md`.
- Created `subjects/math/templates/theory_content/e130_program_linked_theory_template.json`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `2baf9ac906bc7d90737b00cec9e536ec3c4c0dc2`
- `521e1500f372878c3792a24c712df07c21aaf4b8`
- `d21b2835b3548bd4eccc9631791173f5b780d6f8`

Purpose:

- Document how future Theory lessons should reference E130 `programLectureId` while still importing through E129 into `theory_lecture_content`.
- Provide a reusable JSON template package with `target: theory_lecture_content`, `mode: merge`, E130 metadata, Lab Work, and 16 slide roles.
- Keep Round 8 guidance/template only: no production content import yet.

Verification performed:

- Confirmed the authoring guide states that Theory lesson content must still import into `theory_lecture_content`, not `lessons.json`.
- Confirmed the guide requires E129 fields `lessonId`, `chapterId`, `lessonTitle/title`, and `slides`.
- Confirmed the guide recommends E130 fields `programLectureId`, `programLectureIds`, `programAnchorTitle`, `roadmapRole`, `labWork`, and `sourceAnchors`.
- Confirmed the template package uses `target: theory_lecture_content`, `mode: merge`, a stable C01 `chapterId`, and `programLectureId: MATH-PROG-L02-vector-spaces-linear-maps`.

### E130 Round 9 · Real sample content bundle

Status: complete.

Changed:

- Created `subjects/math/content_bundles/theory/e130_c01_vector_as_engineering_data_bundle.json`.
- Updated this `CODEX_STATE.md` file.

Commits:

- `8652b5034ac8e27cea13233ea7bc7e3c7578a64d`
- `e427b2b451a1e9f4e963d3e467c3911030105a54`

Purpose:

- Add one production-like sample content bundle for Chapter 1 / `MATH-PROG-L02-vector-spaces-linear-maps`.
- Keep it as a review/import-testing bundle, not auto-imported durable content.
- Preserve target `theory_lecture_content` and mode `merge`.
- Do not overwrite `subjects/math/data/theory_lecture_content.json` without explicit approval.

Verification performed:

- Confirmed bundle header uses `target: theory_lecture_content`, `mode: merge`, and `bundleStatus: sample_for_review_not_auto_imported`.
- Confirmed record uses stable `chapterId: MATH-VN-C01-vector_trong_khong_gian_`.
- Confirmed record maps to `programLectureId: MATH-PROG-L02-vector-spaces-linear-maps` and related secondary program lecture IDs.
- Confirmed bundle contains Lab Work for Python/NumPy and C++.
- Confirmed bundle includes 16 slide roles ending with `takeaway`.

### E130 Round 10 · Final handoff and manifest cleanup decision

Status: complete.

Changed:

- Created `subjects/math/E130_PROGRAM_FRAME_FINAL_HANDOFF.md`.
- Updated this `CODEX_STATE.md` file.

Commit:

- `a408fc298223015b69f29db3d9b07bd17dd3d914`

Purpose:

- Lock final E130 source-of-truth, runtime, test, import, rollback, and next-production guidance.
- Confirm that E130 is complete as an overlay, not a replacement.
- Confirm manifest cleanup should not be part of E130 Round 10.
- Recommend future `E131 · Math manifest cleanup and version normalization` as a separate inspect/patch/verify cycle.

Verification performed:

- Confirmed final handoff lists E129 core runtime files, E130 sources/assets, authoring guide, sample bundle, and contract.
- Confirmed final handoff preserves Theory source-of-truth: `theory_lecture_content` for content, `theory_lecture_frame` for frame, `lessons` legacy only.
- Confirmed final handoff includes self-check commands, manual smoke checklist, rollback instructions, manifest cleanup decision, and next production path.

## Current runtime notes

- E130 10-round implementation is complete.
- E129 owns the Theory shell and Theory storage route.
- E126 is suppressed when E129 ownership flag is active.
- E128 importer remains available outside E129 Theory storage but should not be used for new Theory content.
- E130 is source-visible and UI-route-visible, but browser runtime still needs user-side Live Server verification.
- E130 sample bundle is not auto-imported into `data/theory_lecture_content.json`.
- `subject-manifest.json` still contains older historical labels/counts. Do not rewrite it casually. Clean it only in future E131 if needed.

## Recommended next work

1. User pulls origin and browser-tests E130.
2. If runtime bug appears, run a narrow bugfix round against E130 assets only.
3. If runtime is stable, review/import the C01 sample bundle via E129 Kho Lý thuyết.
4. Export approved overlay and commit to `data/theory_lecture_content.json` only after explicit approval.
5. Future E131 can clean `subject-manifest.json` separately.

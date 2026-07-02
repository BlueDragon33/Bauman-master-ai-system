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

Key commits:

- Contract: `f679f1b73ad6746bd0e718e7c9383f3976d84a6f`
- E129 bridge/shell/importer work: `266f0a4ff98441b88c3368c2a561e15b557cc748`, `d77a13367b7cf0865289416a08b0c8c0a1d90845`, `0fa6d8530314737c31b8e6c564be93918f1fa420`
- E126 override guard: `b744ff020da9032806e0d63817879a85fad2186d`
- Final handoff: `660d5b58f07a8f22af8354312dcf73779dc4752e`

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

Files inspected:

- `subjects/math/data/discipline_spine.json`
- `subjects/math/data/chapter_spine.json`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/data/content_vault_manifest.json`
- `subjects/math/assets/subject-adapter.js`

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
- Do not create `math_taxonomy_frame.json` / `math_taxonomy_map.json` unless a later compatibility reason requires them.

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

Commit:

- `ff7e5c3387680aa599ce8749d008d32209cab05d`

Purpose:

- Expand `math_program_map.json` from seed mapping to draft full active coverage for chapters 1-40.
- Keep every existing `chapterId` stable.
- Keep mapping by ID only, no large content copied into the map.
- Keep runtime untouched: no UI patch, no adapter registration, no `chapter_spine` modification.

Files inspected for Round 4:

- `subjects/math/data/chapter_spine.json`
- `subjects/math/data/math_program_map.json`

Verification performed:

- Confirmed `math_program_map.json` now declares `coverageStatus: active_chapters_1_40_mapped_draft`.
- Confirmed `chapterMappings` contains active chapter numbers 1-40.
- Confirmed verification block records `activeChapterCountMapped: 40` and `noChapterIdRenamed: true`.

## Current runtime notes

- `subjects/math/index.html` still loads E126 and E128 after E129 for compatibility.
- E129 owns the Theory shell and Theory storage route.
- E126 is suppressed when E129 ownership flag is active.
- E128 importer remains available outside E129 Theory storage but should not be used for new Theory content.
- E129 importer overlay is local/browser runtime storage, not a durable GitHub file write. Export JSON and commit to `data/theory_lecture_content.json` when content is approved.
- `subject-manifest.json` still contains older historical labels/counts. Do not rewrite it casually. Clean it only in a dedicated manifest cleanup round.
- E130 program frame is not yet runtime-active. It now has source files and full active chapter draft mapping, but no UI route yet.

## Remaining E130 rounds

After Round 4, 6 rounds remain in the 10-round plan:

5. Add adapter/source metadata if needed for JSON visibility, without rewriting the large manifest.
6. Add E130 program-frame view to E129 Theory UI behind a route toggle.
7. Verify program-frame view and Bauman route regression.
8. Add content-authoring/import guidance for program-linked lessons and Lab Work.
9. Add one real sample content bundle through `theory_lecture_content`, mapped to a program lecture anchor.
10. Final handoff and manifest cleanup decision.

## Recommended next round

E130 Round 5: Add source metadata bridge.

Tasks:

- Add lightweight source metadata for `math_program_frame` and `math_program_map` so runtime/dev tools can discover them.
- Prefer patching `subject-adapter.js` locally if needed.
- Do not rewrite the large `subject-manifest.json`.
- Do not patch UI yet unless necessary for source visibility only.
- Confirm E129 self-check remains valid.

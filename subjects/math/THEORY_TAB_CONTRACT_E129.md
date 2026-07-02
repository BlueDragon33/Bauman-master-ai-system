# MATH · E129 Theory Tab Contract

Purpose: define the single source of truth for rebuilding the Math subject Theory tab after the E112/E126/E128 mixed-version period.

This file is documentation only. It must not change runtime behavior by itself.

## 1. Current problem

The current runtime is mixed:

- `index.html` loads `theory-main-adapter-E126.js` and `datavault-importer-E128.js`.
- `theory-main-adapter-E126.js` renders the Theory tab from `DB.lessons`.
- The newer DataVault architecture defines `theory_lecture_frame.json` and `theory_lecture_content.json` as the split frame/content sources.
- `lessons.json` is legacy/compatibility, but old render/import code still treats it as primary.

Result: UI, importer, manifest, and content architecture disagree.

## 2. E129 source-of-truth rule

From E129 onward, the Theory tab must follow this priority:

1. Primary frame source: `subjects/math/data/theory_lecture_frame.json`
2. Primary content source: `subjects/math/data/theory_lecture_content.json`
3. Compatibility fallback only: `subjects/math/data/lessons.json`
4. Runtime overlay fallback only: IndexedDB/local overlay created by the importer

`lessons.json` must not be treated as the main source for new Theory content unless explicitly exporting or migrating old content.

## 3. Frame/content responsibilities

### `theory_lecture_frame.json`

Owns the academic tree and navigation shell:

- stageId
- stageTitle
- disciplineId
- disciplineTitle
- chapterId
- chapterTitle
- pureLayer
- appliedLayer
- bridgeQuestion
- targetOutcome
- suggestedLessonCount
- contentStatus

It must not contain long lecture content.

### `theory_lecture_content.json`

Owns actual lesson records:

- lessonId
- chapterId
- lessonTitle/title
- order/lessonNo when available
- slides
- tags/concepts when available
- source anchors when available

It must not redefine the global stage/discipline/chapter tree.

## 4. Theory tab render contract

The Theory tab must render in three states:

### State A: frame exists, no content yet

Show a clean chapter/lesson placeholder based on the frame:

- stage
- discipline
- chapter
- pure/applied layers
- bridge question
- target outcome
- clear message: `Chưa có nội dung bài giảng. Hãy nhập Dữ liệu môn học cho Lý thuyết.`

The page must not be blank.

### State B: frame + matching content exist

Show the full lesson reader:

- left navigation: stage -> discipline -> chapter -> lesson
- center: lecture reader
- right drawer: pure layer, applied layer, related formula/application/QA hooks
- presentation mode: content only, no storage/import clutter

### State C: legacy `lessons` exists but split content is empty

Show legacy lessons only as compatibility mode, with visible internal badge:

`Compatibility: lessons.json fallback`

New imports must still target `theory_lecture_content.json`.

## 5. DataVault route contract

The Theory tab storage action must open:

`Kho môn học -> Học tập -> Lý thuyết -> Khung môn học / Dữ liệu môn học`

Default target must be:

- frame view: `theory_lecture_frame`
- content view: `theory_lecture_content`

It must not default to `lessons` unless the user explicitly chooses legacy/export compatibility.

## 6. Import contract

The preferred import target is `theory_lecture_content`.

Required minimum fields for a content record:

- `lessonId`
- `chapterId`
- `lessonTitle` or `title`
- `slides`

Recommended slide roles for full lecture content:

1. problem_framing
2. deep_essence
3. counter_intuition
4. real_bridge
5. notation
6. core_formula
7. assumption_gate
8. mini_case
9. interpretation
10. simulation
11. common_mistakes
12. application
13. practice
14. professor_qa
15. bridge
16. takeaway

A partial draft may be accepted only when explicitly marked as draft and rendered as incomplete.

## 7. Active scope

Active content generation/import scope:

- Stage 0 to Stage 5
- Active chapters 1 to 40
- `vn`, `prep`, `hk1`, `hk2`, `hk3`, `hk4`

Framework-only scope:

- PhD extension chapters 41 to 56
- `phd_bridge`, `phd_y1`, `phd_y2`, `phd_thesis`

The Theory renderer may display PhD frame placeholders, but must not auto-generate active lecture content for chapters 41 to 56.

## 8. Cleanup rules

Do not delete old files only because their names look outdated.

Allowed cleanup sequence:

1. Mark the new E129 source as primary.
2. Route new UI/import actions to split frame/content.
3. Keep E126/E128 code only as compatibility while migration is not finished.
4. Remove or quarantine old code only after verify confirms no runtime dependency.

Forbidden changes:

- Do not hard-code the academic tree into UI.
- Do not merge frame and content back into one giant JSON.
- Do not make `lessons.json` primary again.
- Do not break storage, overview, planning bridge, mindmap, or other learning tabs.
- Do not scan or rewrite unrelated repo areas.

## 9. E129 implementation target

Target runtime files for future patch rounds:

- `subjects/math/index.html`
- `subjects/math/subject-manifest.json`
- `subjects/math/assets/subject-adapter.js`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`
- optionally replace with a new `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/datavault_importer/datavault-importer-E128.js`
- `subjects/math/data/content_vault_manifest.json`
- `subjects/math/data/content-manifest.json`

Preferred direction: create a new E129 Theory adapter and leave E126 as compatibility until E129 passes verification.

## 10. Verification gates

E129 Theory is not complete until all checks pass:

- Theory tab opens when content is empty.
- Theory tab shows frame placeholders from `theory_lecture_frame.json`.
- Theory tab shows content records from `theory_lecture_content.json` when present.
- Legacy `lessons` fallback is labeled and not treated as primary.
- Storage button opens the split Theory DataVault route, not `lessons` by default.
- Presentation mode hides storage/import clutter.
- Reload does not lose selected stage/chapter/lesson state.
- Other tabs still render.
- No old E106/E108/E112/E126/E128 user-facing label leaks into the final E129 Theory UI unless explicitly inside internal diagnostics.

## 11. Patch discipline for the remaining 8-round plan

Each future patch must be narrow:

- Inspect-only before patching.
- Patch-only with the smallest runtime surface.
- Verify-only after patching.
- Record files touched and why.
- Never rewrite large files without a local reason.

Recommended next round: E129 version cleanup and runtime route decision, not visual redesign yet.

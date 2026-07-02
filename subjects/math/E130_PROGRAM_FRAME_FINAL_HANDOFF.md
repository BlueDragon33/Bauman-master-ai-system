# E130 Program Frame Final Handoff

Status: final handoff for the 10-round E130 integrated Math Program Frame work.

Runtime target:

`E130_MATH_PROGRAM_FRAME_INTEGRATED`

This handoff locks what E130 changed, what remains source-of-truth, how to test, how to import sample content, how to rollback, and whether manifest cleanup should happen now.

## 1. Final decision

E130 is an overlay, not a replacement.

The existing Bauman route remains authoritative:

`stage -> discipline -> chapter -> lesson/content`

The E130 program route adds an alternative view:

`block -> section -> program lecture anchor -> mapped chapters/content`

The 21 lecture anchors are organizing containers. They are not a 21-lesson limit.

## 2. Primary runtime and source files

Core E129 Theory runtime remains:

- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`

E130 program frame sources:

- `subjects/math/data/math_program_frame.json`
- `subjects/math/data/math_program_map.json`

E130 program frame assets:

- `subjects/math/assets/program_frame/program-frame-E130.js`
- `subjects/math/assets/program_frame/program-view-E130.js`
- `subjects/math/assets/program_frame/program-frame-E130.css`

E130 authoring and sample content:

- `subjects/math/E130_PROGRAM_CONTENT_AUTHORING_GUIDE.md`
- `subjects/math/templates/theory_content/e130_program_linked_theory_template.json`
- `subjects/math/content_bundles/theory/e130_c01_vector_as_engineering_data_bundle.json`

E130 contract:

- `subjects/math/MATH_TAXONOMY_CONTRACT_E130.md`

Note: this filename keeps the early taxonomy label for continuity. The current content defines the integrated Bauman program frame, not a generic taxonomy.

## 3. Theory content source-of-truth

New Theory content must go to:

- `subjects/math/data/theory_lecture_content.json`

Frame/navigation source remains:

- `subjects/math/data/theory_lecture_frame.json`

Legacy fallback only:

- `subjects/math/data/lessons.json`

Do not make `lessons.json` primary again.

Do not store full lecture slides inside:

- `math_program_frame.json`
- `math_program_map.json`

Those files are navigation/mapping overlays only.

## 4. What E130 adds

E130 adds:

1. A Bauman-oriented 2-block program frame.
2. Sections A-G.
3. 21 lecture anchors.
4. Lab Work expectation for Python/NumPy/SciPy and C++.
5. A map from active chapters 1-40 to the program anchors.
6. A metadata bridge so the new sources are discoverable.
7. A UI route: `Lộ trình Bauman` / `Khung bài giảng Bauman`.
8. Authoring guide and template for program-linked Theory content.
9. One review/import-testing sample content bundle for C01.

## 5. Runtime behavior

Default route:

`Lộ trình Bauman`

Optional route:

`Khung bài giảng Bauman`

The optional E130 route renders:

- blocks;
- sections;
- 21 lecture anchors;
- Bauman focus;
- Lab Work tasks;
- mapped chapter pills.

Clicking a mapped chapter returns to the E129 Bauman route and syncs:

- `chapterId`
- `e129ChapterId`
- `stage`
- `e129Stage`

## 6. Import route

Import new Theory content through E129:

`Kho Lý thuyết -> Nhập JSON/Dán JSON -> target: theory_lecture_content`

Recommended package wrapper:

```json
{
  "packageType": "bauman.math.theory_lecture_content.e130_patch",
  "target": "theory_lecture_content",
  "mode": "merge",
  "records": []
}
```

Do not import E130 content into `lessons.json`.

## 7. Sample bundle

Review/import-testing sample:

`subjects/math/content_bundles/theory/e130_c01_vector_as_engineering_data_bundle.json`

It targets:

- chapter: `MATH-VN-C01-vector_trong_khong_gian_`
- program anchor: `MATH-PROG-L02-vector-spaces-linear-maps`
- import target: `theory_lecture_content`
- mode: `merge`

It is not auto-imported into durable content.

Only commit its content into `data/theory_lecture_content.json` after explicit approval/export/commit.

## 8. Self-check commands

After pulling and opening Live Server at `subjects/math/index.html`, use the browser console:

```js
BAUMAN_MATH_E130_PROGRAM_FRAME.selfCheck()
BAUMAN_MATH_E130_PROGRAM_VIEW.selfCheck()
BAUMAN_MATH_THEORY_E129.selfCheck()
BAUMAN_MATH_E126_SELF_CHECK()
```

Expected important fields:

```js
{
  ok: true,
  frameInDataFiles: true,
  mapInDataFiles: true,
  metadataOnly: true
}
```

```js
{
  ok: true,
  routeToggle: true,
  defaultRoute: "bauman",
  importTargetUnchanged: "theory_lecture_content",
  e129SelectionSync: "e129ChapterId/e129Stage"
}
```

E129 should still report:

```js
{
  importerTarget: "theory_lecture_content",
  legacyImporterSuppressedOnTheoryStorage: true,
  renderReplacement: true
}
```

E126 should still be compatibility-only/suppressed by E129.

## 9. Manual smoke checklist

1. Pull origin.
2. Open `subjects/math/index.html` with Live Server.
3. Open Lý thuyết.
4. Confirm Bauman route appears by default.
5. Click `Khung bài giảng E130`.
6. Confirm blocks, sections, lecture anchors, Lab Work, and chapter pills render.
7. Click a chapter pill, for example C01 or C19.
8. Confirm it returns to Bauman route and selects the matching chapter/stage.
9. Open `Kho Lý thuyết`.
10. Confirm import target still says `theory_lecture_content`.
11. Import the C01 sample bundle only if testing import behavior.
12. Export approved content and commit to `data/theory_lecture_content.json` only after explicit approval.

## 10. Rollback

If E130 UI causes runtime problems, remove these lines from `index.html`:

```html
<link rel="stylesheet" href="assets/program_frame/program-frame-E130.css?v=130">
<script src="assets/program_frame/program-frame-E130.js?v=130"></script>
<script src="assets/program_frame/program-view-E130.js?v=130"></script>
```

This disables E130 metadata/UI while leaving E129 Theory intact.

Do not delete E130 JSON sources unless a dedicated cleanup round confirms they are not needed.

## 11. Manifest cleanup decision

Do not rewrite `subjects/math/subject-manifest.json` in E130 Round 10.

Reason:

- The manifest contains older historical labels/counts from E106/E108/E112/E126/E128.
- It is large and mixed-version.
- E130 is already registered through a lightweight metadata bridge.
- Manifest cleanup should be a separate future round with its own inspect/patch/verify cycle.

Recommended future task:

`E131 · Math manifest cleanup and version normalization`

Scope of E131:

- inspect `subject-manifest.json`;
- remove or relabel stale E106/E108/E112/E126/E128 strings only when safe;
- add E130 metadata in manifest if needed;
- verify no loader/regression breaks.

## 12. Next production path

Recommended path after E130:

1. Pull and browser-test E130.
2. Review the C01 sample bundle quality.
3. Import C01 sample bundle through E129.
4. Export approved overlay from browser.
5. Commit approved records into `data/theory_lecture_content.json`.
6. Repeat per program anchor/chapter group.
7. Later create formula/exercise/simulation/application/professor QA bundles linked by `programLectureId`.
8. Run E131 manifest cleanup only after runtime stabilizes.

## 13. What not to do next

Do not:

- rewrite `subject-manifest.json` casually;
- rewrite `chapter_spine.json` to match E130 labels;
- rename existing `chapterId` values;
- make `lessons.json` primary;
- copy large lesson content into `math_program_frame.json` or `math_program_map.json`;
- add another UI layer before E130 is browser-tested.

End of E130 final handoff.

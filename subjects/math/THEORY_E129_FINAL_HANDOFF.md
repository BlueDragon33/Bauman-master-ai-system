# Math Theory E129 · Final Handoff

Status: final handoff for the 8-round cleanup of `subjects/math` → tab `Lý thuyết`.

Current runtime target:

`E129_THEORY_CONTENT_IMPORTER`

## 1. What E129 now owns

E129 is the active owner of the Math Theory tab.

Primary runtime files:

- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/THEORY_TAB_CONTRACT_E129.md`
- `subjects/math/THEORY_E129_FINAL_HANDOFF.md`

Compatibility runtime files still loaded:

- `subjects/math/assets/theory_skin/theory-main-adapter-E126.js`
- `subjects/math/assets/datavault_importer/datavault-importer-E128.js`

Compatibility rule:

- E126 must not override E129 when `window.BAUMAN_MATH_E129_OWNS_THEORY` is true.
- E128 remains a legacy lessons importer and must not be used for new Theory content.

## 2. Source-of-truth contract

The Theory tab follows this data contract:

1. Frame/navigation source: `subjects/math/data/theory_lecture_frame.json`
2. Content source: `subjects/math/data/theory_lecture_content.json`
3. Legacy fallback only: `subjects/math/data/lessons.json`

Never make `lessons.json` primary again for new Theory content.

## 3. Current user-facing behavior

The E129 Theory tab should be able to show:

- Stage tabs.
- Discipline groups.
- Chapter list.
- Chapter bridge question.
- Pure layer.
- Applied layer.
- Frame-only placeholder when no lesson content exists.
- Imported lesson content from `theory_lecture_content` overlay/content records.
- A dedicated `Kho Lý thuyết` route for importing/exporting Theory content.

When content is empty, the page must not be blank. It must show a frame-only placeholder.

## 4. Import route

Use the E129 Theory storage panel:

`Lý thuyết E129` → `Kho Lý thuyết`

Import target:

`theory_lecture_content`

Accepted package shape:

```json
{
  "packageType": "bauman.math.theory_lecture_content.patch",
  "target": "theory_lecture_content",
  "mode": "merge",
  "records": [
    {
      "lessonId": "MATH-VN-C01-vector_trong_khong_gian_-L01",
      "chapterId": "MATH-VN-C01-vector_trong_khong_gian_",
      "lessonTitle": "§1.1 · Example lesson",
      "title": "§1.1 · Example lesson",
      "slides": []
    }
  ]
}
```

Recommended slide roles:

1. `problem_framing`
2. `deep_essence`
3. `counter_intuition`
4. `real_bridge`
5. `notation`
6. `core_formula`
7. `assumption_gate`
8. `mini_case`
9. `interpretation`
10. `simulation`
11. `common_mistakes`
12. `application`
13. `practice`
14. `professor_qa`
15. `bridge`
16. `takeaway`

## 5. Browser test commands

After pulling the repo and opening with Live Server, run:

```js
BAUMAN_MATH_THEORY_E129.selfCheck()
```

Expected important fields:

```js
{
  importerTarget: "theory_lecture_content",
  legacyImporterSuppressedOnTheoryStorage: true,
  renderReplacement: true,
  primaryFrameSource: "theory_lecture_frame",
  primaryContentSource: "theory_lecture_content",
  legacySource: "lessons"
}
```

Then run:

```js
BAUMAN_MATH_E126_SELF_CHECK()
```

Expected important fields:

```js
{
  compatibility: true,
  suppressedBy: "E129"
}
```

## 6. Manual smoke-test checklist

1. Pull origin using GitHub Desktop.
2. Open `subjects/math/index.html` through Live Server.
3. Confirm the top label says `MATH · E129 Theory Importer` or updates to it after load.
4. Open `Lý thuyết E129`.
5. Confirm the left side shows stages/disciplines/chapters from `theory_lecture_frame`.
6. Confirm chapter 1 shows `Chương 1 · Vector trong không gian dữ liệu`.
7. Confirm an empty chapter shows `Frame-only · chờ nội dung` instead of a blank screen.
8. Open `Kho Lý thuyết`.
9. Confirm the panel says it imports `theory_lecture_content`.
10. Confirm no old E128 lessons importer panel appears inside E129 Theory storage.
11. Click `Form mẫu E129` and download the sample JSON.
12. Re-import that sample JSON.
13. Return to Theory.
14. Confirm the imported content is labeled `Dữ liệu môn học · theory_lecture_content`.
15. Test `Trình chiếu` and `Thoát trình chiếu`.
16. Test `Xóa overlay` and reload.

## 7. Known limitations

- E129 overlay currently uses browser localStorage for runtime import preview.
- Runtime overlay is not a durable GitHub write.
- Approved content must be exported and committed into `subjects/math/data/theory_lecture_content.json` later.
- Browser-level smoke testing still needs to be performed on the user machine through Live Server.
- `subject-manifest.json` still contains older historical labels/counts. Do not rewrite it casually because it is large and contains many compatibility notes. Clean it only in a dedicated manifest-cleanup round.

## 8. What not to do next

Do not:

- Import new Theory content into `lessons.json`.
- Delete E126/E128 just because they are old.
- Rewrite `subject-manifest.json` as a casual cleanup.
- Hard-code stage/chapter trees inside JS/CSS.
- Merge frame/content into one giant JSON.
- Touch other tabs unless a verified regression requires it.

## 9. Recommended next production path

After this 8-round cleanup, the next production path is content-focused:

1. Create real Chapter 1 Theory content bundle for `theory_lecture_content`.
2. Import it through E129.
3. Export and commit the approved content file.
4. Repeat for Formula, Exercise, Simulation, Application, Professor QA, and Test banks using their own frame/content contracts.
5. Only after stable content exists, perform a dedicated manifest cleanup round.

## 10. Minimal rollback note

If E129 causes a serious runtime issue:

- Temporarily remove the E129 JS/CSS lines from `subjects/math/index.html`.
- E126/E128 compatibility files remain available.
- Do not delete E129 files. Keep them for inspection and targeted fix.

Relevant index lines to revert if necessary:

```html
<link rel="stylesheet" href="assets/theory_skin/theory-tab-E129.css?v=129">
<script src="assets/theory_skin/theory-tab-E129.js?v=129"></script>
```

End of handoff.

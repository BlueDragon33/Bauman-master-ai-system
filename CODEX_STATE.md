# CODEX_STATE

Current task: E135 Header-only Theory Cleanup and loop fix.

Status: runtime loop fix applied. Browser-side check is required.

Read next:

- subjects/math/E135_HEADER_ONLY_CLEANUP.md
- subjects/math/E133_FINAL_HANDOFF.md

Core rules:

- Keep only the old compact Theory header/table in the learner view.
- Do not restore E134 learning-clean runtime.
- Do not restore E128 legacy importer runtime in index.html.
- Do not add another UI overlay for the normal Theory learner view.
- Theory content stays in subjects/math/data/theory_lecture_content.json.
- Do not use lessons.json for new Theory content.
- Do not rewrite subject-manifest.json casually.

Current runtime notes:

- E134 CSS/JS files were deleted.
- E134 handoff was deleted.
- subjects/math/index.html no longer loads E134.
- subjects/math/index.html no longer loads theory-reader-E132.css.
- subjects/math/index.html no longer loads datavault-importer-E128.css or datavault-importer-E128.js.
- E128 was removed from runtime because it injected a legacy E127 panel with MutationObserver while E129 storage suppressed that panel, causing an inject/remove loop.
- subjects/math/index.html loads theory-tab-E129.css?v=136.
- subjects/math/index.html loads program-view-E130.js?v=131, with E130 learner injection disabled.
- E129 CSS contains E135 header-only rules for the normal learner view, but storage/importer remains visible when body has e129-theory-storage.
- E132/E133 slideshow runtime is still loaded for Trình chiếu.

Expected visual/runtime result:

- Opening môn Toán should stop looping and become interactive.
- Normal Lý thuyết view keeps the old compact header/table only.
- Redundant cards/body panels below that header are hidden.
- Kho Lý thuyết opens E129 storage/importer and does not freeze.
- Khung bài giảng E130 no longer appears as a learner UI tab/button.
- Trình chiếu should still open presentation mode.

If user reports failure:

- Ask for screenshot after hard refresh.
- Ask for console errors.
- Check whether browser is still caching old index.html or E129 CSS older than v=136.
- Patch only the concrete issue shown by evidence.

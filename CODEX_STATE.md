# CODEX_STATE

Current task: E135 Header-only Theory Cleanup.

Status: E135 runtime cleanup is applied. Browser-side visual check is required.

Read next:

- subjects/math/E135_HEADER_ONLY_CLEANUP.md
- subjects/math/E133_FINAL_HANDOFF.md

Core rules:

- Keep only the old compact Theory header/table in the learner view.
- Do not restore E134 learning-clean runtime.
- Do not add another UI overlay for the normal Theory learner view.
- Theory content stays in subjects/math/data/theory_lecture_content.json.
- Do not use lessons.json for new Theory content.
- Do not rewrite subject-manifest.json casually.

Current runtime notes:

- E134 CSS/JS files were deleted.
- E134 handoff was deleted.
- subjects/math/index.html no longer loads E134.
- subjects/math/index.html no longer loads theory-reader-E132.css.
- subjects/math/index.html loads theory-tab-E129.css?v=135.
- E129 CSS contains E135 header-only rules for the normal learner view.
- E132/E133 slideshow runtime is still loaded for Trình chiếu.

Expected visual result:

- Normal Lý thuyết view keeps the old compact header/table only.
- Redundant cards/body panels below that header are hidden.
- E129 sidebar/tree inside Theory is hidden in the learner view.
- Trình chiếu should still open presentation mode.

If user reports failure:

- Ask for screenshot after hard refresh.
- Check whether browser is still caching E129 CSS older than v=135.
- Patch only the concrete issue shown by evidence.

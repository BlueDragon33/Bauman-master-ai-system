# CODEX_STATE

Current task: E136 Math Runtime Stabilization.

Status: runtime stabilization and boot minimization applied. User-side browser smoke test is required.

Read next:

- subjects/math/E136_RUNTIME_STABILIZATION.md
- subjects/math/E135_HEADER_ONLY_CLEANUP.md
- subjects/math/E133_FINAL_HANDOFF.md

Core rules:

- Keep only the old compact Theory header/table in the normal learner view.
- Do not restore E128 legacy importer runtime.
- Do not restore E134 learning-clean runtime.
- Do not restore E130 Program View learner injection.
- Do not restore E130 Program CSS into the learner boot path.
- Do not restore E132 reader polish into normal learner view.
- Do not add another UI overlay for the normal Theory learner view.
- Theory content stays in subjects/math/data/theory_lecture_content.json.
- Do not use lessons.json for new Theory content.
- Do not rewrite subject-manifest.json casually.

Current boot runtime in subjects/math/index.html:

Styles:

- core.css?v=123
- math.css?v=123
- theory-main-adapter-E126.css?v=126
- theory-tab-E129.css?v=136
- theory-ui-tokens-E132.css?v=136
- theory-slideshow-E132.css?v=136

Scripts:

- subject-adapter.js?v=123
- program-frame-E130.js?v=130
- theory-tab-E129.js?v=129
- theory-slideshow-E132.js?v=136
- core.js?v=123
- theory-main-adapter-E126.js?v=126

Removed from boot/runtime:

- datavault-importer-E128.css
- datavault-importer-E128.js
- theory-reader-E132.css
- learning-clean-E134.css
- learning-clean-E134.js
- planning-bridge.js
- program-view-E130.js
- program-frame-E130.css

Deleted from repo:

- subjects/math/assets/datavault_importer/datavault-importer-E128.js
- subjects/math/assets/datavault_importer/datavault-importer-E128.css
- subjects/math/assets/learning_clean/learning-clean-E134.css
- subjects/math/assets/learning_clean/learning-clean-E134.js
- subjects/math/E134_LEARNING_UI_CLEANUP_HANDOFF.md

Why E128 was removed:

- E128 injected a legacy E127 panel with MutationObserver.
- E129 storage suppressed that legacy panel.
- The inject/suppress loop made the Math module keep loading and become unresponsive.

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

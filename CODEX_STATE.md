# CODEX_STATE

Current task: E140 C01 Complete Content with flexible slide policy.

Status: user confirmed Math module no longer loops. E137 clean learner lock applied. E140 completed all six C01 theory lessons. Slide count is now flexible. Next pass must be verification-only.

Read next:

- subjects/math/E140_C01_COMPLETE_CONTENT.md
- subjects/math/E139_C01_THEORY_EXPANSION.md
- subjects/math/E138_THEORY_CONTENT_QUALITY.md
- subjects/math/E137_CLEAN_THEORY_LOCK.md
- subjects/math/E136_RUNTIME_STABILIZATION.md
- subjects/math/E135_HEADER_ONLY_CLEANUP.md
- subjects/math/E133_FINAL_HANDOFF.md

Core rules:

- Keep only the old compact Theory header/table in the normal learner view.
- Do not restore E128 legacy importer runtime.
- Do not restore E134 learning-clean runtime.
- Do not restore E130 Program View learner injection.
- Do not restore E130 Program CSS into the learner boot path.
- Do not restore E126 legacy theory adapter.
- Do not restore empty core.js.
- Do not restore E132 reader polish into normal learner view.
- Do not add another UI overlay for the normal Theory learner view.
- Theory content stays in subjects/math/data/theory_lecture_content.json.
- Do not use lessons.json for new Theory content.
- Do not rewrite subject-manifest.json casually.
- Content-only work must not change boot runtime.
- Do not enforce a fixed slide count per lesson or per chapter.

Current boot runtime in subjects/math/index.html:

Styles:

- core.css?v=123
- math.css?v=123
- theory-tab-E129.css?v=137
- theory-ui-tokens-E132.css?v=136
- theory-slideshow-E132.css?v=136

Scripts:

- subject-adapter.js?v=123
- program-frame-E130.js?v=130
- theory-tab-E129.js?v=129
- theory-slideshow-E132.js?v=136

Removed from boot/runtime:

- datavault-importer-E128.css
- datavault-importer-E128.js
- theory-reader-E132.css
- learning-clean-E134.css
- learning-clean-E134.js
- planning-bridge.js
- program-view-E130.js
- program-frame-E130.css
- core.js
- theory-main-adapter-E126.css
- theory-main-adapter-E126.js

Deleted from repo:

- subjects/math/assets/datavault_importer/datavault-importer-E128.js
- subjects/math/assets/datavault_importer/datavault-importer-E128.css
- subjects/math/assets/learning_clean/learning-clean-E134.css
- subjects/math/assets/learning_clean/learning-clean-E134.js
- subjects/math/E134_LEARNING_UI_CLEANUP_HANDOFF.md
- subjects/math/assets/core.js
- subjects/math/assets/theory_skin/theory-main-adapter-E126.js
- subjects/math/assets/theory_skin/theory-main-adapter-E126.css

Why E128 was removed:

- E128 injected a legacy E127 panel with MutationObserver.
- E129 storage suppressed that legacy panel.
- The inject/suppress loop made the Math module keep loading and become unresponsive.

Why E126 was removed:

- E126 was a legacy lessons.json visual adapter with its own MutationObserver.
- E129 now owns Theory.
- Keeping E126 in boot was unnecessary loop risk.

E137 clean learner lock:

- Normal learner view hides technical captions: subjectSubtitle, coreLabel, pageSub, saveState.
- E129 header-only view is lightly polished.
- Storage/importer view remains visible when body has e129-theory-storage.
- Presentation mode remains controlled by E132/E133 slideshow.

Flexible slide policy:

- Short focused lesson: about 8–10 slides.
- Standard lesson: about 10–14 slides.
- Deep foundational lesson: about 14–18 slides.
- Longer only if the topic truly requires it.
- Do not add filler slides just to hit a number.
- Do not remove necessary content just to fit a number.
- Slide roles are a teaching skeleton, not a mandatory checklist.

E140 content completion:

- subjects/math/data/theory_lecture_content.json now uses version E140_C01_FULL_SIX_LESSONS.
- C01 contains six lessons: §1.1 Vector như dữ liệu kỹ thuật; §1.2 Chuẩn vector và khoảng cách; §1.3 Tích vô hướng, góc và phép chiếu; §1.4 Cơ sở, span và tọa độ; §1.5 Không gian con và biểu diễn dữ liệu; §1.6 Từ vector sang ma trận dữ liệu.
- Next required pass: E141 verification-only, no new content unless a concrete JSON/content issue is found.
- E141 must validate parse, count 6 C01 records, check each lesson has a reasonable non-empty slide set, and check learner-facing quality without enforcing a fixed slide count.

Expected visual/runtime result:

- Opening môn Toán should stop looping and become interactive.
- Normal Lý thuyết view keeps the old compact header/table only.
- Redundant cards/body panels below that header are hidden.
- Kho Lý thuyết opens E129 storage/importer and does not freeze.
- Khung bài giảng E130 no longer appears as a learner UI tab/button.
- Trình chiếu should still open presentation mode and show all six C01 lessons.

If user reports failure:

- Ask for screenshot after hard refresh.
- Ask for console errors.
- Check whether browser is still caching old index.html or E129 CSS older than v=137.
- For content display errors, patch only subjects/math/data/theory_lecture_content.json or the concrete slide renderer issue.

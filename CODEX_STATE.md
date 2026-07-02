# CODEX_STATE

Current task: E133 Theory Slideshow Rebuild.

Status: repo-side E133 rebuild is complete with a conditional handoff. Browser-side proof is still required.

Read next:

- subjects/math/E133_FINAL_HANDOFF.md
- subjects/math/E133_BROWSER_REGRESSION_CHECKLIST.md
- subjects/math/E133_SLIDESHOW_REBUILD_PLAN.md

Core rules:

- Theory content stays in subjects/math/data/theory_lecture_content.json.
- Do not use lessons.json for new Theory content.
- Do not rewrite subject-manifest.json casually.
- Do not add another broad UI layer before browser evidence exists.

Current runtime notes:

- subjects/math/index.html loads theory-slideshow-E132.css?v=136.
- subjects/math/index.html loads theory-slideshow-E132.js?v=136.
- Current expected release in console: E133_ISOLATED_OVERLAY_DECK_COMPACT.
- Expected selfCheck fields: isolatedOverlay=true, keyboardCaptured=true, compactContent=true.
- C01 visible seed content exists for stage vn, chapter C01, lesson §1.1 · Vector như dữ liệu kỹ thuật.

If user reports failure:

- Ask for screenshot after clicking Trình chiếu.
- Ask for screenshot after pressing ArrowRight.
- Ask for console output of BAUMAN_MATH_THEORY_E132.selfCheck().
- Patch only the concrete issue shown by evidence.

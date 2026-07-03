# CODEX_STATE

Current task: E144 C02 Final Verification Lock.

Status: PASS. C01 remains locked after E141. C02 is now verified and locked after E144. Boot/runtime untouched.

Read next:

- subjects/math/E144_C02_FINAL_VERIFICATION_LOCK.md
- subjects/math/E143_C02_COMPLETE_CONTENT.md
- subjects/math/E142_C02_THEORY_START.md
- subjects/math/E141_C01_FINAL_VERIFICATION_LOCK.md
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
- Do not enforce one exact slide count per lesson or per chapter.
- Do enforce a quality floor: normal Math theory lessons should not be under 14 slides unless they are clearly secondary/review/micro lessons and the reason is documented.

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

E141 C01 verification result:

- PASS.
- C01 contains six lessons: §1.1 Vector như dữ liệu kỹ thuật; §1.2 Chuẩn vector và khoảng cách; §1.3 Tích vô hướng, góc và phép chiếu; §1.4 Cơ sở, span và tọa độ; §1.5 Không gian con và biểu diễn dữ liệu; §1.6 Từ vector sang ma trận dữ liệu.
- Current C01 lessons each have 16 slides, satisfying the 14-slide quality floor for normal Math theory lessons.
- Academic coverage checked: framing, concept, notation, formulas, conditions, interpretation, application, mistakes, practice, professor QA and bridge.
- No boot/runtime/UI file changed during E141.

E144 C02 verification result:

- PASS.
- subjects/math/data/theory_lecture_content.json uses version E143_C01_C02_COMPLETE.
- C02 contains six lessons:
  - §2.1 Ma trận như dữ liệu và phép biến đổi;
  - §2.2 Phép nhân ma trận và pipeline tuyến tính;
  - §2.3 Hạng ma trận, không gian cột và thông tin độc lập;
  - §2.4 Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm;
  - §2.5 Phép biến đổi tuyến tính trong hình học và dữ liệu;
  - §2.6 Từ ma trận sang PCA và mô hình tuyến tính.
- Each C02 lesson uses 16 slides, satisfying the 14-slide quality floor.
- Academic coverage checked: data/operator, matrix-vector multiplication, composition, shape/order rules, rank/column space, inverse/solve, condition number, geometry/data transforms, projection, basis change, PCA/SVD, linear model bridge, Python checks, practice and professor QA.
- No boot/runtime/UI file changed during E144.

Controlled flexible slide policy:

- Normal Math theory lesson: 14–18 slides.
- Deep foundational lesson: 16–22 slides when the topic requires depth.
- Below 14 slides only for clearly secondary/review/micro lessons, and the reason must be documented.
- Longer than 22 only if the topic truly requires it and should be split if it becomes hard to learn.
- Do not add filler slides just to hit a number.
- Do not remove necessary content just to fit a number.
- Slide roles are a teaching skeleton, not a mandatory checklist.
- Governing rule: enough, accurate, necessary.

Next recommended task:

- Browser smoke test after pull: C01 and C02 visible, slideshow opens.
- Then start C03 as content-only expansion.

If user reports failure:

- Ask for screenshot after hard refresh.
- Ask for console errors.
- Check whether browser is still caching old index.html or E129 CSS older than v=137.
- For content display errors, patch only subjects/math/data/theory_lecture_content.json or the concrete slide renderer issue.

# CODEX_STATE

Current task: E145 C03 staged merge completed.

Status: PASS. Staged C03 theory records were JSON-safe appended into the primary runtime content file on branch `main`. Boot/runtime/UI files were not changed.

Date: 2026-07-03

Files changed:

- `subjects/math/data/theory_lecture_content.json`
- `CODEX_STATE.md`
- `subjects/math/E145_MERGE_C03_STAGED.md`

Merge result:

- Source staged file: `subjects/math/data/theory_lecture_content_c03_e145_staged.json`
- Target file: `subjects/math/data/theory_lecture_content.json`
- Appended records: 3
- Skipped duplicates: 0
- Target `id`: `bauman_math_theory_lecture_content_e145_c03_started`
- Target `version`: `E145_C01_C02_COMPLETE_C03_L01_L03`

Verification:

- JSON parse: PASS
- C01 record count: 6
- C02 record count: 6
- C03 record count: 3
- C03 slide floor: PASS, all merged C03 lessons have 16 slides
- Duplicate `lessonId`: none
- Runtime files changed: none

Next recommended task:

- Continue C03 content authoring with lessons 3.4, 3.5, and 3.6 in a staged bundle before another JSON-safe merge.

---

Current task: E145 C03 Staged Content.

Status: C01 and C02 are locked. E145 staged the first three C03 theory lessons in a separate JSON bundle to avoid unsafe whole-file replacement of the locked primary content file. Boot/runtime untouched.

Read next:

- subjects/math/E145_C03_STAGED_CONTENT.md
- subjects/math/data/theory_lecture_content_c03_e145_staged.json
- subjects/math/E144_C02_FINAL_VERIFICATION_LOCK.md
- subjects/math/E143_C02_COMPLETE_CONTENT.md
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

Locked chapters:

- C01 · Vector trong không gian dữ liệu: PASS after E141, six lessons.
- C02 · Ma trận và phép biến đổi tuyến tính: PASS after E144, six lessons.

E145 staged C03 content:

- Created subjects/math/data/theory_lecture_content_c03_e145_staged.json.
- Contains three staged C03 lessons:
  - §3.1 Hàm số như mô hình đầu vào–đầu ra;
  - §3.2 Đạo hàm và độ nhạy của hệ thống;
  - §3.3 Gradient như hướng thay đổi nhanh nhất.
- Each staged lesson has 16 slides and satisfies the 14-slide quality floor.
- The staged file is not yet part of runtime unless merged into subjects/math/data/theory_lecture_content.json.

Required next step:

- Merge staged C03 records into subjects/math/data/theory_lecture_content.json with a JSON-safe append script.
- Do not manually rewrite locked C01/C02 records.
- After merge, verify JSON parse, C01=6, C02=6, C03=3, every new C03 lesson >=14 slides, no runtime changes.

Recommended local/Codex merge script:

```js
const fs = require('fs');
const mainPath = 'subjects/math/data/theory_lecture_content.json';
const stagedPath = 'subjects/math/data/theory_lecture_content_c03_e145_staged.json';
const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
const staged = JSON.parse(fs.readFileSync(stagedPath, 'utf8'));
const existing = new Set(main.records.map(r => r.lessonId));
for (const rec of staged.records) {
  if (!existing.has(rec.lessonId)) main.records.push(rec);
}
main.id = 'bauman_math_theory_lecture_content_e145_c03_started';
main.version = 'E145_C01_C02_COMPLETE_C03_L01_L03';
fs.writeFileSync(mainPath, JSON.stringify(main, null, 2) + '\n');
```

After safe merge, continue C03 with:

- §3.4 Gradient descent và learning rate;
- §3.5 Hàm mất mát, cực trị và điều kiện tối ưu;
- §3.6 Từ gradient sang backpropagation và tối ưu ML.

If user reports failure:

- Ask for screenshot after hard refresh.
- Ask for console errors.
- Check whether browser is still caching old index.html or E129 CSS older than v=137.
- For content display errors, patch only subjects/math/data/theory_lecture_content.json or the concrete slide renderer issue.

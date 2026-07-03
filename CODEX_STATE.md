# CODEX_STATE

Current task: E149 quality gate for C01 L01 content depth.

Status: BLOCKED

Branch: `codex/e149-c01-l01-content-depth`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/E149_QUALITY_GATE_REPORT.md`

What changed:
- Ran a content/runtime quality gate only; did not patch lesson content.
- Confirmed upgraded §1.1 content contains mojibake/encoding corruption with literal `?` replacements such as `V?n ??`, `k? thu?t`, and `hi?n t??ng`.
- Confirmed E129 reads `block.body`, `block.content`, and `block.text`.
- Confirmed E132 slideshow compresses blocks and sentences, so rich content can appear shortened in slideshow mode.

Verification:
- JSON parse: PASS
- Mojibake check for §1.1: FAIL, 62 suspicious blocks found
- E129 block text/body/content render support: PASS
- E132 compression behavior confirmed: PASS
- Runtime/UI/boot files changed: none

Next recommended task:
- ChatGPT must prepare clean UTF-8 replacement content for §1.1 first. Do not merge `codex/e149-c01-l01-content-depth` into `main` while mojibake exists.

Next actor:
- ChatGPT

Codex required:
- no for content drafting
- yes only for later replacement/verification
- Reason: ChatGPT must prepare clean UTF-8 replacement content first; Codex should later apply it locally and rerun JSON/target-lesson verification.

ChatGPT can do:
- Produce a clean UTF-8 §1.1 replacement bundle or prompt without editing runtime/UI files.

Codex prompt file:
- none

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Current task: E149 C01 L01 content depth upgrade.

Status: PASS

Branch: `codex/e149-c01-l01-content-depth`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Branch stack:
1. `main`
2. `codex/e146-merge-c03-l04-l06`
3. `codex/e149-c01-l01-content-depth`

Related stacked branch:
- `codex/e147-c04-staged-content` is based on E146 and must still be merged only after E146 reaches `main`.

Files changed:
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/E149_C01_L01_CONTENT_DEPTH_REPORT.md`
- `CODEX_STATE.md`

What changed:
- Upgraded only lesson `MATH-VN-C01-vector_trong_khong_gian_-L01-vector-as-engineering-data-e130` from outline-style slides to lecture-grade content.
- Kept 16 slides, preserved slide roles/titles, and expanded each slide to 4 supported-schema blocks using `text`, `formula`, `code`, and `qa`.

Verification:
- JSON parse: PASS
- Only target lesson changed: PASS
- Slide count remains >=14: PASS, 16 slides
- Minimum block count per slide: PASS, 4
- Minimum inspected slide word count: PASS, 185
- Duplicate `lessonId`: none
- Runtime/UI/boot files changed: none

Next recommended task:
- Upgrade C01 §1.2 content depth with the same content-only workflow, or perform branch sync after E146/E147/E149 order is explicitly chosen.

Next actor:
- Codex

Codex required:
- yes
- Reason: local JSON patch and verification scripts over the large runtime content file.

ChatGPT can do:
- Prepare staged content drafts, reports, and prompt files without editing runtime/UI files.

Codex prompt file:
- none created for this task

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Current task: E148 ChatGPT + Codex sync protocol established.

Status: PASS

Branch: `codex/e146-merge-c03-l04-l06`
Base branch: `main`
Main sync status: `needs_fast_forward`

Branch stack:
1. `main`
2. `codex/e146-merge-c03-l04-l06`
3. `codex/e147-c04-staged-content`

Safe merge order:
1. Merge/fast-forward `codex/e146-merge-c03-l04-l06` into `main`.
2. Then merge `codex/e147-c04-staged-content` into `main`.

Files changed:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`
- `CODEX_STATE.md`
- `subjects/math/E148_SYNC_PROTOCOL_REPORT.md`
- `subjects/math/E148_CODEX_BRANCH_SYNC_PROMPT.md`

What changed:
- Added a permanent repo-level ChatGPT + Codex sync protocol, a report, and a ready-to-copy Codex prompt for the next branch sync step.

Verification:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md` exists: PASS
- `CODEX_STATE.md` top block references `CODEX_CHATGPT_SYNC_PROTOCOL.md`: PASS
- `CODEX_STATE.md` includes branch, base branch, main sync status, next actor, and Codex required: PASS
- `main` is ancestor of current branch: PASS
- Current branch is not yet in `main`: PASS, fast-forward is still needed
- `codex/e146-merge-c03-l04-l06` is ancestor of `origin/codex/e147-c04-staged-content`: PASS
- Runtime/UI/boot files changed: none

Next recommended task:
- Use `subjects/math/E148_CODEX_BRANCH_SYNC_PROMPT.md` to fast-forward `main` with E146 first, then merge `codex/e147-c04-staged-content` into `main`.

Next actor:
- Codex

Codex required:
- yes
- Reason: branch merge/fast-forward with stacked branches and local verification.

ChatGPT can do:
- Read `CODEX_STATE.md` and `CODEX_CHATGPT_SYNC_PROTOCOL.md`, create staged content/report/prompt files, and prepare documentation-only handoffs.

Codex prompt file:
- `subjects/math/E148_CODEX_BRANCH_SYNC_PROMPT.md`

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Current task: E146 C03 L04-L06 staged merge completed.

Status: PASS. Staged C03 §3.4-§3.6 theory records were JSON-safe appended into the primary Math Theory runtime content file on branch `codex/e146-merge-c03-l04-l06`. Boot/runtime/UI files were not changed.

Date: 2026-07-03

Files changed:

- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/E146_MERGE_C03_L04_L06_STAGED.md`
- `CODEX_STATE.md`

Merge result:

- Source staged file: `subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json`
- Target file: `subjects/math/data/theory_lecture_content.json`
- Appended records: 3
- Skipped duplicates: 0
- Target `id`: `bauman_math_theory_lecture_content_e146_c03_complete`
- Target `version`: `E146_C01_C02_COMPLETE_C03_L01_L06`

Verification:

- JSON parse: PASS
- C01 record count: 6
- C02 record count: 6
- C03 record count: 6
- C03 slide floor: PASS, all C03 lessons have 16 slides
- Duplicate `lessonId`: none
- C01/C02 records unchanged: PASS
- C03 §3.1-§3.3 records unchanged: PASS
- Runtime/UI/boot files changed: none

Next recommended task:

- Continue with the next staged content batch after C03, keeping the same JSON-safe append workflow and preserving locked records.

---

Current task: E146 C03 staged content §3.4–§3.6 completed.

Status: PASS. Created a content-only staged bundle for the remaining three C03 theory lessons. Boot/runtime/UI files were not changed.

Date: 2026-07-03

Files changed:

- `subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json`
- `subjects/math/E146_C03_L04_L06_STAGED_CONTENT.md`
- `CODEX_STATE.md`

Staged result:

- Target file for next merge: `subjects/math/data/theory_lecture_content.json`
- Source staged file: `subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json`
- Staged records: 3
- Lessons staged:
  - §3.4 Gradient descent và learning rate
  - §3.5 Hàm mất mát, cực trị và điều kiện tối ưu
  - §3.6 Từ gradient sang backpropagation và tối ưu ML
- Staged `id`: `bauman_math_theory_lecture_content_c03_l04_l06_e146_staged`
- Staged `version`: `E146_C03_L04_L06_STAGED`

Verification:

- JSON parse: PASS
- Staged record count: 3
- Duplicate `lessonId` inside staged bundle: none
- C03 slide floor: PASS, every staged lesson has 16 slides
- Runtime files changed: none

Next recommended task:

- Merge E146 staged C03 §3.4–§3.6 records into `subjects/math/data/theory_lecture_content.json` with a JSON-safe append script.
- Do not manually rewrite locked C01/C02 records.
- Do not rewrite already merged C03 §3.1–§3.3 records.
- After merge, verify JSON parse, C01=6, C02=6, C03=6, every C03 lesson >=14 slides, no duplicate `lessonId`, no runtime changes.

Read next:

- `subjects/math/E146_C03_L04_L06_STAGED_CONTENT.md`
- `subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json`
- `subjects/math/E145_MERGE_C03_STAGED.md`
- `subjects/math/E145_C03_STAGED_CONTENT.md`
- `subjects/math/E144_C02_FINAL_VERIFICATION_LOCK.md`
- `subjects/math/E141_C01_FINAL_VERIFICATION_LOCK.md`
- `subjects/math/E138_THEORY_CONTENT_QUALITY.md`
- `subjects/math/E137_CLEAN_THEORY_LOCK.md`

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
- Theory content stays in `subjects/math/data/theory_lecture_content.json`.
- Do not use `lessons.json` for new Theory content.
- Do not rewrite `subject-manifest.json` casually.
- Content-only work must not change boot runtime.
- Do not enforce one exact slide count per lesson or per chapter.
- Do enforce a quality floor: normal Math theory lessons should not be under 14 slides unless they are clearly secondary/review/micro lessons and the reason is documented.

---

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
- The staged file was later merged into subjects/math/data/theory_lecture_content.json by E145 staged merge.

If user reports failure:

- Ask for screenshot after hard refresh.
- Ask for console errors.
- Check whether browser is still caching old index.html or E129 CSS older than v=137.
- For content display errors, patch only subjects/math/data/theory_lecture_content.json or the concrete slide renderer issue.

# CODEX_STATE

Current task: E147 C04 staged content §4.1–§4.3 completed.

Status: PASS. Created a content-only staged bundle for the first three C04 theory lessons on branch `codex/e147-c04-staged-content`. Boot/runtime/UI files were not changed.

Date: 2026-07-03

Branch note:

- This branch is based on `codex/e146-merge-c03-l04-l06`, not directly on `main`.
- E146 merge is PASS on that branch, but `main` still needs to receive/fast-forward that merge before E147 should be merged to `main`.
- Safe order: merge/fast-forward E146 first, then merge E147.

Files changed:

- `subjects/math/data/theory_lecture_content_c04_l01_l03_e147_staged.json`
- `subjects/math/E147_C04_L01_L03_STAGED_CONTENT.md`
- `CODEX_STATE.md`

Staged result:

- Target file for next merge: `subjects/math/data/theory_lecture_content.json`
- Source staged file: `subjects/math/data/theory_lecture_content_c04_l01_l03_e147_staged.json`
- Staged records: 3
- Lessons staged:
  - §4.1 Bất định, không gian mẫu và biến cố
  - §4.2 Biến ngẫu nhiên và phân phối xác suất
  - §4.3 Kỳ vọng, phương sai và độ lệch chuẩn
- C04 chapter id: `MATH-VN-C04-xac_suat_co_ban_va_bien_`
- Staged `id`: `bauman_math_theory_lecture_content_c04_l01_l03_e147_staged`
- Staged `version`: `E147_C04_L01_L03_STAGED`

Verification:

- JSON parse: PASS
- Staged record count: 3
- Duplicate `lessonId` inside staged bundle: none
- C04 slide floor: PASS, every staged lesson has 16 slides
- Runtime files changed: none

Next recommended task:

- Codex/local-script task required: merge E147 staged C04 §4.1–§4.3 records into `subjects/math/data/theory_lecture_content.json` with a JSON-safe append script.
- Do not manually rewrite locked C01/C02 records.
- Do not rewrite completed C03 records.
- After merge, verify JSON parse, C01=6, C02=6, C03=6, C04=3, every C04 lesson >=14 slides, no duplicate `lessonId`, no runtime changes.

Read next:

- `subjects/math/E147_C04_L01_L03_STAGED_CONTENT.md`
- `subjects/math/data/theory_lecture_content_c04_l01_l03_e147_staged.json`
- `subjects/math/E146_MERGE_C03_L04_L06_STAGED.md`
- `subjects/math/E146_C03_L04_L06_STAGED_CONTENT.md`
- `subjects/math/E145_MERGE_C03_STAGED.md`
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

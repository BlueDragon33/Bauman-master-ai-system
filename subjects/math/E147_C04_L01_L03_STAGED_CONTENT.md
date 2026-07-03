# E147 · C04 staged content §4.1–§4.3

Status: PASS. Content-only staged bundle created for the first three C04 theory lessons. Boot/runtime/UI files were not changed.

Date: 2026-07-03

Branch: `codex/e147-c04-staged-content`

## Important branch note

This branch is based on `codex/e146-merge-c03-l04-l06`, not directly on `main`, because E146 merge is complete on that branch but has not yet been fast-forwarded/merged into `main`.

Before merging E147 to `main`, ensure E146 merge is already present in `main` or merge the branch stack in order:

1. `codex/e146-merge-c03-l04-l06`
2. `codex/e147-c04-staged-content`

## Files created

- `subjects/math/data/theory_lecture_content_c04_l01_l03_e147_staged.json`
- `subjects/math/E147_C04_L01_L03_STAGED_CONTENT.md`
- `CODEX_STATE.md`

## Scope

Start C04 content authoring after C03 is complete.

C04 frame source:

- Chapter: `Chương 4 · Xác suất cơ bản và biến ngẫu nhiên`
- Chapter id: `MATH-VN-C04-xac_suat_co_ban_va_bien_`
- Discipline: `probability_statistics_inference`
- Suggested lesson count: 6

Created staged records:

1. `§4.1 · Bất định, không gian mẫu và biến cố`
2. `§4.2 · Biến ngẫu nhiên và phân phối xác suất`
3. `§4.3 · Kỳ vọng, phương sai và độ lệch chuẩn`

## Verification

- JSON parse: PASS
- Staged record count: 3
- Duplicate `lessonId` within staged bundle: none
- Slide quality floor: PASS, every staged lesson has 16 slides
- Target merge policy: append-only
- Runtime files changed: none

## Merge policy for next task

Target file:

- `subjects/math/data/theory_lecture_content.json`

Source staged file:

- `subjects/math/data/theory_lecture_content_c04_l01_l03_e147_staged.json`

Required merge behavior:

- JSON-safe append only.
- Do not manually rewrite locked C01/C02 records.
- Do not rewrite completed C03 records.
- Skip any staged record whose `lessonId` already exists in the target.
- Update target `id` and `version` only after append succeeds.

Recommended target metadata after merge:

```json
{
  "id": "bauman_math_theory_lecture_content_e147_c04_started",
  "version": "E147_C01_C02_C03_COMPLETE_C04_L01_L03"
}
```

## Required post-merge verification

After merge, verify:

- `subjects/math/data/theory_lecture_content.json` parses as JSON.
- C01 record count remains 6.
- C02 record count remains 6.
- C03 record count remains 6.
- C04 record count becomes 3.
- No duplicate `lessonId`.
- Every C04 staged/merged lesson has at least 14 slides.
- No boot/runtime/UI files changed.

## Codex-required point

The next merge step should be performed by Codex or a local script, not by manual GitHub API replacement, because `theory_lecture_content.json` is large and must be append-merged with verification.

## Locked rules carried forward

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

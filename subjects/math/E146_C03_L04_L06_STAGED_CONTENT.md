# E146 · C03 staged content §3.4–§3.6

Status: PASS. Content-only staged bundle created for the remaining three C03 theory lessons. Boot/runtime/UI files were not changed.

Date: 2026-07-03

## Files created

- `subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json`
- `subjects/math/E146_C03_L04_L06_STAGED_CONTENT.md`
- `CODEX_STATE.md`

## Scope

Continue C03 content authoring after E145 merged §3.1–§3.3 into the primary runtime content file.

Created staged records:

1. `§3.4 · Gradient descent và learning rate`
2. `§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu`
3. `§3.6 · Từ gradient sang backpropagation và tối ưu ML`

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

- `subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json`

Required merge behavior:

- JSON-safe append only.
- Do not manually rewrite locked C01/C02 records.
- Do not rewrite already merged C03 §3.1–§3.3 records.
- Skip any staged record whose `lessonId` already exists in the target.
- Update target `id` and `version` only after append succeeds.

Recommended target metadata after merge:

```json
{
  "id": "bauman_math_theory_lecture_content_e146_c03_complete",
  "version": "E146_C01_C02_COMPLETE_C03_L01_L06"
}
```

## Recommended merge script

```js
const fs = require('fs');

const mainPath = 'subjects/math/data/theory_lecture_content.json';
const stagedPath = 'subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json';

const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
const staged = JSON.parse(fs.readFileSync(stagedPath, 'utf8'));

const existing = new Set(main.records.map(r => r.lessonId));
let appended = 0;
let skipped = 0;

for (const rec of staged.records) {
  if (existing.has(rec.lessonId)) {
    skipped++;
    continue;
  }
  main.records.push(rec);
  existing.add(rec.lessonId);
  appended++;
}

main.id = 'bauman_math_theory_lecture_content_e146_c03_complete';
main.version = 'E146_C01_C02_COMPLETE_C03_L01_L06';

fs.writeFileSync(mainPath, JSON.stringify(main, null, 2) + '\n');

console.log({ appended, skipped, total: main.records.length });
```

## Required post-merge verification

After merge, verify:

- `subjects/math/data/theory_lecture_content.json` parses as JSON.
- C01 record count remains 6.
- C02 record count remains 6.
- C03 record count becomes 6.
- No duplicate `lessonId`.
- Every C03 lesson has at least 14 slides.
- No boot/runtime/UI files changed.

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

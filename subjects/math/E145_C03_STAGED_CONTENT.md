# E145 · C03 Staged Content

Status: staged, not merged into the primary runtime content file yet.

## Why staged

`subjects/math/data/theory_lecture_content.json` is now large and locked for C01/C02. The current GitHub contents tool replaces whole files rather than applying a JSON-path append patch.

To avoid damaging locked C01/C02 records, E145 creates a staged C03 content bundle first.

## Created

- `subjects/math/data/theory_lecture_content_c03_e145_staged.json`

## Contains

C03 · Giải tích, đạo hàm và gradient starts with three learner-facing theory lessons:

1. `§3.1 · Hàm số như mô hình đầu vào–đầu ra`
2. `§3.2 · Đạo hàm và độ nhạy của hệ thống`
3. `§3.3 · Gradient như hướng thay đổi nhanh nhất`

Each lesson has 16 slides and satisfies the 14-slide quality floor for normal Math theory lessons.

## Merge policy

The staged file must be merged into:

- `subjects/math/data/theory_lecture_content.json`

by appending `records` only.

Do not modify existing C01/C02 records.
Do not rewrite locked chapters by hand.
Do not touch boot/runtime.

## Recommended merge command for local/Codex

Use a JSON-safe append script, not manual copy-paste:

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

Then verify:

- JSON parses;
- C01 has 6 records;
- C02 has 6 records;
- C03 has 3 records;
- every new C03 lesson has at least 14 slides;
- no runtime file changed.

## Next after merge

Continue with:

4. `§3.4 · Gradient descent và learning rate`
5. `§3.5 · Hàm mất mát, cực trị và điều kiện tối ưu`
6. `§3.6 · Từ gradient sang backpropagation và tối ưu ML`

End of E145 staged content.

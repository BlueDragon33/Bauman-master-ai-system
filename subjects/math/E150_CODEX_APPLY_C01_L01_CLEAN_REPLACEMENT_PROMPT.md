# E150 · Codex apply clean C01 L01 replacement prompt

Use this prompt in Codex to apply the clean UTF-8 §1.1 replacement prepared by ChatGPT.

```text
Continue from CODEX_STATE.md on branch codex/e150-c01-l01-clean-replacement.

Task: E150 apply clean UTF-8 replacement for C01 §1.1.

Token-saving mode:
- Do not scan the repo.
- Do not generate lecture content yourself.
- Do not inspect unrelated lessons.
- Do not rewrite the whole JSON manually.
- Use a small local script to replace exactly one record by lessonId.

Read only:
- CODEX_STATE.md
- subjects/math/data/theory_lecture_content.json
- subjects/math/data/theory_lecture_content_c01_l01_e150_clean_replacement.json

Target lessonId:
- MATH-VN-C01-vector_trong_khong_gian_-L01-vector-as-engineering-data-e130

Patch:
- In subjects/math/data/theory_lecture_content.json, replace only the record with the target lessonId using the single record from:
  subjects/math/data/theory_lecture_content_c01_l01_e150_clean_replacement.json
- Do not touch any other records.
- Do not edit UI/runtime/boot files.
- Do not edit subject-manifest.json.
- Do not edit lessons.json.

Important quality checks:
- Verify the replacement uses UTF-8 Vietnamese correctly.
- Verify no mojibake patterns remain in the target lesson, especially: V?n, k?, hi?n, t??ng, thu?t, d? li?u.
- Verify the replacement uses supported block keys, especially body/content/text. The prepared file uses body.

Recommended local script outline:

const fs = require('fs');
const mainPath = 'subjects/math/data/theory_lecture_content.json';
const replPath = 'subjects/math/data/theory_lecture_content_c01_l01_e150_clean_replacement.json';
const targetId = 'MATH-VN-C01-vector_trong_khong_gian_-L01-vector-as-engineering-data-e130';

const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
const replPkg = JSON.parse(fs.readFileSync(replPath, 'utf8'));
const repl = replPkg.records.find(r => r.lessonId === targetId);
if (!repl) throw new Error('Replacement record not found');

const idx = main.records.findIndex(r => r.lessonId === targetId);
if (idx < 0) throw new Error('Target record not found in main content');

main.records[idx] = repl;
fs.writeFileSync(mainPath, JSON.stringify(main, null, 2) + '\n');

Verification:
- JSON parse PASS.
- Exactly one lesson record changed.
- Target lesson has 16 slides.
- Every target slide has at least 3 blocks.
- No mojibake suspicious pattern in target lesson.
- No duplicate lessonId.
- C01 count remains 6.
- C02 count remains 6.
- C03 count remains 6 on this branch.
- Runtime/UI/boot files unchanged.

Report:
- Create subjects/math/E150_C01_L01_CLEAN_REPLACEMENT_REPORT.md
- Update CODEX_STATE.md top block with:
  - PASS/FAIL
  - branch
  - base branch
  - main sync status
  - files changed
  - exact verification result
  - next recommended task
  - next actor
  - Codex required yes/no
```

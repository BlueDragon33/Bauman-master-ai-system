# E146 · Codex merge prompt

Use this prompt in Codex when merging the E146 staged C03 lessons into the primary Math Theory runtime content file.

```text
Continue from CODEX_STATE.md on branch codex/e146-merge-c03-l04-l06.

Task: E146 merge staged C03 §3.4–§3.6 into the primary Math Theory runtime content file.

Repository rules:
- Optimize tokens strictly.
- Do not scan the whole repo.
- Inspect only the files listed below unless verification proves a concrete issue.
- Do not rewrite large files manually when a local JSON append script is safer.
- Do not touch unrelated UI/runtime/boot files.

Inspect only:
- CODEX_STATE.md
- subjects/math/E146_C03_L04_L06_STAGED_CONTENT.md
- subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json
- subjects/math/data/theory_lecture_content.json

Patch target:
- subjects/math/data/theory_lecture_content.json
- subjects/math/E146_MERGE_C03_L04_L06_STAGED.md
- CODEX_STATE.md

Do not edit:
- subjects/math/index.html
- subject-manifest.json
- lessons.json
- any CSS file
- any JS runtime file
- C01/C02 records except preserving them exactly
- already merged C03 §3.1–§3.3 records except preserving them exactly

Merge behavior:
- JSON-safe append only.
- Source staged file: subjects/math/data/theory_lecture_content_c03_l04_l06_e146_staged.json
- Target file: subjects/math/data/theory_lecture_content.json
- Append staged records whose lessonId does not already exist.
- Skip existing lessonId duplicates if any.
- After successful append, update target metadata:
  id = bauman_math_theory_lecture_content_e146_c03_complete
  version = E146_C01_C02_COMPLETE_C03_L01_L06

Recommended local merge script:

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

Post-merge verification:
- JSON parse PASS for subjects/math/data/theory_lecture_content.json.
- C01 record count remains 6.
- C02 record count remains 6.
- C03 record count becomes 6.
- No duplicate lessonId.
- Every C03 lesson has at least 14 slides.
- Runtime/UI/boot files unchanged.

Report:
- Create subjects/math/E146_MERGE_C03_L04_L06_STAGED.md with PASS/FAIL, files changed, appended/skipped counts, verification results, and next recommended task.
- Update CODEX_STATE.md at the top with the same PASS/FAIL summary.
```

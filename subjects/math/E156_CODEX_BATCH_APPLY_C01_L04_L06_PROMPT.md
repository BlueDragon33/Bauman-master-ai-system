# E156 · Codex batch apply C01 L04-L06 clean replacements

Use this prompt in Codex when token is available.

```text
Continue from CODEX_STATE.md on branch codex/e150-c01-l01-clean-replacement.

Task: E156 batch apply clean UTF-8 replacements for C01 §1.4-§1.6.

Token-saving mode:
- Do not scan the repo.
- Do not generate lecture content.
- Do not inspect unrelated lessons.
- Do not rewrite the whole JSON manually.
- Use a small local script to replace exactly three records by lessonId.

Read only:
- CODEX_STATE.md
- subjects/math/data/theory_lecture_content.json
- subjects/math/data/theory_lecture_content_c01_l04_e153_clean_replacement.json
- subjects/math/data/theory_lecture_content_c01_l05_e154_clean_replacement.json
- subjects/math/data/theory_lecture_content_c01_l06_e155_clean_replacement.json

Target lessonIds:
- MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140
- MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140
- MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140

Patch:
- In subjects/math/data/theory_lecture_content.json, replace exactly the three target records using the corresponding single record from each replacement package.
- Do not touch any other records.
- Do not edit UI/runtime/boot files.
- Do not edit subject-manifest.json.
- Do not edit lessons.json.

Recommended local script outline:

const fs = require('fs');
const mainPath = 'subjects/math/data/theory_lecture_content.json';
const packages = [
  ['subjects/math/data/theory_lecture_content_c01_l04_e153_clean_replacement.json', 'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140'],
  ['subjects/math/data/theory_lecture_content_c01_l05_e154_clean_replacement.json', 'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140'],
  ['subjects/math/data/theory_lecture_content_c01_l06_e155_clean_replacement.json', 'MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140']
];
const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
let changed = 0;
for (const [pkgPath, targetId] of packages) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const repl = pkg.records.find(r => r.lessonId === targetId);
  if (!repl) throw new Error('Replacement not found: ' + targetId);
  const idx = main.records.findIndex(r => r.lessonId === targetId);
  if (idx < 0) throw new Error('Target not found in main content: ' + targetId);
  main.records[idx] = repl;
  changed++;
}
if (changed !== 3) throw new Error('Expected 3 replacements, got ' + changed);
fs.writeFileSync(mainPath, JSON.stringify(main, null, 2) + '\n');

Verification:
- JSON parse PASS.
- Exactly three lesson records changed.
- Each target lesson has 16 slides.
- Every target slide has at least 3 blocks.
- No mojibake suspicious pattern in target lessons, especially: V?n, k?, hi?n, t??ng, thu?t, d? li?u.
- No duplicate lessonId.
- C01 record count remains 6.
- C02 record count remains 6.
- C03 record count remains 6 on this branch.
- Runtime/UI/boot files unchanged.

Report:
- Create subjects/math/E156_C01_L04_L06_BATCH_APPLY_REPORT.md
- Update CODEX_STATE.md top block with PASS/FAIL, files changed, exact verification result, next recommended task, next actor, and Codex required yes/no.

If PASS:
- Mark C01 content-depth runtime complete for §1.1-§1.6 on this branch.
- Next recommended task: visual review E129 reader/slideshow, then decide whether to patch E132 compression or continue C02 content depth.
```

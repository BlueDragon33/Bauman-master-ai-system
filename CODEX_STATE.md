# CODEX_STATE

Current task: E156 batch apply clean UTF-8 replacements for C01 §1.4-§1.6.

Status: PASS

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Files changed:
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/E156_C01_L04_L06_BATCH_APPLY_REPORT.md`
- `CODEX_STATE.md`

What changed:
- Applied the prepared clean UTF-8 replacement packages for C01 §1.4, §1.5, and §1.6.
- Replaced exactly three records by lessonId:
  - `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`
  - `MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`
  - `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`
- Did not generate content and did not edit UI/runtime/boot files.

Verification:
- JSON parse: PASS
- Exactly three lesson records changed: PASS
- Each target lesson has 16 slides: PASS
- Every target slide has at least 3 blocks: PASS, min 4
- Mojibake check: PASS, no suspicious patterns in target lessons
- Duplicate `lessonId`: none
- C01 record count: 6
- C02 record count: 6
- C03 record count: 6
- Runtime/UI/boot files changed: none

Completion status:
- C01 content-depth runtime is complete for §1.1-§1.6 on this branch.

Next recommended task:
- Visual review E129 reader/slideshow for C01 §1.1-§1.6, then perform academic QA before using this style as a template for other chapters.

Next actor:
- User

Codex required:
- no
- Reason: E156 batch replacement and verification are complete; Codex is only needed for visual/runtime test or the next local JSON replacement/verification.

ChatGPT can do:
- Prepare clean UTF-8 replacement packages for later lessons after academic QA confirms the C01 style.

Codex prompt file:
- `subjects/math/E156_CODEX_BATCH_APPLY_C01_L04_L06_PROMPT.md`

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Current task: E156 batch-apply prompt for C01 §1.4-§1.6 prepared.

Status: PASS

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Files changed:
- `subjects/math/E156_CODEX_BATCH_APPLY_C01_L04_L06_PROMPT.md`
- `CODEX_STATE.md`

Current C01 status:
- Runtime patched and verified: §1.1 E150, §1.2 E151, §1.3 E152.
- Package-only waiting for safe apply: §1.4 E153, §1.5 E154, §1.6 E155.
- Batch apply prompt ready: `subjects/math/E156_CODEX_BATCH_APPLY_C01_L04_L06_PROMPT.md`.

Next recommended task:
- Run the E156 prompt with Codex/local script when available.
- It must replace exactly three records by `lessonId` and verify JSON parse, no mojibake, no duplicate `lessonId`, C01=6, C02=6, C03=6, and runtime/UI/boot unchanged.

Next actor:
- Codex when available.

Codex required:
- yes for permanent JSON replacement/verification of E153-E155.

ChatGPT can do:
- Prepare more package-only content, or wait for E156 result.

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Previous task: E155 clean UTF-8 replacement package for C01 §1.6 prepared by ChatGPT only.

Status: PASS

Files changed:
- `subjects/math/data/theory_lecture_content_c01_l06_e155_clean_replacement.json`
- `subjects/math/E155_C01_L06_CHATGPT_ONLY_PACKAGE_REPORT.md`
- `CODEX_STATE.md`

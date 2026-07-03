# CODEX_STATE

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

# CODEX_STATE

Current task: E150 clean UTF-8 replacement bundle for C01 §1.1 prepared.

Status: PASS

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Branch stack:
1. `main`
2. `codex/e146-merge-c03-l04-l06`
3. `codex/e150-c01-l01-clean-replacement`

Related branches:
- `codex/e149-c01-l01-content-depth` is BLOCKED and must not be merged because it contains mojibake in §1.1.
- `codex/e147-c04-staged-content` is also based on E146 and should be merged only after E146 reaches `main`.

Files changed:
- `subjects/math/data/theory_lecture_content_c01_l01_e150_clean_replacement.json`
- `subjects/math/E150_CODEX_APPLY_C01_L01_CLEAN_REPLACEMENT_PROMPT.md`
- `CODEX_STATE.md`

What changed:
- ChatGPT prepared a clean UTF-8 replacement package for only lesson `MATH-VN-C01-vector_trong_khong_gian_-L01-vector-as-engineering-data-e130`.
- The replacement package uses supported schema fields and uses `body` for block content.
- The runtime content file `subjects/math/data/theory_lecture_content.json` was not patched by ChatGPT.

Verification:
- Replacement package created: PASS
- Target lessonId included: PASS
- Slide count in replacement package: 16
- Runtime/UI/boot files changed: none
- Main content file changed by ChatGPT: no

Next recommended task:
- Codex/local-script task: apply the clean replacement package to `subjects/math/data/theory_lecture_content.json` by replacing exactly one record by `lessonId`, then verify JSON, one-record diff, no mojibake, no duplicate `lessonId`, C01=6, C02=6, C03=6, runtime/UI/boot unchanged.

Next actor:
- Codex

Codex required:
- yes
- Reason: local JSON replacement and verification over the large runtime content file.

ChatGPT can do:
- Prepare additional clean replacement packages for later lessons after E150 is verified.

Codex prompt file:
- `subjects/math/E150_CODEX_APPLY_C01_L01_CLEAN_REPLACEMENT_PROMPT.md`

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

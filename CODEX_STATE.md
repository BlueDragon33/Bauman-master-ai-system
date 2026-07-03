# CODEX_STATE

Current task: E165C package availability check.

Status: BLOCKED_E165C_CONTENT_PACKAGE_MISSING

Branch: `main`
Base branch: `main`

Scope:
- Checked only the current ledger and targeted `subjects/math` paths/keywords.
- Focus: E129 Reader, E132 Slideshow, C01 content-flow safety.

User goal:
- Prepare for a compact-only E132/C01 task without breaking schema, Reader full content, formulas, or long-block rendering.

Result:
- No `E165C` prompt/package or `E165C_CONTENT_PACKAGE` file was found under `subjects/math`.
- No academic content was generated.
- No UI/runtime/content patch was applied.

Files changed:
- `CODEX_STATE.md`
- `subjects/math/E165C_CONTENT_PACKAGE_MISSING_REPORT.md`

Files not touched:
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- Other subjects

Verification:
- `git status --short`: working tree was clean before this report.
- Targeted search for `*E165C*`: no files.
- Targeted search for `*E165*`: no files.
- Targeted `rg` inside `subjects/math`: only existing E160-E164 Full lecture references found.

Decision:
- STOPPED as required by the user rule: if E165C content package is missing, inspect/report only and do not invent content.

Next required input:
- Provide or commit the E165C content package/prompt file under `subjects/math`.

Next actor:
- User / ChatGPT content package provider

---

Current task: E164 C01 content-flow layout audit PASS on main.

Status: C01_FLOW_LAYOUT_PASS_IN_MAIN

Branch: `main`
Base branch: `main`
Main sync status: `in_main`

Main sync / pull instruction:
- Verified E164 result is in `main`.
- User should pull directly from `main` after push:
  - `git checkout main`
  - `git pull origin main`

Files changed:
- `CODEX_STATE.md`
- `subjects/math/E164_C01_FLOW_LAYOUT_PATCH_PASS_REPORT.md`

Browser evidence:
- E129 reader C01 audit: PASS
- C01 lessons checked in reader: 6/6
- Reader slides per lesson: 16
- Reader minimum block gap: 8px
- E132 slideshow C01 audit: PASS
- C01 slides checked in slideshow: 96
- Slideshow minimum card gap: 13px
- Compact/Full toggle: PASS
- Console errors: 0

Verification:
- `node --check subjects/math/assets/theory_skin/theory-tab-E129.js`: PASS
- `node --check subjects/math/assets/theory_skin/theory-slideshow-E132.js`: PASS
- JSON parse: PASS
- C01 record count: 6
- C02 record count: 6
- C03 record count: 6
- No duplicate lessonId: PASS
- No mojibake: PASS
- Runtime/UI/content files changed: no

Decision:
- No CSS/runtime/content patch was applied because the reported C01 layout issue was not reproducible on current `main` after pulling `origin/main`.
- The passing browser audit is recorded in `subjects/math/E164_C01_FLOW_LAYOUT_PATCH_PASS_REPORT.md`.

Next recommended task:
- User pulls `main` and retests locally.

Next actor:
- User

---

Current task: E163 UI runtime PASS and synced to main.

Status: RUNTIME_SMOKE_PASS_C01_BASELINE_READY_IN_MAIN

Branch: `main`
Base branch: `main`
Main sync status: `in_main`

Main sync / pull instruction:
- Verified E163 result is now in `main`.
- User should pull directly from `main`:
  - `git checkout main`
  - `git pull origin main`

Files changed:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`
- `CODEX_STATE.md`
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/data/theory_lecture_content_c01_l01_e150_clean_replacement.json`
- `subjects/math/data/theory_lecture_content_c01_l02_e151_clean_replacement.json`
- `subjects/math/data/theory_lecture_content_c01_l03_e152_clean_replacement.json`
- `subjects/math/data/theory_lecture_content_c01_l04_e153_clean_replacement.json`
- `subjects/math/data/theory_lecture_content_c01_l05_e154_clean_replacement.json`
- `subjects/math/data/theory_lecture_content_c01_l06_e155_clean_replacement.json`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/E146_CODEX_MERGE_PROMPT.md`
- `subjects/math/E146_MERGE_C03_L04_L06_STAGED.md`
- `subjects/math/E148_CODEX_BRANCH_SYNC_PROMPT.md`
- `subjects/math/E148_SYNC_PROTOCOL_REPORT.md`
- `subjects/math/E150_C01_L01_CLEAN_REPLACEMENT_REPORT.md`
- `subjects/math/E150_CODEX_APPLY_C01_L01_CLEAN_REPLACEMENT_PROMPT.md`
- `subjects/math/E151_C01_L02_CLEAN_REPLACEMENT_REPORT.md`
- `subjects/math/E151_CODEX_APPLY_C01_L02_CLEAN_REPLACEMENT_PROMPT.md`
- `subjects/math/E152_C01_L03_CLEAN_REPLACEMENT_REPORT.md`
- `subjects/math/E152_CODEX_APPLY_C01_L03_CLEAN_REPLACEMENT_PROMPT.md`
- `subjects/math/E153_C01_L04_CHATGPT_ONLY_PACKAGE_REPORT.md`
- `subjects/math/E154_C01_L05_CHATGPT_ONLY_PACKAGE_REPORT.md`
- `subjects/math/E155_C01_L06_CHATGPT_ONLY_PACKAGE_REPORT.md`
- `subjects/math/E156_C01_L04_L06_BATCH_APPLY_REPORT.md`
- `subjects/math/E156_CODEX_BATCH_APPLY_C01_L04_L06_PROMPT.md`
- `subjects/math/E157R_C01_QA_CRITERIA_CORRECTION.md`
- `subjects/math/E157_C01_ACADEMIC_QA_REPORT.md`
- `subjects/math/E158_C01_SEMANTIC_QA_REPORT.md`
- `subjects/math/E159_C01_VISUAL_RENDER_QA_REPORT.md`
- `subjects/math/E160_E132_FULL_LECTURE_MODE_PATCH_REPORT.md`
- `subjects/math/E161_E132_STATIC_SMOKE_AND_BROWSER_CHECKLIST.md`
- `subjects/math/E162_RUNTIME_SMOKE_FAIL_REPORT.md`
- `subjects/math/E163_UI_RUNTIME_PATCH_AND_SMOKE_PASS_REPORT.md`

Verification:
- Browser smoke: PASS
- C01 lesson chips visible: 6/6
- Tested lessons: `§1.1`, `§1.4`, `§1.5`, `§1.6`
- E132 overlay header: `E160 THEORY DECK`
- Full lecture default: PASS
- 4 blocks / 4 cards in Full mode: PASS
- No ellipsis clamp in Full mode: PASS
- Compact/Full toggle: PASS
- Keyboard Right/Left/Space/F/C/Esc: PASS
- Esc exits to E129 reader: PASS
- Console errors: 0
- JSON parse: PASS
- C01 record count: 6
- C02 record count: 6
- C03 record count: 6
- No duplicate lessonId: PASS
- No mojibake in C01: PASS
- E132 release marker present: `E160_ISOLATED_OVERLAY_DECK_FULL_LECTURE`
- Main sync: PASS

Next recommended task:
- User pulls `main` and retests locally once.
- Then continue C02 content-depth or open a separate UI polish task.

Next actor:
- User

Codex required:
- no
- Reason: verified E163 result has been merged into `main`; Codex is only needed for the next task.

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Current task: E163 UI-only runtime patch after E162 failure.

Status: RUNTIME_SMOKE_PASS_READY_FOR_MAIN_SYNC

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `pending_controlled_sync`

Main sync / pull instruction:
- Do not pull `main` until controlled sync is completed.
- E163 browser smoke now passes on `codex/e150-c01-l01-clean-replacement`.
- Next step is merge/sync verified result into `main`, then push `main`.

Files changed:
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/E163_UI_RUNTIME_PATCH_AND_SMOKE_PASS_REPORT.md`
- `CODEX_STATE.md`

Root cause:
- E129 learner CSS hid `.e129-placeholder`, which contains the C01 lesson chips and `.e129-slide-list`.
- E132 MutationObserver re-opened the deck after render and reset Compact mode to Full.

Verification:
- E129/E132 JS syntax: PASS
- Browser opened Math page: PASS
- Console errors: 0
- C01 lesson chips visible: 6/6
- Tested lessons: `§1.1`, `§1.4`, `§1.5`, `§1.6`
- Each tested lesson opens E160 overlay: PASS
- Full lecture default: PASS
- 4 blocks / 4 cards in Full mode: PASS
- No ellipsis clamp in Full mode: PASS
- Compact/Full toggle: PASS
- Keyboard Right/Left/Space/F/C/Esc: PASS
- Esc returns to E129 reader: PASS
- Content JSON edited: no
- Main sync: pending

Next recommended task:
- Controlled merge into `main`, verify JSON counts/runtime markers, push `main`.
- Final pull target should be `main` only after sync.

Next actor:
- Codex

Codex required:
- yes
- Reason: controlled main sync and push are required so the user can pull directly from `main`.

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Current task: E162 runtime browser smoke test.

Status: FAIL

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Main sync / pull instruction:
- Do not pull `main` for this result.
- Main was not synced because E162 browser/runtime smoke failed.
- Pull `codex/e150-c01-l01-clean-replacement` only for diagnosis:
  - `git checkout codex/e150-c01-l01-clean-replacement`
  - `git pull origin codex/e150-c01-l01-clean-replacement`

Files changed:
- `subjects/math/E162_RUNTIME_SMOKE_FAIL_REPORT.md`
- `CODEX_STATE.md`

Verification:
- Local branch synced with origin before test: PASS
- Required E160/E161 files exist: PASS
- Browser opened Math page: PASS
- Console boot errors: 0
- E132 current-lesson overlay opens: PASS
- E132 overlay header shows `E160 THEORY DECK`: PASS
- Full lecture default for current lesson: PASS
- Current slide shows 4 cards / 4 blocks: PASS
- Browser global release/selfCheck probe: FAIL/UNAVAILABLE (`window.BAUMAN_MATH_THEORY_E132` read as `undefined` through automation)
- Required C01 lesson selection for `§1.4`, `§1.5`, `§1.6`: FAIL, lesson chips exist but are hidden/clipped at `0x0`
- Browser smoke overall: FAIL
- Main sync: NOT RUN

Root cause / exact failure:
- E129 lesson selection UI exists in the DOM but is not usable in the visible reader layout.
- `.e129-sidebar` is `display:none`.
- `.e129-reader` is clipped to about `94px` height with `overflow:hidden`.
- `.e129-placeholder`, `.e129-slide-list`, and `.e129-chip-btn` lesson controls are hidden or `0x0`.
- This blocks multi-lesson E162 smoke and prevents marking C01 baseline ready.

Next recommended task:
- E163 UI-only patch based on `subjects/math/E162_RUNTIME_SMOKE_FAIL_REPORT.md`.
- Do not edit content JSON.
- Restore visible lesson selection and then re-run browser smoke.

Next actor:
- Codex

Codex required:
- yes
- Reason: UI/runtime patch and browser smoke verification are required before any safe main sync.

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Current task: E161 E132 static smoke completed; browser runtime still pending.

Status: STATIC_SMOKE_PASS_BROWSER_RUNTIME_PENDING

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Main sync / pull instruction:
- Current work is on `codex/e150-c01-l01-clean-replacement`.
- Do not tell the user to pull `main` until verified work is merged or fast-forwarded into `main`.
- User preference: after future PASS tasks, Codex should sync verified results into `main` when safe, then report `Main sync status: in_main`.

Files changed:
- `subjects/math/E161_E132_STATIC_SMOKE_AND_BROWSER_CHECKLIST.md`
- `CODEX_STATE.md`

Verification:
- Static smoke: PASS.
- Browser/runtime visual smoke: PENDING.

Next recommended task:
- Run browser smoke test using `subjects/math/E161_E132_STATIC_SMOKE_AND_BROWSER_CHECKLIST.md`.
- If browser smoke passes, prepare controlled main sync.
- If browser smoke fails, patch only E132 UI files again.

Next actor:
- Codex/local browser or user visual test.

Codex required:
- yes for browser/runtime smoke test and controlled main sync after PASS.

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

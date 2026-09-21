# CODEX_STATE

Current task: E165 C02 §2.1 content factory + E166 local code-block structural repair.

Status: LOCAL_CONTENT_QA_PASS_GLOBAL_BROWSER_BASELINE_PENDING

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

LESSON:
- C02 §2.1 · Ma trận như dữ liệu và phép biến đổi

Execution:
- C1 Learning Contract: PASS
- C2 Deep Core Content: PASS
- C3 Visual + Example Architecture: PASS
- C4 Practice + Computational Tool: PASS
- C5 Misconception + Assessment: PASS
- C6 Software Tester: PASS (static)
- C6 User Tester: PASS
- Numerical/code verification: PASS
- BLOCKER: 0
- MAJOR: 0

Local defect found and repaired:
- E166 fixed code blocks being flattened into paragraph/formula semantics across E129 → E132.
- E129 now preserves `code` with a preformatted block.
- E132 keeps `code` distinct from `formula` in Full and Compact modes.
- JS syntax checks PASS.
- Cache keys bumped to v166.

Files changed:
- `subjects/math/data/theory_lecture_content.json`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Academic strengthening:
- measurable LO contract
- data-matrix vs linear-operator distinction
- row-dot-product + column-combination interpretations
- linearity/affine failure gate
- E1 simple / E2 contextual / E3 transfer
- P0→P3 practice ladder
- D0/D1/D2 assessment
- misconception diagnostics
- beginner NumPy entry with explicit verification
- JIT Russian overlay
- provenance to BMSTU IU-5 curriculum, MIT OCW and NumPy docs

Deferred:
- E164 browser/runtime selector + E132 visual baseline remains required before global display acceptance.
- C02 frame still contains stale `contentStatus: empty_waiting_for_theory_lecture_content` even though content records exist; defer to a local frame-status reconciliation pass, do not broaden current lesson scope.

Main sync:
- NOT RUN. Do not pull main for this checkpoint.

Next:
- C02 §2.2 · Phép nhân ma trận và pipeline tuyến tính
- Execute exactly C1→C6 for that lesson.
- Keep E164 runtime baseline deferred unless browser capability becomes available.

---

Current task: E164 runtime selector probe hardening.

Status: STATIC_PROBE_PASS_BROWSER_EXECUTION_REQUIRED

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Main sync / pull instruction:
- Do not pull `main` for this result.
- E164 adds only local runtime observability for the unresolved E162/E163 browser gate.
- No learning-content JSON was changed.

Files changed:
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/index.html`
- `subjects/math/E164_RUNTIME_SELECTOR_PROBE.md`
- `CODEX_STATE.md`

Verification:
- E163 CSS cascade repair still present: PASS.
- Existing lesson click/rerender flow unchanged: PASS.
- Runtime probe distinguishes DOM presence from non-zero visible layout: PASS by inspection.
- E129 JS cache key bumped to v164: PASS.
- Content JSON untouched: PASS.
- Browser execution of probe + E132 smoke: REQUIRED.
- Main sync: NOT RUN.

Next recommended task:
- Browser-open C01, run `BAUMAN_MATH_THEORY_E129.selfCheck()`.
- Require `lessonSelectorRuntimeReady:true`, then smoke §1.1/§1.4/§1.5/§1.6.
- Only after browser PASS mark C01 display baseline ready and resume the content-production pipeline.

Next actor:
- Browser/runtime tester.

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Current task: E163 visible lesson selector UI repair.

Status: STATIC_PATCH_PASS_BROWSER_RETEST_REQUIRED

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Main sync / pull instruction:
- Do not pull `main` for this result.
- E163 is a local UI-only repair on the stacked content branch.
- No learning-content JSON was changed.

Files changed:
- `subjects/math/assets/theory_skin/theory-tab-E129.css`
- `subjects/math/index.html`
- `subjects/math/E163_VISIBLE_LESSON_SELECTOR_PATCH.md`
- `CODEX_STATE.md`

Verification:
- E162 root cause identified: PASS.
- Normal learner-view lesson selector restored statically: PASS.
- Raw slide list remains hidden in normal learner view: PASS.
- Existing `data-e129-lesson` state/rerender handler preserved: PASS.
- E129 stylesheet cache key bumped to v163: PASS.
- Content JSON untouched: PASS.
- Browser/runtime E162 re-smoke: REQUIRED.
- Main sync: NOT RUN.

Next recommended task:
- Re-run E162 browser smoke against E163 patch.
- If runtime PASS, mark the C01 display baseline ready and then resume the content-production pipeline.

Next actor:
- Browser/runtime tester.

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

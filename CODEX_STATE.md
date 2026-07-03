# CODEX_STATE

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

# CODEX_STATE

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

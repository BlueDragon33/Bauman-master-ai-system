# CODEX_STATE

Current task: E161 E132 static smoke completed; browser runtime still pending.

Status: STATIC_SMOKE_PASS_BROWSER_RUNTIME_PENDING

Branch: `codex/e150-c01-l01-clean-replacement`
Base branch: `codex/e146-merge-c03-l04-l06`
Main sync status: `stacked_branch`

Files changed:
- `subjects/math/E161_E132_STATIC_SMOKE_AND_BROWSER_CHECKLIST.md`
- `CODEX_STATE.md`

Scope lock:
- Verification/report-only task.
- Content JSON was not edited.
- UI JS/CSS was not patched during E161.

Static smoke verdict:
- E132 release is `E160_ISOLATED_OVERLAY_DECK_FULL_LECTURE`.
- Default mode is `full`.
- `openDeck()` resets mode to full.
- Full render path uses `s.fullBlocks`.
- Compact/truncation helpers remain only for optional compact mode.
- Self-check exposes full lecture fields.
- CSS supports full lecture stacked cards and scrollable grid area.

Important limitation:
- This is not a browser/runtime visual PASS.
- Browser smoke test is still required to confirm actual DOM, readability, scrolling, keyboard navigation and console status.

Next recommended task:
- Run browser smoke test using `subjects/math/E161_E132_STATIC_SMOKE_AND_BROWSER_CHECKLIST.md`.
- If browser smoke passes, mark C01 baseline ready.
- If it fails, patch only E132 UI files again.

Next actor:
- Codex/local browser or user visual test.

Codex required:
- recommended for browser/runtime smoke test.

Protocol reference:
- `CODEX_CHATGPT_SYNC_PROTOCOL.md`

---

Previous task: E160 E132 full lecture mode UI-only patch applied.

Status: PATCH_APPLIED_CODE_INSPECTION_PASS_RUNTIME_SMOKE_PENDING

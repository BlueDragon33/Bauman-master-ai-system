# CODEX_STATE

Current task: E235_REFERENCE_PANEL_THEORY_GUARD

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-formula-fraction-align-E235.js`
- `CODEX_STATE.md`
- `HANDOFF_E328C.md`

Approved baseline:
- E235 remains the approved visual and interaction standard for `Xem đầy đủ`.
- E236, E237, and E238 remain disabled from runtime.
- Runtime order remains E211 -> E224 -> E234 -> E235 -> E212.

Root cause fixed:
- E211 can select a slide `code` block as `Tham khảo thêm`.
- E211 normalizes block text with whitespace collapse and renders the extension as `<p>`.
- A Python function therefore appeared as one long paragraph with lost indentation.

E235 R2 patch:
- Release: `E235_READER_PRO_FORMULA_STANDARD_R2`.
- Keeps all approved fraction and notation behavior.
- Adds a reference-panel guard inside the already-loaded E235 file, so no new runtime layer is required.
- Detects code-like content using Python/code signatures such as `def`, `return`, `raise`, `np.`, exceptions, and assignments.
- Replaces leaked code in `.e211-extension-panel` with a concise advanced-theory note selected from the active formula family.
- `Tham khảo thêm` remains theory-only.
- Python remains in the `Xem đầy đủ` code panel, where `<pre>` preserves line breaks and indentation.
- Existing semantic notation rule remains:
  - raw `_i` -> `<sub>i</sub>`
  - legitimate `^i`, `x^2`, `A^{-1}`, and `A^k` remain superscripts

Commits:
- E235 R2: `df10a7610d9e3f9c7b04338922c46d248b159f59`
- Removed unused standalone guard: `1639b98136bca6832882e87965ec4e02dd5dd2b5`
- E328C handoff: `411fe72440b28d2bbaf4b1ab6470aec70642befb`

Cache note:
- `index.html` still references `theory-formula-fraction-align-E235.js?v=236` because the cache-query write was blocked.
- Use hard refresh or disable browser cache after pulling.

Required local smoke:
1. `git pull origin main`
2. Hard refresh or disable cache.
3. Reopen the slide shown in the screenshot.
4. Confirm `Tham khảo thêm` contains advanced theory, not Python.
5. Open `Xem đầy đủ` and confirm Python still preserves line breaks and indentation.
6. Confirm fractions, radicals, `X_i`, `x_j^T`, `A^{-1}`, and `x^2` remain correct.
7. Confirm no new console errors.

Next task:
- `E328C_E235_STANDARD_EXPANSION`
- Persistent new-session prompt: `HANDOFF_E328C.md`
- E328C must replicate the approved E235 behavior across C01-C03 without creating a new layout system or re-enabling E236/E237/E238.

Status is not PASS because browser smoke was not run from this chat environment.

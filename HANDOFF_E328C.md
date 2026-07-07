# HANDOFF E328C

Use this as the first message in the next working session.

---

Continue the Bauman Math project in repository `BlueDragon33/Bauman-master-ai-system`, branch `main`.

Task ID: `E328C_E235_STANDARD_EXPANSION`
Mode: inspect-only -> patch-only -> verify-only.

## Approved baseline
- `E235` is the approved visual and interaction standard for `Xem đầy đủ`.
- Preserve the exact E235 popup structure, spacing, visual hierarchy, fraction alignment, radical rendering, and Python-code panel.
- Do not redesign the popup.
- Do not load or restore E236, E237, or E238.
- E202 remains the only slideshow engine.
- Current runtime order must remain:
  1. E211
  2. E224
  3. E234
  4. E235
  5. E212

## Current state
Read `CODEX_STATE.md` first.
The latest E235 patch also enforces:
- `_i` -> subscript, such as `X_i`, `x_j`, `a_{mn}`
- `^i` remains superscript when the source really uses `^`
- `Tham khảo thêm` must contain advanced theory only
- Python/code must not leak into `Tham khảo thêm`
- Python code belongs only in the `Xem đầy đủ` code panel and must preserve line breaks and indentation

## E328C goal
Replicate the approved E235 behavior consistently across all C01-C03 formula slides without creating a new layout system.

Audit and patch only real inconsistencies in:
- stacked fractions
- radicals with nested expressions
- subscripts versus superscripts
- matrix indices such as `a_ij`, `X_i`, `x_j^T`
- powers such as `x^2`, `A^{-1}`, `A^k`
- summation indices
- code blocks and indentation
- `Tham khảo thêm` theory-only rule

## Token rules
- Do not scan the whole repo.
- Read only:
  1. `CODEX_STATE.md`
  2. `subjects/math/index.html`
  3. `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
  4. `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
  5. `subjects/math/assets/theory_skin/theory-formula-typeset-E234.js`
  6. `subjects/math/assets/theory_skin/theory-formula-fraction-align-E235.js`
  7. only the exact theory JSON records needed for reproduced failures
- Do not rewrite large files if a local patch is enough.
- Do not create another popup/layout bridge.
- Do not re-enable E236/E237/E238.
- One narrow root cause per patch.

## Required inspect evidence
For every reproduced issue record:
- lesson title
- slide number
- raw formula source
- rendered DOM fragment
- expected notation
- actual notation
- exact file/function causing the mismatch

## Verify
Run real browser smoke on representative formulas from C01-C03:
- fraction
- nested radical
- `X_i`
- `x_j^T`
- `a_ij`
- `A^{-1}`
- `x^2`
- summation index
- Python snippet with indentation
- `Tham khảo thêm` containing theory, not code

Do not claim `PASS_BROWSER_SMOKE` unless the browser test was actually run.
Otherwise use `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`.

## Output
Update `CODEX_STATE.md` with:
- root cause per patch
- files read
- files changed
- formulas tested
- browser smoke result
- remaining risks

---

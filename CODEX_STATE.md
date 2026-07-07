# CODEX_STATE

Current task: RESTORE_E235_READER_PRO_STANDARD

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-formula-fraction-align-E235.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Decision:
- E235 is now the approved visual and interaction baseline for `Xem đầy đủ`.
- E236, E237, and E238 remain in the repository for reference but are no longer loaded by `subjects/math/index.html`.
- No later bridge may alter the Reader Pro popup unless it reproduces the E235 baseline first and is explicitly approved.

Runtime load order restored:
1. E211 Reader Pro content
2. E224 formula content/parser bridge
3. E234 balanced fraction/radical typesetter
4. E235 Reader Pro formula standard
5. E212 fit bridge

Disabled from runtime:
- `theory-formula-mini-lesson-E236.js`
- `theory-formula-academic-E237.js`
- `theory-formula-coverage-audit-E238.js`

E235 standard now includes:
- balanced vertical fraction alignment
- symmetric numerator/denominator spacing
- nested fraction scale control
- explicit subscript typography below the baseline
- explicit superscript typography above the baseline
- semantic index guard:
  - when raw source contains `X_i`, `x_j`, or `a_{mn}`, the displayed index must use `<sub>`
  - it only converts an accidental `<sup>` when the raw formula explicitly used `_`
  - it does not globally rewrite legitimate powers such as `x^2` or `A^k`

Cache:
- `theory-formula-fraction-align-E235.js?v=236`

Required local smoke:
1. `git pull origin main`
2. Hard refresh or disable browser cache.
3. Open `Xem đầy đủ` for representative formulas containing:
   - a stacked fraction
   - a square root
   - `X_i`
   - `x_j^T`
   - `A^{-1}`
4. Confirm:
   - popup matches the approved E235 layout
   - fractions remain centered
   - `i` and `j` appear below indexed symbols
   - `T`, `-1`, and numeric powers remain above symbols
   - E236 mini-lesson badges/section layout do not appear
   - E237 academic replacement content does not appear
   - no new console errors

Status is not PASS because browser smoke was not run from this chat environment.

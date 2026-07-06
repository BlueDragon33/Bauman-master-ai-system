# CODEX_STATE

Current task: E226_READER_PRO_FORMULA_TYPOGRAPHY

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Why E226 was made:
- User reported that math formulas in `Xem đầy đủ` still looked too raw.
- Exponents should render visually as superscripts instead of `^` text.
- Subscripts and common math tokens should also be displayed more like mathematical notation.

E226 patch summary:
- Updated the existing content-only bridge file:
  - `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
- Release changed to `E226_READER_PRO_FORMULA_TYPOGRAPHY`.
- This bridge remains content/layout-only and is not a slideshow engine.
- Formula blocks still keep the E225 study layout:
  - label/chú thích above.
  - formula on its own line below.
  - each formula is a separate block.
- Formula raw text is now rendered into math-like HTML instead of plain `pre` text:
  - `^2`, `^n`, `^{...}` -> `<sup>...</sup>`.
  - `_i`, `_n`, `_{...}` -> `<sub>...</sub>`.
  - `sqrt(...)` -> `√(...)`.
  - `sum_i`, `sum_{...}^{...}` -> `∑` with sub/sup where detected.
  - common tokens like `\\cdot`, `\\times`, `\\nabla` are normalized.
  - common Greek names are converted where detected: `pi`, `alpha`, `beta`, `gamma`, `lambda`, `sigma`.
- Formula raw source is preserved in `data-e226-raw-formula` so the bridge can re-read the original formula if the modal is re-rendered.
- Added injected CSS for formula typography:
  - `.e226-math`
  - superscript/subscript sizing and vertical alignment
  - math-oriented font stack: `Cambria Math`, `STIX Two Math`, `Times New Roman`, serif
- Existing formula-specific analysis, application, and concise Python code are preserved.
- Existing E223 amber popup theme and E224/E225 content/layout behavior remain intact.
- No E202/E210/E211/E212 changes were made.
- E190/E191/E192/E193/E195 were not re-enabled.

Cache/loading changed:
- `index.html` now loads:
  - `theory-slideshow-reader-content-E211.js?v=223`
  - `theory-slideshow-reader-formula-accuracy-E224.js?v=226`
  - `theory-slideshow-reader-fit-E212.js?v=219`

Verification status from ChatGPT direct GitHub patch:
- Repository files were patched directly through GitHub connector.
- No browser smoke was run from this chat environment.
- Required state is `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`, not PASS.

Required local browser smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open Reader Pro formula slide.
4. Click `Xem đầy đủ`.
5. Confirm in `Công thức đầy đủ`:
   - exponents render as raised superscripts, not raw `^` where supported.
   - subscripts render as lowered indices where supported.
   - each formula remains on a separate line/block with label above.
   - formulas look more like math notation and less like raw code text.
6. Confirm analysis/application/Python content still works.
7. Confirm popup still opens above slideshow and retains amber layout.
8. Browser console should not show new E226/E224 errors.

Known remaining blocker/risk:
- This is a lightweight HTML typography formatter, not a full LaTeX/MathJax renderer.
- It improves common raw formulas but may not perfectly render every formula shape.
- Earlier smoke found C02/C03 Level C blocked by upstream slideshow data parse issue:
  `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.
- Because E226 was patched from ChatGPT without browser smoke, it must be verified locally before claiming PASS.

Next safe task if local smoke still fails:
- Patch-only `theory-slideshow-reader-formula-accuracy-E224.js`.
- Do not touch E202.
- Do not create a slideshow engine.
- Do not scan the whole repo.
- Use screenshot + actual formula text to adjust formula typography only.

---

Previous task: E225_READER_PRO_FORMULA_STACK_READABILITY

Previous E225 summary:
- Put each formula in a separate study block with label above and formula below.
- E226 preserves that structure and improves math typography inside the formula surface.

# CODEX_STATE

Current task: E227_READER_PRO_FORMULA_EXAMPLE_SPLIT

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Why E227 was made:
- User screenshot showed `Công thức đầy đủ` still rendering an inline vector example as one long raw line:
  `A = [...] B = [...] C = [...] A và B có pattern gần nhau`.
- This was not the expected readable formula block layout.
- The issue was not only typography; it required splitting inline examples into separate study blocks.

E227 patch summary:
- Updated the existing content-only bridge file:
  - `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
- Release changed to `E227_READER_PRO_FORMULA_EXAMPLE_SPLIT`.
- This bridge remains content/layout-only and is not a slideshow engine.
- Added smart splitting for inline vector examples:
  - `A = [100, 40, 0.01]`
  - `B = [110, 44, 0.012]`
  - `C = [20, 300, 0.20]`
  - trailing Vietnamese note becomes its own `Nhận xét` block.
- Added better splitting for common inline formula sequences where multiple formulas are written in one line.
- `Công thức đầy đủ` now renders vector examples as separate blocks:
  - `Vector A`
  - `Vector B`
  - `Vector C`
  - `Nhận xét`
- Preserved E226 math typography for formula blocks:
  - superscripts/subscripts where detected.
  - sqrt/sum/basic symbol normalization.
  - math-oriented font stack.
- Added vector-example specific analysis/application/Python mapping:
  - analysis explains multi-dimensional vectors as feature vectors.
  - application explains pattern recognition / sample comparison.
  - Python code builds A/B/C arrays and compares distances.
- Existing amber popup theme and layout remain intact.
- No E202/E210/E211/E212 changes were made.
- E190/E191/E192/E193/E195 were not re-enabled.

Cache/loading changed:
- `index.html` now loads:
  - `theory-slideshow-reader-content-E211.js?v=223`
  - `theory-slideshow-reader-formula-accuracy-E224.js?v=227`
  - `theory-slideshow-reader-fit-E212.js?v=219`

Verification status from ChatGPT direct GitHub patch:
- Repository files were patched directly through GitHub connector.
- No browser smoke was run from this chat environment.
- Required state is `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`, not PASS.

Required local browser smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open Reader Pro formula/example slide.
4. Click `Xem đầy đủ`.
5. Confirm the inline vector example is split into separate blocks:
   - `Vector A` with `A = [...]`
   - `Vector B` with `B = [...]`
   - `Vector C` with `C = [...]`
   - `Nhận xét` with the trailing explanation.
6. Confirm formulas still render math-like typography where applicable.
7. Confirm analysis/application/Python content still works and is specific to the detected content.
8. Confirm popup still opens above slideshow and retains amber layout.
9. Browser console should not show new E227/E224 errors.

Known remaining blocker/risk:
- This is still a lightweight HTML formatter and parser, not a full LaTeX/MathJax renderer.
- It improves common formula and vector-example shapes but may need more rules as new formula styles appear.
- Earlier smoke found C02/C03 Level C blocked by upstream slideshow data parse issue:
  `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.
- Because E227 was patched from ChatGPT without browser smoke, it must be verified locally before claiming PASS.

Next safe task if local smoke still fails:
- Patch-only `theory-slideshow-reader-formula-accuracy-E224.js`.
- Do not touch E202.
- Do not create a slideshow engine.
- Do not scan the whole repo.
- Use screenshot + exact raw formula/example text to adjust formula splitting only.

---

Previous task: E226_READER_PRO_FORMULA_TYPOGRAPHY

Previous E226 summary:
- Improved math typography in formula blocks.
- E227 preserves E226 and adds inline example/formula splitting.

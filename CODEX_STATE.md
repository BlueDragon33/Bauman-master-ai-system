# CODEX_STATE

Current task: E225_READER_PRO_FORMULA_STACK_READABILITY

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Why E225 was made:
- User reported that in `Xem đầy đủ`, formulas should not sit on the same visual row as their annotation/label.
- Each formula should appear on its own line/block to make studying and visual scanning easier.

E225 patch summary:
- Updated the existing content-only bridge file:
  - `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
- Release changed to `E225_READER_PRO_FORMULA_STACK_READABILITY`.
- This bridge remains content/layout-only and is not a slideshow engine.
- `Công thức đầy đủ` now renders each formula as a separate study block:
  - label/chú thích on top.
  - formula on its own line below.
  - each formula block has clear spacing, bottom separation, and a left amber accent border.
- Added injected CSS for formula readability:
  - `.e225-formula-stack`
  - `.e225-formula-box`
  - formula `h4` label with its own divider.
  - formula `pre` as a separate readable surface.
- Existing formula-specific analysis, application, and concise Python code are preserved.
- Existing E223 amber popup theme and E224 content accuracy remain intact.
- No E202/E210/E211/E212 changes were made.
- E190/E191/E192/E193/E195 were not re-enabled.

Cache/loading changed:
- `index.html` now loads:
  - `theory-slideshow-reader-content-E211.js?v=223`
  - `theory-slideshow-reader-formula-accuracy-E224.js?v=225`
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
   - label/chú thích is above the formula.
   - each formula appears on a separate line/block.
   - formulas are not crowded on the same visual row as labels.
   - multiple formulas are clearly separated.
6. Confirm analysis/application/Python content still works.
7. Confirm popup still opens above slideshow and retains amber layout.
8. Browser console should not show new E225/E224 errors.

Known remaining blocker/risk:
- Earlier smoke found C02/C03 Level C blocked by upstream slideshow data parse issue:
  `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.
- Because E225 was patched from ChatGPT without browser smoke, it must be verified locally before claiming PASS.

Next safe task if local smoke still fails:
- Patch-only `theory-slideshow-reader-formula-accuracy-E224.js`.
- Do not touch E202.
- Do not create a slideshow engine.
- Do not scan the whole repo.
- Use screenshot + actual formula text to adjust formula block layout only.

---

Previous task: E224_READER_PRO_FORMULA_MODAL_ACCURACY_BRIDGE

Previous E224 summary:
- Added content-only formula accuracy bridge after E211.
- Classified actual formula types and rewrote formula/analysis/application/Python content to be more specific.
- E225 preserves that logic and only improves formula block readability.

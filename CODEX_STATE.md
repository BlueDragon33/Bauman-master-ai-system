# CODEX_STATE

Current task: E229_READER_PRO_FORMULA_SPLIT_AUDIT_AND_FIX

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Files read:
- `CODEX_STATE.md`
- `subjects/math/index.html`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js` (missing before this task)
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js` (targeted inspection only because E224 was missing and modal structure was needed)
- `subjects/math/data/theory_lecture_content.json`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Patch summary:
- Added E224 as a small Reader Pro formula accuracy bridge loaded after E211/E212 with cache `?v=229`.
- Did not touch E202, E211, E212, content JSON, or create a new slideshow engine.
- E224 watches the existing E211 formula modal and replaces only the `Công thức đầy đủ` section.
- Added parser rules:
  - split only at top-level formula starts;
  - do not split inside `()`, `[]`, `{}`, or `||...||`;
  - do not treat `sum_{i=1}` or similar subscript equality as a new formula;
  - keep matrix/vector-stack expressions such as `X = [x_1^T; ...; x_m^T]` as one formula card;
  - convert Vietnamese clauses starting with `Nếu`, `hoặc`, `với`, `trong đó`, `khi`, `đây là`, etc. into note cards;
  - split inline vector examples into `Vector A`, `Vector B`, `Vector C`, and `Nhận xét`;
  - preserve formula labels and apply light formatting for subscript/superscript, `sqrt`, `sum`, and common symbols.

Verification:
- `node --check subjects/math/assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js`: PASS.
- Parser tests from canonical JSON:
  - cosine + condition note: PASS.
  - norm/dot/distance/cosine: PASS.
  - vector A/B/C example: PASS.
  - matrix X / mean / `sum_{i=1}`: PASS.
  - L1/L2/L∞ with sqrt/sum/sub/sup: PASS.
- Browser smoke was partially run on local static server:
  - Math page opened.
  - Reader Pro slideshow opened.
  - `Xem đầy đủ` opened the modal.
  - Browser DOM confirmed E224 patched formula section.
  - Slide 6 rendered 4 formula cards: `Chuẩn vector`, `Tích vô hướng`, `Khoảng cách`, `Cosine similarity`.
  - Slide 7 rendered `Cosine similarity` + `Điều kiện sử dụng`, with no bogus formula cards for `Nếu/hoặc`.
  - Slide 8 rendered `Vector A`, `Vector B`, `Vector C`, `Nhận xét`.
- Browser smoke limitation:
  - Could not complete UI browser smoke for matrix stack because after selecting `Bài 1.6`, breadcrumb changed but the reader body still displayed `Bài 1.1`; this appears to be existing E129/E186 state/routing behavior outside E229 scope.

Console result:
- No new E224 errors observed.
- Existing warning remains: `[E209] slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.

Remaining risks:
- Needs local browser re-smoke for matrix stack after the existing lesson-selection/read-body mismatch is addressed or bypassed safely.
- E224 intentionally patches only the existing E211 modal formula section; it does not change Reader body routing.

---

Current task: E223_READER_PRO_FORMULA_MODAL_AMBER_LESSON_LAYOUT

Status: PASS

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Patch summary:
- E211 release updated to `E223_READER_PRO_FORMULA_MODAL_AMBER_LESSON_LAYOUT`.
- Formula popup theme shifted from cyan/teal neon to a darker amber/yellow-orange lesson popup:
  - darker overlay and card gradient
  - amber border/glow/accent buttons
  - warm heading/context text with stronger contrast
- Preserved the E222 compact centered popup frame and vertical right code panel.
- Changed `formulaModalHtml` so the left content renders like a lesson:
  - `Công thức đầy đủ` uses formula sub-boxes.
  - `Phân tích công thức` uses stacked lesson boxes such as meaning/conditions/mistake guard.
  - `Ứng dụng` uses stacked lesson boxes when content is long enough.
  - Left column now scrolls as one lesson stack instead of forcing each section into a cramped mini-scroll.
- Right code panel remains vertical and now includes:
  - `Python snippet`
  - `Ghi chú khi chạy`
- E211 cache-buster changed from `?v=222` to `?v=223`.
- E202 was not touched and no slideshow engine was added.

Verification:
- `git pull origin main`: PASS, fast-forwarded to remote before patch.
- `node --check subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`: PASS.
- Browser smoke on local static server: PASS.
  - Opened Math page, Reader Pro slideshow, formula slide.
  - Clicked `Xem đầy đủ`.
  - Confirmed popup opens above slideshow.
  - Confirmed amber/darker theme via live computed styles.
  - Confirmed 3 left lesson sections and 6 `.e211-lesson-box` sub-boxes.
  - Confirmed right code panel remains vertical and narrower than the left column.
  - Confirmed sections no longer self-overflow; left lesson stack scrolls internally when needed.
  - Confirmed Escape closes modal first, next/previous still work, second Escape closes deck.
- Screenshot capture timed out in the in-app browser, so visual verification used live DOM/computed-style/layout measurements.

Console result:
- No new E211 errors observed.
- Existing E202/E209 warning still appears: `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.

Remaining risks:
- C02/C03 Level C smoke is still affected by the existing E209 JSON parse warning outside E223 scope.

---

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

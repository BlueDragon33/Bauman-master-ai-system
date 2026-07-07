# CODEX_STATE

Current task: E236_FORMULA_MODAL_MINI_LESSON_LAYOUT

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-07
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-formula-mini-lesson-E236.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Scope:
- Layout-only improvement for the Reader Pro formula popup.
- No change to E202 slideshow logic.
- No change to E224 parser/content logic.
- No change to E234 fraction/radical parsing.
- No change to E235 fraction alignment.
- No change to theory JSON.

Patch summary:
- Added a mini-lesson visual hierarchy with four steps:
  01 Formula
  02 Analysis
  03 Application
  04 Python
- Formula section now spans the full content width and acts as the visual anchor.
- Analysis and application are placed side by side on desktop.
- Python remains in a dedicated right-side panel with improved code readability.
- Formula cards use responsive auto-fit columns; note cards remain full width.
- Added distinct but restrained visual treatment for formula, analysis, application, and code sections.
- Improved modal dimensions for desktop while preserving responsive single-column layout.
- Added compact mobile layout under 720px.
- Added section numbering and a small MINI LESSON badge without changing content.
- E236 is loaded after E212 so its modal-specific layout is the final visual override.

Index load order:
- E224 formula parser/content bridge
- E234 balanced fraction/radical typesetter
- E235 fraction alignment override
- E212 fit bridge
- E236 mini-lesson modal layout

Required local smoke:
1. `git pull origin main`
2. Hard refresh or disable cache.
3. Open `Xem đầy đủ` for:
   - cosine
   - projection
   - matrix X
   - rank/Col(A)
4. Confirm:
   - formula is the main visual focus
   - analysis and application are easy to compare
   - Python code is readable and scrolls correctly
   - fractions and radicals remain unchanged
   - layout does not overflow at desktop width
   - responsive layout works below 1000px and 720px
   - no new console errors

Status remains `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE` because browser smoke was not run from this chat environment.

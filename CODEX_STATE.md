# CODEX_STATE

Current task: E220_READER_PRO_FORMULA_MODAL_TOP_LAYER_LAYOUT

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Why E220 was made:
- User reported that clicking `Xem đầy đủ` opened a popup that was hidden underneath the slideshow overlay.
- User requested the formula popup to appear above the presentation and to use a slideshow-like interface with different color.
- User requested formula popup layout: three horizontal panels and one dedicated Python code panel spanning the popup width, but shorter than the three upper panels.

E220 patch summary:
- E211 release: `E220_READER_PRO_FORMULA_MODAL_TOP_LAYER`.
- Raised the formula popup above the Reader Pro slideshow overlay with a very high top-layer z-index.
- When using the existing `#modal`, E211 now adds `e211-formula-modal-host`, forces fixed full-screen placement, and raises `z-index` to `2147483600`.
- The existing modal card is restyled only while formula modal content is open.
- Fallback formula overlay also uses the same top-layer z-index and presentation-like card.
- Formula popup layout changed to:
  - header area
  - three horizontal upper panels:
    1. `Công thức đầy đủ`
    2. `Phân tích công thức`
    3. `Ứng dụng`
  - one full-width bottom panel for `Cách dùng trong code Python`
- The code panel is intentionally shorter than the top three panels and scrolls internally.
- Popup uses a different teal/green-blue presentation color scheme so it is visually distinct from the main slideshow.
- Close/Escape handling still closes the formula modal first, before allowing the deck to close.
- No new slideshow engine was created.
- E202 remains the slideshow engine.
- E210 remains identity-only.
- E211 remains Reader Pro content bridge only.
- E212 was not changed in E220.
- E190/E191/E192/E193/E195 were not re-enabled.

Cache-busters changed:
- E211: `?v=219` -> `?v=220`
- E212 unchanged: `?v=219`
- E202 unchanged.
- E210 unchanged.

Verification status from ChatGPT direct GitHub patch:
- Repository files were patched directly through GitHub connector.
- No browser smoke was run from this chat environment.
- Required state is `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`, not PASS.

Required local browser smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Open Reader Pro formula slide.
4. Click `Xem đầy đủ`.
5. Confirm popup appears above the slideshow, not hidden behind it.
6. Confirm popup layout:
   - three horizontal panels on top
   - one full-width code panel below
   - code panel shorter than the upper panel row
7. Confirm full formula, analysis, application, and Python code are visible/scrollable.
8. Confirm close button and Escape close the formula popup before closing the deck.
9. Browser console should not show new E211 errors.

Known remaining blocker/risk:
- Earlier smoke found C02/C03 Level C blocked by upstream slideshow data parse issue:
  `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.
- Because E220 was patched from ChatGPT without browser smoke, it must be verified locally before claiming PASS.

Next safe task if local smoke still fails:
- Patch-only E211.
- Do not touch E202.
- Do not create a new slideshow engine.
- Do not scan the whole repo.
- Use screenshot + selector evidence to adjust only formula modal layer/layout.

---

Previous task: E219_READER_PRO_TITLE_BODY_AND_FORMULA_PURPOSE_FIX

Previous E219 summary:
- Separated title/body typography in E212.
- Repaired formula preview and formula popup content in E211.
- E219 still left the popup visually hidden under the slideshow layer, so E220 raises and restyles only the formula popup surface.

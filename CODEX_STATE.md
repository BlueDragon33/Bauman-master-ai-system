# CODEX_STATE

Current task: E221_READER_PRO_FORMULA_MODAL_VERTICAL_CODE_LAYOUT

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Date: 2026-07-06
Branch: `main`

Files changed:
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
- `subjects/math/index.html`
- `CODEX_STATE.md`

Why E221 was made:
- User screenshot showed the Python code panel was still horizontal at the bottom of the formula popup.
- User clarified that the code panel must be a vertical panel, not a horizontal bottom band.

E221 patch summary:
- E211 release: `E221_READER_PRO_FORMULA_MODAL_VERTICAL_CODE`.
- Formula popup layout changed from bottom-code layout to a two-column body layout:
  - left wide column: three horizontal information panels stacked vertically:
    1. `Công thức đầy đủ`
    2. `Phân tích công thức`
    3. `Ứng dụng`
  - right narrow column: one vertical Python code panel.
- The code panel is narrower than the left content column and spans the popup body height.
- The popup still stays above the slideshow layer with top-layer z-index.
- Existing formula content, analysis, application, and Python code generation logic are preserved.
- No new slideshow engine was created.
- E202 remains the slideshow engine.
- E210 remains identity-only.
- E211 remains Reader Pro content bridge only.
- E212 was not changed in E221.
- E190/E191/E192/E193/E195 were not re-enabled.

Cache-busters changed:
- E211: `?v=220` -> `?v=221`
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
5. Confirm formula popup appears above slideshow.
6. Confirm layout:
   - left side has three horizontal panels stacked vertically.
   - right side has one vertical code panel.
   - code panel is narrower than the left column and spans the popup body height.
7. Confirm content is visible/scrollable and no panel is hidden behind the slideshow.
8. Confirm close button and Escape close the formula popup before closing the deck.
9. Browser console should not show new E211 errors.

Known remaining blocker/risk:
- Earlier smoke found C02/C03 Level C blocked by upstream slideshow data parse issue:
  `slideshow data unavailable SyntaxError: Bad escaped character in JSON at position 9749`.
- Because E221 was patched from ChatGPT without browser smoke, it must be verified locally before claiming PASS.

Next safe task if local smoke still fails:
- Patch-only E211.
- Do not touch E202.
- Do not create a new slideshow engine.
- Do not scan the whole repo.
- Use screenshot + selector evidence to adjust only formula modal layout.

---

Previous task: E220_READER_PRO_FORMULA_MODAL_TOP_LAYER_LAYOUT

Previous E220 summary:
- Raised formula popup above slideshow.
- Restyled popup as mini-presentation.
- E220 still placed Python code as a horizontal bottom panel; E221 corrects it into a vertical side panel.

# CODEX_STATE

Current task: E198 slideshow baseline reset.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132-content-fix-E171.js`

Compatibility files currently loaded by `index.html`:
- `theory-slideshow-C02-deck-pack-E190.js` now reports `active:false`.
- `theory-slideshow-C02-level-c-E192.js` now reports `active:false`.

C03 files:
- `theory-slideshow-C03-deck-pack-E191.js` now reports `active:false`.
- `theory-slideshow-C03-level-c-E193.js` is not loaded by `index.html`.
- `theory-slideshow-C03-level-c-enhancer-E195.js` is not loaded by `index.html`.

Routing:
- `theory-learning-path-E186.js?v=195` remains active.
- C02 and C03 static lesson lists remain in E186 so the picker can show real lessons.

Files changed in the final baseline pass:
- `subjects/math/assets/theory_skin/theory-slideshow-C02-deck-pack-E190.js`
- `subjects/math/assets/theory_skin/theory-slideshow-C02-level-c-E192.js`
- `subjects/math/assets/theory_skin/theory-slideshow-C03-deck-pack-E191.js`
- `CODEX_STATE.md`

Notes:
- Do not add any chapter slideshow wrapper after E132/E171 without browser smoke.
- Future Level C content should use one stable path, not stacked runtime wrappers.
- E193 and E195 remain present as historical files but are not part of the active page.

Required local smoke:
1. `git pull origin main`
2. Hard refresh browser.
3. Test C01, C02, C03 slideshow.
4. Confirm no repeated slide movement.
5. Confirm next, previous, Escape, and close work.
6. Browser console: 0 errors.

Next safe rebuild direction:
- Keep E132/E171 as the only active presentation engine.
- Rebuild Level C later by converting content into data consumed by one stable renderer, not by loading extra overlay engines.

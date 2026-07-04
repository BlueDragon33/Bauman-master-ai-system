# CODEX_STATE

Current task: E199 slideshow baseline stable + deck length policy.

Status: BASELINE_STABLE_USER_CONFIRMED

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Active slideshow stack:
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132-content-fix-E171.js`

Compatibility files currently loaded by `index.html`:
- `theory-slideshow-C02-deck-pack-E190.js` reports `active:false`.
- `theory-slideshow-C02-level-c-E192.js` reports `active:false`.

C03 files:
- `theory-slideshow-C03-deck-pack-E191.js` reports `active:false`.
- `theory-slideshow-C03-level-c-E193.js` is not loaded by `index.html`.
- `theory-slideshow-C03-level-c-enhancer-E195.js` is not loaded by `index.html`.

Routing:
- `theory-learning-path-E186.js?v=195` remains active.
- C02 and C03 static lesson lists remain in E186 so the picker can show real lessons.

Deck length policy:
- 16 slides is the minimum acceptable lesson deck size, not a maximum.
- Do not introduce any hard cap such as `MAX_SLIDES=16`, `slice(0,16)`, or equivalent truncation.
- A lesson deck may have more than 16 slides when the topic needs formulas, worked examples, visual explanations, mini-cases, pitfalls, and review checks.
- Future Level B and Level C deck creation must treat 16 as a floor.
- For dense topics such as matrices, calculus, probability, optimization, signals, and control, prefer 18-28 slides if needed rather than compressing important ideas into exactly 16 slides.

Notes:
- Do not add any chapter slideshow wrapper after E132/E171 without browser smoke.
- Future Level C content should use one stable path, not stacked runtime wrappers.
- E193 and E195 remain present as historical files but are not part of the active page.
- Future visual content must be owned by the stable renderer/data path, not by post-render DOM mutation.

Required local smoke after any future slideshow change:
1. `git pull origin main`
2. Hard refresh browser.
3. Test C01, C02, C03 slideshow.
4. Confirm no repeated slide movement.
5. Confirm next, previous, Escape, and close work.
6. Browser console: 0 errors.

Next safe rebuild direction:
- Keep E132/E171 as the only active presentation engine.
- Rebuild Level C later by converting content into data consumed by one stable renderer.
- Do not stack runtime deck wrappers.

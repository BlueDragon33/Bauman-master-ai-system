# CODEX_STATE

Current task: `THEORY_RUNTIME_MIN_SLIDE_CONTRACT_C01_L04_PASS_15`

Status: `PASS_15_MINIMUM_16_SLIDES_PATCHED_STATIC_VERIFY_PASS`

Date: 2026-07-08
Branch: `main`

## Codex session rule
- Prefer direct ChatGPT-to-GitHub work when repository tools are available.
- If Codex is required, create a new Codex session for one narrow task.
- Never continue an old Codex session.
- A new Codex session must read this file and only explicitly named source files.
- Do not scan the full repository.

## §1.4 overall status
- Academic workflow: 14/14 passes, 73/73 steps complete.
- Runtime completion workflow: 1/6 passes complete.
- Runtime steps complete: 5/34.
- Runtime steps remaining: 29/34.
- Source slideshow slides: 22.
- Runtime import slides: 22.
- Minimum slide count: 16.
- Maximum slide count: none.
- Slide compression: prohibited for the accepted §1.4 package.

## Pass 15 objective
Correct the old E129 exact-count behavior so that:
- fewer than 16 slides remains below the required minimum;
- 16 slides is valid;
- more than 16 slides is valid;
- 22 slides does not produce the obsolete exact-count warning;
- semantic roles after the first 16 positions are allowed;
- no slideshow engine or Reader Pro redesign is introduced.

## Pass 15 changes

### Runtime compatibility patch
Created:
`subjects/math/assets/theory_skin/theory-min-slide-contract-E239.js`

Release:
`E239_MINIMUM_16_SLIDES_NOT_MAXIMUM`

Behavior:
- minimum slide count: `16`;
- maximum slide count: `null`;
- slide count mode: `minimum_not_exact`;
- preferred 16 roles are a baseline, not a fixed deck size;
- extended semantic roles are allowed;
- obsolete warning `Khuyến nghị đủ 16 slide role; hiện có N.` is removed only when `N >= 16`;
- below-minimum warnings remain;
- stored E129 import reports are normalized;
- public E129 `commitContent` and `selfCheck` receive the corrected contract metadata.

This is a narrow compatibility patch around the current E129 importer. It does not create a new renderer or slideshow engine.

### Runtime load order
Updated:
`subjects/math/index.html`

Added immediately after E129:
`assets/theory_skin/theory-min-slide-contract-E239.js?v=239`

The patch loads before user import actions and before slideshow/Reader extensions.

### Contract documentation
Created:
`subjects/math/THEORY_SLIDE_COUNT_CONTRACT_E239.md`

Locked rules:
- 16 is minimum;
- no maximum;
- approved learning beats must not be compressed to silence warnings;
- first 16 roles may follow E129 preferred order;
- slides after 16 may use explicit extended semantic roles.

## Static verification
Verified from the E239 contract and self-check logic:
- `validateSlideCount(15).ok === false`;
- `validateSlideCount(16).ok === true`;
- `validateSlideCount(22).ok === true`;
- 15 retains a warning;
- 16 and 22 have no count warning;
- maximum is null;
- E129 contract metadata exposes the minimum rule;
- no E202/E211/E212/E234/E235 file changed;
- E236, E237 and E238 remain disabled;
- no academic artifact changed;
- the accepted 22-slide import package remains unchanged.

## Browser verification status
Not run in Pass 15.

Pass 15 is accepted as:
`PATCHED_STATIC_VERIFY_PASS_NEEDS_BROWSER_CONFIRMATION_IN_PASS_20`

Browser confirmation will occur in final runtime QA after durable merge and data-path synchronization. It must confirm that importing 22 slides shows no obsolete exact-count warning.

## Files read
- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/index.html`
- `subjects/math/THEORY_TAB_CONTRACT_E129.md`
- `subjects/math/data/theory_integration/theory_lecture_content_c01_l04_import.json`

## Files created
- `subjects/math/assets/theory_skin/theory-min-slide-contract-E239.js`
- `subjects/math/THEORY_SLIDE_COUNT_CONTRACT_E239.md`

## Files updated
- `subjects/math/index.html`
- `CODEX_STATE.md`

## Pass 15 commits
- E239 runtime contract patch: `a97b0d46e8866c89c2ecd7ac52e406d68f97471a`
- Load E239 in Math index: `5d513b844449c7d409ad83334b4befcf69f0d683`
- E239 contract documentation: `2487e7ecf68ab70bd8a1106e98bf6b6cbe53716f`

## Next task
PASS 16/20 — Durable merge into `theory_lecture_content.json`, 5 steps:
1. read the monolithic content file safely and record its current hash/count;
2. locate the exact §1.4 record by lessonId;
3. replace only that record with the accepted 22-slide runtime record;
4. verify JSON validity, total record count, duplicate lesson IDs, chapter mapping and unchanged neighboring lessons;
5. commit the durable source and update state without touching UI or Reader files.

Because Pass 16 modifies a large monolithic JSON file, use a **new Codex session** or another JSON-safe merge workflow. Do not rewrite it manually from partial chunks. Do not continue an old Codex session.

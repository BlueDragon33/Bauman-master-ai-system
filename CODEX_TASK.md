# CODEX_TASK

Task: E234A_SLIDE16_DUPLICATE_FIX
Mode: inspect-first, patch-only, verify-only.

## Token rules
- Do not scan the repo.
- Read only the files below.
- One root cause, one patch, one smoke test.
- Do not rewrite large files when a local patch is enough.
- Do not work on formula typography in this task.

## Read only
1. `CODEX_STATE.md`
2. `subjects/math/index.html`
3. `subjects/math/assets/theory_skin/theory-slideshow-E202.js`
4. The single slideshow JSON file for the lesson that shows duplicate slide 16
5. Read E129/E186 only if runtime evidence points there

## Goal
Fix the duplicated final slide. Do not assume slide 16 is locked.

## Inspect evidence
For the failing lesson record:
- raw JSON slide count
- unique slide count
- DOM `.e129-slide` count
- E202 `model.length`
- fingerprints of the final two slides: title + formula + core + visual

## Patch rules
- Fix the real source only.
- Do not use `slice(0,16)`.
- Do not hide a slide with CSS.
- Do not hard-code slide number 16.
- If exact deduplication is required, fingerprint with lessonId + title + formula + core + use + check + visual.
- Preserve different slides that share a title.

## Verify
Browser smoke on the failing lesson:
1. Navigate from slide 1 to the end.
2. A 16-slide lesson ends once at `16 / 16`.
3. Next at the end must not create another slide.
4. Close/reopen and switch lesson/back.
5. No new console errors.

## Output
Update `CODEX_STATE.md` with:
- root cause
- files read/changed
- raw count vs unique count
- browser smoke result
- status: `PASS_BROWSER_SMOKE` only after real smoke; otherwise `PATCHED_NEEDS_LOCAL_BROWSER_SMOKE`

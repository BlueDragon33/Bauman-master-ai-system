# E164 · Runtime Selector Probe Hardening

Status: STATIC_PROBE_PASS_BROWSER_EXECUTION_REQUIRED

Branch: `codex/e150-c01-l01-clean-replacement`

Scope: local testability hardening for the unresolved E162/E163 browser gate. No learning-content JSON or lesson body changed.

## Why this pass exists

E162 demonstrated that DOM presence is not enough: lesson buttons existed but were laid out at `0x0`. E163 repaired the CSS. E164 adds a direct runtime probe so the next browser smoke can distinguish DOM presence from actual visible/clickable layout.

## Probe added

`BAUMAN_MATH_THEORY_E129.selfCheck()` now reports:

- `selectedLessonId`
- `lessonButtonCount`
- `visibleLessonButtonCount`
- `activeLessonVisible`
- `lessonSelectorRuntimeReady`
- `presenting`

`lessonSelectorRuntimeReady` is true only when:

1. at least one lesson button exists;
2. every lesson button has a non-zero layout box and is not display/visibility hidden;
3. the active lesson button also has a non-zero layout box.

## Static verification

- Existing lesson selection event flow remains unchanged.
- E129 still writes `state().e129LessonId` and rerenders.
- E132 still rebuilds its source model from the current presenting E129 slide DOM.
- No content JSON changed.
- E129 script cache key bumped to `v=164`.

## Browser acceptance command

After opening Theory/C01 in a real browser:

```js
BAUMAN_MATH_THEORY_E129.selfCheck()
```

Expected before opening slideshow:

- `lessonButtonCount >= 6` for C01
- `visibleLessonButtonCount === lessonButtonCount`
- `activeLessonVisible === true`
- `lessonSelectorRuntimeReady === true`

Then select §1.4 / §1.5 / §1.6 and run the E132 smoke from E161/E162.

Browser PASS is still required before C01 display baseline is accepted.

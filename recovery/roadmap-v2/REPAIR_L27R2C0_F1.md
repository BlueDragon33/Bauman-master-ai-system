# L27R2C0-F1 — Stabilize packaged Math Reader acceptance

## Trigger

Whole System Integration run `35326766318` failed only at:

- packaged ChatGPT Site browser acceptance;
- Math lesson `l05`;
- assertion: Reader slide count `0 !== 22`.

The source-runtime execution of the same test passed.

## Evidence

The packaged server log shows HTTP 200 for:

- `theory_lecture_content.json`;
- `theory_slideshow_c01_l05.json`;
- `theory_reference_c01_l05.json`;
- `theory_normalization_c01_l05.json`;
- `theory_full_view_c01_l05.json`.

The test had already confirmed the selected durable source record contained 22 slides. Therefore this was not a missing packaged asset.

## Root cause

The acceptance test waited only for the `data-current-lesson` marker, then immediately counted `.e129-slide` elements. The packaged runtime has a longer asynchronous/rerender window than the source runtime, so the marker could become observable before the Reader DOM reached its stable 22-slide state.

## Fix

The test now waits for a stable condition:

- current Reader lesson ID equals the requested lesson;
- Reader contains exactly 22 `.e129-slide` elements.

It then waits a short stability interval and rechecks both lesson identity and slide count.

This does not weaken the gate. A missing asset, wrong lesson, incomplete render or persistent slide-count regression still fails after the existing timeout.

## Safety

No production runtime, Math content, learner state, package content or UI behavior is changed. Only synchronization in the browser acceptance test is corrected.

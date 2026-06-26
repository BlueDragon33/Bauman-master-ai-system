# RUSSIAN V12.72 FINAL GATE UI QA REPORT

## Scope
- Final QA for exam gate logic, exercise cleanup, and theory slide rendering.

## Logic locked
- Day 1-6: weekly exam locked.
- Day 7: unlock 7-day exam, Easy only.
- Day 14: unlock 14-day exam, Easy + Medium.
- Day 21: unlock higher level up to Hard.
- Day 28: unlock 28-day exam, all levels Easy/Medium/Hard/Expert.
- After day 28: route reset and full exam reset remain locked until all four 28-day levels have been submitted and passed.
- Reset current paper remains available for retrying failed work.

## UI fixes retained
- Exercise tab removes duplicated intro and enters the question card directly.
- Exercise card uses internal scroll and full prompt/answer containment.
- Exercise dropdown displays Vietnamese labels and disables locked levels.
- Theory tab slide strip no longer collapses into vertical slivers.
- Presentation mode uses readable slide list and independent content scroll.

## QA
- JS syntax checked with node --check.
- JSON data parsed successfully.
- Manifest parsed successfully.
- ZIP created and extraction tested.

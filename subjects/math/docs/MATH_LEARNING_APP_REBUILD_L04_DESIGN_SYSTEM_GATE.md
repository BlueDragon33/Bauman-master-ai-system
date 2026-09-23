# Math Learning Application Rebuild — LƯỢT 4 Design System & CSS Debt Gate

## Goal
Create clear visual ownership before further redesign. No new versioned override layer and no new `!important` debt.

## Changes
- `math-navigation.css` is now the single owner of visible primary navigation.
- `math-premium.css` no longer styles primary navigation.
- Workspace no longer injects navigation buttons.
- Removed `!important` from the active modular UI layers:
  - math-navigation.css: 49 → 0
  - math-premium.css: 220 → 0
  - math-reader-pro.css: 44 → 0
  - math-workspace.css: 7 → 0
  - math-study-library.css: 7 → 0
  - math-learning-flow.css: 4 → 0
  - math-runtime-health.css: 2 → 0

## Legacy quarantine
The old foundations still contain very large historical override debt:
- `core.css`: ~949 KB, 12,167 `!important`
- `math.css`: ~155 KB, 1,847 `!important`

They are treated as legacy foundation during the rebuild. They must not be used as a destination for new override patches.

Migration rule:
1. new learner-facing components use owned modular selectors;
2. no new V5/V6/V7 override layers;
3. no new `!important`;
4. when a legacy selector blocks a rebuild component, move ownership or refactor that selector rather than adding a stronger override.

## Gate
- Navigation ownership unique: PASS
- New modular layers free of `!important`: PASS
- No extra CSS file/version created: PASS
- CSS braces balanced in touched files: PASS
- Legacy debt explicitly quarantined: PASS

## Result
**PASS**

The whole legacy CSS base is not claimed clean. It is isolated as migration debt and is not allowed to dictate new learner architecture.

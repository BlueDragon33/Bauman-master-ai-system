# RUSSIAN V12.90 · Route UX Redesign

## Scope
- Moved schedule settings into the current-stage side panel instead of floating over the route modal.
- Rebuilt route modal into a cleaner learning dashboard: main study route on the left, current-stage card on the right.
- Hid redundant closure blocks from the main modal to reduce visual noise.
- Enlarged the main route cards and improved spacing, line-height and responsive behavior.

## Files changed
- assets/core.js
- assets/core.css

## QA
- node --check assets/core.js: OK
- data/*.json parse: OK
- CSS brace balance: OK

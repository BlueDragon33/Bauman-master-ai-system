# Russian Bauman Elearning · V12.88 Speaking Map Button

## Scope
- Screenshot-driven patch only.
- Collapsed the full phrase/sentence map into a single `Bản đồ câu nói` button inside the speaking toolbar.
- Removed the large always-visible map from the main speaking area so the current spoken sentence has primary visual space.
- Preserved all dialogue data and speaking-room logic.

## Files touched
- `assets/core.js`
- `assets/core.css`

## QA
- `node --check assets/core.js`: OK
- `node --check assets/subject-adapter.js`: OK
- `node --check subject-manifest.js`: OK
- `data/*.json` parse: OK
- CSS brace balance: OK

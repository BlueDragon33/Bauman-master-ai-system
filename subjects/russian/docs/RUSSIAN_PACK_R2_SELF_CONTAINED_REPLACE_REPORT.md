# RUSSIAN PACK R2 · Self-contained replacement

## Scope
- Replaced the old Russian subject package inside Main with Russian V12.73 Bonus Total QA Polish.
- All runtime files are now contained under `subjects/russian/`.
- Main can continue to call `subjects/russian/index.html` and `subjects/russian/editor.html`.

## Final local structure
- `subjects/russian/index.html`
- `subjects/russian/editor.html`
- `subjects/russian/subject-manifest.json`
- `subjects/russian/subject-manifest.js`
- `subjects/russian/assets/`
- `subjects/russian/data/`
- `subjects/russian/external-data/`
- `subjects/russian/docs/`

## Notes
- No old Russian V8/V9 runtime file was kept in the active `subjects/russian/` package.
- Data files remain local to `subjects/russian/data/`.
- Extra large/reference files remain local to `subjects/russian/external-data/`.

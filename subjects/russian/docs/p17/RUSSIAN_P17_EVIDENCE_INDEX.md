# Russian P17 Evidence Index

Repository governance:
- `RUSSIAN_P17_MUTATION_MANIFEST.json`
- this P17 baseline document set
- `subjects/russian/scripts/validate-p17-release-governance.mjs`
- `.github/workflows/russian-production-release-closure.yml`

Executable subject evidence:
- `tests/russian-ru05-ru08-acceptance-browser.mjs`
- `tests/russian-offline-shell-browser.mjs`
- `subjects/russian/scripts/validate-ru05-ru08-runtime-compliance.mjs`

Release-specific evidence is generated as an Actions artifact named `russian-p17-closure-<run_id>`, bound to the exact workflow SHA; no generic "latest" identity is accepted.

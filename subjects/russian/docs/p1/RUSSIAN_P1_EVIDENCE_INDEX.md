# Russian P1 Evidence Index

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`
Audit branch: `audit/russian-p1-forensic-foundation-20260930`

| Evidence | Status | Supports |
|---|---|---|
| Git tree `main?recursive=1` | captured | 305-file Russian inventory and byte sizes |
| `subjects/russian/index.html` | captured | direct CSS/JS bootstrap order |
| `subjects/russian/subject-manifest.json` | captured | declared tabs/data and module metadata |
| `REFACTOR_AUDIT_20260923.md` | historical only | hypotheses/previous checkpoint, not current authority |
| `russian-ui-reference-gate.yml` | captured | current Russian static/domain CI coverage |
| `system-integration-ci.yml` | captured and patched on audit branch | browser/package acceptance availability + trigger blind spot |
| PR/browser workflow results | pending | current runtime/browser evidence |
| Browser artifacts/screenshots | pending | geometry/visual/offline evidence |

## Rule
Historical reports do not override current runtime. Any conclusion needing browser/computed-style/state evidence remains `UNKNOWN` or `NEEDS VALIDATION`.

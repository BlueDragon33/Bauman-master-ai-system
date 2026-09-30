# Russian P1 DOM Ownership Map

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

| Region / responsibility | Initial creator candidate | Subsequent mutator candidate | Observer evidence | Status |
|---|---|---|---:|---|
| App shell / route view | `assets/core.js` | `assets/russian-future-ui.js` | Future UI: 1 | MULTIPLE_TOUCH / VALIDATING |
| Learning state surfaces | `core.js` | `learning-state.js` | 1 | MULTIPLE_TOUCH / VALIDATING |
| Learning flow | `core.js` | `learning-flow.js` | 1 | MULTIPLE_TOUCH / VALIDATING |
| Vocabulary/SRS | `core.js` | `vocab-srs.js` | 0 | DOMAIN_OVERLAY |
| Speaking | `core.js` | `speaking-coach.js` | 1 | DOMAIN_OVERLAY |
| Academic language | `core.js` | `academic-language.js` | 1 | DOMAIN_OVERLAY |
| AI mentor boundary | `core.js` | `ai-mentor-guard.js` | 1 | BOUNDED_ASSISTANT |
| Planning/Hub bridge | `planning-bridge.js` | `subject-adapter.js` | n/a | INTEGRATION |

## Static evidence
- `core.js` has 7 direct `innerHTML=` assignments and 22 `addEventListener` calls.
- `russian-future-ui.js` has 6 direct `innerHTML=` assignments, 17 listeners and 1 MutationObserver construction(s).
- `speaking-coach.js` has 1 view-scoped MutationObserver construction(s).

## Runtime gate
The browser probe must confirm actual creator/mutator order and DOM-idempotence. P1 does **not** merge these renderers based on static counts alone.

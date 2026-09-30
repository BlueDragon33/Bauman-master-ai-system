# Russian P1 CSS Ownership Map

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## Cascade order
1. `assets/core.css`
2. `assets/russian.css`
3. `assets/russian-future-ui.css`
4. `assets/learning-state.css`
5. `assets/content-contract.css`
6. `assets/learning-flow.css`
7. `assets/vocab-srs.css`
8. `assets/speaking-coach.css`
9. `assets/academic-language.css`
10. `assets/capability-progression.css`
11. `assets/runtime-optimizer.css`
12. `platform/ui/bauman-ui.css?v=1`

## Static forensic facts
- `core.css`: 735573 bytes, 10452 `!important`, 237 media queries, 1426 duplicated selector names (approximate parser).
- `russian-future-ui.css`: 49648 bytes, 119 `!important`, 19 media queries.
- Platform UI loads after all Russian CSS, so a final computed value can originate outside `subjects/russian/`.
- Load order establishes cascade opportunity, **not** final ownership.

## Shell selector candidates
| Selector | core.css refs | future-ui refs | Final owner |
|---|---:|---:|---|
| `.app` | 12 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.sidebar` | 31 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.main` | 27 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.nav` | 46 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.nav button` | 39 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.content` | 0 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.card` | 7 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.panel` | 20 | 1 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.topbar` | 12 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.lesson` | 106 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.page` | 0 | 0 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.modal` | 68 | 3 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.ru-app-shell` | 0 | 7 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.ru-sidebar` | 0 | 12 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.ru-main` | 0 | 1 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.ru-topbar` | 0 | 5 | NEEDS_RUNTIME_COMPUTED_STYLE |
| `.ru-view` | 0 | 4 | NEEDS_RUNTIME_COMPUTED_STYLE |

## Ownership hypothesis
- Documented canonical Russian presentation layer: `russian-future-ui.css`.
- Legacy/base declarations remain heavily present in `core.css`.
- Component CSS files should own scoped domain surfaces only.
- `platform/ui/bauman-ui.css` is a downstream global presentation layer and must be included in conflict tracing.

## Delete policy
No CSS file is DELETE in P1. Retirement requires matched-rule evidence, route reachability, visual regression and rollback.

## Runtime evidence
The P1 browser probe records matched rules + computed values for representative shell components at 11 viewports. Until artifact inspection, final computed-source cells remain `NEEDS_RUNTIME_COMPUTED_STYLE`.

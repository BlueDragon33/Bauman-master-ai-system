# Russian P1 Route Map

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## Manifest-declared top-level tabs
1. `overview`
2. `learning`
3. `dialogue`
4. `writing`
5. `media`
6. `vocab`
7. `grammar`
8. `mindmap`
9. `storage`

| Route | Declared | Core refs | Future UI refs | Direct-entry/reload/back |
|---|---:|---:|---:|---|
| `overview` | yes | 57 | 18 | NEEDS_BROWSER |
| `learning` | yes | 111 | 33 | NEEDS_BROWSER |
| `dialogue` | yes | 413 | 7 | NEEDS_BROWSER |
| `writing` | yes | 442 | 15 | NEEDS_BROWSER |
| `media` | yes | 249 | 12 | NEEDS_BROWSER |
| `vocab` | yes | 286 | 32 | NEEDS_BROWSER |
| `grammar` | yes | 159 | 13 | NEEDS_BROWSER |
| `mindmap` | yes | 174 | 3 | NEEDS_BROWSER |
| `storage` | yes | 252 | 11 | NEEDS_BROWSER |

## Deep-route evidence
Static scan finds 239 generic `route` references in `core.js`, 79 in `learning-state.js`, and 29 in `planning-bridge.js`.

## Required browser checks
- direct entry;
- reload;
- back/forward;
- deep link;
- Hub → Russian;
- Russian → Hub;
- standalone Russian.

P1 does not delete aliases or hidden routes.

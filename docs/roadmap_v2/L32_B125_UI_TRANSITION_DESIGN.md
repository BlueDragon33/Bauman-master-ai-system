# L32 / B125–B127 — Additive 8-to-10 UI transition design

## Decision

L32 defines a deterministic transition but creates no production route and changes no production HTML, CSS, or JavaScript. Ten canonical destinations are planned under `/courses/{01..10}/index.html`; all eight `/subjects/{legacy}/index.html` routes remain direct compatibility surfaces. Automatic redirects are forbidden because one legacy module can support several canonical courses.

## Canonical destinations and legacy support

| Course | Planned destination | Legacy support | Activation boundary |
|---|---|---|---|
| 01 TIẾNG NGA | `/courses/01/index.html` | Russian, Foundation | Static Registry allowed |
| 02 TOÁN AI & DATA | `/courses/02/index.html` | Math, Foundation, Signal | Static Registry allowed |
| 03 PYTHON & OOP | `/courses/03/index.html` | Programming | Academic validation required |
| 04 ALGORITHMS & DATA STRUCTURES | `/courses/04/index.html` | Programming | Academic validation required |
| 05 DATABASE & INFORMATION SYSTEMS | `/courses/05/index.html` | Programming, Systems | Academic validation required |
| 06 LINUX, OS & COMPUTER NETWORKS | `/courses/06/index.html` | Programming, Foundation, Systems | Academic validation required |
| 07 OPERATIONS RESEARCH & SYSTEM MODELING | `/courses/07/index.html` | Signal, Systems | Academic validation required |
| 08 MACHINE LEARNING & RESEARCH | `/courses/08/index.html` | AI, Signal | Academic validation required |
| 09 CURRENT BAUMAN SUBJECTS | `/courses/09/index.html` | Foundation, Signal, Systems | Blocked until verified syllabus import; 0 static lessons |
| 10 NIR/THESIS | `/courses/10/index.html` | Research, Signal, Systems | Academic validation required |

All route values are design identifiers only. `physicalCanonicalRoutesCreated = 0`.

## Legacy compatibility

The reverse mapping is complete:

- AI → 08
- Foundation → 01, 02, 06, 09
- Math → 02
- Programming → 03, 04, 05, 06
- Research → 10
- Russian → 01
- Signal → 02, 07, 08, 09, 10
- Systems → 05, 06, 07, 09, 10

Legacy routes preserved/deleted/renamed/redirected: `8/0/0/0`.

## Ordered remediation backlog

| Phase | Findings | Required outcome before later phases |
|---|---|---|
| P0 Security boundary | F001, F012, F015 | Remove static credentials; origin/source/schema-checked messaging; trace HTML sink trust boundaries |
| P1 Canonical semantics | F002, F003, F004, F016 | One progress contract; one GĐ0–GĐ3 registry; 10 canonical + 8 compatibility routes; verified-only course 09 |
| P2 Evidence UX | F005, F006, F009, F011 | Assessment blueprint, evidence-gated completion, mastery/readiness projection, compatibility-only legacy percent |
| P3 Accessibility & maintainability | F007, F008, F010, F013, F014 | Import contract, shell/adapters split, assistant grounding, Math load ownership, accessible names |

Every L31 finding appears exactly once and remains `OPEN`. L32 resolves none.

## Focused validation

- B125 contract: PASS
- B126 deterministic transition plan and SHA-256 manifest: PASS
- B127: 28/28 failure-mode tests PASS
- B128: awaiting full-checkout L19–L32 regression and production boundary

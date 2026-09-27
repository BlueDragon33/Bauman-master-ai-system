# BAUMAN FUTURE INTERFACE SYSTEM

Status: implementation track for the Strategic UI/UX Master Prompt.

## Product target

Bauman is treated as a **professional learning operating system**, not a collection of independently styled pages. The UI core owns navigation, surfaces, typography, spacing, interaction contracts, responsive behavior and extension points. Feature modules own content and domain logic.

## Architecture

`platform/ui/` is the canonical UI package:

- `tokens.css` — colors, surfaces, typography, spacing, radius, borders, elevation, motion, z-index and layout widths.
- `foundation.css` — readable defaults, focus-visible, reduced motion and accessibility utilities.
- `components.css` — reusable buttons, fields, cards, badges, tabs, toolbar, loading/empty/error patterns.
- `layouts.css` — App, Dashboard, Learning, Resource, Admin and Focus layout contracts.
- `patterns.css` — command palette, contextual actions, progress and mobile navigation.
- `app-shell.css` — canonical Master Hub shell and dashboard presentation.
- `subject-adapter.css/js` — common subject shell, subject navigation, mobile navigation and Focus Mode.
- `resource-viewer.css/js` — universal viewer shell for image/video/audio/PDF/URL/HTML/simulation.
- `micro-app.css/js` — native-feeling wrapper for standalone simulation HTML apps.
- `editor.css` — shared data-editor/admin utility surface.
- `data.css` — professional table/data pattern.
- `import-center.css/js` — Upload → Detect → Classify → Preview → Validate → Publish wizard.
- `ai.css` — AI panel and structured response hierarchy.
- `performance.js` — progressive lazy loading for images/iframes.
- `runtime.js` — command/search API, Focus Mode, icon family, mobile navigation, slots and accessibility.
- `compat.css` — explicitly bounded migration bridge for legacy primitives only.

## Contracts

### App shell

One hierarchy: Global Navigation → Context Header → Primary Workspace → Contextual Utility Layer.

Legacy presentation modules may continue to provide data/content, but the final shell is selected by `data-bui-shell="1"`. A legacy theme must not reactivate a competing app shell.

### Extension / plugin contract

Extensions must register capabilities rather than append arbitrary DOM:

- `BaumanUI.commands.register(...)`
- `BaumanUI.search.register(...)`
- `BaumanUI.slots.register/resolve/mount(...)`
- `BaumanUI.resource.open(...)`
- `BaumanUI.resource.register(type, renderer)`
- `BaumanUI.importCenter.mount(...)`

### Subject contract

Every subject app loads the same BFIS package. Subject identity may change icon/accent/content, but navigation, typography, control language, focus behavior, mobile strategy and accessibility stay consistent.

### Resource contract

A resource declares `type`, `src`, `title`, optional `description` and `progress`. ResourceViewer owns header, context tools, notes and progress. Type adapters own only rendering.

### Priority color contract

- Q1 — urgent + important: red.
- Q3 — urgent + not important: orange.
- Q2 — important + not urgent: blue.
- Q4 — not important + not urgent: green.

## Epoch status

| Epoch | Scope | Status |
| --- | --- | --- |
| UI-E1 | Visual & UX Audit | Implemented; legacy CSS debt measured |
| UI-E2 | Design Token Foundation | Implemented |
| UI-E3 | Typography / Spacing / Surface | Implemented |
| UI-E4 | Unified App Shell | Implemented |
| UI-E5 | Navigation Architecture | Implemented |
| UI-E6 | Dashboard Reconstruction | Implemented in canonical shell |
| UI-E7 | Universal Page Layouts | Implemented |
| UI-E8 | Professional Component Library | Implemented |
| UI-E9 | Responsive Architecture | Implemented; acceptance required |
| UI-E10 | Mobile Experience | Bottom navigation + responsive shell implemented |
| UI-E11 | Learning Focus Experience | Implemented |
| UI-E12 | Universal Resource Viewer | Implemented |
| UI-E13 | PDF Experience | Shell/adapter contract implemented; full PDF renderer deferred until a PDF asset exists |
| UI-E14 | HTML Micro-App Experience | Implemented for all standalone simulation HTML pages |
| UI-E15 | Search + Command Palette | Implemented |
| UI-E16 | Contextual Actions | Resource-type contextual actions implemented |
| UI-E17 | Forms / Tables / Data UX | Shared patterns + subject editors implemented |
| UI-E18 | Import Center UX | Implemented |
| UI-E19 | Plugin UI Slots | Implemented |
| UI-E20 | Subject UI Unification | All 8 subject applications connected |
| UI-E21 | AI-native Interaction Layer | Shared visual/response contract implemented |
| UI-E22 | Dark Mode Perfection | Tokenized dark surfaces implemented; visual acceptance required |
| UI-E23 | Accessibility Hardening | Skip link, focus-visible, keyboard nav, reduced motion, touch target contract implemented |
| UI-E24 | Motion & Microinteraction | Tokenized 120/180/240 ms motion contract implemented |
| UI-E25 | Performance & Perceived Performance | Lazy-loading/progressive shell implemented |
| UI-E26 | Visual Regression Infrastructure | Implemented by BFIS CI/screenshot gate |
| UI-E27 | Cross-device UX Audit | Must pass 1920/1440/1280/1024/768/430/390 |
| UI-E28 | Final Professional Product Audit | Merge gate only after screenshots and behavioral acceptance pass |

## Legacy debt policy

The existing repository contains substantial historical CSS, especially the Math app and older Hub presentation layers. BFIS does **not** add another arbitrary page-specific patch stack. Migration follows these rules:

1. New UI primitives live in `platform/ui/`.
2. Canonical shell styles are loaded last and selected explicitly by `data-bui*` contracts.
3. Feature behavior stays in existing modules until it can be migrated without regression.
4. Compatibility rules are centralized; no new page-specific CSS override is allowed in `compat.css`.
5. Every release reduces legacy ownership instead of adding another independent visual system.

## Merge gate

A BFIS release can merge only when:

- syntax/static architecture checks pass;
- primary Hub tabs pass browser behavior tests;
- representative simple and complex subject apps pass;
- standalone micro-apps pass;
- command palette, keyboard navigation, Focus Mode and theme switching pass;
- no horizontal overflow at required breakpoints;
- screenshots for desktop/tablet/mobile and light/dark are reviewed;
- no new route, data or academic logic regression is introduced.

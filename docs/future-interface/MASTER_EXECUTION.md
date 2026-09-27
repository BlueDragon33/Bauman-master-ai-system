# BAUMAN_FUTURE_INTERFACE_SYSTEM

Status: ACTIVE
Repository: BlueDragon33/Bauman-master-ai-system
Authority: PROMPT xây giao diện chuyên nghiệp

## Product target
Bauman is treated as a professional learning operating system, not a collection of independently styled pages.

## Active architecture
- `platform/ui/tokens.css`: canonical visual primitives.
- `platform/ui/components.css`: reusable component contracts.
- `platform/ui/layouts.css`: App/Dashboard/Learning/Resource/Admin/Focus layouts.
- `platform/ui/patterns.css`: command palette and contextual patterns.
- `platform/ui/motion.css`: motion and reduced-motion contract.
- `platform/ui/utilities.css`: accessibility and composition utilities.
- `platform/ui/app-shell.css`: canonical application shell.
- `platform/ui/legacy-adapters.css`: temporary migration bridge for existing renderers only.
- `platform/ui/runtime.js`: command palette, focus mode and mobile navigation.

## Rules now enforced
1. New UI does not add visual primitives directly to feature CSS.
2. New feature/plugin UI consumes `platform/ui`.
3. Existing page renderers may be migrated progressively, but no new patch file is allowed.
4. Primary surfaces use shared spacing, radius, border, type and motion scales.
5. Ctrl/Cmd+K belongs to the global command palette.
6. Mobile uses bottom navigation rather than a shrunken desktop sidebar.
7. Dark mode uses dedicated tokens rather than automatic inversion.
8. Every interactive control targets at least 44px.
9. Visual review is required in addition to CI.
10. Specialized epochs are created only when a real feature requires them.

## Epoch state

| Epoch | Scope | State |
|---|---|---|
| UI-E1 | Visual & UX Audit | PASS in current batch |
| UI-E2 | Design Token Foundation | PASS |
| UI-E3 | Typography / Spacing / Surface | PASS |
| UI-E4 | Unified App Shell | PASS |
| UI-E5 | Navigation Architecture | PASS |
| UI-E6 | Dashboard Reconstruction | ACTIVE migration adapter |
| UI-E7 | Universal Page Layouts | PASS foundation |
| UI-E8 | Professional Component Library | PASS foundation |
| UI-E9 | Responsive Architecture | PASS foundation |
| UI-E10 | Mobile Experience | PASS primary navigation |
| UI-E11 | Learning Focus Experience | PASS foundation |
| UI-E12 | Universal Resource Viewer | PENDING real resource-shell migration |
| UI-E13 | PDF Experience | PENDING PDF viewer implementation |
| UI-E14 | HTML Micro-App Experience | PENDING adapter migration |
| UI-E15 | Search + Command Palette | PASS foundation |
| UI-E16 | Contextual Actions | ACTIVE by module |
| UI-E17 | Forms / Tables / Data UX | PENDING dedicated surfaces |
| UI-E18 | Import Center UX | PENDING Import Center feature |
| UI-E19 | Plugin UI Slots | PENDING plugin host refactor |
| UI-E20 | Subject UI Unification | ACTIVE; shared tokens/layouts now authoritative |
| UI-E21 | AI-native Interaction Layer | ACTIVE |
| UI-E22 | Dark Mode Perfection | PASS token foundation; visual audit continues |
| UI-E23 | Accessibility Hardening | PASS baseline; audit continues |
| UI-E24 | Motion & Microinteraction | PASS baseline |
| UI-E25 | Performance & Perceived Performance | ACTIVE |
| UI-E26 | Visual Regression Infrastructure | ACTIVE via browser CI |
| UI-E27 | Cross-device UX Audit | ACTIVE via 1920/1440/768/390 gate |
| UI-E28 | Final Professional Product Audit | NOT YET ELIGIBLE |

## No-patchwork migration
`legacy-adapters.css` is explicitly a transition layer. It may only reduce differences between existing page renderers and the canonical design system. New feature-specific selectors must not be added there. When a renderer migrates to shared components, its adapter rules are deleted.

## Current release gate
A batch may merge only when:
- static architecture gate passes;
- desktop/tablet/mobile browser acceptance passes;
- command palette works by keyboard;
- focus mode works;
- primary pages have no horizontal document overflow;
- dark/light surfaces remain readable;
- no route/tab order changes are introduced unintentionally;
- screenshots are captured for review.

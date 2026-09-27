# BAUMAN_FUTURE_INTERFACE_SYSTEM · UI-E1 → UI-E4

## Scope

This track applies to the full repository, not to one tab or one subject.

## UI-E1 · Visual & UX Audit

Baseline findings:

1. The repository contains one Main Hub plus multiple independently-styled subject modules, editors and simulation micro-apps.
2. Visual primitives are duplicated across many CSS files.
3. Subject modules currently use several different shell families: generic `.side/.top`, shared-core `.sidebar/.topbar`, Russian-specialized shell and Math-specialized shell.
4. Typography, spacing, radii, controls and focus behavior are therefore not guaranteed to remain consistent when a new module is added.
5. The current repository already has valuable reference designs for Dashboard, Roadmap, Subjects, Schedule and Thesis; the problem is the absence of a durable shared visual contract beneath them.

## UI-E2 · Design Token Foundation

Implemented in `platform/ui/tokens.css`.

Token groups:
- semantic colors;
- surface scale;
- typography scale;
- spacing;
- radius;
- border;
- elevation;
- motion;
- layout;
- z-index.

Dark mode is token-driven rather than automatic color inversion.

## UI-E3 · Typography / Spacing / Surface System

Implemented in:
- `platform/ui/foundations.css`;
- `platform/ui/components.css`;
- `platform/ui/responsive.css`.

Rules include:
- 16px body baseline;
- unified focus-visible behavior;
- 44px touch targets;
- reduced-motion support;
- semantic buttons, forms, panels, tables, dialogs, empty/error/loading primitives;
- 12/8/4-column conceptual grid;
- reading width and workspace width contracts.

## UI-E4 · Unified App Shell Foundation

Implemented through `platform/ui/layouts.css` and `platform/ui/bauman-ui.js`.

This epoch deliberately does **not** rewrite domain routing. It establishes one visual/layout contract underneath:
- Main Hub;
- all subject entry points;
- subject editors;
- Math/Programming simulation micro-apps.

Legacy shells remain operational through a transitional compatibility layer. New UI must use `.bui-*` primitives instead of adding another local shell family.

## Quality gates

The track adds:
- repository-wide HTML adoption checks;
- design-token contract checks;
- browser acceptance at desktop/tablet/mobile;
- dark/reduced-motion checks;
- screenshots for visual review.

## Next epochs

UI-E5 Navigation Architecture
UI-E6 Dashboard Reconstruction
UI-E7 Universal Page Layouts
UI-E8 Professional Component Library
UI-E9 Responsive Architecture
UI-E10 Mobile Experience
UI-E11 Learning Focus Experience
UI-E12 Universal Resource Viewer
UI-E13 PDF Experience
UI-E14 HTML Micro-App Experience
UI-E15 Search + Command Palette
UI-E16 Contextual Actions
UI-E17 Forms / Tables / Data UX
UI-E18 Import Center UX
UI-E19 Plugin UI Slots
UI-E20 Subject UI Unification
UI-E21 AI-native Interaction Layer
UI-E22 Dark Mode Perfection
UI-E23 Accessibility Hardening
UI-E24 Motion & Microinteraction
UI-E25 Performance & Perceived Performance
UI-E26 Visual Regression Infrastructure
UI-E27 Cross-device UX Audit
UI-E28 Final Professional Product Audit

No epoch is considered complete only because CI is green. Screenshot review remains a release gate.

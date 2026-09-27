# BAUMAN FUTURE INTERFACE SYSTEM

This package is the shared UI foundation for Bauman Master Hub and every subject/micro-app.

## Contract

- `tokens.css`: semantic visual primitives only.
- `foundations.css`: reset, typography, focus, accessibility baseline.
- `components.css`: reusable component primitives.
- `layouts.css`: App/Dashboard/Learning/Resource compatibility contracts.
- `responsive.css`: desktop/tablet/mobile layout behavior.
- `bauman-ui.css`: package entry point.
- `bauman-ui.js`: route-agnostic runtime helpers.

New modules should consume these tokens and components rather than invent new font sizes, radii, spacing, shadows, or colors.

## Design rules

1. Clarity before decoration.
2. Hierarchy before density.
3. Focus before features.
4. Progressive disclosure.
5. Consistency before creativity.
6. Content first.

## Migration

Current legacy pages are supported by a compatibility layer, but new work should use `.bui-*` primitives. Compatibility rules are transitional; do not add one-off overrides to them.

## Accessibility baseline

- visible keyboard focus;
- touch targets >= 44px;
- reduced motion support;
- semantic live announcements;
- light/dark token support.

## Long-term ownership

The UI package owns visual primitives, shared layout contracts, and cross-project accessibility behavior. It does not own routing, domain data, or subject-specific learning logic.

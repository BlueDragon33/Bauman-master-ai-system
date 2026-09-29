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


## UI-E5 navigation contract

- The shared kernel may mirror the application's existing primary navigation, but it never owns routing.
- Active routes expose `aria-current="page"`.
- Desktop sidebar navigation supports Arrow Up/Down plus Home/End keyboard movement.
- Mobile Hub navigation mirrors the five canonical routes: Trang chủ, Lộ trình, Môn học, Lịch học, НИР & Luận văn.
- The mobile mirror delegates activation back to the canonical route button; it does not duplicate page-state logic.
- Authentication remains authoritative: the mobile navigation stays hidden while `#appRoot` is hidden.
- A skip-navigation link is injected progressively for keyboard users.


## UI-E6 dashboard contract

- `dashboard.css` owns shared dashboard structure, focus affordances and container-responsive behavior.
- The existing Hub runtime continues to own dashboard data and actions.
- The E6 dashboard exposes stable semantic regions through `data-bui-region` and stable utility panels through `data-bui-panel`.
- Legacy `hub-safe-*` classes remain compatibility hooks during migration; new dashboard work should target `.bui-dashboard*`.
- UI-E6 does not create a second Home route, duplicate academic state or replace the existing search/scheduler/AI handlers.

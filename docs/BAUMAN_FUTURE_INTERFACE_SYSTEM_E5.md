# BAUMAN FUTURE INTERFACE SYSTEM · UI-E5 Navigation Architecture

## Scope

UI-E5 upgrades navigation from a page-specific visual pattern into one shared accessibility and cross-device contract while preserving all existing application routing.

## Implemented

1. The canonical Hub navigation receives an accessible label and active-route `aria-current="page"` state.
2. Arrow Up/Down and Home/End move keyboard focus through the five primary Hub routes without changing route ownership.
3. A mobile bottom navigation mirrors the canonical five routes:
   - Trang chủ
   - Lộ trình
   - Môn học
   - Lịch học
   - НИР & Luận văn
4. Mobile navigation delegates every activation back to the existing source navigation button.
5. The mirror stays hidden while the authenticated application root is hidden.
6. A skip-navigation link is injected progressively for keyboard users.
7. Safe-area padding is respected on mobile devices.

## Non-goals / protected behavior

- UI-E5 does not replace `app.page(...)`, page renderers, subject routers or domain state.
- It does not change route order.
- It does not change authentication, Device Gate, scheduler, mastery, academic state or deployment behavior.
- It does not introduce a second source of navigation truth.

## Gate

The existing Future Interface static/browser CI now checks:
- route ownership remains false;
- navigation initializes;
- five mobile routes are mirrored;
- primary navigation has an accessible label;
- skip-navigation is present;
- mobile safe-area styling is present.

Screenshot review remains required before merge.

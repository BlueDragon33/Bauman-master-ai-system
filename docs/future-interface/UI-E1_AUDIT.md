# UI-E1 · Visual & UX Audit

## Root causes found
1. Visual primitives were duplicated between `main.css`, `hub-safe-shell.css`, reference page CSS files and readability overrides.
2. App Shell styling was distributed across several generations of CSS, producing conflicting dimensions, shadows and theme behavior.
3. Reference pages solved density by shrinking text, violating the readability requirement.
4. Global search existed as a page-oriented modal rather than a true command capability.
5. Desktop sidebar behavior was inherited by smaller screens instead of having a mobile navigation model.
6. Theme behavior mixed hard-coded page colors with theme variables.
7. Focus mode existed conceptually but not as a global learning interaction.
8. Multiple old compatibility layers still exist; deleting them all in one change would create unacceptable regression risk.

## Target state adopted
- One design-token authority under `platform/ui/`.
- One canonical App Shell.
- Shared layout contracts.
- Shared control and surface primitives.
- Mobile bottom navigation.
- Global Ctrl/Cmd+K command palette.
- Explicit Focus Mode.
- Dark mode token scale.
- 44px interaction floor.
- Temporary, documented migration adapters rather than ad-hoc end-of-file patches.

## Deferred by design
ResourceViewer, PDF native experience, Import Center, plugin slot host and advanced data-table patterns are not fabricated without a real consuming feature. Their epochs remain pending until an actual integration requires them.

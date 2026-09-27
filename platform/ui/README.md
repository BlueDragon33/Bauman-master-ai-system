# BAUMAN FUTURE INTERFACE SYSTEM

This package is the canonical UI foundation for Bauman Master Hub and subject apps.

## Contracts

- **Tokens**: color, surface, typography, spacing, radius, border, elevation, motion, z-index and breakpoints live in `tokens.css`.
- **Components**: new UI uses reusable `.bui-*` primitives. Do not create one-off visual primitives inside feature modules.
- **Layouts**: use `bui-app-layout`, `bui-dashboard-layout`, `bui-learning-layout`, `bui-resource-layout`, `bui-admin-layout`, or `bui-focus-layout`.
- **Command palette**: Ctrl/Cmd+K. Features register commands through `BaumanUI.commands.register(...)`.
- **Focus mode**: `BaumanUI.focus.toggle()` or Alt+F.
- **Slots**: extensions register or resolve named slots through `BaumanUI.slots`; do not query arbitrary host DOM to append plugin UI.
- **Subject apps**: load `index.css`, `subject-adapter.css`, `runtime.js`, and `subject-adapter.js`.
- **Legacy bridge**: `compat.css` only maps established primitives to tokens. Do not add page-specific fixes there.

## Quality bar

Every major UI change must pass desktop, tablet and mobile browser acceptance, keyboard/focus checks, no-overflow checks, light/dark visual review and screenshot regression.

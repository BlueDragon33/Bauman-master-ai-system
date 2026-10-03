# 07 — UI/UX Architecture

## Product feel

Target: **calm, precise, premium, intelligent, future-ready**.

Future-looking design comes from information architecture, typography, spacing, contextual actions and intelligent behavior — not excessive neon, glass, gradients or animation.

## One App Shell

Shared shell owns:

- global navigation;
- contextual header;
- global search/command palette;
- workspace;
- notifications/profile;
- responsive navigation behavior.

Subjects do not invent independent application shells.

## Shared layout contracts

- AppLayout
- DashboardLayout
- LearningLayout
- ResourceLayout
- FocusLayout
- AdminLayout

Extensions select approved layout slots rather than append arbitrary DOM.

## Design System

Central tokens:

- color/surface;
- spacing;
- typography;
- radius;
- border/elevation;
- motion;
- breakpoints;
- z-index.

Central components:

- Button/Input/Dialog;
- Card/Panel;
- Table/Form;
- LessonHeader;
- ResourceViewer;
- Progress/Evidence state;
- Search/Command;
- Empty/Loading/Error states.

## Learning experience hierarchy

A learner-facing page should answer quickly:

1. Where am I?
2. What am I learning?
3. What matters now?
4. What should I do next?
5. What evidence/progress do I have?

Do not expose internal academic schemas unnecessarily.

## Universal Resource Viewer

PDF/video/audio/HTML/URL/image/simulation should live inside one resource-shell contract with resource-specific contextual actions.

## Responsive matrix

Required acceptance targets include at least:

- 1920
- 1440
- 1280
- 1024
- 768
- 430
- 390

Mobile is not desktop scaled down.

## Accessibility

Critical journeys require:

- keyboard operation;
- visible focus;
- semantic structure;
- usable dialogs/focus restore;
- meaningful labels;
- contrast;
- reduced motion;
- touch-safe targets.

## UI anti-patterns

Forbidden as default repair strategies:

- card-inside-card accumulation;
- random per-subject design systems;
- CSS override piles;
- `!important` as architecture;
- global DOM query hacks from plugins;
- a button for every capability;
- dashboard dumping all available data.


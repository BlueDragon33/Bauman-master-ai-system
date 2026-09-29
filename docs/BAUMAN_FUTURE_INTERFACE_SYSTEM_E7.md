# BAUMAN FUTURE INTERFACE SYSTEM · UI-E7 iPad + iPhone Refinement

## Goal

UI-E7 changes compact layouts from “desktop scaled down” into deliberate tablet and phone experiences while preserving all E5 navigation and E6 dashboard contracts.

## Layout profiles

- desktop: >1100 px;
- tablet-landscape: 821–1100 px;
- tablet-portrait: 481–820 px;
- phone: <=480 px.

These are viewport capability profiles, not user-agent or Apple-device sniffing.

## iPad

- landscape retains the compact sidebar but relaxes one-screen desktop constraints;
- portrait uses the shared floating five-destination dock;
- portrait topbar is reduced and separated cleanly from Home content;
- Home hero is shorter and more readable;
- subject cards become a snap-scrolling priority strip instead of five compressed cards;
- Continue Learning keeps art on tablet but reduces its footprint;
- Progress and right-rail panels use two-column tablet composition.

## iPhone

- floating safe-area-aware bottom dock with short labels;
- compact two-row topbar;
- shorter Home hero and single-column CTAs;
- decorative quote is removed;
- subjects become snap cards;
- Continue Learning becomes one-column and removes decorative art;
- progress ring becomes compact horizontal metadata;
- AI suggestions and achievements become horizontal strips;
- all important controls retain >=44 px touch targets.

## Protected behavior

UI-E7 does not own routing, data, authentication, Device Gate, AI semantics, scheduler state, learner progress or production release.

## Verification

CI must capture and validate:
- iPad landscape 1024×768;
- iPad portrait 820×1180;
- iPad portrait 768×1024;
- iPhone 430×932;
- iPhone 390×844;
plus the existing desktop evidence.

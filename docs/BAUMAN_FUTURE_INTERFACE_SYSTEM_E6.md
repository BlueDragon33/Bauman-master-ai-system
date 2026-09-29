# BAUMAN FUTURE INTERFACE SYSTEM · UI-E6 Dashboard Reconstruction

## Objective

Move the Home dashboard from an implementation identified only by legacy `hub-safe-*` selectors toward a stable shared UI contract without changing its data, routes or academic behavior.

## Implemented

- canonical dashboard root: `data-bui-dashboard="e6"`;
- shared structural classes under `.bui-dashboard*`;
- semantic regions:
  - hero;
  - subjects;
  - continue;
  - progress;
  - rail;
- semantic utility panels:
  - assistant;
  - schedule;
  - motivation;
- container-responsive dashboard behavior in `platform/ui/dashboard.css`;
- visible keyboard focus for dashboard actions;
- shared runtime readiness signal `dashboardReady`;
- static/browser gates that fail if E6 structure disappears.

## Compatibility

The existing `hub-safe-*` classes are intentionally retained during E6 because the current production-quality reference skin and acceptance suite still consume them. They are compatibility hooks, not the future component API. New code should consume the E6 `bui-dashboard*` contract.

## Protected behavior

UI-E6 does not own or modify:
- route state;
- authentication or Device Gate;
- learner progress/mastery;
- scheduler data;
- subject data;
- AI handler semantics;
- production deployment.

## Exit criteria

E6 may merge only when the Future Interface, Development Fast, Russian Reference UI and Constitution gates remain green and desktop/tablet/mobile screenshot evidence shows no dashboard regression.

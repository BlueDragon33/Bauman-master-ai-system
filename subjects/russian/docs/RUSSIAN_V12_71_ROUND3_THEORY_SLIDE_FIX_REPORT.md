# RUSSIAN V12.71 ROUND 3 THEORY SLIDE FIX REPORT

## Scope
- Fixed theory slide rail being squeezed into thin vertical columns.
- Added v1271 theory classes to renderTheory and presentation modal.
- Hardened slide strip: horizontal scroll, fixed pill width, no vertical text compression.
- Hardened lesson content: one main scroll area, full width slide page, long text wraps safely.
- Hardened presentation: sidebar slide list remains vertical, content scrolls independently, long slides stay readable.

## Safety
- Did not change exam unlock logic from V12.69.
- Did not change exercise clean-scroll logic from V12.70.
- No ZIP is intended for user delivery until final round.

# V12.85 R2 · Compact frame and balanced workspace

Scope: layout only. No data JSON touched.

Steps:
1. Reduced main sidebar from the oversized 340px block to a compact 286px desktop rail, with 270px at medium desktop and icon rail at narrow width.
2. Balanced main workspace padding and side panels so the right content area aligns better with the navigation rail.
3. Added overflow-x guards and responsive grid rules to prevent horizontal spill, clipping and dead whitespace.

Touched files:
- assets/core.css

Validation:
- CSS brace balance OK
- node --check assets/core.js OK
- JSON parse OK

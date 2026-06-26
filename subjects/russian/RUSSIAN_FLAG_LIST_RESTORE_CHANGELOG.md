# Russian Bauman Flag List Restore Hotfix

## Fixed

- Restored the missing question flag lists in **Ôn tập** and **Kiểm tra**.
- The flag lists are restored as scrollable cards inside the main content area.
- This avoids bringing back the previous small left board that caused hidden/khuyết UI issues.
- Added page range tabs for long question sets.
- Added overflow protection for flag lists and compact assessment cards.

## Validation

- `assets/core.js`: syntax OK.
- `assets/subject-adapter.js`: syntax OK.
- `subject-manifest.js`: syntax OK.
- All JSON files in `data/`: parse OK.

## Manual check

Open with Live Server and test:

1. Học tập → Ôn tập → click flag numbers.
2. Học tập → Kiểm tra → click flag numbers.
3. Verify the question changes correctly and content no longer hides.

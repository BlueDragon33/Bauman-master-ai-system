# E165C Local Browser Verify Prompt

Use this only for a verify-only Codex/browser run after pulling `main`.

## Goal

Verify the direct E165C patch for Math Theory C01. Do not edit content. Do not edit UI unless the browser smoke fails and the exact runtime bug is proven.

## Rules

- Start from `main`.
- Pull latest `main`.
- Do not scan whole repo.
- Do not write academic content.
- Do not touch `subjects/math/data/theory_lecture_content.json`.
- Do not change E129 Reader.
- Verify only E132 Slideshow C01 behavior.

## Files to inspect if needed

- `CODEX_STATE.md`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.js`
- `subjects/math/assets/theory_skin/theory-slideshow-E132.css`
- `subjects/math/assets/theory_skin/theory-tab-E129.js`
- `subjects/math/assets/theory_skin/theory-tab-E129.css`

## Expected runtime

- `window.BAUMAN_MATH_THEORY_E132.release` is `E165C_COMPACT_ONLY_C01_CURATED_DECK`.
- `window.BAUMAN_MATH_THEORY_E132.selfCheck()` returns:
  - `compactOnly:true`
  - `fullLecture:false`
  - `autoSlice:false`
- E132 overlay header says `E165C Compact Deck`.
- No Full lecture label/button exists.
- No Full/Compact toggle exists.
- Pressing `F` or `C` must not switch to full mode.
- E129 Reader remains full content.

## C01 test matrix

Open C01 lessons one by one:

- §1.1 · Vector như dữ liệu kỹ thuật
- §1.2 · Chuẩn vector và khoảng cách
- §1.3 · Tích vô hướng, góc và phép chiếu
- §1.4 · Cơ sở, span và tọa độ
- §1.5 · Không gian con và biểu diễn dữ liệu
- §1.6 · Độc lập tuyến tính, chiều và hạng dữ liệu

For each lesson:

1. Open E129 Reader and confirm full content still exists.
2. Open E132 Slideshow.
3. Confirm compact cards render.
4. Confirm no Reader paragraph auto-slice is shown.
5. Confirm slide count is 15.
6. Confirm each slide has 3 cards.
7. Navigate next/prev/space.
8. Check console errors.
9. Check no overlap, clipping, or unwanted ellipsis.

## PASS criteria

PASS only if:

- All 6 C01 lessons open compact deck correctly.
- Console errors: 0.
- E129 full content remains intact.
- E132 Full lecture is gone.
- No auto slicing occurs.

## FAIL behavior

If FAIL:

- Do not sync/declare PASS.
- Write a precise fail report.
- Patch only the smallest runtime selector/detection bug needed.
- Do not alter academic content.

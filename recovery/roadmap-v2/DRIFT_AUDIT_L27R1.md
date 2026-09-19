# L27R1 — Modern baseline drift audit

## Result

Historical Roadmap V2 protected **40** repository paths. Against the current green runtime:

- unchanged: **30**
- changed: **10**
- missing: **0**

This is expected modernization drift and must not be repaired by reverting the current runtime.

## Academic-content finding

The canonical legacy lesson source remains byte-identical:

- `subjects/math/data/lessons.json` retains blob `caacdf2b0813c1300af215608c4222ca61669184`.

The theory framework and Math subject manifest also retain their historical fingerprints.

The durable theory overlay changed legitimately:

- historical blob: `0a7c49c25c0546411717dc5c39308c0c71d2a2e1`
- current blob: `9e4a0a0b8d33c21b2e343c09f2152b5c53b5bb7e`
- records: 18 → 18
- slides: 300 → 306
- changed record: `MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`
- record slide count: 16 → 22

Therefore L27R3 must regenerate the Roadmap baseline around the modern source instead of restoring the 300-slide historical overlay.

## Changed protected paths

- `CODEX_STATE.md`
  - historical: `66cc5f91d6c150f3f5fbb0c0de20959b7a5acf20`
  - current: `651da240b4d3c3e438d256df1a600986bf57cfd9`
- `subjects/math/assets/theory_skin/theory-artifact-reader-E241.js`
  - historical: `30f726cebecb22708b571442c75368989f878b10`
  - current: `66946f150fe80a464a846edf25398bb9b707857f`
- `subjects/math/assets/theory_skin/theory-artifact-registry-E244.js`
  - historical: `996aab99055472d4adbc4e5b807809b777bc1be8`
  - current: `4c3f94aabc7bc4b2921c5b11328258441340bb7e`
- `subjects/math/assets/theory_skin/theory-presenter-route-lock-E243.js`
  - historical: `8c2cb13c9c1c8c06c054adec6c6074308d65ea93`
  - current: `05ab993411ce646615e0896b931b87478b949d5e`
- `subjects/math/assets/theory_skin/theory-slideshow-E202.js`
  - historical: `ccf69b7f9c89038cba8a90e547a29b0acd15cbb4`
  - current: `a58a3a13a3d0f948989dd0ca65133b4249815fb1`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-content-E211.js`
  - historical: `4bfdeab862626b78ead65ffa7050b27f34925ad6`
  - current: `35732340e2d6497c1a4b31465740357ee06ee489`
- `subjects/math/assets/theory_skin/theory-slideshow-reader-fit-E212.js`
  - historical: `5b04e0bc978b0c90a86e2739301f6e895396e84f`
  - current: `95f47e031f572d1846814067b3547bb43eaa412a`
- `subjects/math/assets/theory_skin/theory-slideshow-richness-E242.js`
  - historical: `8d07a9d15db08236ed1db39cc644ec02e5f3c281`
  - current: `cb48b3cb18c843edaa49b6fbfc9b3476359b5b8f`
- `subjects/math/data/theory_lecture_content.json`
  - historical: `0a7c49c25c0546411717dc5c39308c0c71d2a2e1`
  - current: `9e4a0a0b8d33c21b2e343c09f2152b5c53b5bb7e`
- `subjects/math/index.html`
  - historical: `f3f98f53459d4ce46080ffdf7eebb6c32fcda3ef`
  - current: `dccf7230fbfb37c37f06ff484f9544c005da6ff0`

## Safety conclusion

- No historical branch will be merged wholesale.
- The 30 unchanged protected files remain strong compatibility anchors.
- The 10 changed files require semantic/fingerprint reconciliation.
- Runtime/UI changes remain forbidden during R2A/R2B.

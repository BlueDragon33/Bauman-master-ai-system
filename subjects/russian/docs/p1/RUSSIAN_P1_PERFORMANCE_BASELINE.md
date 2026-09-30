# Russian P1 Performance Baseline

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## Static size baseline
- Russian subject files: 305.
- `core.css`: 735,573 bytes.
- `core.js`: 404,508 bytes.
- Required learning data: 28,743,053 bytes.
- Optional large data: 63,591,688 bytes.
- Dialogue: 35,049,608 bytes.
- Deep Speaking: 28,156,378 bytes.
- Vocab: 11,212,921 bytes.
- Tests: 7,923,057 bytes.
- Speaking: 7,343,576 bytes.

## Existing performance controls
- Vocab/tests and other heavy data have lazy/conditional loading paths.
- Dialogue/Deep Speaking source files are excluded from packaged direct form and chunked for Cloudflare preview.
- Optional large sources are not service-worker precached.
- Runtime optimizer uses bounded light-data idle warming.

## Browser baseline
Status: `VALIDATING`.
P1 Playwright probe will supply 11-viewport network/DOM/error/storage evidence. Timing/memory metrics not emitted by the first probe remain explicitly `UNKNOWN` rather than fabricated.

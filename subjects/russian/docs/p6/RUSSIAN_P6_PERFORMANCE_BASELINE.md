# Russian P6 Performance Baseline

Base main SHA: `40186868af15edd9215d5a4e0e8bb939fd0779ba`
Validated runtime head: `b48a43364f975fa33a75022bc4e0636b52753ef0`
Recorded: 2026-09-30

## Static runtime footprint
- `assets/speech-interaction-engine.js`: 9,080 bytes.
- `assets/speaking-coach.js`: 24,396 bytes.
- `assets/core.js`: 408,068 bytes.
- `sw.js`: 5,207 bytes.
- Large optional dialogue data remains lazy: `dialogue-bauman-az.json` = 35,049,608 bytes.
- Large Deep Speaking data remains lazy: `deep-speaking-bauman.json` = 28,156,378 bytes.

## Runtime acceptance baseline
GitHub Actions run `36711679569` on the validated code head completed:
- Russian P1 11-viewport forensic browser acceptance: PASS for source and packaged runtime.
- Russian Future UI source/package acceptance: PASS.
- Whole-System browser acceptance including packaged runtime: PASS.
- No P6 change promotes large dialogue/deep-speaking datasets into eager startup loading.
- P6 interaction engine is offline-cached and loaded before `core.js`.

## Interpretation
P6 adds one bounded interaction owner rather than duplicating audio/ASR/recording implementations. Browser APIs remain optional; unsupported/denied microphone and recognition paths retain a usable fallback.

## Production note
Cloudflare's automatic feature-branch Workers build check is failing independently of the P6 acceptance contract. P6 does not claim production success. This remains a P14/P17 deployment-integration item.

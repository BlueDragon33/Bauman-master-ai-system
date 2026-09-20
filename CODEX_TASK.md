# CODEX_TASK

Task: `BAUMAN_ROADMAP_V2_CURRENT_TRACK`
Mode: `CHAT_FIRST / ADDITIVE / FAIL_CLOSED`

## Mandatory sequence

1. Treat `docs/roadmap_v2/CURRENT_EXECUTION_STATE.md` as the only current round marker.
2. Complete L26/B101 Scheduler contract revalidation on Consumer Blueprint + Priority V2.
3. If B101/F1 gates are green, open B102 current in-memory weekly projector.
4. Then B103 adversarial/deterministic scheduler harness.
5. Then B104 full-system closeout.
6. Do not open L27 until B104 and its documentation closeout pass the complete six-gate set.

## Current defect rule

Never reuse historical PASS status as current PASS. Historical L26/L27 artifacts are design evidence only. Any stale manifest/hash, runtime write, persistence, calendar connection, generated dynamic content or hidden production wiring must fail closed and create an L26-Fx/Hx step.

## Protected contracts

- Preserve existing Hub, Math, Russian and subject runtime behavior.
- Preserve Device Gate and offline/package acceptance.
- Preserve L23 Consumer Blueprint, L24 Mastery V2 and L25 Priority V2 boundaries.
- Keep Roadmap production integration disconnected.
- No destructive source migration.
- No production publish.

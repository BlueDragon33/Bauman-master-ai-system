# RE49 — exact review packets after RE48 red-team corrections

Status: **PENDING_EXTERNAL_RU03 · AUDIO_BLOCKED · NOT RELEASED**

RE49 regenerates the complete 43-item review inventory from the exact RE48 candidate. This is not a cosmetic re-export. The spatial and dialogue pack revisions changed, therefore every RE47 review fingerprint is intentionally stale and all 43 packets receive fresh fingerprints.

Two advisory entries are also refreshed so reviewer context is not silently inherited from superseded wording:

- `rl-15-university`: `Передай мне, пожалуйста, тетрадь.`
- `repair-dorm-shower:reply`: `Душевая в конце коридора справа.`

Each packet binds exact Russian text, speaker/recipient roles, Vietnamese situation context, expected physical action/visual, advisory evidence, text fingerprint and current audio identity. Current audio identity remains `BROWSER_TTS_SAMPLE_ONLY` with no immutable reviewed audio SHA-256, so AUDIO approval cannot pass.

Acceptance requires deterministic 43/43 packet generation, 43 stale RE47 fingerprints, rejection of old approvals, no human/AI authority confusion, no RU04 mastery, no default runtime enable and no production release.

The next valid authority step is an independent qualified HUMAN_RU03 review of the exact RE49 fingerprints plus an immutable audio asset/review path. Until that exists, `promotionReady=false` is the only valid state.

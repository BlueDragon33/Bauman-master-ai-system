# Bauman Hub — OFFLINE development quickstart

Status: **offline-first policy adopted; app-specific complete offline coverage not yet fully verified**.
The Cloudflare Preview and Production workflows are intentionally dormant by default. DO NOT publish the in-progress learning application.

## Start on Windows without internet
1. Download/clone this repository **once** (development source sync may require internet); keep it on the local device.
2. Open a terminal in the repository folder containing `index.html`.
3. Start a loopback-only static server: `py -3 -m http.server 8765 --bind 127.0.0.1` (Python installed on Windows). If `py` is unavailable: `python -m http.server 8765 --bind 127.0.0.1`.
4. In the same machine's browser open `http://127.0.0.1:8765/` or `http://127.0.0.1:8765/subjects/russian/`. No external domain, no public port, no Cloudflare.
5. Keep the local server running while studying. Stop it with Ctrl+C. Keep the same protocol, hostname and port so browser local storage uses the same origin.

## Offline QA after the first install
- Disconnect internet and confirm pages, CSS, bundled content, lesson navigation, vocabulary, audio assets, local progress, offline reload and data restore.
- Mark optional features that call online AI, cloud TTS/STT, cloud authentication or central administration **UNAVAILABLE OFFLINE** unless an actual local provider exists.
- Browser microphone and local Web Speech API availability varies by device and cannot be guaranteed offline. Do not simulate success.
- Local-only does not mean no authentication/data protection when serving sensitive apps.
- The current app's automated Russian true-offline shell browser gate and local storage tests are evidence **only for their tested scope**. Other Bauman modules remain **OFFLINE_READINESS=UNVERIFIED** until verified.
- Avoid `file://` for modules using `fetch()`, ES modules or Service Workers; use localhost.
- To use from several devices over LAN later requires a separately reviewed local network exposure policy; this command binds only to `127.0.0.1`.

## Deployment rules
No push/merge/CI passing may publish a Preview, Pages or Production build. Existing hosted websites may remain accessible until separately retired; the current offline policy does not delete them.

Authoritative operational policy: `BlueDragon33/Software-Blueprint-Hub/control/development-runtime-policy.v1.json`.
Bơi Ếch (`BlueDragon33/BOIECH_AI`) is the only exception to the ecosystem default.

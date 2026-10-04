# Russian Protected Offline Precache Fx

Date: 2026-10-04
Branch: `fix/russian-protected-offline-precache-fx-20261004`
Base: `4b203ee6515c129093cb7c8e7f2b45d4b7d956a5`

## Production evidence

The production release for `4b203ee6515c129093cb7c8e7f2b45d4b7d956a5` passed exact preview, D1 backup/migration, Control + Learning Runtime deploy, infrastructure smoke, RU08 learner acceptance and RU08 author acceptance, but the offline browser gate failed after all three service-worker readiness attempts.

## Root cause

The service-worker install-time `SHELL` included:

`../../foundation/domain-model/legacy-mapping-registry.v1.json`

That path is protected by the managed Learning Runtime Device Gate because it is JSON under `/foundation/`. An install event must not depend on authenticated/protected learning data; otherwise service-worker activation can remain blocked before the offline runtime is established.

## Fix

- App-shell cache namespace bumped to v10.
- Protected Foundation JSON removed from install-time public shell precache.
- Protected offline assets are declared separately.
- After the service worker is active and controlling the page, `prepareOfflineCore()` fetches protected offline assets with the valid device session and caches them into the active app-shell cache.
- Browser acceptance still requires the Foundation mapping JSON to be present before switching offline.
- Static audit now fails if the protected mapping JSON returns to install-time shell precache.

## Safety

Device Gate is not weakened. Protected JSON still requires an approved session online and is only made available offline after explicit authenticated offline preparation.

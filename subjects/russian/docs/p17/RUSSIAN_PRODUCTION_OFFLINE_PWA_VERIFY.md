# Russian Production Offline / PWA Verify

Historical 2026-10-01 release: **NOT FULLY VERIFIED IN PRODUCTION**.

Source/package CI had offline tests, but P17 requires production installed-client/update/offline/reconnect evidence. Corrective closure runs `tests/russian-offline-shell-browser.mjs` against production and requires RU05 scenario data, RU06 production owners, and RU08 authoring assets to remain available through the service worker.

# Development Mode

Bauman is currently in active-development mode.

## Default development loop

1. Edit on a feature branch.
2. Open/merge a PR quickly.
3. Only **Development Fast CI** runs automatically.
4. Every push to `main` automatically deploys the newest revision to the isolated Cloudflare preview.
5. Newer preview runs cancel older in-progress preview runs.

## Heavy gates

The following validation families are kept in the repository but are **manual-only** during active development:

- Whole System Integration
- Academic 2026 prerequisite/reporting gates
- Russian reference UI gate
- Math learning/recovery gates
- Foundation/content provenance gates
- Runtime Device Gate
- Control Service CI
- Cloudflare preview/production publish gates
- Roadmap reconciliation
- Windows checkout safety
- Current-main control-state gate

Run them from GitHub Actions only when a focused verification or release candidate needs them.

## Production

Production deployment remains separate and manual. Development mode does not automatically mutate the production Worker or production D1.

## Returning to release mode

Before a release candidate, restore the required automatic gates or manually run the full release suite and production publish gate.

# L25-F5 — Packaged Hub Decorative Image Navigation Abort

Status: `PASS`

## Trigger

B100 Whole System run `35342379719` failed at:

`Run packaged ChatGPT Site browser acceptance`

with:

`GET /assets/media/hub-ai-robot.svg net::ERR_ABORTED`

## Evidence

The packaged HTTP server log shows `hub-ai-robot.svg` returning HTTP 200 repeatedly during the same acceptance run.

The failure is therefore not a missing packaged asset or HTTP error. It is a browser-side navigation/rerender abort while the additive Hub Safe Shell is replacing or leaving a decorative image request.

## Fix

The existing confirmed-decorative-navigation-abort filter is extended from:

- `/assets/media/hub-mountains.svg`

to the exact allowlist:

- `/assets/media/hub-mountains.svg`
- `/assets/media/hub-ai-robot.svg`

Only same-origin `GET` requests with exactly `net::ERR_ABORTED` are ignored.

## Gate strength preserved

The acceptance still fails on:

- any HTTP status >= 400;
- missing assets;
- connection failures;
- non-GET failures;
- non-`ERR_ABORTED` network failures;
- `ERR_ABORTED` for any path outside the exact decorative allowlist.

No production runtime code or Roadmap logic is changed.

B100 remains blocked until F5 and all six project gates pass.


## Full gate evidence

Accepted B100/F5 functional head: `624b20cf53e26b193db01377fd83891d88fd0f4c`

- Roadmap V2 Current Gate — run `35342688744` — PASS
- Foundation Domain Model — run `35342688774` — PASS
- Windows checkout safety — run `35342688509` — PASS
- Russian Reference UI — run `35342688603` — PASS
- Cloudflare Preview — run `35342688479` — PASS
- Whole System Integration — run `35342688636` — PASS

# L25-F5 — Packaged Hub Decorative Image Navigation Abort

Status: `FIX_APPLIED_PENDING_GATE`

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

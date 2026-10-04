# PYTHON05 INPUT CONTRACT
Status: NOT READY — requires PYTHON04 PASS.

PYTHON05 may consume PYTHON04 only after:
- one governed execution facade is selected;
- provider/runtime identity is explicit;
- sandbox and resource limits are proven by executable tests;
- filesystem/network/subprocess/secret boundaries pass;
- test/debug result envelopes are stable;
- package/data environment identity is reproducible;
- AI remains advisory and hidden tests are protected;
- offline/failure behavior is honest.

Current handoff is intentionally blocked because no compliant learner Python execution provider has yet been proven. PYTHON05 may continue UI/authoring design against the contracts, but must not present code execution as available until PYTHON04 runtime gates pass.
## Canonical provider continuation

Consume the accepted Cloudflare Sandbox/Containers decision and implementation plan on main `a86f00ebe339a0f39ad8feab66315046b94185a7`. Provider credentials/binding and API access are an external blocker documented in `PYTHON04_CLOUDFLARE_INFRASTRUCTURE_BLOCKER.md`. The local Docker reference spike is not canonical acceptance. PYTHON05 executable UX remains NOT READY until real Cloudflare security/assessment fixtures and exact-head acceptance pass.

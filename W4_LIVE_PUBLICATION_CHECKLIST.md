# W4 Live Publication Checklist

Target: ChatGPT Site

Verified runtime commit: `1a5969b38a49f88c24e98a87c044dd3f616a05c3`

W3 report: `WHOLE_SYSTEM_W3_QA_REPORT.json`

Publication manifest: `W4_PUBLICATION_MANIFEST.json`

## Before Publish

- Reconcile GitHub `main` against the verified runtime commit.
- Classify every commit after the verified runtime and confirm there is no asset/code/data runtime delta. Documentation/state/report/manifest and CI-verified QA-only test/audit changes are non-runtime.
- Confirm QA-only HEAD `60631ca409ddff8b84c91f706e4aaa8c1bd851da` passed integration/browser run `34916354239` and Windows run `34916354249`.
- Do not publish any untested runtime delta.
- Do not publish preview/debug/intermediate artifacts.
- Keep E235 active and unchanged.
- Keep E236/E237/E238 disabled.
- Preserve §1.6 `22/22`, one-to-one, `compression: false`.

## Publish

Record:

- Live ChatGPT Site URL / site identity.
- Publication timestamp.
- Published source/build identity when exposed by the platform.
- Operator/environment used for publication.

## Live Acceptance

### Hub and subject routing

- Hub loads without blocking error.
- Canonical subject entry points work.
- Hub → Math works.
- Hub → Russian works.
- Subject → Hub state/progress handshake works.

### Math regression

- §1.4 opens and remains `22/22`.
- §1.5 opens and remains `22/22`.
- §1.6 opens and remains `22/22`.
- §1.6 source/runtime identities remain one-to-one.
- §1.6 `compression: false` remains true.
- E186 lesson/activity selection stays synchronized with E129 Reader.
- Activity Studio works.
- Mastery controls work.
- Personal notes/session resume work.
- Formula Library/Context work.
- Simulation Lab opens and closes correctly.
- Professor Drill loads accepted questions.
- Study Command Center review queue/resume works.
- Runtime Health has no blocking failure.
- Regression Gate has no blocking failure.

### Russian regression

- Russian app loads.
- Reference UI loads.
- Optional chunk manifests resolve.
- Dialogue/deep-speaking chunk loading works without loading the removed monolithic datasets.

### Browser/runtime quality

- Desktop smoke passes.
- Tablet smoke passes.
- Mobile smoke passes.
- No blocking console errors.
- No page errors.
- No failed required requests.
- No unexpected HTTP 4xx/5xx for required runtime resources.

## Failure policy

If any BLOCKER or functional MAJOR appears:

1. Do not mark W4 PASS.
2. Fix the smallest owning layer.
3. Re-run relevant local/CI regression.
4. Republish the corrected verified lineage.
5. Repeat live acceptance.

## Completion

Only after every live check passes:

- Create `WHOLE_SYSTEM_W4_PUBLICATION_REPORT.json` with exact evidence.
- Advance `CODEX_STATE.md` and `CODEX_TASK.md` to final accepted state.
- Record final live URL/site identity and publication timestamp.

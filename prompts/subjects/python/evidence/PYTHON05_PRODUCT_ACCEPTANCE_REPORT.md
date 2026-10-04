# PYTHON05 LEARNING PRODUCT ACCEPTANCE REPORT

Status: **REVALIDATION REQUIRED — HISTORICAL LOCAL/MOCK PRODUCT REPORT**

Tested implementation head: `d27cde65639f5c15b69ed488eceec4526efd2b7f`

Exact-head evidence:
- Python P5 Learning Product CI run `37199916215`: PASS
- Python P4 Container Provider CI run `37199916222`: PASS
- Development Fast CI run `37199916238`: PASS
- Future Interface System CI run `37199916223`: PASS
- Universal Constitution Compliance run `37199916665`: PASS

## Accepted learner surfaces
- shared-shell Programming entry links to Python Code Lab;
- responsive Code Lab at `subjects/programming/code-lab.html`;
- explicit stdin, code editor, hint ladder and autosave;
- Run / Run tests / Submit / Cancel are distinct actions;
- stdout, stderr, system, tests and evidence are separate;
- multi-tab conflict and offline execution unavailability are explicit;
- mobile controls support indentation/punctuation without squeezing desktop panes.

## Accepted runtime integration
- UI calls governed HTTP/capability facade only;
- public tests execute server-side;
- submit runs public + hidden tests server-side;
- hidden input/expected/source is not returned;
- submit produces evidence only: `officialAttemptWrite=false`, `masteryWrite=false`;
- P4 provider/security regression remains green.

## Accepted authoring
- ordinary coding task authoring is data-driven;
- governed runtime picker;
- public/hidden test separation;
- validation and sandbox preview;
- public catalog export separated from secure author bundle;
- no arbitrary shell/install/runtime-image field;
- lifecycle remains shared DRAFT → VALIDATE → REVIEW → PREVIEW → APPROVE → ACTIVATE.

## Browser acceptance
Playwright exercised learner Code Lab and authoring at desktop/tablet/mobile widths including 390×844, with no page-level horizontal overflow and basic keyboard/semantic-label paths.

## Deferred honestly
- notebook execution is not claimed;
- offline Python execution is not claimed;
- production learner execution remains feature-gated;
- official attempt/mastery write remains canonical learner-state authority work for PYTHON06 hardening/release integration.

Historical handoff claim: **PYTHON06 READY**. Current handoff: **NOT READY**, pending native PYTHON04 and integrated PYTHON05 acceptance.


## Current native/runtime revalidation

The latest main Code Lab, authoring schema and task catalog are preserved, while
both product and author preview now delegate to the sole Programming runtime
facade. Task IDs and existing drafts/state are unchanged. The prior independent
transport, late-result rendering and cancel-before-result bugs are fixed at the
owner; safe autosave does not overwrite a newer tab's draft.

Native API access still returns 403 with an active account token. Public task
contracts outside the declared function-return practice task and official submit
remain unavailable; stdout is not an official correctness authority. Original
product acceptance test assertions are retained and are not claimed PASS by the
new gated UI fixtures. The remaining official assessment/native/authenticated
E2E gates must pass before PYTHON05/PYTHON06 acceptance or production activation.

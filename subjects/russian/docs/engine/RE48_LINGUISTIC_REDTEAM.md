# RE48 — linguistic red-team corrections after RE47

Status: **AI_DRAFT_PENDING_RU03 · NOT HUMAN APPROVAL · NOT RELEASED**

This phase is intentionally small. It re-read the exact RE47 candidate rather than adding more breadth and found two concrete language/meaning defects worth correcting before external RU03 review.

1. `rl-15-university`
   - old: `Передай, пожалуйста, тетрадь.`
   - candidate: `Передай мне, пожалуйста, тетрадь.`
   - reason: the scripted action sends the notebook to the classmate who is speaking. `мне` makes the recipient explicit and avoids asking a Pre-A0 learner to infer an omitted recipient.

2. `repair-dorm-shower` reply
   - old: `Душевая в конце коридора, направо.`
   - candidate: `Душевая в конце коридора справа.`
   - reason: `направо` normally expresses direction of movement ("to the right"), while this line is a location statement. `справа` directly describes the shower room's position and matches the scene semantics.

The resolver pins the expected prior revisions and exact old strings, validates roles/targets before patching, bumps candidate revisions, remains deterministic and fails closed on source drift. It does not touch the original r1 fixtures, default runtime, mastery, audio authority, or production. RE47 review packets become stale for these revised lines and must be regenerated against the new revision before genuine HUMAN_RU03 decisions are accepted.

Other reviewed candidate lines are not claimed perfect or human-certified merely because this pass did not change them. Browser TTS remains sample-only and audio review remains blocked until immutable audio plus qualified listening review exist.

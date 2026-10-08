# RE55 — Same AI draft corrections in review and opt-in learner preview

Owners: RU03/RU05/RU08 under RE00. Existing Russian Engine review and integration only; offline SW is an explicit narrow integration change.

## Bug
Review pipeline RE48/RE52 corrected two misleading Russian drafts, but the RE43/RE44 opt-in previews continued to read unchanged older fixtures. Users with no Russian could therefore still hear `Передай, пожалуйста, тетрадь.` without the known recipient context, or `Душевая в конце коридора, направо.` with conflicting Vietnamese directions.

## Single-owner fix
Move only the two previously audited AI draft corrections to a browser-safe, shared data module. RE48 consumes the same constants, preserving its exact output/fingerprints. The two opt-in previews derive an in-memory patch from the old fixture after structural validation and strict old-text/source/semantic guards. Original fixture files remain byte-for-byte unchanged. Draft UI continues to say unapproved, browser TTS is sample-only, and RU04 receives no mastery evidence.

## Negative QA
Fail on old text drift, altered recipient/location, wrong Vietnamese direction hint, changed source revision or authority forgery. Check 15 spatial and 4 dialogue previews, both semantic corrections exactly match the RE48 derived candidate, and no mutation of original fixtures. All four exact-head CI and packaged/offline browser gates before engineering merge.

No HUMAN_RU03 approval, canonical promotion, or Production publication.

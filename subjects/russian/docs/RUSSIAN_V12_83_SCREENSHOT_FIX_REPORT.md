# V12.83 Screenshot-driven cleanup

Scope: fix only the issues shown in the user's screenshots, without generating images.

## Fixed
1. Route modal/layout top overlap: route header is no longer sticky over the content, buttons wrap safely, title area is compact.
2. Learning top content: removed the bulky learning hero and converted it to a compact mode bar so the main lesson content moves upward.
3. Theory header: reduced duplicate lesson title/summary block; slide content starts higher.
4. Exercise tab: removed the redundant warning/hint paragraph, expanded the exercise list, and disabled line-clamping so card content can show fully.
5. Speaking tab: restored content by sanitizing invalid group/difficulty filters per lesson and keeping the speaking player/map scrollable.
6. Review logic: wrong answers no longer reveal the correct answer or explanation. Explanation appears only after a correct answer. Wrong attempts are tracked; after more than 2 wrong attempts the item is flagged as needing chapter review.

## QA
- assets/core.js node syntax: OK
- assets/subject-adapter.js node syntax: OK
- subject-manifest.js node syntax: OK
- data/*.json parse: OK
- exercise orphans: 0
- speaking orphans: 0

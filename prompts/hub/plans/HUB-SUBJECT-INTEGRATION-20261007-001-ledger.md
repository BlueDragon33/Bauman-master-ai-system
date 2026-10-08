# Execution ledger — plan: prompts/hub/plans/HUB-SUBJECT-INTEGRATION-20261007-001.md

Spec: CURRENT_WORK_PACKET.json r1. Implementation: inline; no implementer delegation.
Pre-flight: config migration produces descriptor authority used by launch adapter; planning-main overrides the main launch actions. Existing facade normalization must follow successful config transfer before persisting.

Ruling: preserve personal DB schema and place device-global config in independent application DB — accepted storage r5 must remain stable — risk if wrong: launch configuration cannot initialize, covered by failure/retry tests.
Ruling: extend allowedPaths only with planning-main.js — directly approved by user; actual planning task owner must bind the adapter — risk if wrong: task handoff regresses, covered by real public-fixture browser test.
Ruling: adapt original learner-path injection test to assert it cannot override canonical application target; independently reject invalid application targets — ownership moved by packet — risk if wrong: unsafe navigation, covered in new browser suite.
Ruling: packaged config-admin tests use explicit standalone HTML with actual packaged assets; existing managed tests remain unchanged — actual managed profile is not an admin — risk if wrong: admin-only packaged evidence is misread as managed authorization; fixtures are labeled explicitly.
Ruling: correct only local managed Hub-only fixture expectation (no owner-private platform meta); preserve original GitHub packaged gate — local safe packaging omits subject/production build — risk if wrong: platform coverage overclaimed; full original remote gate remains required.
Ruling: latest main advanced only subject-owned paths; reconcile by rebasing feature onto latest main without inspecting their content — Hub packet and accepted runtime unchanged — risk if wrong: integration failure detected by exact reconciled original CI.

Task 1: complete — initial main 84215c8b1ec32a29dd9f72291060418ad292d575, reconcile main ffd1db07a7fd121aede14a08fceab6a9d0698235; only forbidden-path names inspected, no contents read. Plan/scope check PASS.
Task 2: complete — watched normalization leak RED then GREEN; migration failure data loss RED then GREEN; recovery export RED then GREEN. Real IndexedDB failure/retry, cross-scope and concurrent admin fields PASS.
Task 3: complete — public task handoff failed due planning owner; authorized adapter binding GREEN. Home/continue/Schedule/search/mentor/reference Hub/tab public fixture launch PASS. No learner editor action; authoring null.
Task 4: local preliminary PASS — 15 owner regression suites plus new static/caller/system/responsive coverage, 4 standalone suites and 4 managed Hub-only suites. Final committed-head reruns and original GitHub full-system gate pending.
Task 5: pending — fresh review, any material RED/GREEN fixes, exact-head evidence and full CI.

Final review: fresh gpt-6-astra reviewer /root/integration_final_review. One Important, no Critical or Minor findings.
Final: fixed startup role visibility under delayed configuration open — hub-subject-config-browser real IndexedDB delay test RED→GREEN for admin and learner, existing failure/retry/recovery tests GREEN. Resolved personal-store profile is rendered before configuration I/O; no default/managed authority inferred.
Ruling: Launch Adapter owns URL validation and task-query construction; main's public compatibility helpers delegate, planning only produces existing mission/handoff data — direct long-term user instruction 2026-10-08 — risk if wrong: route/task query drift, new static protocol and real handoff regression PASS.
Ruling: clean dormant hub-premium-v2.js learner lastStudy raw path copy without changing route choice — additional Hub-owned caller explicitly authorized by user — risk if wrong: legacy presentation selection regresses; subjectId choice remains unchanged and all active presentation regression required.
Final: Ruling: real Subject private files/stores/DOM remain unreviewed — express user boundary — cost if wrong: subject-side behavior needs original remote CI, never claimed from local fixtures.
Final: Ruling: full integration completion is still pending CI — browser passes are supporting evidence — cost if wrong: false release; do not mark complete before exact-head original gate success.
Final: Ruling: public static assertion adaptations await separate scope authorization — no dead compatibility code added to satisfy brittle literal tests — cost if wrong: CI stays red until contract assertions authorized/aligned.
Final: Ruling: open-tab instantaneous device-config refresh is not added — packet requires atomic durable writes and config ownership, existing tabs refresh on initialization/reload — cost if wrong: other open tab sees prior config until reload; durable concurrent-field test PASS.
Reconciliation: main advanced to 5924b72ff600dc0798369362ced83356550f2095; inherited Hub V6 contrast CSS and responsive regression plus governance and Subject changes. No subject content read; preserve upstream contrast/governance and rerun source/packaged gates after rebase.

Task 4: local complete — ce4ce81152a1b35ba8fefaf24419cd497b671429: 19 source + 4 standalone package + 4 managed Hub-only = 27/27 PASS, DSJ validator PASS. Original full CI is 7/9 workflows PASS, two failed source-location contracts. Original 97 workflow steps retained +5 additive steps.
Task 5: boundary blocked — original validator in forbidden subjects/** requires old main.js query implementation location. No validator/source workaround, no gate weakening. Pending Hub-test authorization and Subject validator owner alignment; fullSystemValidated=false.

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

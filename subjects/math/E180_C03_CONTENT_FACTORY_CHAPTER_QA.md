# E180 · C03 Content Factory Chapter QA, Staged Sync & Frame Reconciliation

Status: LOCAL_CHAPTER_QA_PASS_GLOBAL_BROWSER_BASELINE_PENDING

Branch: `codex/e150-c01-l01-clean-replacement`

## Scope

Only C03 · Hàm số, đạo hàm và gradient cơ bản.

## Chapter QA

- 6/6 lessons present: PASS
- orderInChapter 1→6: PASS
- §3.1→§3.6 titles aligned: PASS
- C1→C6 local content gates: PASS
- BLOCKER: 0
- MAJOR: 0
- 16 preferred slide roles per lesson: PASS
- measurable LO count 3–8: PASS
- source provenance ≥3 per lesson: PASS
- E164 browser/runtime baseline: PENDING

## Structural defects repaired

1. Both C03 frame copies still declared `empty_waiting_for_theory_lecture_content`.
2. Staged E145/E146 packages still contained pre-factory skeleton lesson bodies and could overwrite accepted runtime content if re-imported.

## Repairs

Frame:
- `contentStatus: content_factory_complete_runtime_pending`
- `contentRecordCount: 6`
- `contentFactoryVersion: E179`
- `contentAuditStatus: LOCAL_PASS_GLOBAL_BROWSER_PENDING`
- `runtimeGate: E164`
- `stagedContentSync: E180`

Staged packages:
- L01–L03 synced from accepted runtime records.
- L04–L06 synced from accepted runtime records.
- original lesson IDs preserved.
- canonical C03 chapterId preserved.

## Boundary

No framework redesign.
No main sync.
Global browser acceptance remains blocked by E164.

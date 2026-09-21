# CODEX_STATE

Current task: `BAUMAN_PROJECT_STATE_POST_DEVICE_CONTRACT_RECONCILIATION`

Status: `ROADMAP_V2_COMPLETE · RUSSIAN_LISTEN_WRITE_PROMOTED · ACADEMIC_PHASE2_A1_A6_PROMOTED · DEVICE_CONTRACT_V6_PROMOTED · CONTROL_STATE_RECONCILIATION`

Date: 2026-09-21
Branch: `hardening/post-issue-28-state-reconcile-20260921`
Base: `main`

## Authoritative progress

The single authoritative Roadmap progress marker remains:

`docs/roadmap_v2/CURRENT_EXECUTION_STATE.md`

That marker records:

- Roadmap V2 complete through **L35**;
- post-L35 architecture audit complete;
- **no L36 required** by the accepted architecture;
- PR #54 merged to `main` as `c45d34b6fbf1815952674d5d93848138eb006370`;
- Roadmap production execution/deployment remains outside the Roadmap V2 authority boundary.

Russian Handwriting Listen+Write is promoted:

- PR #72 merged to `main` as `4c2e9c7c85edaabbea036b2953f670710f2fe67b`;
- the cleaned Listen+Write implementation passed the current Russian Reference UI, Foundation Domain Model, Windows checkout safety, Cloudflare Preview and Whole System Integration gates, including direct and packaged browser/offline acceptance.

Academic Phase2 current-main reconstruction is promoted:

- PR #76 merged to `main` as `30092c01cf8ce41cf612823299195aaff240b3f0`;
- A1→A6 completed on current-main architecture rather than merging stale historical PR #38;
- d01 remains English-owned; P0 Technical Russian remains separate and does not gate d01;
- unresolved multi-semester allocation/timing and honors-denominator caveats remain preserved until authoritative evidence exists.

## Device Contract v6 is also promoted

Issue #28 implementation was reconstructed from current `main` and promoted through PR #79:

- PR #79 merged to `main` as `0d603a979a7952697d5d612fd9de5f8106a0e609`;
- final candidate head: `d423f788843f2f53bb54a3d37784d29650087dd9`;
- contract version: **6**;
- device registry remains Bauman-owned and isolated;
- P-256 challenge/proof, revocable sessions, device metadata, unblock/edit-permission mutations and audit are implemented;
- new device display code format is `BM-xxxx-xxxx-xxxx-xxxx`;
- protected learning assets are gated server-side by the Runtime Worker using a live approved device session;
- blocked/revoked/pending devices fail closed for protected learning data;
- no production deployment or automatic production promotion was performed.

The validated PR #79 head passed:

- Bauman Control Service CI;
- Bauman Runtime Device Gate CI;
- Bauman Cloudflare Preview CI;
- Academic 2026 Prerequisite Gate;
- Windows checkout safety;
- Whole System Integration Gate.

## Reconciliation defect repaired by this branch

After PR #79 merged, the control files still stopped at the post-Phase2 state and did not record the promoted Device Contract v6 work. Issue #28 also remained open even though its implementation scope and acceptance gates were complete.

This branch updates the control-state so future sessions start from the true current-main baseline instead of reconstructing or duplicating Device Contract work.

## Intentional capability layering preserved

The base control worker intentionally does **not** self-promote the learning access gate. The preview/deployment wrapper promotes `learningAccessGate` only after the required D1 and app-origin conditions are ready.

Do not change that layering merely because `control-service/src/index.ts` contains a base `learningAccessGate: false`; the contract tests explicitly preserve this fail-closed behavior.

## Remaining capability gap

`contentReviewApi` remains explicitly marked `missing` in the application-management contract. It is **not** part of Issue #28 and must not be silently bundled into Device Contract closure.

If content review / approval / publish control is required, open a separate named capability track from current `main`, define ownership and permissions, add migrations/contracts/tests as needed, and pass the relevant current gates before promotion.

## Safety boundary

- Roadmap V2 remains terminally closed unless a separately approved new architecture track is explicitly opened.
- Preserve promoted Hub, Math, Russian, Foundation, Device Gate and Academic behavior.
- Do not merge stale historical candidate branches merely because they contain older PASS evidence.
- No production deployment or production-promotion execution is authorized by this reconciliation.
- Any new capability lane must start from current `main`, state its ownership boundary and pass the relevant current gate set before promotion.

## Execution rule

1. Treat `docs/roadmap_v2/CURRENT_EXECUTION_STATE.md` as authoritative for Roadmap history and terminal status.
2. Do not execute historical Roadmap rounds as current work.
3. Treat Russian Listen+Write, Academic Phase2 A1→A6 and Device Contract v6 as promoted current-main behavior.
4. Close Issue #28 as completed after this reconciliation is promoted; any production activation remains a separate explicit operation.
5. Audit new work against current `main`.
6. When a new defect is found, create a scoped Fx hardening step and run the relevant current gates.
7. When a genuinely missing capability is found, create a new named track rather than extending Roadmap V2 by default.

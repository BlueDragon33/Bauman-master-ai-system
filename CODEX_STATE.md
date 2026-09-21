# CODEX_STATE

Current task: `BAUMAN_PROJECT_STATE_POST_PHASE2_RECONCILIATION`

Status: `ROADMAP_V2_COMPLETE · RUSSIAN_LISTEN_WRITE_PROMOTED · ACADEMIC_PHASE2_A1_A6_PROMOTED · CONTROL_STATE_HARDENING`

Date: 2026-09-21
Branch: `hardening/project-state-post-phase2-20260921`
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

Russian Handwriting Listen+Write is also promoted:

- PR #72 merged to `main` as `4c2e9c7c85edaabbea036b2953f670710f2fe67b`;
- promotion occurred only after the cleaned PR head passed Russian Reference UI, Foundation Domain Model, Windows checkout safety, Cloudflare Preview and Whole System Integration, including direct and packaged browser/offline Listen+Write acceptance.

## Academic Phase2 current-main reconstruction is also promoted

- PR #76 merged to `main` as `30092c01cf8ce41cf612823299195aaff240b3f0`;
- A1→A6 completed on current-main architecture rather than merging stale historical PR #38;
- final candidate head `89739ccfbcd83b1aaa4271cbe71d0bdfcbce041b` passed Windows checkout safety, Cloudflare Preview CI, Academic 2026 Prerequisite Gate, dedicated Phase2 Current-Main Promotion Gate and Whole System Integration;
- direct and packaged browser/offline regressions passed, including Foundation, Hub, Russian offline and Listen+Write;
- d01 remains English-owned; P0 Technical Russian does not gate d01;
- multi-semester allocation/timing for d01/d15/p02 remains unresolved unless authoritative evidence is added;
- transcript/honors denominator remains projection-only until IU5-local mapping is verified.

## Control-state defect repaired by this branch

The previous `CODEX_STATE.md` still declared `L26_B102_ACTIVE`, and `CODEX_TASK.md` still instructed B101→B104 execution. Those instructions were stale relative to the authoritative terminal Roadmap marker and could cause duplicate or conflicting work.

This branch removes that stale active-round instruction. It does not reopen Roadmap V2 and does not create L36.

## Safety boundary

- Roadmap V2 is terminally closed unless a separately approved new architecture track is explicitly opened.
- No production deployment or production-promotion execution is authorized by the Roadmap V2 receipt boundary.
- Preserve existing Hub, Math, Russian, Foundation, Device Gate and subject runtime behavior.
- Do not merge stale historical candidate branches merely because they contain older PASS evidence.
- Any future project lane must start from current `main`, state its responsibility boundary, and pass the relevant current gate set before promotion.

## Execution rule

1. Treat `docs/roadmap_v2/CURRENT_EXECUTION_STATE.md` as authoritative for Roadmap history and terminal status.
2. Do not execute L26/B101-B104, L27, or any other historical Roadmap step as current work.
3. Treat Academic Phase2 A1→A6 as promoted current-main behavior; do not reconstruct or re-merge historical PR #38.
4. Audit remaining open PRs/branches against current `main`; close, supersede, or reconstruct stale candidates instead of merging contaminated history.
5. Open a new implementation round only when a real missing capability, defect, or explicitly requested feature is identified.

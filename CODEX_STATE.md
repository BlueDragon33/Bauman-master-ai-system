# CODEX_STATE

Current task: E196 Disable C03 visual enhancer to stop slideshow jumping.

Status: PATCHED_NEEDS_LOCAL_BROWSER_SMOKE

Branch: `main`
Base branch: `main`
Main sync status: `in_main_direct_patch_from_chatgpt`

Scope:
- User reported C03 slideshow still jumps/behaves chaotically after E195.
- Stabilize slideshow immediately by removing all C03 DOM-observer visual enhancer layers from active load order.
- Keep C03 routed to real lessons through E186 E195 picker fix.
- Keep C03 slideshow on the working E191 deck pack only.
- Do not modify E132 core.
- Do not modify E129 Reader.
- Do not modify content JSON.
- Do not modify C02 E192 Matrix Lab.

Files changed:
- `CODEX_STATE.md`
- `subjects/math/index.html`

Patch summary:
- Removed active load of `theory-slideshow-C03-level-c-enhancer-E195.js?v=195` from `subjects/math/index.html`.
- E193 was already removed from active load order.
- Active slideshow stack is now:
  - E132 core
  - E171 C01 microfix
  - E190 C02 B fallback/history
  - E191 C03 Mức B deck pack
  - E192 C02 Level C Matrix Lab
- C03 now uses E191 only, with no E193/E195 visual layer observing or mutating the slideshow DOM.
- E186 remains at `v=195`, preserving the C03 picker fix with all 6 real C03 lessons.

Root cause / decision:
- Any layer that uses MutationObserver to inject into a running slideshow can cause render churn, layout jumps, or repeated DOM mutation loops.
- Since the user saw chaotic jumping, visual enhancement must not be done as a live DOM observer over the slideshow.
- Future C03 Level C must be implemented either:
  1. directly inside a stable deck pack render path, or
  2. as static slide content owned by the deck, not as a post-render observer.

Verification:
- GitHub update succeeded for `subjects/math/index.html`.
- Browser smoke was not run from this chat environment.

Required local smoke test:
1. `git checkout main`
2. `git pull origin main`
3. Hard refresh browser.
4. Open Math module → Học tập → Chương 3.
5. Confirm Bài picker lists all 6 C03 lessons.
6. Open C03 lessons 3.1-3.6 → `Lý thuyết` → `Trình chiếu`.
7. Confirm slideshow no longer jumps chaotically.
8. Confirm next/prev and Esc/Thoát work.
9. Confirm C02 still opens E192 Matrix Lab for 2.1 and 2.2.
10. Browser console: 0 errors.

Remaining risks:
- C03 is temporarily back to Mức B slideshow only.
- E193 and E195 files remain in repo but are quarantined/not loaded.
- Do not re-enable E193 or E195 until they are redesigned without live DOM mutation.

Next recommended task:
- First confirm C03 E191 is stable after E196.
- Then implement C03 Level C by replacing E191 with a stable E197 deck pack that includes visuals inside its own render output, or by merging visual content into E191 itself.
- Avoid observer-based decorators for slideshow content.

Next actor:
- User local smoke test.

---

Integrated recent state summary:
- E196: Removed E195 from active load order to stop C03 slide jumping.
- E195: Safe visual enhancer file remains in repo but is not loaded.
- E194: Codex attempted E193 fix but full click smoke was not completed and C03 routing remained incomplete.
- E193: C03 Level C standalone overlay remains in repo but is not loaded.
- E192: C02 Level C Matrix Visual Lab remains active.
- E191: C03 Mức B deck remains active.
- E190: C02 Mức B fallback/history, superseded by E192 for C02 slideshow.
- E189/E195-E186: C02/C03 picker source labels fixed with static real lesson lists.
- E171: C01 E132 text microfix.

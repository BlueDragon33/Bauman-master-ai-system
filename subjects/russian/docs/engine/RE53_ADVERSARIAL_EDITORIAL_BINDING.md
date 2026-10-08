# RE53 — Candidate/advisory consistency, adversarial QA

Context: RE52 aligned the shower location's Russian/Vietnamese meaning. This narrow follow-up hardens generation of the full 43-item review inventory: an editorial advisory is only valid for its exact candidate revision/fingerprint and for exact accepted Russian text on the two corrected lines. A well-formed yet stale advisory fails closed; no fresh packet may inherit obsolete context. The original r1 materials remain unmodified.

Test injections: stale candidate SHA, stale dialogue revision, a wrong shower-room Russian reply, and a wrong notebook request. Each must throw instead of producing review packets. No auto-approval or production enablement. This is an **engineering test** and does not certify spoken Russian as native or pedagogically perfect.

Gate: exact HEAD Development Fast CI including Russian Engine suite; Russian Reference UI Gate; Universal Constitution Compliance; Whole System Integration Gate (source and packaged). Merge only if all four succeed.

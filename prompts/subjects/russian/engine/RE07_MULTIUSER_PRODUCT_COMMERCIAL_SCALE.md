# RE07 — MULTI-USER · PRODUCT · COMMERCIAL SCALE

Canonical owners: C1 + C2 + C3 + RU08
Russian pedagogy remains owned by RU02–RU07 as applicable.

Mission: ensure Russian Engine can become a sellable product for many learners without prematurely forcing a paid backend or mixing commerce into pedagogy.

---

# 1. SCALE PRINCIPLE

Design for scale before buying scale.

Progression:

Stage A — single local learner;
Stage B — multiple local profiles;
Stage C — optional account and cross-device sync adapter;
Stage D — managed multi-user service when product demand justifies it;
Stage E — organization/school/team capabilities if later required.

Stages C–E must not force a rewrite of Russian learning semantics.

---

# 2. IDENTITY BOUNDARY

Engine uses stable learner/profile identity.

It must not depend directly on:
- Google account ID;
- Cloudflare ID;
- database row ID;
- payment provider customer ID.

Map external identities through platform adapters.

---

# 3. DATA OWNERSHIP

Separate:
- learner profile;
- canonical learning evidence;
- preferences;
- sync metadata;
- entitlement;
- billing;
- analytics.

Billing failure must not corrupt learner evidence.

Changing subscription must not silently delete progress.

---

# 4. ENTITLEMENT ABSTRACTION

A commercial product may expose editions/content packs such as:
- Core;
- Survival;
- University;
- Technical;
- Research;
- specialty packs.

Engine asks:
`isCapabilityOrPackAvailable(id)`

Engine does not call payment providers directly.

Entitlements are a platform concern consumed through a stable contract.

---

# 5. FREE / PAID DESIGN ETHICS

Do not intentionally degrade learning truth in free mode.

Possible paid value:
- expanded content;
- richer media;
- advanced scenarios;
- specialty packs;
- cross-device managed sync;
- premium voice/provider capability;
- teacher/admin features.

Do not sell fake “mastery” badges detached from evidence.

---

# 6. OFFLINE / OWNERSHIP

Core learning should remain useful offline according to C1.

Purchased/downloaded content rights need a clear offline policy.

Do not design mandatory always-online checks that make legitimate learning impossible without necessity.

Commercial licensing implementation requires later legal/product decisions and explicit authorization.

---

# 7. CONTENT LICENSING METADATA

Content/media records should be able to store:
- creator/source;
- license;
- commercial-use permission;
- attribution requirement;
- expiry/restriction if any;
- generated/synthetic marker;
- territory/language metadata if needed.

No commercial release with unknown media rights.

---

# 8. PRODUCT LOCALIZATION

The shell may support Vietnamese/English/Russian interface languages.

Russian-learning content itself follows Russian-first pedagogy.

UI localization must not turn every Russian stimulus into automatic translation.

---

# 9. MULTI-USER STORAGE

All learner-owned data must be partitionable by profile/tenant identity.

Requirements when managed storage exists:
- authorization check on every learner-owned query;
- no cross-user leakage;
- scoped cache keys;
- export/delete;
- backup;
- migration;
- audit for privileged admin actions.

Do not implement tenant infrastructure inside Russian Engine if platform owns it.

---

# 10. SYNC

Preferred model:
local canonical state
→ journal
→ version/hash
→ optional sync adapter
→ remote projection/backup.

Need:
- retry;
- idempotency;
- conflict detection;
- no silent newer-data overwrite;
- offline queue;
- duplicate evidence prevention.

---

# 11. ANALYTICS

Analytics is optional and consent-aware.

Prefer product events that do not require raw voice or full learner text.

Separate:
- product analytics;
- learning evidence;
- crash diagnostics.

Never use product analytics as mastery truth.

---

# 12. PRIVACY

Commercial readiness requires:
- transparent data categories;
- least collection;
- clear retention;
- export;
- deletion;
- child/minor policy if product later targets minors;
- voice recording consent;
- AI provider disclosure where applicable.

Do not claim legal compliance merely because a checklist exists; legal review is separate when commercialization begins.

---

# 13. FEATURE FLAGS

New Engine capabilities should be releasable behind stable feature flags/registrations when useful.

Flags must not fork learner truth.

A feature disabled later must leave evidence/history readable.

---

# 14. CONTENT DELIVERY

Prepare for:
- core bundled data;
- lazy packs;
- downloadable offline packs;
- versioned manifests;
- checksum/integrity;
- delta updates where worthwhile.

Do not load all 100 levels at startup.

---

# 15. BUSINESS CONTINUITY

The product must tolerate:
- provider price increase;
- AI provider outage;
- speech quota exhaustion;
- sync outage;
- CDN failure;
- billing provider outage.

Core local learning and already-owned learner data must remain safe.

---

# 16. SUPPORTABILITY

For commercial use, diagnostics should expose:
- app version;
- Engine version;
- content pack revision;
- provider capability status;
- sync state;
- storage health;
- last migration result.

Never expose secrets or another learner's data.

---

# 17. ACCESSIBILITY AS PRODUCT QUALITY

Commercial quality includes:
- keyboard;
- screen reader semantics;
- reduced motion;
- captions/transcript accommodations;
- contrast;
- scalable text;
- microphone fallback where pedagogically possible.

Accessibility is not an optional premium feature.

---

# 18. COMPETITOR POSITIONING PRINCIPLE

The product should aim to outperform translation-heavy/gamification-heavy systems through:
- grounded meaning;
- natural speech;
- contextual interaction;
- deep learner model;
- repair;
- transfer;
- real university/technical/research Russian.

Do not define success as “more animations” or “more XP mechanics”.

---

# 19. RE07 EXIT GATE

PASS when architecture can move from one local profile to many managed users by adding platform identity/sync/entitlement providers without rewriting acquisition, competency, content or evidence semantics.

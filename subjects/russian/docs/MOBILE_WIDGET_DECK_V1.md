# Russian Mobile Widget Deck Contract v1 — P1 candidate

Owner: `BlueDragon33/Bauman-master-ai-system/subjects/russian`.
Consumer: `BlueDragon33/Bauman-Russian-iOS` (private, pending Blueprint onboarding).
Policy: Blueprint OS 1.3.0, B4. **Not a deployed API or a RU03-approved content release.**

## Data boundary

`engine/mobile/widget-deck.mjs` is a pure, read-only Bauman-owned
projection. It never scans `data/vocab.json`, rewrites lessons, mutates
learner state, connects to providers, or supplies review authority.
It accepts **Bauman-controlled** candidate publication, verified human
reviewer, decision and rights registries, pinned to audited source revisions.
Missing registries, mismatched fingerprints, unverifiable RU03 reviewer,
withdrawal/supersession or missing offline/display rights withhold the item.

Output schema `RUSSIAN_WIDGET_DECK_V1` lives in
`engine/mobile/widget-deck.schema.json` and contains sourceProjectId,
contentRevision (SHA-256 of selected item metadata), generatedAt,
expiresAt, status, items and non-authoritative diagnostics.
Item fields: contentId, revision, senseId, textRu, stressMarked,
meaningVi, stage, contentSha256, sourceRefs, approvalDecisionId,
reviewerEvidenceId, licenseUrl and optional audio.
The digest detects accidental drift; it does **not** authenticate
the data source or substitute for a signed package or a valid RU03 approval.

This is a module contract, not an implemented `/api/russian/mobile/v1`
HTTP route. First integration may export an immutable, separately reviewed
static package. A server endpoint and iOS network adapter require
their own security and deployment reviews.

## Source-of-truth and current blockers

- `data/provenance.json` classifies the legacy vocabulary dataset as
  `UNVERIFIED`, especially for stress/morphology.
- `engine/content/review/ru03-reviewers.v1.json` presently has zero
  human reviewers and `EXTERNAL_REVIEWER_REQUIRED`.
- `engine/content/review/real-life-scenes.review-decisions.v1.json`
  has zero approvals.
- No canonical widget publication, verified reviewers or rights
  release registries have yet been approved for this projection.

Therefore **no live vocabulary is exportable** by this P1 package.
The positive unit fixture is fictional and only validates contract
logic. It is not approval evidence and must never ship to users.

## Why multiple gates

Publication state by itself is not proof of review. The projection
requires a matching immutable content digest in both a separate
publication record and an independent human RU03 decision (including
stress, Vietnamese meaning and sense), an authorization record for the
reviewer, and a rights entry granting display and offline cache.
Audio requires its own reviewed fingerprint and license.
Changing text, translation, stress, sense, revision or source refs
invalidates the corresponding digest.

## Follow-up wiring and real acceptance

1. Define durable, auditable human credentials and approvals in
   Bauman's RU03 registry, with qualified independent reviewer evidence.
2. Approve canonical source licensing and immutable release index
   under Bauman; establish revocation and review process.
3. Bind exporter inputs to trusted revisioned canonical stores, not
   browser-submitted JSON or arbitrary user files.
4. Add approved/withdrawn/expired package integration tests against
   exact revisions and test package signing/verification if distributed.
5. Only then create an offline-ready iOS widget client and optionally
   versioned authenticated HTTP route; protect learner progress separately.

There is no production or Quality Gate PASS granted by passing this
contract test alone. See Blueprint OS Constitution and release policy.

## Offline expiration and text consistency

The deck requires explicit ISO-8601 `generatedAt` and `expiresAt` with a
positive lifetime of at most 30 days. iOS consumers MUST refuse to display the
deck after `expiresAt` and show a transparent expired/empty state, including
when the device has no network. They must still verify content provenance;
the lifetime is not an RU03 approval certificate. A previously downloaded
deck may not learn about emergency revocation while offline; that risk needs
a separately reviewed withdrawal/refresh threat model and release policy.

Text formatting checks ensure that stripping Unicode acute marks from
`stressMarked` equals `textRu`, accents sit on Russian vowels, and
multisyllabic words carry visible stress or `ё`. They are structural
consistency checks, NOT independent certification that the stressed syllable
is linguistically correct. All such judgments remain RU03-owned.

The JSON Schema constrains serialized consumer payload shape and is not an
authorization layer. Deck `contentRevision` is a deterministic content hash
rather than a signature; a future iOS-facing package must verify authenticity
through a separately approved distribution/signature trust model.

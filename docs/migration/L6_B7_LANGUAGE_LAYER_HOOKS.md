# Lượt 6 · B7 · Russian Twin + English Research Layer Hooks

Status: **IMPLEMENTED · acceptance is controlled by the deterministic gate**

Contract:
`assets/data/lesson/language-layer-hooks-v1.json`

Gate:
`scripts/academic/l6-b7-language-layer-regression.cjs`

B7 declares latent companion capabilities. It does not translate the current
Web App, generate a second copy of every lesson, or activate a multilingual UI
before L12.

## 1. Audit baseline

The existing architecture already reserves `russianTwinRef`,
`englishResearchRef`, `vietnameseRescuePolicyRef` and `exposurePolicyRef` in
the Universal Lesson `language` namespace. The B4 registry points all eight
lesson types to `L6-B7#<typeId>` without changing their primary type.

The current source evidence is:

- Roadmap V3 includes `russian-twin-lesson`, `research-methodology`,
  `research-thesis`, `matching-russian-technical` and `nir-vkr` priorities.
- Russian has 26 rich lessons and 26 Russian titles, plus specialist dialogue,
  shadowing, speaking, handwriting, writing, review and exam engines.
- Research has 45 `elearning-v1.1` lessons across preparation and four master
  stages, with НИР/ВКР, paper, artifact and defense content.

These sources are compatibility references only. B7 does not rewrite or claim
to project them into the new contract.

## 2. Companion, not translated copy

A language hook aligns a stable source lesson, concept, term, step or evidence
unit with a scoped language action. It does not duplicate lesson navigation,
source identity, progress or assessment state.

The source artifact keeps its original language and version. Russian, English
or Vietnamese support is stored as a separate aligned output with provenance
and review status. Missing alignment remains unavailable; it is never filled
with an invented translation.

Technical language remains a secondary facet for mathematics, programming,
database, software design, ML/data, ASOIU/system and research. It cannot
reclassify those lessons as language lessons or merge the language block
policy into them.

## 3. Latent activation contract

B7 is declared at L6-B7; full learner UI remains owned by L12.

The states are declared, available, recommended, active, deferred and
unavailable. Default state is `declared`, default visibility is hidden until a
resolver finds a valid source alignment, and `autoActivate` is false.

Only these paths can activate a hook:

- explicit learner choice;
- instructor assignment;
- a pre-authorized deterministic study-plan policy with an immediate defer
  control.

AI may recommend a hook but cannot activate it. A recommendation explains the
language need, scope, learner action and expected cost before activation.
Missing hook data never blocks the unchanged source lesson or subject engine.

## 4. Language roles

Each hook declares source language, primary learning language, support
languages and target output language. Supported codes in this contract are
`vi`, `ru` and `en`; script, locale and fallback order remain explicit.

Russian Twin normally targets Russian output while Vietnamese may provide a
progressive rescue path. English Research normally targets English reading or
output while Russian/Vietnamese may explain context. Changing a support
language never changes source identity, official assessment requirements or
evidence identity.

## 5. Hook and alignment envelopes

The hook envelope binds stable hook/lesson/subject/type identity, objectives,
source bindings, alignment references, language roles, activation/exposure
policies, evidence, offline policy and provenance.

Each aligned unit binds source anchors, concepts, unit kind, source/aligned
output references, protected tokens, review status, content version and
provenance. Unit kinds include term, definition, claim, worked step,
instruction, dialogue turn, formula narration, code/query explanation,
research section and defense prompt.

Review states are:

- unreviewed-ai-draft;
- source-aligned;
- instructor-reviewed;
- official-source-original;
- needs-repair.

`official-source-original` is only for an original authoritative artifact. An
AI or learner translation cannot receive that label. Incompatible source
version changes move alignment to `needs-repair` instead of silently reusing
it.

Review authority is separate from mastery authority. A deterministic importer
may label only a verified unchanged authoritative artifact as
`official-source-original`; curators and instructors may approve alignment;
integrity checks may invalidate it; learners can propose user evidence; AI can
set only `unreviewed-ai-draft`. Even instructor-reviewed alignment does not
verify a learner artifact—B5 authority is still required.

## 6. Protected technical tokens

Code identifiers, APIs, SQL keywords, formula symbols, dataset fields,
citation keys, paths, versions, official program codes and official course
titles have explicit handling. A language layer can preserve them exactly,
add an explanation, show a localized label with the original, or require human
review.

The identity rule remains two-field:

- official Bauman source metadata: `09.04.01`;
- personalized learner display: `ИУ-5 · 09.04.01/11`.

No generic translator may transform code, formulas, queries, fields or
citations without an explicit domain adapter.

## 7. Trilingual glossary hook

Glossary identity is a stable `termId` plus concept, subject, source and
version—not surface-string equality. A record may align Vietnamese, Russian
and English while keeping source and review status.

Russian fields can carry stress, gender, case pattern, aspect, collocations
and pronunciation. English Research fields can carry search synonyms, paper
section usage, claim strength, collocations and citation usage.

Missing terms remain missing. Learner glossary items are user evidence until
reviewed and never overwrite the shared glossary.

## 8. Russian Twin

Russian Twin is a source-aligned companion for the current technical or
research lesson. Its modes are:

- technical terminology;
- concept twin;
- worked-step narration;
- classroom dialogue;
- lab-report language;
- error-repair language;
- oral defense;
- НИР/ВКР register.

The exposure sequence is recognize → comprehend → retrieve → produce →
defend. A twin unit contains Russian output, Vietnamese rescue, terminology,
learner action, evidence kind, review status and offline reference.

The dedicated Russian engine continues to own dialogue, shadowing, speech,
handwriting, writing, review and exam. B7 neither duplicates those tools nor
claims their source has migrated.

## 9. English Research Layer

English Research is scoped to literature search, paper reading, claim/evidence
annotation, methods/results language, citation/paraphrase boundaries,
scientific writing, conference defense and reproducibility README work.

It is not a whole-site English locale. It does not translate unrelated
navigation or replace official Bauman records. Search queries, claims,
methods, results, limitations and citations keep source anchors.

Polished English cannot compensate for an invalid method, unsupported claim,
weak evidence, missing source or unreproducible artifact. A missing paper or
citation is never synthesized and presented as real.

## 10. Exposure and Vietnamese rescue

Exposure levels are hidden, term-only, term-plus-rescue, aligned-snippet,
guided-output and independent-output. The resolver considers language state,
lesson objective, source availability, assessment disclosure, schedule,
accessibility and offline availability.

Rescue content can restore comprehension. It is progressively reduced when
independent target-language production is the objective. Transliteration may
help recognition but cannot replace required Cyrillic or source-script
evidence.

Formal assessment always caps exposure at its disclosure policy, even if a
richer companion pack is already cached.

## 11. Evidence boundary

Opening a hook, viewing a term, using rescue text or receiving feedback is not
Master-ready evidence.

A hook event can project to mastery only when:

1. a named objective maps it to a registered B4 type evidence output;
2. the learner produces an observable artifact;
3. an authorized B5 verifier verifies it.

Using Russian or English support for a technical objective does not create
language mastery. Using language support for research does not verify research
validity. Repair appends aligned evidence and does not rewrite source lessons
or prior attempts.

## 12. Assessment dimensions

Assessment can declare domain correctness, source integrity, target-language
comprehension, target-language production, terminology accuracy and
register/defense as separate dimensions.

Domain and language scores stay separate unless an official objective binds
them. A rescue or translated answer cannot satisfy target-language production.
Neither hook nor AI can expose protected questions, answers, hints or
solutions before submission. Post-submission feedback still follows the
active blueprint and focuses one repair at a time.

## 13. AI grounding and authority

AI may recommend a hook, draft alignment, explain a term, suggest a search
query, diagnose a language error, suggest source-linked repair or simulate
unverified oral practice.

AI cannot auto-activate, overwrite source, promote its draft to source,
fabricate a paper/citation, set verified, reveal a protected answer or silently
change a language role. Every retained AI output remains `ai-inference` with
context/source refs, creation time and review status.

The required context includes current lesson/subject, prerequisites, progress,
errors, weak topics, schedule, language state and НИР/ВКР state. This is a
semantic contract; the contextual AI runtime remains L13 work.

## 14. Offline and accessibility behavior

Resolved glossary, aligned text, transcripts, pronunciation audio, paper
metadata and source annotations use bundled, subject-pack or local-file
policies. Large audio/paper/media requires explicit authorization. Local
papers and notes remain zero-copy Direct Local Reader references.

Speech recognition, synthesis, translation and generative AI are optional.
Resolved alignment, deterministic exercises, evidence capture and recovery
continue offline without queued AI verification.

Every segment declares language and script for assistive technology.
Side-by-side alignment may stack while preserving source → companion → action
order. Audio has transcript and independent controls. Stress, grammar, claim
strength and token notes cannot rely on color. Mixed Cyrillic, Latin, code,
formula and citation spans keep explicit boundaries.

## 15. Eight type profiles

Every B4 lesson type has one B7 profile. Each profile selects allowed Russian
Twin and English Research modes, maps only to registered B4 evidence outputs,
declares protected tokens, and explains activation scope.

Profiles are allowed vocabularies, not content coverage claims. An individual
lesson instantiates only source-aligned hooks justified by its objective,
context and authorized activation.

## 16. Compatibility and forward ownership

Russian remains `read-only-reference-unprojected`; Research remains
`read-only-light-subject-unprojected`. B8 owns formal instance schema and
migration, B9 Subject Factory registration, B10 renderer/legacy bridge, B11
runtime regression, L12 full multilingual UX, and L13 contextual AI runtime.

B7 does not claim translated content coverage, automatic generation, runtime
rendering or full multilingual UI.

## 17. Rollback

Rollback removes the B7 contract, decision record, generated report and
workflow gate, then restores progress markers to B6. No learner state or
legacy source/runtime migration has run.

## 18. Acceptance

B7 passes only when:

1. B2/B4/B5/B6 and Roadmap refs match exact versions.
2. Hooks are latent, opt-in/deferable and AI cannot auto-activate them.
3. Language/source/alignment/protected-token/glossary contracts are explicit.
4. Russian Twin and English Research expose scoped modes and evidence rules.
5. Rescue, mastery, assessment and AI boundaries prevent false evidence and
   protected-answer leakage.
6. Offline and accessibility fallbacks remain deterministic.
7. Exactly eight profiles use only registered modes, capabilities/evidence and
   exact B4 forward refs.
8. Russian 26/26 titles, Research 45 eLearning lessons and Roadmap hook signals
   remain present without source/runtime modification.
9. B1-B6 remain green, B7 report is deterministic and L5 regression does not
   fail.

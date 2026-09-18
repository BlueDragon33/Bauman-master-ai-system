# Bauman Foundation — Learning Content Standard

This directory defines the pedagogical authoring constraints for lessons rendered by Russian and future Bauman subject apps.

It is intentionally independent from UI implementation. A future renderer may be HTML, PWA, AR, VR, mobile, desktop, or an AI-generated interface; the lesson contract should remain valid.

## Why this exists

The updated Russian Lesson 1 material demonstrates a strong reusable pattern: the same vocabulary and grammar are revisited through reading, games, listening/writing, dialogue, phrase building, and contextual reading. The foundation therefore treats examples, meaningful visuals, repeated multimodal encounters, retrieval, and application as first-class authoring requirements rather than optional decoration.

## Core rule

A concept should not be presented only as an isolated definition when a clearer example, meaningful visual, diagram, audio model, worked example, simulation, or realistic context can make it easier to understand and remember.

This does **not** mean every concept needs a photograph. Abstract mathematics may need a graph or derivation; control theory may need a block diagram and response curve; algorithms may need a trace or animation; research may need a figure, table, claim-evidence map, or reproducibility artifact.

## Lesson rhythm

The standard uses a reusable rhythm:

1. **Orient** — what the learner is about to understand or do.
2. **Observe** — see/hear a meaningful representation.
3. **Example** — inspect a concrete worked/contextual example.
4. **Interact** — manipulate, classify, match, build, compare, simulate, or respond.
5. **Retrieve** — attempt recall before full reveal when appropriate.
6. **Apply** — use the concept in a new or realistic task.
7. **Reflect** — inspect feedback or explanation.
8. **Review** — return through evidence-based SRS/Review Queue when needed.

A lesson does not have to render eight visible screens. The rhythm is a design contract, not a rigid UI wizard.

## Russian-specific authoring rules

### Vocabulary

Picturable vocabulary should normally include a meaningful visual plus contextual sentence. Source audio and source stress are preferred when available. If canonical stress or audio is missing, the UI must say so truthfully rather than inventing it.

A vocabulary item should be reusable in multiple directions when the data supports them:

- image → Russian word;
- Russian word → image;
- audio → word;
- audio → image;
- Russian → meaning;
- meaning/context → Russian;
- image → spoken sentence;
- sentence → comprehension/retrieval.

### Grammar

Do not teach grammar as a long theory list. Use a short rule or pattern, examples, recognition, manipulation, production, and error correction. Images/scenes should be used when they clarify reference or agreement, such as `мой дом`, `моя собака`, `моё фото`.

### Listening and speaking

Listening should connect sound to meaning and context. Where source audio exists, preserve provenance. Runtime TTS remains a support tool, not canonical pronunciation evidence. Speaking tasks should progress from model/shadowing to hidden-text production and role-play when appropriate.

## Bauman-subject authoring rules

The same standard applies outside language learning:

- Mathematics: formula + worked example + graph/geometry/derivation + application.
- Control: concept + block diagram + response plot + parameter exploration/simulation + technical Russian overlay.
- Algorithms: concept + trace + state visualization + code/task.
- Database: schema + relationship diagram + query example + editable task.
- Networks: topology + packet/path visualization + troubleshooting task.
- AI/ML: model concept + visual behavior + parameter experiment + interpretation.
- Research: source/claim + evidence/method + figure/table + critique/reproducibility task.

## Visual quality rule

A visual is valuable only when it carries learning meaning. Decorative imagery must never substitute for explanation or consume the space needed for the task. If an image is used, it should support identification, comparison, context, reasoning, recall, or application whenever possible.

## Evidence and mastery

Interaction produces evidence; it does not automatically produce mastery. Opening a card, watching an animation, clicking an image, or completing one easy drag action cannot silently mark a concept mastered.

Wrong answers, uncertainty, abandonment, pronunciation flags, and scheduled SRS may enter review only when supported by real learner evidence and the relevant subject policy.

## Accessibility

Meaningful images require alt text. Audio/video should have transcript/caption support when feasible. Color cannot be the only correctness signal. Interactions must support keyboard and touch. Motion-heavy representations need a reduced-motion path where applicable.

## AI-generated material

AI may draft examples, images, questions, explanations, and practice variants, but generated material must be marked in metadata, retain lineage to source/context, and must not silently replace canonical source material. AI-generated visual or textual content becomes publishable lesson content only after the authoring workflow accepts it.

## Relationship to the universal domain model

The lesson standard uses the same foundation entities:

- `source` for original material and provenance;
- `knowledge` for the concept;
- `competency` for what the learner should be able to do;
- `task` for interactions and applications;
- `evidence` for actual learner observations;
- `artifact` for learner outputs or transformed lesson assets;
- `workflow` for lesson/review/authoring flows.

The lesson standard must not introduce a parallel identity system.

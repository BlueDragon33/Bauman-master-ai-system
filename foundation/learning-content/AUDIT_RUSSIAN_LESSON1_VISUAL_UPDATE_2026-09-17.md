# Audit — Russian Lesson 1 visual/content update — 2026-09-17

## Source

`17_9_Урок 1 - РЯ сегодня.pptx`

This audit records only source-supported pedagogical structure. It does not claim that every image in the PPT has already been extracted into runtime assets.

## Newly emphasized source pattern

The updated material makes the learning sequence more concrete and contextual. Source-supported elements include:

- `Задание 21. Прочитайте слова` with people, places and everyday objects;
- `Игра` immediately after vocabulary exposure;
- `Задание 21в. Слушайте слова, и пишите` for listening-to-writing retrieval;
- dialogue around `Иван / Инна`, `фото`, `дом`, `собака`;
- `Составьте словосочетания` for phrase construction;
- another `Игра` after phrase work;
- contextual reading `Комната Ивана` containing room/object vocabulary and repeated possessive forms.

## Pedagogical conclusion

The valuable change is not merely a higher image count. The lesson now supports a reusable pattern:

`word exposure → visual/context association → game/manipulation → listening retrieval → dialogue → phrase construction → game/retrieval → contextual reading → production/review`

The same word or grammar relation can therefore be encountered through multiple channels instead of being shown once and forgotten.

## Visual targets supported by the source text

The source text itself supports meaningful visual/scene authoring around:

- people;
- photo;
- house;
- dog;
- room;
- window;
- cactus;
- table;
- lamp;
- laptop;
- parrot;
- other picturable Lesson 1 vocabulary.

Actual PPT visual assets must later be ingested with slide/source locators before being treated as canonical lesson assets.

## Architectural decision

1. Images are first-class learning representations, not decoration.
2. Picturable language should normally have meaningful visual context.
3. Abstract knowledge should use diagrams, graphs, worked examples or simulations instead of forced decorative imagery.
4. Every core concept cluster needs at least one real example and at least one retrieval/application step.
5. Visuals should become interactive when that interaction improves recognition, recall, reasoning or production.
6. Imported visuals require provenance; generated visuals require generation metadata and author approval.
7. Viewing an image or opening a card is not mastery evidence.
8. The lesson template describes content/task intent; interaction logic belongs to reusable renderer capabilities.

## Resulting foundation artifacts

- `BAUMAN_WEB_LESSON_STANDARD_V1`
- Russian Lesson 1 Golden Template
- `BAUMAN_LEARNING_COMPONENT_CAPABILITIES_V1`

These artifacts extend the foundation additively and do not alter current Russian runtime behavior in L9.

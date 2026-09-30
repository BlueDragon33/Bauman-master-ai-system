# Russian P1 Content Standard Gap Report

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## Evidence baseline
The current Russian Reference UI Gate audited the repository data successfully:
- 26 lessons, 8,000 vocabulary records, 1,320 assessment questions, 312 exercises.
- 1,220 basic speaking items, 4,164 dialogue items, 1,140 deep-speaking items, 1,058 speaking-link-index entries.
- No duplicate IDs were reported by the current data audit.
- All 1,220 speaking items link to known lessons.

## Strong content to preserve
- 26 lesson IDs already span R01–R26.
- Reading/academic audit found Russian-language material in all 26 lessons.
- Writing has 42 tasks distributed across handwriting, sentence, paragraph, email, report, thesis and error-log modes.
- Grammar has 20 entries and grammar-path has 19 structured progression entries.
- Dialogue, Deep Speaking and basic Speaking are already separated datasets.

## Major gaps against the Master Prompt

### GAP-CONTENT-001 — Vocabulary stress authority is missing
Current audit:
- 8,000/8,000 vocabulary rows have Russian term and pronunciation fields.
- **0/8,000 have an explicit stress field**.
- **7,670 multi-vowel entries have no acute-marked stress or explicit stress evidence**.
- pronunciation is present, but current samples are transliterations such as `Zdravstvuyte`; this is not canonical Russian stress authority.

Impact: P2 phonetics, P3 lexical schema and P6 pronunciation cannot safely treat the 8,000-word bank as stress-authoritative.

### GAP-CONTENT-002 — Lexical morphology/network depth is missing
Current content-contract audit reports:
- POS: 0/8,000.
- forms/inflections: 0/8,000.
- lesson links: 0/8,000.
- audio field: 0/8,000.

Impact: vocabulary is a large usable corpus but not yet the lexical network required by P2/P3.

### GAP-CONTENT-003 — Current curriculum is stage-level, not unit/micro-lesson graph
`curriculum.json` contains 6 stages + 6 modules while `lessons.json` contains R01–R26.

Impact: R01–R26 already exists as content identity, but P2 still needs Unit and Micro-Lesson structure, prerequisites, competencies, performance gates and remediation links.

### GAP-CONTENT-004 — Speaking evidence semantics are inconsistent
`speaking-coach.js` explicitly says ASR is not a pronunciation score, but `core.js` computes transcript similarity, renders “Điểm nói/Điểm nhại”, uses `score >= 70` as `ok`, and manual confirmation records `score:100, ok:true`.
`simulations.json` also states an 80% speech-recognition pass rule.

Impact: content wording + runtime evidence contract are inconsistent with P4/P6.

## Pedagogical rhythm
The repository has substantial orient/observe/example/interact/retrieve/produce material, but P1 does not infer full 8-step lesson compliance from record count. Detailed per-micro-lesson rhythm belongs to P2 after canonical lesson decomposition.

## P2 input
Use `AUDIT → NORMALIZE → ENRICH → LINK → VALIDATE`.
Do **not** generate another 8,000-word bank. Enrich the existing one through canonical IDs and verified linguistic authority.

# E132 · Canva-to-Runtime Mapping

Purpose: keep Canva visual references and repository implementation aligned for the Math Theory tab and slideshow.

Canva is the design reference. The repository is the runtime source.

## 1. Source boundary

Canva may define:

- visual mood;
- palette examples;
- slide layout references;
- typography hierarchy;
- composition examples;
- screenshots/mockups for review.

Canva must not define:

- durable lesson content;
- DataVault source names;
- `chapterId`, `lessonId`, or `programLectureId`;
- runtime import target;
- JavaScript behavior;
- actual production JSON records.

Runtime truth remains:

- `theory_lecture_frame.json` for Theory frame;
- `theory_lecture_content.json` for Theory content;
- `math_program_frame.json` / `math_program_map.json` for E130 program overlay;
- E132 CSS/JS for visual enhancement.

## 2. Canva deck template roles

Use this mapping when designing Canva reference slides.

| Theory role | Canva layout name | Runtime treatment |
|---|---|---|
| `problem_framing` | Cover / Problem Gate | large title, question card, metadata pills |
| `deep_essence` | Big Idea | one central idea, 2-3 support cards |
| `counter_intuition` | Contrast | warning ribbon, misconception vs corrected view |
| `real_bridge` | Engineering Bridge | math concept + Bauman application |
| `notation` | Symbol Sheet | notation card + meaning note |
| `core_formula` | Formula Hero | large formula/code-style card |
| `assumption_gate` | Checkpoint | assumption checklist |
| `mini_case` | Case Study | small engineering scenario |
| `interpretation` | Meaning Lens | explain what the formula/idea means |
| `simulation` | Simulation Preview | input/process/output layout |
| `common_mistakes` | Mistake Alert | red/amber warning structure |
| `application` | Lab Work | task + code + expected output |
| `practice` | Practice Task | prompt + checklist |
| `professor_qa` | Professor Q&A | question blocks + short answer space |
| `bridge` | Next Bridge | current idea -> next concept |
| `takeaway` | Final Takeaway | 3-line summary + next step |

## 3. Runtime file mapping

| Design concern | Runtime file |
|---|---|
| E132 palette/tokens | `assets/theory_skin/theory-ui-tokens-E132.css` |
| Reader polish | `assets/theory_skin/theory-reader-E132.css` |
| Slideshow deck CSS | `assets/theory_skin/theory-slideshow-E132.css` |
| Slideshow controls/keyboard | `assets/theory_skin/theory-slideshow-E132.js` |
| E132 contract | `THEORY_UI_SLIDESHOW_CONTRACT_E132.md` |
| Canva style guide | `E132_CANVA_THEORY_STYLE_GUIDE.md` |
| This mapping | `E132_CANVA_TO_RUNTIME_MAPPING.md` |

## 4. Visual acceptance checklist

For every future Theory slide design:

- One main idea is visible immediately.
- The slide title is readable in two seconds.
- Formula/code appears inside a distinct card.
- Lab Work tells the learner what to do, what to run, and what output to expect.
- Metadata is present but quiet.
- The design works at laptop width.
- The slide can be rendered from `theory_lecture_content` data, not from hard-coded UI copy.

## 5. Runtime acceptance checklist

Before accepting any E132 visual change:

- `BAUMAN_MATH_THEORY_E132.selfCheck()` returns `ok: true`.
- `BAUMAN_MATH_THEORY_E129.selfCheck()` still passes.
- E129 import target remains `theory_lecture_content`.
- E130 Program Frame route still opens.
- Presentation mode supports next/previous/escape.
- Reader mode remains scrollable and searchable.
- Storage/Importer still opens and exports content.

## 6. Expansion path

After E132 stabilizes:

1. Import the C01 sample bundle through E129.
2. Review slide rendering in reader and presentation mode.
3. Improve templates if the content looks crowded.
4. Expand content by chapter/program anchor.
5. Only then consider a dedicated Canva reference deck for each major program block.

End of mapping.

# E130 Program-Linked Content Authoring Guide

Purpose: guide future Math Theory content so it can be organized by the E130 program frame while still importing through the E129 Theory content pipeline.

This guide does not change runtime behavior.

## 1. Golden rule

Theory lesson content must still be imported into:

`theory_lecture_content`

Do not import new Theory lessons into:

`lessons.json`

Do not store long lecture slides inside:

- `math_program_frame.json`
- `math_program_map.json`

Those files are navigation/mapping overlays only.

## 2. How E130 relates to E129

E129 owns the Theory reader and importer.

E130 organizes the same content through program lecture anchors:

`block -> section -> programLectureId -> mapped chapterId -> lessonId/content`

A real lesson record should preserve the E129 fields and add E130 metadata.

Required E129 fields:

- `lessonId`
- `chapterId`
- `lessonTitle` or `title`
- `slides`

Recommended E130 fields:

- `programLectureId`
- `programLectureIds`
- `programAnchorTitle`
- `roadmapRole`
- `labWork`
- `sourceAnchors`

## 3. Recommended record shape

```json
{
  "lessonId": "MATH-VN-C01-vector_trong_khong_gian_-L01",
  "chapterId": "MATH-VN-C01-vector_trong_khong_gian_",
  "lessonTitle": "§1.1 · Vector như dữ liệu kỹ thuật",
  "title": "§1.1 · Vector như dữ liệu kỹ thuật",
  "programLectureId": "MATH-PROG-L02-vector-spaces-linear-maps",
  "programLectureIds": [
    "MATH-PROG-L02-vector-spaces-linear-maps",
    "MATH-PROG-L17-ai-machine-learning-math-foundations"
  ],
  "programAnchorTitle": "Không gian vectơ và Ánh xạ tuyến tính",
  "roadmapRole": "foundation_before_prep",
  "sourceAnchors": {
    "stageId": "vn",
    "disciplineId": "linear_algebra_data_space",
    "chapterId": "MATH-VN-C01-vector_trong_khong_gian_",
    "programLectureId": "MATH-PROG-L02-vector-spaces-linear-maps"
  },
  "labWork": {
    "required": true,
    "languages": ["Python/NumPy", "C++"],
    "tasks": []
  },
  "slides": []
}
```

## 4. Slide-role expectation

E129 recommends 16 slide roles per lesson:

1. `problem_framing`
2. `deep_essence`
3. `counter_intuition`
4. `real_bridge`
5. `notation`
6. `core_formula`
7. `assumption_gate`
8. `mini_case`
9. `interpretation`
10. `simulation`
11. `common_mistakes`
12. `application`
13. `practice`
14. `professor_qa`
15. `bridge`
16. `takeaway`

The importer may warn if the count/order is different. It should still be treated as a quality gate.

## 5. Lab Work requirements

Every E130-linked lesson should include a Lab Work section.

Lab Work should be practical and runnable, not decorative.

Recommended lab-work fields:

```json
{
  "required": true,
  "languages": ["Python/NumPy/SciPy", "C++"],
  "tasks": [
    {
      "taskId": "lab-vector-norms-python",
      "title": "Compute vector norms and cosine similarity",
      "language": "Python/NumPy",
      "goal": "Turn vector definitions into runnable code.",
      "expectedOutput": "A small table comparing Euclidean norm and cosine similarity."
    }
  ]
}
```

Each Lab Work task should include:

- `taskId`
- `title`
- `language`
- `goal`
- `expectedOutput`
- optional `starterCode`
- optional `validationChecklist`

## 6. Import package shape

Use this package wrapper when importing through E129:

```json
{
  "packageType": "bauman.math.theory_lecture_content.e130_patch",
  "target": "theory_lecture_content",
  "mode": "merge",
  "records": []
}
```

Valid modes:

- `merge`
- `replace`
- `patch`

Use `merge` for normal authoring.

## 7. Mapping discipline

Before creating a new lesson, check `math_program_map.json`:

1. Find the lesson `chapterId`.
2. Use its `primaryProgramLectureId` as the main `programLectureId`.
3. Put secondary anchors into `programLectureIds`.
4. Do not invent a new `chapterId`.
5. Do not rename old `chapterId` values to match the program frame.

## 8. Content-domain linking

A future production bundle can link the same `programLectureId` to multiple content domains:

- Theory: `theory_lecture_content`
- Formula: `formula_content`
- Exercise: `exercise_content`
- Simulation: `simulation_content`
- Application: `application_content`
- Professor QA: `professor_qa_content`
- Question bank: `question_bank_content`
- Review pack: `review_pack_content`

Use IDs and references. Do not copy large content into `math_program_map.json`.

## 9. Quality checklist before import

Before importing a record:

- `target` is `theory_lecture_content`.
- `lessonId` is unique.
- `chapterId` exists in `theory_lecture_frame.json`.
- `programLectureId` exists in `math_program_frame.json`.
- The `chapterId` is mapped to that `programLectureId` in `math_program_map.json`.
- Slides have meaningful titles and blocks.
- Lab Work exists and is runnable.
- There is no placeholder text such as TODO/FIXME/lorem.
- The record is academic content, not UI text.

## 10. What not to do

Do not:

- Put full lecture slides inside `math_program_frame.json`.
- Put full lecture slides inside `math_program_map.json`.
- Use `lessons.json` for new content.
- Rewrite `chapter_spine.json` for a single lesson.
- Change `programLectureId` names casually after content is mapped.
- Make Lab Work vague or impossible to run.

End of guide.

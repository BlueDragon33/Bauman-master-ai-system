# Math Learning Application Rebuild — LƯỢT 13 Exercise + Feedback Audit

## Goal
Integrate exercises into the lesson flow and provide meaningful feedback without fabricating grading data.

## Current source reality
- theory lessons audited: 18
- lessons with embedded `practice` slide: 17
- embedded practice slides: 17
- lessons with embedded `professor_qa` slide: 17
- canonical `exercise_content.json` records: 0
- canonical exercise sampleRecord: DRAFT schema example only

## Important limitation
The current canonical exercise source does not contain real exercise records with structured learner-answer metadata such as:
- answer type;
- correct answer;
- distractor rationale;
- misconception/concept mapping;
- wrong-answer feedback;
- retry rule.

Embedded theory practice slides contain learning tasks, but they are not a structured grading source.

Therefore the runtime must **not** invent correctness, scores, or “Sai. Đáp án …” feedback from prose.

## Existing safe behavior
`math-activity-studio.js`:
- prefers canonical exercise/question records when they exist;
- otherwise uses embedded semantic practice / professor-QA content from the current lesson;
- never renders DRAFT sampleRecord as learner data;
- exposes canonical solution only when the source actually provides one.

`math-activity-mastery.js`:
- stores only learner self-assessment;
- explicitly does not claim grading authority;
- does not infer correctness.

## LƯỢT 13 blocker
Meaningful automated wrong-answer diagnosis cannot honestly be completed until at least one canonical exercise record provides structured answer/feedback metadata.

This is a **content contract gap**, not a UI bug.

## Required hardening before automated grading
Canonical exercise records should optionally support:
- `answerType`
- `correctAnswer`
- `conceptIds`
- `formulaIds`
- `feedback.correct`
- `feedback.incorrect`
- `feedback.commonMistakes[]`
- `reviewStepId`
- `retryPolicy`

Free-response exercises may remain self-check/manual unless a deterministic validator is supplied.

## Gate status
- exercises remain lesson-scoped: PASS
- canonical source preferred over fallback: PASS
- DRAFT sample not rendered: PASS
- embedded practice fallback available for 17/18 theory lessons: PASS
- fake grading avoided: PASS
- automated wrong-answer diagnosis: BLOCKED BY SOURCE CONTRACT
- retry-to-concept routing: BLOCKED BY SOURCE CONTRACT

## LƯỢT 13 result
**PARTIAL — CONTENT CONTRACT BLOCKER**

The next hardening step is to define and validate the exercise feedback contract without inventing academic answers. Once real records adopt that contract, interactive grading can be enabled safely.

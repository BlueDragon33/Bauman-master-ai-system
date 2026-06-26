# Core Data Contract V6

Tài liệu này mô tả hợp đồng dữ liệu tối thiểu để một môn chạy được trên Bauman Universal Learning Core V1.

## 1. `curriculum.json`

Nên có:

```json
{
  "stages": [{"id":"vn", "title":"Giai đoạn Việt Nam", "goal":"..."}],
  "modules": [{"id":"m1", "stage":"vn", "title":"...", "summary":"..."}]
}
```

Bắt buộc với adapter:

- `getStages(db)` trả về mảng stages.
- `getModules(db)` trả về mảng modules.

## 2. `lessons.json`

Mỗi bài học nên có:

```json
{
  "id":"lesson_01",
  "stage":"vn",
  "title":"Tên bài",
  "summary":"Mục tiêu ngắn",
  "slides":[{"title":"Slide 1", "blocks":[{"type":"section", "heading":"...", "text":"..."}]}]
}
```

Adapter bắt buộc cung cấp:

- `lessonTitle(item)`
- `lessonSubtitle(item)`

## 3. Khái niệm / công thức / ngữ pháp

Core gọi chung là `concepts`. Từng môn tự ánh xạ:

- Tiếng Nga: `grammar.json`
- Toán: `formulas.json`
- ML: `concepts.json`

Adapter bắt buộc:

- `getConcepts(db)`
- `conceptTitle(item)`
- `conceptBody(item)`

## 4. `vocab.json`

Core không ép từ vựng phải là ngôn ngữ. Với Toán, đây có thể là thuật ngữ/ký hiệu/công thức.

Adapter bắt buộc:

- `vocabTerm(item)`
- `vocabMeaning(item)`
- `vocabSearchText(item)`

## 5. `exercises.json`

Adapter bắt buộc:

- `getExercises(db)`
- `exerciseTitle(item)`
- `exercisePrompt(item)`
- `exerciseAnswer(item)`
- `exerciseLevel(item)`

## 6. `tests.json`

Core hỗ trợ hai schema:

```json
{"questions":[{"question":"...", "options":["A","B"], "answer":0}]}
```

hoặc:

```json
[{"question":"...", "choices":["A","B"], "answerIndex":0}]
```

Adapter bắt buộc:

- `getTests(db)`
- `testQuestion(item)`
- `testChoices(item)`
- `testAnswerIndex(item)`
- `testExplanation(item)`

## 7. `simulations.json`

Dùng cho mô phỏng, lab, tình huống, bài nghe nói, thí nghiệm ảo.

Adapter bắt buộc:

- `getPractice(db)`
- `practiceTitle(item)`
- `practiceSubtitle(item)`
- `practiceGroup(item)`
- `practiceDifficulty(item)`

## 8. `videos.json` hoặc `media.json`

Adapter bắt buộc:

- `getMedia(db)`
- `mediaTitle(item)`
- `mediaCategory(item)`
- `mediaPurpose(item)`
- `mediaUrl(item)`

## 9. Quy tắc stage

Mọi item nên có `stage`. Adapter có thể đổi tên trường qua:

```js
stageOf(item){ return item?.stage || item?.phase || ''; }
```

Nếu item không có stage, core coi như dùng chung cho mọi giai đoạn.

# Russian Listening & Visual-First Learning Architecture

Status: active development contract

## Learning order

1. Nghe & nói: nghe mẫu → nhại → shadowing → đóng vai.
2. Chữ cái & viết tay: nhận mặt chữ in → đối chiếu chữ viết tay → luyện nét.
3. Bài học: phân tích nội dung sau khi đã có âm thanh và mặt chữ.
4. Từ vựng trực quan: hình/biểu tượng + giải thích tiếng Nga + ngữ cảnh sử dụng.
5. Ngữ pháp: rút mẫu từ câu đã nghe/nói.
6. Bài tập.
7. Kiểm tra.

## Vocabulary rule

For stage `vn`, learner-facing vocabulary must not present a direct Vietnamese translation as the flashcard answer. English glosses present in legacy datasets are metadata only and must not become the learner-facing answer.

Preferred learner-facing evidence:
- Russian term;
- audio/pronunciation;
- image or visual symbol;
- Russian explanation;
- situational explanation and usage;
- Russian example/dialogue.

## Data preservation

Legacy fields such as `vi`, `clue_en`, or imported bilingual dialogue metadata are not deleted in this slice. They may still be needed for migration, authoring, search, or later staged pedagogy. The runtime display contract prevents them from acting as the primary vocabulary answer.

## Gate

`subjects/russian/scripts/validate-listening-visual-first.mjs` is required by the Russian UI gate.

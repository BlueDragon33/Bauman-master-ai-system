# V8 LearningBridge QA Checklist

## Test độc lập
- Mở `subjects/russian/index.html` bằng Live Server.
- Kiểm tra sidebar có 6 tab: Tổng quan, Học tập, Đối thoại, Viết, Video/Audio, Từ vựng.
- Vào Học tập, nút Học thuật trên topbar mở dropdown 4 mục.
- Chọn Lý thuyết, Bài tập, Mô phỏng, Kiểm tra: mỗi mục hiển thị đúng nội dung.
- Vào Kiểm tra, chọn đáp án: bộ đếm phiên kiểm tra tăng đúng.

## Test với Main
- Từ Main, mở môn Tiếng Nga với task có `taskId`, `learningItem`, `durationMinutes`, `targetQuestions`, `targetScore`.
- Môn hiện banner `NHIỆM VỤ TỪ MAIN`.
- Môn tự chuyển đúng tab nếu nhiệm vụ có từ khóa Đối thoại, Viết, Video/Audio, Từ vựng hoặc Kiểm tra.
- Làm câu kiểm tra, Main nhận `BAUMAN_SUBJECT_PROGRESS`.
- Khi đủ 100 câu và đạt điểm mục tiêu, payload có `completed=true`.
- Khi điểm thấp, payload có `needsWeekendIntensive=true`.

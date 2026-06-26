# Russian Survival Master V8 · LearningBridge Report

## Vai trò
V8 là bản Tiếng Nga đầu tiên nối đúng với Main điều phối. Môn không tự dựng lộ trình riêng nữa, mà nhận nhiệm vụ học từ Main và phản hồi kết quả ngược lại.

## Nâng cấp chính
- Giữ khung V7.4: nút Học thuật trên topbar, không còn box trung gian.
- Giữ 6 tab chuyên môn: Tổng quan, Học tập, Đối thoại, Viết, Video/Audio, Từ vựng.
- Thêm LearningBridge V1:
  - Nhận `BAUMAN_ASSIGN_TASK` từ Main.
  - Gửi `BAUMAN_SUBJECT_READY` khi môn sẵn sàng.
  - Gửi `BAUMAN_SUBJECT_PROGRESS` khi làm kiểm tra hoặc bấm gửi tiến độ.
- Hỗ trợ nhận nhiệm vụ qua URL query: `taskId`, `courseId`, `stage`, `learningItem`, `view`, `learnTab`, `targetQuestions`, `targetScore`.
- Kiểm tra có phiên mục tiêu 100 câu, điểm mặc định 80%.
- Nếu điểm kém, payload phản hồi có `needsWeekendIntensive=true` để Main tăng ôn tập cuối tuần.

## Quy tắc hoàn thành
Một nhiệm vụ hoàn thành khi:

```text
answered >= targetQuestions && percent >= targetScore
```

Mặc định:
- `targetQuestions = 100`
- `targetScore = 80`

## Ghi chú thiết kế
Tổng quan đã bỏ danh sách module/lộ trình môn để tránh chồng với lộ trình lớn ở Main. Môn chỉ còn không gian kỹ năng và trạng thái nhiệm vụ từ Main.

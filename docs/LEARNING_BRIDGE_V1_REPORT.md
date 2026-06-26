# Learning Bridge V1 · Main điều phối ↔ Môn học phản hồi

## Mục tiêu
Main là nơi quyết định lộ trình lớn, môn học không tự dựng lộ trình riêng. Main tạo thời khóa biểu, gửi nhiệm vụ cụ thể sang môn, nhận kết quả kiểm tra và tự điều chỉnh lịch ôn tập.

## Luồng chuẩn
1. Main tạo ca học từ `DATA.courses` và thời khóa biểu.
2. Khi mở môn, Main gửi `BAUMAN_ASSIGN_TASK` qua `postMessage` và URL query.
3. Môn học nhận: môn gì, học mục nào, thời lượng bao lâu, ngày học, hạn kết thúc dự kiến, mục tiêu kiểm tra.
4. Môn học làm nhiệm vụ và gửi `BAUMAN_SUBJECT_PROGRESS` về Main.
5. Main ghi `subjectReports`, cập nhật `progress`.
6. Nếu kết quả kém hơn điểm mục tiêu, Main tự thêm ôn tập tăng cường vào thứ 7/chủ nhật. Nếu bình thường, Main thêm ôn tập gián đoạn.
7. Hoàn thành chỉ được ghi 100% khi phiên kiểm tra đạt tối thiểu số câu mục tiêu và điểm mục tiêu.

## Mặc định hiện tại
- Số câu kiểm tra kết thúc: 100.
- Điểm mục tiêu: 80%.
- Kết quả yếu: dưới điểm mục tiêu.
- Kết quả bình thường: từ điểm mục tiêu trở lên nhưng chưa đủ 100 câu.

## File sửa chính
- `assets/js/main.js`
- `assets/css/main.css`

## Hàm mới quan trọng
- `buildLearningTask(subjectId, context)`
- `sendTaskToSubject(win, task)`
- `receiveSubjectProgress(report)`
- `scheduleAdaptiveReviews(report)`
- `findReviewSlot(startDate, forceWeekend)`

## Gói môn học cần dùng
Môn học nên chạy trên `A0_Bauman_Core_Subjects_LearningBridge`, vì bản này có bridge nhận nhiệm vụ và gửi tiến độ về Main.

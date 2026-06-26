# Main PlanningBridge V2 Report

## Mục tiêu
Nâng Main từ LearningBridge thao tác đơn lẻ lên PlanningBridge: Main gửi mission có mục tiêu, thời lượng, số buổi, deadline; môn học phản hồi cảnh báo; Main có thể tạo lại lịch hoặc thêm học bù cuối tuần.

## Đã thêm
- `assets/js/planning-main.js`
- Cảnh báo tam giác trong ô lịch khi môn báo không đủ điều kiện.
- Panel cảnh báo ở Tổng quan.
- Hai hành động: `Tạo lại lịch`, `Học bù thêm giờ`.
- Mission Main gửi xuống môn có `sessions`, `durationDays`, `deadline`, `requiredOutput`, `targetQuestions`, `targetScore`, `antiCramming`.

## Luồng
1. Bấm một ca học trong thời khóa biểu.
2. Main gom các ca của cùng môn/học phần thành mission.
3. Main mở môn bằng iframe và gửi `BAUMAN_ASSIGN_TASK`.
4. Môn phân tích khả thi và gửi `BAUMAN_SUBJECT_WARNING` nếu thiếu thời lượng/ngày học.
5. Main lưu cảnh báo, hiện trong lịch và Tổng quan.
6. Người học chọn `Tạo lại lịch` hoặc `Học bù thêm giờ`.

## Ghi chú
Bản này xử lý ở lõi Main. Từng môn thật cần tích hợp `planning-bridge.js` để phân tích khả thi sâu theo đặc thù môn.

## Tích hợp thử
Trong gói Main V2 này, `subjects/russian/` đã được thay bằng Russian Survival Master V9 PlanningBridge để test ngay luồng Main ↔ Tiếng Nga.

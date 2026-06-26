# Russian Survival Master V9 PlanningBridge Report

## Mục tiêu
Nâng Tiếng Nga từ V8 LearningBridge lên V9 PlanningBridge: môn không chỉ nhận nhiệm vụ đơn lẻ, mà nhận mission gồm mục tiêu cấp độ, số ngày, số buổi, tổng phút học và deadline.

## Đã thêm
- `assets/planning-bridge.js`
- Adapter policy riêng cho Tiếng Nga: A0/A1/A2/B1/B2/C1 với phút/ngày khuyến nghị.
- Phân tích khả thi: đủ thời lượng hay chưa, đủ ngày giãn cách hay chưa, có nhồi nhét hay không.
- Lịch trình nội bộ môn học: chia phiên theo kỹ năng nghe, nói, từ vựng, ngữ pháp, đọc, viết và kiểm tra.
- Cảnh báo ngược Main qua `BAUMAN_SUBJECT_WARNING`.
- Nút yêu cầu Main `Tạo lại lịch` hoặc `Học bù thêm giờ`.

## Nguyên tắc
- Main giữ lộ trình lớn.
- Tiếng Nga tạo lịch trình nội bộ để đạt mission được giao.
- Nếu số ngày/phút không đủ, môn phản hồi cảnh báo thay vì giả vờ hoàn thành được.
- Hoàn thành học phần cần kiểm tra 100 câu và đạt điểm mục tiêu.

## Kiểm thử tay
1. Main mở Tiếng Nga từ một ca học.
2. Tiếng Nga hiện banner Mission từ Main.
3. Nếu mission A0→A2 trong thời lượng thấp, Tiếng Nga hiện cảnh báo.
4. Bấm `Yêu cầu Main tạo lại lịch` hoặc `Yêu cầu học bù thêm giờ` để gửi yêu cầu ngược về Main.

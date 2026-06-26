# Main PlanningBridge V3 Report

Bản này áp SubjectCore V9 Final vào Main.

## Nâng cấp chính

- Main gửi mission theo chuẩn `BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS`.
- Mission có đủ danh sách buổi, thời lượng, ngày cuối tuần, thống kê đã học và kết quả kiểm tra trước đó.
- Main chỉ gửi `isWeekEndSignal`, môn tự quyết định kiểm tra hay ôn củng cố.
- Main nhận cảnh báo từ môn và hiển thị tam giác cảnh báo trên Tổng quan/Lịch học.
- Main xử lý 2 nhánh: `Tạo lại lịch` hoặc `Học bù thêm giờ`.
- Main lưu route plan/route cards nếu môn gửi về.
- Ô lịch hiển thị nút đi thẳng tới nơi học khi có route cards.

## Nguyên tắc sư phạm

- Không ép kiểm tra ngày đầu.
- Không ép kiểm tra cuối tuần nếu môn báo chưa đủ nền.
- Ưu tiên chống nhồi nhét: học mới, ôn, tự kiểm, sửa lỗi.

## Ghi chú

Bản này là Main V3. Bước tiếp theo là áp SubjectCore V9 vào Tiếng Nga để tạo Russian V10 RouteCards Final.

# Russian Bauman V13.17 · Stage Gate Final

## Mục tiêu sửa
- Kiểm tra chỉ mở từ **Lịch trình hôm nay**.
- Không mở khóa 7 ngày tiếp theo. Hoàn thành phần hiện tại thì mở **phần tiếp theo**; hoàn thành phần cuối thì mở **giai đoạn tiếp theo**.
- Giai đoạn tự chia phần theo thời lượng: trên 21 ngày = 4 phần, 14-21 ngày = 3 phần, dưới 14 ngày = 2 phần.
- Điều kiện qua phần: phần 1 cần 1 Phổ thông; phần 2 cần 2 Phổ thông + 1 Tăng cường; phần 3 cần 3 Phổ thông + 2 Tăng cường + 1 Nâng cao; phần 4 cần 4 Phổ thông + 3 Tăng cường + 2 Nâng cao + 1 Chuyên sâu.
- Đề ưu tiên lấy từ giai đoạn/phần hiện tại và lessonId trong lịch/bài đang học.

## Kết quả sửa
- Thêm `stageGate` để lưu giai đoạn, phần, chặng lịch đã mở-học và đề đã đạt.
- Thêm `examGateSource` để phân biệt mở Kiểm tra từ Lịch hôm nay với mở trực tiếp từ tab.
- Thêm màn khóa Kiểm tra khi chưa đi từ lịch hoặc chưa hoàn thành chặng trước kiểm tra.
- Thêm panel Cổng học thuật trong Lịch hôm nay.
- Thêm panel tiến độ cổng trong Kiểm tra và nút **Mở khóa phần tiếp theo / Mở khóa giai đoạn tiếp theo**.
- Đồng bộ `tests.json` sang tỷ lệ 30/30/20/20.

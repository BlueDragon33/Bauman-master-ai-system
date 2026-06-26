# Russian Bauman V12.30 · Step 1 Safe Actions

## Mục tiêu
Thực hiện Bước 1 theo yêu cầu: các nút quan trọng phải có popup xác nhận, đổi nhãn Reset, bổ sung Reset cho Ôn tập và thêm dẫn đường trong Lịch trình.

## Đã sửa
1. Đổi nút **Tạo lại lịch** trong Lịch trình thành **Reset**.
2. Đổi nút **Tạo lại toàn mốc** trong Kiểm tra thành **Reset**.
3. Thêm popup xác nhận với nội dung: **Bạn có xác định ấn nút này?** và hai lựa chọn **Đúng / Không** cho:
   - Reset lịch trình
   - Reset toàn bộ mốc kiểm tra
   - Reset đề hiện tại
   - Nộp đề kiểm tra
   - Reset Ôn tập
   - Ẩn lịch trình phụ đạo
4. Thêm nút **Reset** trong tab **Ôn tập** để xóa trạng thái đã làm/cắm cờ/câu sai.
5. Trong popup **Lịch trình**, từng thẻ học có thêm nút **Dẫn đường tới mục tiêu**.

## Kiểm tra kỹ thuật
- `core.js` hợp lệ cú pháp.
- `subject-adapter.js` hợp lệ cú pháp.
- JSON hợp lệ.
- ZIP đóng gói không lỗi.

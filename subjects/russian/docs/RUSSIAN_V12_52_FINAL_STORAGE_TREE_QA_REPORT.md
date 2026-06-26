# RUSSIAN V12.52 FINAL STORAGE TREE QA REPORT

## Phạm vi lượt cuối
- Nâng tab **Lưu trữ** thành kho dữ liệu dạng cây thư mục.
- Giữ nguyên các nâng cấp lượt 1 và lượt 2: lịch trình hôm nay đầy đủ, dashboard Tổng quan Canva/pro UI, nút Thiết lập cuộc nói.
- Bổ sung lớp quản trị dữ liệu rõ ràng, không phơi JSON dài trên màn hình chính.

## Nâng cấp chính
1. **Kho cây thư mục**
   - Chia nguồn thành 4 cụm: Lõi môn học, Luyện tập nghe nói viết, Đánh giá và mô phỏng, Thư viện tra cứu.
   - Mỗi nguồn có icon, tên thân thiện, tên file JSON, số lượng bản ghi và trạng thái.

2. **Tìm kiếm dễ lấy đồ**
   - Có ô tìm toàn kho ở cây thư mục.
   - Có ô tìm trong nguồn hiện tại ở vùng preview.
   - Tìm theo tên file, nhãn nguồn, tiêu đề, nội dung bản ghi và JSON text.

3. **Preview sạch thay vì bảng code dài**
   - Màn hình chính hiển thị thẻ bản ghi.
   - Mỗi thẻ có nhãn đường dẫn, tiêu đề, mô tả, stage/level/group/category nếu có.
   - Bấm **Sửa** mới mở JSON từng mục.

4. **Quản trị dữ liệu đầy đủ**
   - Nhập/Thay file JSON.
   - Thêm mục mới theo skeleton phù hợp từng nguồn.
   - Sửa từng mục.
   - Xuất nguồn hiện tại.
   - Xuất toàn DB.
   - Khôi phục nguồn hiện tại.
   - Khôi phục toàn bộ DB.
   - Dán JSON mới trong modal riêng.

5. **Chống lỗi nguồn đặc biệt**
   - `tests.json` được đọc/sửa theo `questions[]`.
   - `curriculum.json` được đọc/sửa theo `stages[]` và `modules[]`.
   - Các mảng lớn như `vocab`, `speaking`, `tests.questions` được preview giới hạn để không làm phình UI.

## QA đã chạy
- `node --check` cho `core.js`: OK.
- `node --check` cho `subject-adapter.js`: OK.
- `python -m json.tool` cho `subject-manifest.json`: OK.
- Parse toàn bộ JSON trong `data/`: OK.
- Static render test cho 12 nguồn dữ liệu: OK.
  - curriculum: 12 mục
  - lessons: 26 mục
  - grammar: 20 mục
  - vocab: 8000 mục
  - exercises: 312 mục
  - tests.questions: 1320 mục
  - simulations: 18 mục
  - speaking: 1220 mục
  - handwriting: 48 mục
  - writing: 42 mục
  - videos: 24 mục
  - knowledge-index: 26 mục

## Phiên bản
- Version: **V12.52 Final Storage Tree QA**
- Base: **V12.51 Round 2 Canva Dialogue Setup**
- Trạng thái: bản cuối của đợt sửa 3 lượt.

# RUSSIAN V12.50 · ROUND 1 SCHEDULE INTEGRITY REPORT

## Phạm vi lượt 1
- Khóa lỗi nền cho nút **Lịch trình hôm nay**.
- Sửa tình trạng popup lịch trình có thể bị khuyết nội dung khi Main chỉ gửi session/block thiếu `cards`, `output`, `action`, hoặc route đích.
- Chuẩn hóa lịch fallback theo ưu tiên 2 tháng đầu ở Việt Nam: **Video/Audio → Nghe chủ động → Nhại/Shadowing → Đóng vai → Viết/gõ ít → Tự phản hồi**, chưa kiểm tra chính thức ngày đầu.

## Thay đổi chính
1. `assets/core.js`
   - Nâng version lên `V12.50 · Round 1 Schedule Integrity`.
   - Thêm lớp chuẩn hóa `normalizeRouteSession()` để tự bù đủ:
     - `date`, `minutes`, `phase`, `output`.
     - `blocks` đầy đủ thời lượng, hành động, đầu ra, route đích.
     - `cards` học hôm nay kể cả khi dữ liệu từ Main bị thiếu.
   - Thêm fallback theo loại buổi: `orientation`, `foundation`, `study`, `review_consolidation`, `assessment`.
   - Bổ sung các khối hiển thị trong popup:
     - timeline chặng học đầy đủ.
     - đầu ra bắt buộc.
     - chống nhồi.
     - luật học hôm nay.
     - thẻ học hôm nay có nút dẫn đúng tab.
     - tuần này và toàn bộ lộ trình.
   - Reset scroll modal khi mở để tránh mở lại ở vị trí cũ.

2. `assets/core.css`
   - Mở rộng modal lịch trình lên `1420px` tối đa, dùng `100dvh` để không bị cụt trên màn nhỏ.
   - Tách scroll vào `#modalBody`, giữ header/footer của lịch trình ổn định.
   - Làm lại timeline, thẻ học, panel đầu ra, panel luật học theo layout sạch hơn.
   - Thêm responsive cho màn dưới `1180px` và `720px`.

3. Metadata
   - Cập nhật `index.html`, `subject-manifest.json`, `subject-manifest.js`, `subject-adapter.js` sang `V12.50 Round 1 Schedule Integrity`.

## Kiểm thử đã chạy
- `node --check assets/core.js` OK.
- `node --check assets/planning-bridge.js` OK.
- `node --check assets/subject-adapter.js` OK.
- `node --check subject-manifest.js` OK.
- Parse toàn bộ JSON trong `data/*.json` và `subject-manifest.json` OK.

## Ghi chú cho lượt 2
- Tổng quan phần dưới vẫn sẽ được nâng tiếp theo hướng dashboard Canva/pro UI.
- Tab Đối thoại sẽ thêm nút thiết lập cuộc nói: nhóm, chủ đề, mức độ, số người, thời lượng.

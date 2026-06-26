# Russian Survival Master V12.7 · Final QA Stable

## Mục tiêu lượt cuối
- Nghiệm thu toàn hệ thống sau 3 lượt sửa lớn.
- Giữ nguyên nâng cấp V12.4, V12.5, V12.6, chỉ gia cố logic để tránh lỗi dây chuyền.
- Cập nhật phiên bản cuối và đóng gói sạch.

## Đã gia cố
1. **State/localStorage an toàn hơn**
   - Thêm `safeParseJson()` để tránh hỏng app khi localStorage có JSON lỗi.
   - Merge `testSession` và `recentAccess` an toàn khi nâng phiên bản.
   - `save()` không vỡ nếu trạng thái DOM chưa sẵn sàng.

2. **Clamp trạng thái theo dữ liệu thật**
   - Tự siết chỉ số slide, bài tập, câu test, hội thoại, dòng hội thoại, từ vựng, viết tay, nhiệm vụ viết.
   - Khi lọc làm mất item đang chọn, app tự quay về item hợp lệ.

3. **Nạp đủ nguồn dữ liệu**
   - Bổ sung `knowledge-index` vào `dataFiles`, manifest và Data Studio.
   - Data Studio nhận diện file hiện hành hợp lệ trước khi render.

4. **Tổng quan có QA strip**
   - Thêm dải kiểm tra nhanh: bài học, từ vựng, hội thoại, câu test.
   - Nếu nguồn lõi thiếu, Tổng quan báo ngay thay vì im lặng.

5. **Bridge lịch trình ổn định hơn**
   - Giữ các message cũ: `BAUMAN_ASSIGN_TASK`, `BAUMAN_PLANNING_MISSION`, `BAUMAN_TODAY_TASK`, `BAUMAN_MAIN_TODAY`.
   - Bổ sung nhận `BAUMAN_TODAY_GOAL`, `BAUMAN_SCHEDULE_TODAY`.
   - Export lịch đổi sang `russian_route_plan_v12_7.json`.

6. **Phím nhanh bổ sung**
   - Học tập/Lý thuyết: ←/→ đổi slide, ↑/↓ cuộn nội dung.
   - Trình chiếu: ←/→ đổi slide, ↑/↓/PageUp/PageDown cuộn, Esc đóng.
   - Đối thoại: ←/→ đổi câu.
   - Từ vựng: ←/→ đổi thẻ.

7. **Responsive và nút 3D cuối**
   - Siết lại sidebar trên màn hình nhỏ.
   - Modal lịch trình và trình chiếu bớt tràn.
   - Nút/card có trạng thái nổi, hover, active rõ hơn nhưng không lòe loẹt.

## Kiểm tra đã chạy trong sandbox
- `node --check` cho `core.js`, `subject-adapter.js`, `subject-manifest.js`.
- Parse toàn bộ JSON trong `data/` và `subject-manifest.json`.
- Kiểm tra ZIP integrity.

## Ghi chú sử dụng
- Cần mở bằng Live Server để `fetch(data/*.json)` hoạt động đúng.
- Nếu Main chưa gửi lịch, Tổng quan hiển thị: **Mục tiêu hôm nay: Chưa đồng bộ được**.
- Nếu trình duyệt từng lưu overlay JSON lỗi, V12.7 không làm vỡ app mà quay về dữ liệu gốc.

# Russian Survival Master V12.3 · Clean Frame Final

## Mục tiêu
Lượt cuối của chuỗi V12 Clean Frame: làm sạch các vùng còn thô/phình sau V12.1 và V12.2, tập trung vào **Viết**, **Video/Audio**, **Lưu trữ** và QA cuối.

## Đã xử lý

### 1. Tab Viết
- Làm lại thành `Writing Studio` hai tầng:
  - **Прописи / Viết tay Cyrillic** là mặc định.
  - **Học thuật** là chế độ phụ cho câu, email, báo cáo, НИР/ВКР.
- Canvas viết tay giữ pointer events, rê chuột/trackpad/bút cảm ứng.
- Thêm danh sách bài viết tay bên trái, mẫu chữ và vở viết lớn bên phải.
- Thêm lựa chọn màu bút, nét bút, hoàn tác, xóa nét, tải ảnh.
- Giảm vùng phình bằng `compact-panel`, scroll nội bộ và layout 2 cột có giới hạn.

### 2. Tab Video/Audio
- Làm lại thành `Media Studio`.
- Khôi phục rõ hai vai trò:
  - xem media;
  - quản lý nguồn URL/iframe.
- Modal thêm/sửa có trường riêng:
  - tiêu đề;
  - thể loại;
  - URL trực tiếp;
  - iframe/embed;
  - mục đích học.
- Nếu nguồn là link tìm kiếm hoặc URL không nhúng được, giao diện không báo trống vô nghĩa mà hiện hướng dẫn và nút **Mở trực tiếp**.

### 3. Tab Lưu trữ
- Làm lại thành `Data Studio` rõ tầng:
  - cột trái: nhóm nguồn JSON;
  - cột phải: trình sửa nguồn;
  - preview dữ liệu bên cạnh textarea.
- Thêm nhóm nguồn:
  - core;
  - practice;
  - assessment;
  - library.
- Thêm nút **Khôi phục nguồn** để khôi phục riêng file đang mở từ `data/<source>.json`.
- Vẫn giữ: nhập file, xuất nguồn, xuất toàn DB, khôi phục toàn bộ.

### 4. QA logic
- Cập nhật version nhãn trong `index.html`, `subject-manifest.json/js`, `subject-adapter.js`.
- Bổ sung state còn thiếu: `handwritingQuery`, `writingQuery`, `writingIndex`.
- Sửa lưu media để URL và iframe không bị ghi đè lẫn nhau.
- Kiểm tra cú pháp JS bằng `node --check`.
- Kiểm tra toàn bộ JSON trong `data/` hợp lệ.

## Không thay đổi trong lượt này
- Không thay đổi dữ liệu học thật.
- Không thay đổi PlanningBridge/RouteCards.
- Không đưa lịch trình ra khỏi popup.
- Không thêm nội dung học mới, chỉ làm sạch khung.

## Checklist test tay bằng Live Server
1. Mở tab Viết, rê chuột trên canvas có viết được không.
2. Đổi màu bút, đổi nét, hoàn tác, xóa nét, tải ảnh.
3. Chuyển Viết → Học thuật, chọn nhiệm vụ, gõ nháp không mất focus.
4. Video/Audio: chọn media, bấm mở trực tiếp, sửa nguồn URL/iframe.
5. Lưu trữ: chọn từng nguồn, preview đúng, sửa JSON, xuất nguồn.
6. Bấm Khôi phục nguồn, kiểm tra chỉ nguồn đang mở được khôi phục.
7. Kiểm tra lại Học tập và Lịch trình sau các thay đổi không bị vỡ.

## Kết luận
V12.3 là bản hoàn tất vòng **Clean Frame**: Tổng quan/Lịch trình đã gọn ở V12.1, Học tập/Slide/Đối thoại đã gọn ở V12.2, Viết/Video/Lưu trữ đã được làm sạch ở V12.3.

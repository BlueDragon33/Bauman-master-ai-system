# RUSSIAN V12.51 · ROUND 2 CANVA DIALOGUE SETUP REPORT

## Phạm vi lượt 2

Lượt 2 xử lý hai vùng được giao sau lượt khóa nền lịch trình:

1. Nâng phần dưới tab Tổng quan theo hướng Canva/pro dashboard.
2. Thêm nút Thiết lập cuộc nói trong tab Đối thoại mà không phá bố cục luyện nói chính.

## Thay đổi chính

### 1. Tổng quan phần dưới

- Thay cụm nhắc nhở sơ sài bằng dashboard học tập có KPI nhanh:
  - Nghe/Nói.
  - Video/Audio.
  - Từ vựng phụ trợ.
  - Ôn tập còn lại.
- Bổ sung luồng học 5 bước:
  - Mở tai.
  - Nhại câu.
  - Đóng vai.
  - Viết/gõ ít.
  - Chốt lỗi.
- Bổ sung nhóm thẻ kỹ năng có nút dẫn thẳng tới tab đúng:
  - Video.
  - Đối thoại.
  - Từ vựng.
  - Viết.
- Giữ ưu tiên 2 tháng đầu ở Việt Nam: nghe, nói, video là chính; từ vựng/ngữ pháp chỉ phụ trợ.

### 2. Tab Đối thoại

- Thêm nút `Thiết lập cuộc nói` ở header phòng luyện nói.
- Nút mở modal riêng, không chen vào luồng nghe/nhại/ghi âm chính.
- Modal cho phép chọn:
  - Nhóm ngữ cảnh.
  - Mức độ.
  - Chủ đề/cuộc nói.
  - Số người: 1, 2, 3, 4.
  - Thời lượng: 5, 10, 15, 20 phút.
  - Chế độ: nghe rồi nhại, shadowing + đóng vai, đóng vai mở rộng, phản xạ hỏi đáp nhanh.
  - Bối cảnh: lớp học, ký túc xá, phòng giáo vụ, đời sống, học thuật Bauman.
- Sau khi áp dụng, phòng luyện nói hiển thị tóm tắt cấu hình ngay dưới tên hội thoại.
- Bổ sung kế hoạch vi mô theo thời lượng: khởi động, nhại câu, đóng vai, sửa lỗi.

### 3. UX/UI

- Bổ sung CSS `V12.51 · Round 2 Canva overview + dialogue setup`.
- Dashboard mới dùng thẻ lớn, nhịp chia khối rõ, responsive cho màn hình nhỏ.
- Modal thiết lập có badge thời lượng, lưới form rõ, preview kịch bản trước khi áp dụng.

## File đã sửa

- `subjects/russian/assets/core.js`
- `subjects/russian/assets/core.css`
- `subjects/russian/assets/subject-adapter.js`
- `subjects/russian/index.html`
- `subjects/russian/subject-manifest.js`
- `subjects/russian/subject-manifest.json`
- `subjects/russian/README.md`
- `subjects/russian/FINAL_LAUNCH_NOTE.md`

## Kiểm thử

- `node --check assets/core.js`: OK.
- Toàn bộ JSON trong `data/`: parse OK.
- `subject-manifest.json`: parse OK.
- Không gửi file ở lượt này theo yêu cầu. File sẽ chỉ gửi ở lượt cuối.

## Việc còn lại cho lượt cuối

- Sửa tab Lưu trữ thành kho dạng cây thư mục.
- Bổ sung tìm kiếm, lọc loại dữ liệu, preview và thao tác nhập/thêm/xuất/khôi phục dễ hiểu hơn.
- QA tổng thể và đóng gói bản cuối.

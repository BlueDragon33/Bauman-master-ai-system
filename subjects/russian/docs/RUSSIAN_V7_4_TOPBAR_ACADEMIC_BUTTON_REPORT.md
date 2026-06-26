# Russian Survival Master V7.4 · Topbar Academic Button Report

## Mục tiêu
- Chuyển nút **Học thuật** từ box nội dung trong tab Học tập lên khu vực topbar theo yêu cầu giao diện.
- Bỏ toàn bộ nội dung trong box Học thuật cũ: tiêu đề, mô tả, chip “Đang mở”, khung details nằm giữa màn hình.
- Giữ chức năng 4 nhánh: Lý thuyết, Bài tập, Mô phỏng, Kiểm tra.

## Thay đổi chính
- `renderLearning()` giờ chỉ render nội dung của nhánh đang chọn, không còn tạo panel trung gian.
- Thêm `renderTopLearningMenu()` để sinh nút **🎓 Học thuật** trong topbar khi đang ở tab Học tập.
- Nút **Học thuật** mở dropdown chứa 4 nút con. Bấm nút con nào thì nội dung tương ứng hiện trực tiếp bên dưới.
- Các tab khác không hiển thị nút Học thuật trên topbar để tránh nhiễu.

## File đã sửa
- `subjects/russian/assets/core.js`
- `subjects/russian/assets/core.css`
- `subjects/russian/assets/subject-adapter.js`
- `subjects/russian/index.html`
- `subjects/russian/subject-manifest.json`

## Kết quả mong đợi
- Trong tab Học tập, topbar có đúng một nút **Học thuật**.
- Không còn box Học thuật nằm dưới topbar.
- Nội dung Lý thuyết/Bài tập/Mô phỏng/Kiểm tra mở trực tiếp, nhanh và rõ.

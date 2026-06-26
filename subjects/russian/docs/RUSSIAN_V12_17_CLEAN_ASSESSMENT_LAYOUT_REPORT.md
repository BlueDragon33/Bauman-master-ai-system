# Russian Survival Master V12.17 · Clean Assessment Layout

## Mục tiêu sửa

Dọn sạch bố cục Ôn tập/Kiểm tra sau phản hồi: vùng flag còn thô, trùng lặp, có khung rỗng lớn và sidebar bị nhồi bảng số.

## Đã sửa

1. Gỡ bảng flag trùng trong sidebar Học tập khi đang ở Ôn tập/Kiểm tra.
2. Bố cục lại Ôn tập thành 2 cột: cột flag nhỏ bên trái, câu hỏi bên phải.
3. Bố cục lại Kiểm tra thành 2 cột: cột flag 40 câu bên trái, câu hỏi bên phải.
4. Flag chỉ còn số, không có mô tả/thông tin bên trong.
5. Gỡ các pill thống kê phình và khung flag rỗng rộng quá mức.
6. Thu gọn bộ lọc, giữ chức năng nhưng không chiếm không gian học.
7. Giữ màu trạng thái: trắng, vàng, xanh, đỏ sau khi nộp bài.

## Kiểm tra kỹ thuật

- core.js: kiểm tra cú pháp.
- subject-manifest.js/json: cập nhật version.
- JSON data: parse hợp lệ.
- ZIP: đóng gói mới.

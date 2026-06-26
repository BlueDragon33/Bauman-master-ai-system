# Russian Bauman · V12.61 Final Closure QA Clean

## Phạm vi khóa lỗi
Bản này xử lý lại vòng cuối theo 4 lượt, 11 bước, tập trung vào: không chồng layout, không khuyết nội dung, không sót version cũ, không để tab Học tập bị tràn/chồng như các bản trước.

## Đã sửa
1. Đồng bộ version toàn hệ thống sang `V12.61 Final Closure QA Clean` trong `index.html`, `subject-manifest.json`, `subject-manifest.js`, `assets/core.js`.
2. Xóa lỗi version cũ: `V12.54`, `V12.57`, `V12.58`, `V12.59`, `V12.60`, `VV12.57`, `ROUND 1 OVERVIEW RESTORE` khỏi các file active chính.
3. Xóa block render cũ bị định nghĩa trùng: `renderTheory`, `renderExercises`, `renderPractice` hiện chỉ còn 1 hàm mỗi loại.
4. Tab Học tập: giữ cấu trúc trái/phải, danh sách full bên trái, nội dung chính bên phải.
5. Lý thuyết: slide chuyển thành strip ngang gọn, nội dung bài là vùng chính có scroll riêng.
6. Bài tập: bỏ danh sách lặp trong khung chính, chỉ hiển thị bài tập đang làm.
7. Nghe/Nói: chọn hội thoại bên trái, luyện câu bên phải, bản đồ câu chỉ là phụ lục nhỏ.
8. Tổng quan: tái cấu trúc thành `overview-v1261-closure`, không dùng cách nhồi card cho đầy; có mục tiêu, KPI, luồng học, hành động nhanh, tiếp tục học và trạng thái nhanh.
9. Lịch trình hôm nay: modal gọn, không phơi nhiều bảng chồng; mỗi chặng có thời lượng, nhiệm vụ, đầu ra và 1 nút hành động chính.
10. Gom checklist và đường lui thành một khối: nghe, nói, viết/gõ, tự sửa, còn 30 phút, còn 15 phút, kết thúc buổi.
11. Các panel lịch cũ vẫn được giữ hàm để tránh phá tham chiếu, nhưng không còn nằm trong luồng render chính của modal V12.61.

## Checklist kỹ thuật
- `node --check assets/core.js`: OK
- `node --check assets/subject-adapter.js`: OK
- `node --check assets/planning-bridge.js`: OK
- `node --check assets/russian.js`: OK
- `node --check subject-manifest.js`: OK
- `subject-manifest.json`: parse OK
- Tất cả JSON trong `data/`: parse OK
- ZIP: nén và kiểm tra giải nén OK

## Kiểm soát chồng chéo
- Không còn `learn-canva-quick` trong file active chính.
- Không còn 3 cụm cấm: `Chọn đúng bài`, `Làm ngay trong khung`, `Chốt bằng hành động`.
- Không còn nhiều định nghĩa trùng cho `renderTheory`, `renderExercises`, `renderPractice`.
- Modal lịch V12.61 không render các khối cũ: `route-output-panel`, `route-focus-panel`, `today-practical-strip`, `route-contract-panel`, `route-continue-panel`.

## Ghi chú kiểm thử
Kiểm thử thực hiện bằng static/parse/syntax checks trong môi trường sandbox. Không tuyên bố đã kiểm thử tương tác thủ công bằng trình duyệt thật trên máy người dùng.

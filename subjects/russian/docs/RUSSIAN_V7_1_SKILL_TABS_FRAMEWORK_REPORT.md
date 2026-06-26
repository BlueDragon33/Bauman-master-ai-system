# Russian Survival Master V7.1 · Skill Tabs Framework

## Lý do sửa
Bản V7 chỉ có 4 tab ngoài cùng nên Đối thoại, Ngữ pháp và Luyện chữ bị nhét sâu hoặc chưa hiện thành trục kỹ năng riêng. Với môn Tiếng Nga Bauman, đây là thiếu sót lớn vì khả năng đối thoại quyết định việc sống, hỏi bài, làm seminar và bảo vệ luận văn.

## Đã sửa ở khung sườn
- Thêm tab ngoài cùng: **Đối thoại**.
- Thêm tab ngoài cùng: **Ngữ pháp**.
- Thêm tab ngoài cùng: **Luyện chữ**.
- Giữ các tab: Tổng quan, Học tập, Video/Audio, Từ vựng.
- Tách `speaking.json` sang tab Đối thoại để luyện nói sâu, không còn bị giấu trong Học tập > Mô phỏng.
- Tách `grammar.json` sang tab Ngữ pháp để tra/luyện sâu, không còn chỉ là phần phụ trong Lý thuyết.
- Thêm `handwriting.json` làm dữ liệu nền cho luyện chữ Cyrillic.

## Controller
- Vẫn dùng một state, một render, một event delegation.
- Không dùng onclick inline.
- Thêm state riêng cho dialogue/grammar/handwriting để tránh đè filter của Học tập.

## Tab Đối thoại
- Có bộ lọc nhóm, mức độ, tìm kiếm.
- Có phân tầng luyện: nghe hiểu, nhại, đổi vai, phản xạ, tự nói.
- Mở hội thoại bằng modal, có nghe toàn bài bằng Web Speech nếu trình duyệt hỗ trợ.

## Tab Ngữ pháp
- Đọc trực tiếp từ `grammar.json`.
- Hiển thị quy tắc, ví dụ, bài luyện và lỗi thường gặp.

## Tab Luyện chữ
- Đọc từ `handwriting.json`.
- Có chữ cái, từ/cụm, câu mẫu và mẫu học thuật.
- Giai đoạn sau có thể thêm canvas luyện nét/chấm chữ.

## Kiểm tra kỹ thuật
- `core.js`: pass syntax check.
- `subject-adapter.js`: pass syntax check.
- JSON mới: hợp lệ.

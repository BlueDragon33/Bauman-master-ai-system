# Russian Bauman Survival Master V7

## Vai trò

V7 là bản dành riêng cho môn Tiếng Nga Bauman. Khác với V6.1 Clean Release, bản này không đóng vai trò làm khuôn nhân môn mới. Nó là gói học Tiếng Nga chủ đạo để người học có thể tồn tại và tiến dần tới học thuật kỹ thuật tại Bauman.

## Nền kỹ thuật

- Runtime: `assets/core.js`, lấy từ Bauman Universal Learning Core V1.
- Adapter riêng: `assets/subject-adapter.js`.
- Theme riêng: `assets/russian.css`.
- 4 tab ngoài cùng: Tổng quan, Học tập, Video/Audio, Từ vựng.
- Không có tab phụ ngoài router để tránh nhấp nháy, nhân nút và lỗi ẩn hiện.

## Dữ liệu giữ nguyên

- `curriculum.json`: 6 giai đoạn học.
- `lessons.json`: 26 bài học.
- `grammar.json`: 20 mục ngữ pháp/khái niệm.
- `vocab.json`: 8000 thẻ từ vựng.
- `exercises.json`: 312 bài tập.
- `tests.json`: 1320 câu kiểm tra.
- `simulations.json`: 18 mô phỏng.
- `speaking.json`: 1220 hội thoại.
- `videos.json`: 24 nguồn video/audio.

## Khác V6.1 ở đâu?

V6.1 là bản lõi chung sạch để nhân sang môn Toán và các môn khác.

V7 là bản học Tiếng Nga chuyên dụng, nhấn vào:

1. Sinh tồn ban đầu: sân bay, ký túc xá, siêu thị, bệnh viện, thủ tục.
2. Dự bị STANKIN: nghe lớp, hỏi giáo viên, làm bài kiểm tra, diễn đạt ngữ pháp nền.
3. Bauman HK1-HK2: nghe giảng, đọc đề bài, làm việc nhóm, báo cáo kỹ thuật.
4. Bauman HK3-HK4: НИР, ВКР, bảo vệ luận văn, thuật ngữ AI/tín hiệu/tự động hóa.

## Cách mở

Mở bằng VS Code Live Server tại:

`subjects/russian/index.html`

Không nên mở trực tiếp bằng double-click nếu trình duyệt chặn `fetch()` JSON.

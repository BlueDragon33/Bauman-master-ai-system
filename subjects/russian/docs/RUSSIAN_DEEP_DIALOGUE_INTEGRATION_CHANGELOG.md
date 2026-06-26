# Russian Bauman Deep Dialogue Integrated

Ngày: 2026-06-08

## Nguyên tắc tích hợp

- Giữ `data/speaking.json` cho tab **Nghe/Nói** cơ bản: nghe chậm, nhại chuẩn, luyện từng câu.
- Thêm `data/dialogue-bauman-az.json` cho tab **Đối thoại**: hội thoại Bauman A-Z đầy đủ.
- Thêm `data/deep-speaking-bauman.json` và `data/speaking-link-index.json` cho luyện sâu trong tab **Đối thoại**.
- Dữ liệu lớn được lazy-load, không tải lúc mở app.

## File sửa chính

- `assets/core.js`: lazy-load, tách nguồn Nghe/Nói và Đối thoại, thêm Deep Speaking panel, ôn tập yếu, storage tùy chọn.
- `assets/subject-adapter.js`: khai báo optional data files và metadata.
- `subject-manifest.json/js`: khai báo capability mới.
- `assets/russian.css`: style riêng cho Deep Dialogue, không đè layout cũ.

## Kết quả dữ liệu

- speaking.json: 1220 mục, giữ cho Nghe/Nói cơ bản.
- dialogue-bauman-az.json: 4164 mục, dùng cho Đối thoại.
- deep-speaking-bauman.json: 1140 unit luyện sâu.
- speaking-link-index.json: 1058 key cầu nối.

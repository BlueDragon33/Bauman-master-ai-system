# Russian Bauman · Assessment Font Fit / No Clip HOTFIX

- Giảm size câu hỏi trong Ôn tập/Kiểm tra thêm một nhịp để cân hơn.
- Dựng lại khung nội dung phải theo kiểu flex cố định: câu hỏi/đáp án cuộn trong `question-scroll-main`.
- Feedback, giải thích, kết quả có cuộn riêng, không đẩy vỡ khung.
- Thêm chống tràn chữ: `overflow-wrap:anywhere`, `white-space:normal`, `hyphens:auto`.
- Giữ panel flag trái, nội dung chính phải ổn định, không dịch layout khi câu hỏi dài.

Ghi chú: sandbox đã check cú pháp JS và parse JSON. Phần nhìn thật cần kiểm tra thêm bằng Live Server trên máy người dùng.

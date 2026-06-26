# V13.16 Route Bound Exam

Đợt này ràng buộc lại Kiểm tra vào Lịch hôm nay:

1. Chặng có nhãn/key Kiểm tra/test/exam/assessment trong lịch sẽ mở đúng tab `Học tập > Kiểm tra`, không bị rơi sang Ôn tập.
2. Chặng Ôn tập/mini-check/chữa lỗi/phụ đạo vẫn mở đúng `Học tập > Ôn tập`.
3. Nút trong lịch tự truyền `paperType/examPaperType` để mở đúng dạng đề hôm nay.
4. Mapping dạng đề:
   - easy hoặc mặc định: Phổ thông 20 câu.
   - medium hoặc 40 câu: Tăng cường 40 câu.
   - hard hoặc 60 câu: Nâng cao 60 câu.
   - expert hoặc 100 câu: Chuyên sâu 100 câu.
5. Lịch hôm nay có thẻ gọn “Kiểm tra hôm nay” khi session có chặng kiểm tra, kèm nút mở đúng đề.
6. Sau khi nộp, câu sai vẫn đi về Ôn tập/phụ đạo theo logic đã có.

Kiểm tra: core.js, planning-bridge.js, subject-adapter.js, subject-manifest.js syntax OK; JSON OK; CSS cân bằng ngoặc OK.

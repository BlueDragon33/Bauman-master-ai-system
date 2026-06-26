# Russian Bauman V12.37 · Safe Round 3 Media Route

## Phạm vi lượt 3
Chỉ xử lý hai phần đã chốt: làm đẹp tab Video/Audio và hoàn thiện khu Lịch trình hôm nay.

## Đã làm
1. Khôi phục và nâng cấp `renderMedia()` thành Media Hub: hero bắt mắt, thẻ video đẹp hơn, player rõ, hướng dẫn xem/nghe theo 3 bước.
2. Khôi phục `renderVocab()` an toàn để tránh lỗi thiếu hàm khi mở tab Từ vựng.
3. Lịch trình hôm nay: mỗi block timeline có nút `Đi tới mục tiêu`; mỗi thẻ học có nút `Dẫn đường tới mục tiêu` và `Mở nội dung`.
4. Thêm suy luận route theo nội dung block: video/audio → tab Media, nghe/nói/đóng vai → Dialogue, viết → Writing, từ vựng → Vocab, ngữ pháp → Learning.
5. CSS responsive cho Media Hub và Route Cards.

## Kiểm tra
- core.js hợp lệ cú pháp.
- subject-adapter.js hợp lệ cú pháp.
- subject-manifest.json và toàn bộ data JSON hợp lệ.
- ZIP test không lỗi.

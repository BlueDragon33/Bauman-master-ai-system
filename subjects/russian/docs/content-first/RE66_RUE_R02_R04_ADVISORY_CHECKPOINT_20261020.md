# RE66 — Kết nối Russian Expert Engine với Bauman CONTENT-FIRST

**Bản candidate, ngày 20/10/2026.** Dùng đúng hai repo theo Blueprint OS 1.3.0, **không chạy Work/Codex, không GitHub-hosted Actions, không merge/publish, không tự cấp chứng nhận RU03**.

## 1. Nguồn và quyền sở hữu

- Bauman là chủ duy nhất của sáu câu R02–R04: `subjects/russian/data/listen-write-lessons.json`, source owner Git blob `f041ceebc32245438f93142014f347440ebe2599`; RE61 source-review blob `a4eda4e8bcc075fd0b29c82102536698a1325e4a`; map candidate blob `7a71e138dc4972816dae79df1adc73ffc12e8422`.
- Source baseline commit Bauman: `3c2f5072fe55a6ec20c9c7792c7dbe2899988b43`. RUE contract baseline commit: `2cd2be269e3ca1a32f436d373f372d45e28ca352`. Đây là **baseline**, không được nhầm với HEAD khi chạy trên checkout thực.
- Bauman exporter: `engine/review/re66-rue-content-first-bridge.mjs`. RUE consumer: `src/pilots/ru03-bauman-r02-r04.mjs` trong repo `BlueDragon33/Blueprint-Russian-Expert-Engine` ở nhánh draft PR #5.
- CLI readback: `engine/review/re66-bauman-rue-cli.mjs`; RUE `src/pilots/ru03-bauman-re66-cli.mjs`. Hai CLI kiểm HEAD thực, xuất/đọc JSON offline; không tự gửi file hoặc tạo dịch vụ.
- Gate Node tùy chọn (cần **hai checkout thực đã có sẵn**): `tests/russian-re66-rue-cross-repo-offline.mjs`; chỉ chạy khi ba biến `BAUMAN_RUE_OFFLINE_CHECKOUT`, `BAUMAN_RE66_EXACT_BAUMAN_HEAD`, `BAUMAN_RE66_EXACT_RUE_HEAD` được điền từ HEAD kiểm chứng. **Chưa chạy gate này trong phiên**, không yêu cầu người dùng thực hiện thay.

## 2. Giá trị chuyên môn đã đưa vào RUE

Sáu mục R02–R04 đã có tham chiếu tra cứu Gramota.ru cụ thể:

- R02_NAME: `зову́т` (dạng động từ);
- R02_INTRO: `здра́вствуйте` (từ chào);
- R03_REG: `регистра́ция` (chỉ lemma; câu nguồn có dạng biến cách `регистрацию`, chưa được xác nhận từ link lemma);
- R03_DOCS: `пожа́луйста` (từ tình thái lịch sự);
- R04_METRO: `метро́` (danh từ không biến cách);
- R04_DOCTOR: `врач` (danh từ một âm tiết).

Bằng chứng này là **nguồn từ vựng có giới hạn**, không phải đánh giá toàn bộ ngữ pháp, ngữ điệu, phát âm, cấp độ hay quyền audio. Các báo cáo vẫn ghi `grammar=UNVERIFIED`, `stress=UNVERIFIED` theo nghĩa cả câu chưa được chuyên gia xác nhận, `phonetics=UNVERIFIED_NO_HUMAN_VOICE`, `audioQa=BLOCKED_NO_IMMUTABLE_LICENSED_RECORDING`. Không ghi phản hồi này vào learner mastery.

## 3. Benchmark mù và giới hạn

- RUE `data/benchmarks/re66-r02-r04-blind-challenges.v1.json`: 12 thử thách tiếng Nga, gồm câu gốc, biến thể, trọng âm/đúng ngữ cảnh. Tình huống do nhóm phát triển tạo, **chưa có nhãn độc lập**.
- RUE `src/pilots/re66-independent-benchmark-gate.mjs` khóa metric: `measuredRecall=null`, `measuredPrecision=null`, `measuredErrorDetectionAccuracy=null`. Không có gán nhãn độc lập và adjudication thì **không được tuyên bố năng lực chuyên gia đã được nghiệm thu**.
- Tương tác mô phỏng V8: **6/6 gói và cả hai chiều advisory PASS** ở cấp mã logic; thay tên trong câu/tự cấp HUMAN_RU03 đều bị chặn. V8 dùng digest giả lập cho vận chuyển; **không phải Node SHA-256 đầy đủ, không phải Chromium**.
- Khi kiểm thử Node offline trên exact HEAD, cần kiểm hash Git blob, thực thi RUE và xác minh readback. Không lặp các gate UI/Chromium đã PASS trên SHA cũ, nhưng cũng không chuyển PASS cũ thành nghiệm thu mới.
- RUE vẫn là nền tảng **AI advisory/source QA**, chưa chứng minh đã có mô hình huấn luyện hoặc tự động kết luận ngữ pháp/phát âm chính xác. Đây là điểm cần phát triển thực chất tiếp theo, không tạo một pipeline kiểm định thứ hai.

## 4. Quy tắc phát hành

Người có thẩm quyền và bằng chứng HUMAN_RU03 nằm ở Bauman RE45/RE50, không chuyển cho RUE. RE62–RE65 audio/người tình nguyện được **giữ BLOCKED**, không tự kích hoạt lại việc tìm người ngoài, không public giọng nói hoặc quyền cá nhân. RUE chỉ cung cấp advisory để tiết kiệm khối lượng đánh giá thường xuyên; chứng nhận chỉ sau benchmark độc lập và các gate có thẩm quyền.

**Next technical gate:** kiểm thử Node offline của **hai checkout thật, đúng SHA**, giữ đầy đủ kết quả BLOCKED của ngữ âm/audio, rồi mới xét cải tiến kiểm định ngôn ngữ thực bằng nguồn tham khảo và gold-set độc lập.

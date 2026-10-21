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


## RE66 readback root-cause repair (20/10/2026)

**Phát hiện:** Cổng SHA của hai checkout trước đây chỉ dùng `git rev-parse HEAD`, nên một thư mục có file đã sửa nhưng chưa commit vẫn có thể được báo là đang chạy source đúng SHA. Bộ nhận lexical evidence cũng chưa khóa đúng dấu trọng âm/URL theo từng item — người sửa có thể tính lại checksum rồi tráo một mục từ.

**Đã sửa trên hai nhánh candidate:**

- Bauman `re66-bauman-rue-cli.mjs`, RUE `ru03-bauman-re66-cli.mjs` và bài QA chéo kiểm `git status --porcelain=v1 --untracked-files=all`; checkout có thay đổi hoặc file không được theo dõi đều **BLOCKED**.
- `re66-rue-content-first-bridge.mjs` ràng buộc chính xác sáu cặp từ, dạng trọng âm, scope và URL Gramota; các test tạo lại bundle SHA sau khi tráo trọng âm/URL nhưng vẫn phải **REJECT**. Không phong chuẩn ngữ âm/audio.
- Thêm `test-re66-exact-head-clean-checkout.mjs` và RUE `re66-exact-head-clean-checkout.test.mjs` kiểm trường hợp thiếu bất biến HEAD/dirty.
- Bằng chứng thật có trong phiên: **Node v22 SHA-256 cho sáu câu nguyên văn 6/6 khớp**. Mô phỏng V8 đối chiếu giữa hai module và chống giả stress/URL/claim **PASS** nhưng dùng giả lập hash cho hợp đồng vận chuyển. **Full Node cross-repo exact SHA: NOT_TESTED** vì container không có hai checkout và DNS đến GitHub raw không hoạt động.

Không yêu cầu chạy PowerShell, không GitHub-hosted Actions, không Work/Codex, không sửa canonical, runtime, learner mastery; không approve, merge, ratify hay publish.


### RE66 follow-up — three-fingerprint guard (20/10/2026)

Từ chính sáu item R02–R04 trong canonical `listen-write-lessons.json`, map tình huống và `RE61→RE45 stableStringify/fingerprint`, đã dựng lại trên môi trường phân tích và tính bằng SHA-256 thật. Đối chiếu **Python hashlib và Node.js crypto cho 18/18 fingerprint** (mỗi item: `sourceRevision`, `textFingerprint`, `reviewFingerprint`): khớp. RUE dùng 18 giá trị khóa này, không còn chỉ yêu cầu chuỗi hex hợp lệ. Bauman test `test-re66-rue-content-first-bridge.mjs` nay đối chiếu lại 18 fingerprint với handoff RE61 trực tiếp khi chạy ở checkout thật.

**Phạm vi chứng cứ:** đã kiểm tra phép tính fingerprint trên dữ liệu tái dựng từ tệp GitHub; không tuyên bố chạy toàn bộ RE61 trong checkout, không thay chứng cứ Node cross-repo. Container chỉ có Node v22.16.0 trong khi `Blueprint-Russian-Expert-Engine/package.json` yêu cầu Node 24. Không lấy được checkout GitHub qua DNS; full Node cross-repo trên hai SHA candidate `NOT_TESTED`. Không yêu cầu người dùng PowerShell, không tự nâng gate RU03, không Actions/approve/merge/publish.


## RE66 — canonical inbound request guard (20/10/2026)

**Nguyên nhân gốc xác định bằng mã nguồn:** bộ nhận `verifyRe66RueAdvisoryBundle(request,bundle)` trước đây chỉ so sánh checksum của **request do chính người gửi cung cấp**. Người gửi có thể đổi `Меня зовут Нам.` thành `Меня зовут Сара.`, tính lại `requestSha256`, `advisorySha256` và `bundleSha256` rồi tạo một báo cáo có vẻ hợp lệ, bởi RE66 chỉ so sánh report với request đã bị sửa. Kết quả đó không chứng minh nguồn canonical RE61.

**Sửa đúng owner:** tại `re66-rue-content-first-bridge.mjs`, mỗi lượt nhận xây lại `buildRe66RueRequest()` từ owner, map, RE61 Git blobs có pin và bắt buộc `request.requestSha256 === canonicalRequest.requestSha256`; chỉ kiểm checksum nội bộ là không đủ. Dữ liệu trống hoặc sai cấu trúc trả `ok=false`, không cấp quyền. `test-re66-rue-content-first-bridge.mjs` bổ sung thay R02_NAME rồi **tính lại toàn bộ hash** và các trường hợp null/malformed.

**QA thực hiện trong phiên:** V8 chạy trực tiếp logic verifier với nguồn đóng băng do kiểm thử cấp: request gốc PASS, request giả thay tên & tái băm bị REJECT, null & malformed bị REJECT. Mã module/test mới V8 syntax PASS. **Không gọi đây là Node 24 cross-repo PASS**: container hiện tại có Node 22.16.0, không có hai checkout exact SHA và GitHub DNS trực tiếp bị chặn. Source phục vụ mô phỏng có hash giả lập, nên phép thử chỉ chứng minh **logic kiểm soát**.

Không sửa dữ liệu lesson, audio, UI, learner mastery, không Actions/Work/Codex/merge/ratify/publish. `RU03=BLOCKED`; `CROSS_REPO_EXACT_SHA_NODE=NOT_TESTED`.


## RE67 — Bổ sung kiểm tra mẫu ngữ pháp có nguồn

Đã bổ sung `src/pilots/re67-r02-r04-grammar-advisory.mjs` ở **Russian Expert Engine PR #5 candidate**, dùng như phần mở rộng của RE66 hiện có; không tạo một pipeline approval mới. RUE gửi `grammarEvidence` cho đủ sáu source item R02–R04, kèm pattern ID, nguồn Gramota, `sourceItemId`, hash của câu nguồn và hash báo cáo. Bauman kiểm chính xác pattern gắn từng source ID, hash, `grammarScore=null`, `humanRu03Approved=false`, `readyForLearning=false`. Đổi score thành 100 hoặc tự gắn approval bị từ chối dù bundle checksum được tính lại.

Năng lực phát hiện giới hạn: giới thiệu tên `Меня зовут…` (không đánh sai cách danh từ thay thế hợp lệ), `нужно/надо + infinitive`, mẫu hỏi giấy tờ, `до метро` / `к метро`, và nhận diện literal mẫu `Мне нужен врач`. Câu lạ hoặc cần ngữ cảnh trả `ABSTAIN_UNSUPPORTED_CONTEXT`; cách từ nghi ngờ `REVIEW_LOCAL_FORM` chứ không tự chứng nhận sai. Chỉ áp dụng **nguồn câu và ví dụ có kiểm soát**, không coi đây là LLM đã được huấn luyện hoặc thước đo năng lực tiếng Nga.

Chi tiết nguồn và các hạn chế: tài liệu `docs/RUE-BAUMAN-RE67-SCOPED-GRAMMAR.md` ở RUE PR #5 candidate. Đã mô phỏng bằng V8 **14 trường hợp quy tắc/biến thể** và **6/6 packet RE66 hai chiều**; test kiểm tra điểm grammar giả bị từ chối. Tất cả kiểm tra Node24 trên cặp checkout sạch và benchmark blind có gold độc lập vẫn **NOT_TESTED/BLOCKED**. Không sửa runtime, lesson hoặc learner mastery; không kích hoạt CI, review authority, merge/publish.


## RE68 — Nhận diện mục đích hội thoại R03–R04 (21/10/2026)

RUE Draft PR #5 đã thêm **`src/pilots/re68-r03-r04-dialogue-variants.mjs`** để phân loại *cùng mục đích giao tiếp*, *có liên quan nhưng không tương đương*, *khác chức năng* hoặc **`ABSTAIN`** khi ngữ cảnh mơ hồ. Cụ thể: `нужно/надо оформить регистрацию`, yêu cầu thông tin giấy tờ và thán từ `скажите пожалуйста!`, đi bộ `до/к метро` so với di chuyển bằng phương tiện, xin bác sĩ so với xin trợ giúp chung. Chỉ 4 mục R03/R04 có `dialogueEvidence`; 2 mục R02 là `null`.

Ở Bauman, `engine/review/re66-rue-content-first-bridge.mjs` đã thêm cổng kiểm tra SHA-256, source ID, canonical fingerprint, exact URL/scope từ Gramota, pattern ID và tất cả bất biến **`grade=null`**, `grammarCorrectness=null`, `humanRu03Approved=false`, `learnerMasteryWrite=false`. Dữ liệu nội dung gốc, routing, audio, UI và các công cụ RE45/RE50 không thay đổi. Bài kiểm thử synthetic của Bauman chặn **điểm giả, nguồn giả, quyền ghi mastery giả và đánh giá R02 ngoài phạm vi**, kể cả khi tái băm.

Bằng chứng đã thực hiện: V8 chạy 4 nhóm test trực tiếp từ nguồn RE68 (26 ví dụ), PASS; mô phỏng V8 exchange giữa module RUE và bộ nhận Bauman, 6/6 packet, trong đó 4/4 RE68, PASS; các giả mạo nêu trên bị chặn. **Node24 cross-repo exact checkout = NOT_TESTED**, chưa có nhãn gold benchmark mù, **RU03 = BLOCKED**, không có điểm phát âm tự động.

Nguồn và phần giải thích chuyên môn nằm ở `docs/RUE-BAUMAN-RE68-DIALOGUE-INTENT-ADVISORY.md` của RUE. Các phép thử này không phải bằng chứng model AI đã được huấn luyện hay chứng nhận RKI/RU03. Không chạy Work/Codex, Actions, approve/merge, ratify hoặc publish.

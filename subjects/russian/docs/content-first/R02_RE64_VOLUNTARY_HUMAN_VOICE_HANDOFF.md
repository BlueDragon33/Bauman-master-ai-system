# RE64 — Gói mời thu âm R02 (offline, chỉ dùng nội bộ thẩm định)

**Trạng thái:** `SPEAKER_NOT_CONNECTED` · `0/2_HUMAN_AUDIO` · `RIGHTS_UNVERIFIED` · `HUMAN_RU03_PENDING` · `ZERO_SPEND` · `NO_UPLOAD`

## 1. Tệp thu âm độc lập đã tạo

- Người nói được cung cấp `subjects/russian/engine/review/re64-r02-speaker-capture.offline.html`.
- Trang HTML hoạt động độc lập, không phụ thuộc tài khoản, server, API, TTS hay mạng; cần trình duyệt hỗ trợ ghi micro trong secure context (mở local file nếu trình duyệt cho phép, hoặc một máy chủ localhost do phía điều phối vận hành).
- Yêu cầu ghi âm **đúng 2 câu, nguyên vẹn**:

  - `LW_ITEM_R02_NAME` — **Меня зовут Нам.**
  - `LW_ITEM_R02_INTRO` — **Здравствуйте. Меня зовут Нам. Я из Вьетнама.**

- Ghi một mạch từng câu bằng người thật; **không** ghép các từ, không TTS, nhạc, lọc âm, lấy tiếng người khác. Sau khi ghi, người nói phải tự nghe lại và có thể thu lại.
- Trang cung cấp ba tệp tải riêng: `RE64_R02_NAME.{webm|ogg|m4a}`, `RE64_R02_INTRO.{webm|ogg|m4a}`, `RE64_R02_UNVERIFIED_SPEAKER_DECLARATION.json`. JSON chứa băm SHA-256 do trình duyệt tính trực tiếp trên bytes người nói ghi, ID, nguyên văn câu, metadata, tên ghi công/pseudonym và lời khai đồng ý.
- Không tự gửi file đi. **Chỉ** người nói mới quyết định chuyển ba tệp đó đến điều phối viên qua kênh được họ chọn. Không đưa dữ liệu cá nhân/giọng thật vào public GitHub.

## 2. Lời mời người đọc (tiếng Nga, có thể chuyển nguyên văn)

> Здравствуйте! Мы готовим офлайн-материалы по русскому языку для начинающих. Нам нужны две короткие записи живого голоса: «Меня зовут Нам.» и «Здравствуйте. Меня зовут Нам. Я из Вьетнама.»
>
> Участие полностью добровольное. Если вы согласны, запишите каждую фразу целиком на отдельной локальной странице, прослушайте результат и сохраните два аудиофайла и декларацию JSON. Ничего не загружается автоматически. Форма предлагает разрешить образовательное использование записей, в том числе офлайн-распространение с указанием авторства, по лицензии CC BY 4.0. Перед подтверждением внимательно прочитайте условия. Вы можете не соглашаться и не отправлять никаких файлов.
>
> После получения материалы будут отдельно проверены на качество произношения и права использования. Ваше согласие не означает автоматического одобрения учебной записи.

*Văn bản Nga trong lời mời là hướng dẫn giao nhận, không phải học liệu RU03 được thẩm định.*

## 3. Cổng kiểm tra và thẩm định độc lập

1. Điều phối viên nhận **đủ 3 tệp** qua kênh riêng và lưu ở nơi kiểm soát quyền truy cập, không đưa dữ liệu giọng nói vào phiên bản ứng dụng hay kho công khai.
2. Công cụ `subjects/russian/engine/review/re64-speaker-recording-intake.mjs` kiểm tra giấy khai, ID, nguyên văn từ canonical RE61, dung lượng/bytes/hash SHA-256, codec/duration từ RE63. Bất kỳ sai khác hoặc quyền thiếu đều **BLOCKED**.
3. Đọc được bytes và metadata không thể xác thực giọng là người thật, nội dung âm đã đúng, giấy khai đúng chủ quyền hoặc tên người. **Tất cả vẫn `PENDING_INDEPENDENT_RIGHTS_REVIEW` và `PENDING_HUMAN_RU03`.**
4. Chuyên gia có năng lực chứng thực tiếng Nga/РКИ và ngữ âm nghe từng câu để xét ngữ điệu, trọng âm, giảm nguyên âm, phụ âm mềm, tên riêng «Нам», phép lịch sự, tính tự nhiên. Nếu câu chưa đúng, gửi **đề nghị sửa canonical** rồi thu lại câu trên revision mới; không âm thầm sửa text để khớp clip.
5. Chỉ có quyết định đúng fingerprint theo RE45/RE50, tư cách reviewer được xác minh và quyền âm thanh rõ ràng mới có thể mở đường cho việc đóng gói offline dưới kiểm soát riêng. Tự xác nhận trên JSON, tên bất kỳ, hash, TTS/ASR, hay kết quả kiểm thử không phải phê duyệt.

## 4. Ranh giới vận hành

Không GitHub-hosted Actions, không merge, không production/publish, không Work/Codex ngoài lệnh rõ ràng. Không ép người học phải tìm/thu âm người Nga hoặc tự xác nhận quyền và phát âm. Môi trường thử nghiệm có thể dùng **âm tổng hợp để kiểm tra codec**, nhưng chỉ trạng thái `SYNTHETIC_QA`, tuyệt đối không dùng làm mẫu nghe.

# R02 — Audio nguyên câu: kết quả tìm nguồn, QA bytes và cổng RU03 (2026-10-20)

## 1. Yêu cầu sản phẩm và bản ghi thực còn thiếu

Canonical owner: `subjects/russian/data/listen-write-lessons.json`, không sửa lời thoại để khớp với tệp nguồn khác:

| RE61 source ID | Văn bản đúng | Audio giọng người có phép rõ ràng, đúng **toàn bộ** lời thoại |
|---|---|---|
| `LW_ITEM_R02_NAME` | `Меня зовут Нам.` | **NOT_FOUND / NOT_RECORDED** |
| `LW_ITEM_R02_INTRO` | `Здравствуйте. Меня зовут Нам. Я из Вьетнама.` | **NOT_FOUND / NOT_RECORDED** |

Các hội thoại tải về từ nguồn khác dùng tên `Сара`, `Вероника`, `Оксана`, v.v. **Không** được trộn, ghép âm hoặc dùng âm của một tên khác để công nhận bài R02. Từ `Здравствуйте` có ghi âm riêng lẻ Wikimedia Commons, chỉ là tham chiếu một từ, chưa có bằng chứng quyền người thu âm cuối cùng.

- Wikimedia Commons word clip: https://commons.wikimedia.org/wiki/File:CPIDL_Russian_-_Zdravstvujte.ogg
- RussianForEveryone (tên khác, chưa có phép rehosting): https://russianforeveryone.com/MyDownloads.htm
- RussianPod101 dialogue (tên khác, chưa có phép rehosting): https://www.russianpod101.com/lesson/basic-bootcamp-1-self-introductionsbasic-greetings

**Không có bằng chứng cho việc "toàn câu đã có audio" chỉ từ những trang trên.**

## 2. Gói thu âm thực cần thiết

`RE63` là **brief + inspector read-only** mới, chỉ gắn vào 2 source ID thuộc RE61/RE45/RE50. Cần bản thu nguyên câu do một người có quyền cho phép sử dụng, với thông tin tác giả/giọng đọc, nhà sản xuất, điều khoản cấp phép, văn bản đồng ý và phương thức ghi âm. Cần chuyên gia РКИ kiểm tra phát âm tên riêng `Нам`, trọng âm, giảm nguyên âm, mềm hóa, ngữ điệu và đăng ký ngữ dụng.

- `engine/content/review/re63-r02-full-utterance-capture-brief.v1.json`
- `engine/review/re63-full-utterance-audio-preflight.mjs`
- `engine/tests/test-re63-full-utterance-audio-preflight.mjs`

Không đổi bản nói để đúng với một nguồn âm "gần giống". Không bắt người dùng tự thu hoặc tự phê duyệt tiếng Nga.

## 3. Kiểm tra bytes THẬT trên máy QA (không phải audio RU03)

Để thử kỹ thuật file/codec không sử dụng audio có bản quyền bên ngoài, chạy eSpeak **offline tại môi trường QA** cho đúng *chuỗi ký tự* R02. Công cụ cảnh báo rõ “Full dictionary is not installed for 'ru'”, nên các mẫu này là **synthetic QA unverified**, không phải giọng chuẩn. Kết quả đo từ bytes cục bộ bằng SHA-256 và `ffprobe` thực:

| Mẫu máy QA | Kích thước | SHA-256 bytes đo thực | Codec | Hz | kênh | duration |
|---|---:|---|---|---:|---:|---:|
| `R02_INTRO_SYNTHETIC_TEST_ONLY` | 209536 | `6c20fae71695a222817f6f8f5e20e84d980849ab95e9c724bf4ece574d5c8527` | `pcm_s16le` / WAV | 22050 | 1 | 4.750385 s |
| `R02_NAME_SYNTHETIC_TEST_ONLY` | 77892 | `54c8bb8bc0e7bb5c861c4a520c318899cc02cd7d95760ae9702d8c4cb05aeddd` | `pcm_s16le` / WAV | 22050 | 1 | 1.765261 s |

Giá trị SHA-256 trên **chỉ** là dấu vân tay tệp âm máy thử kỹ thuật, **không** phải SHA của Commons, người đọc tiếng Nga, hay proof of pronunciation. Không lưu tệp QA trong repository, offline app hoặc RE61 media authority.

## 4. Gate cuối phiên

| Cổng | Kết quả |
|---|---|
| RE63 source binding vào 2 packet RE61 | V8 simulation PASS, Node repo NOT_TESTED |
| Thực thi ffprobe và SHA-256 trên hai WAV máy QA | PASS ở container QA |
| Thử chống thiếu bytes, định dạng sai, phê duyệt giả | V8 mock PASS, Node repo chưa chạy |
| Ghi âm người thật đầy đủ 2 câu | BLOCKED 0/2 |
| Giấy phép cho bản ghi người thật | BLOCKED |
| Human text/audio RU03 | BLOCKED |
| Offline learner audio chuẩn | BLOCKED |
| GitHub Actions / merge / publish | NOT_RUN / NOT_PERMITTED |

**Quy tắc:** nếu không có bytes giọng người và quyền sử dụng thì không được coi R02 audio hoàn thành, dù pipeline/hash/codec hoạt động. Khi có source đủ điều kiện, cập nhật packet theo quy trình độc lập RE45/RE50, không cấp quyền từ manifest hoặc test.

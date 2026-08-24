# Lượt 5 · Web App runtime / Roadmap V3 / Offline-first · FINAL

## Kết luận

**PASS** cho source checkpoint:

- Source SHA: `de34c9606d8e35b138e9933c835d4ab55228fca6`
- Immutable checkpoint branch: `checkpoint/l5-webapp-offline-pass-a20-20260824`
- Validation PR: `#25` — validation-only, **không merge**
- Authoritative validation run: `32702609199` (L5 Validation Base, run #18)
- PR merge-test SHA: `af0d752fcfbde386aa641e42b17ddbf2c70eada7`
- Artifact: `l5-validation-reports`, artifact id `9511098621`
- Artifact SHA-256: `cbad86b04a73d92d1e2e9109787e6a73627c967191e13a0c42e3b18c23a41218`

`main` không bị thay đổi. `serviceWorkerCache` vẫn **OFF** trong runtime config; L5 chỉ chứng minh offline/PWA runtime hoạt động đúng khi Service Worker được kích hoạt có chủ đích. Rollout thực tế chỉ được bật ở staging/PWA rollout sau này.

## Gate đã PASS

1. Static routing: **9 entry / 0 failure / 0 warning**.
2. Academic Runtime V3: **36/36**.
3. Service Worker lifecycle: **17/17**.
4. Runtime self diagnostics: **14/14**.
5. Roadmap/offline static invariants: **75/75**.
6. Data-loading audit: **8 subjects / 0 failure / 3 non-blocking warnings**.
7. Browser startup + deferred loading + Russian overlay persistence: **PASS**.
8. Responsive/runtime routing: **36 page × viewport checks / 0 failure**.
9. Render performance: **3 critical pages / 0 failure**.
10. Direct Local Reader: **12/12**.
11. Roadmap + Local Library + Offline/PWA browser flow: **46/46**.
12. Offline report semantic integrity: **5/5**, nhận diện đúng 1 sandbox-block console signal là hành vi bảo mật mong đợi.

## Browser startup payload đã xác nhận

| Entry | Startup JSON | Startup MB | JSON lớn ở startup |
|---|---:|---:|---:|
| Main | 1 | 0.01 | 0 |
| AI | 7 | 0.53 | 0 |
| Foundation | 7 | 0.25 | 0 |
| Math | 7 | 0.49 | 0 |
| Programming | 15 | 2.08 | 0 |
| Research | 7 | 0.48 | 0 |
| Russian | 11 | 2.16 | 0 |
| Signal | 7 | 0.39 | 0 |
| Systems | 7 | 0.60 | 0 |

Russian overlay persistence được kiểm riêng và PASS; `vocab/tests/speaking` không bị eager-load ở startup. Math legacy large lessons cũng không bị startup-request.

## Offline/PWA đã xác nhận

- Main mở offline sau đăng nhập và render Roadmap ИУ-5 · 09.04.01/11.
- Foundation mở offline, không có same-origin request failure.
- Math mở offline, legacy large lessons không bị startup-request.
- Russian mở offline, heavy `vocab/tests/speaking` không bị startup-request.
- Foundation base pack: 13 tài nguyên, 333,522 bytes, 0 skipped, 0 failed.
- Math base pack: 37 tài nguyên, 1,995,171 bytes, 0 skipped, 0 failed.
- Russian base pack: 20 tài nguyên, 3,410,976 bytes, 0 skipped, 0 failed.
- IndexedDB Local Library roundtrip PASS.
- Quota preflight + partial-import rollback PASS.
- Shared-cache reference counting PASS.
- Local HTML sandbox không cho script đụng parent Web App.
- Direct Local Reader zero-copy không sinh IndexedDB pack cho file chỉ đọc trực tiếp.

## Performance đã xác nhận

Gate khóa các ngân sách DOM/render và đã PASS:

- Main V3 không render toàn bộ kho môn cùng lúc.
- Russian Vocab render 20 row/trang.
- Russian Review/Exam render theo page, không bung toàn ngân hàng câu hỏi.
- Math large legacy source tiếp tục deferred.
- `content-visibility`/bounded rendering được giữ để hạn chế chi phí DOM.

## Ba warning không chặn từ static data audit

1. Math `lessons.json` vẫn xuất hiện trong legacy initial-data metadata, nhưng browser authoritative regression xác nhận không có startup fetch.
2. Programming `deep-speaking-bauman` là optional/background source nhưng metadata còn `lazy=false`.
3. Programming `speaking-link-index` là optional/background source nhưng metadata còn `lazy=false`.

Ba mục này là metadata hygiene, không tạo startup large payload trong browser run hiện tại. Chúng được chuyển thành backlog cleanup; không được dùng để suy diễn rằng runtime đang eager-load.

## Root causes đã phát hiện và sửa trong L5

- Math/Russian từng eager-load dữ liệu lớn.
- Russian lazy source từng có nguy cơ bị đồng nhất với optional/non-persistent và làm mất/hide overlay người học.
- Main từng dùng academic graph cũ trong khi Roadmap đã sang V3.
- Offline pack từng có nguy cơ giữ cache cũ vô hạn.
- Service Worker `waitUntil` lifecycle từng chưa được khóa chặt.
- Local file lớn từng bắt buộc copy vào IndexedDB mới đọc được.
- Offline HTML cần sandbox capture guard.
- Shared cache cần refcount trước khi xóa pack.
- Quota/import cần rollback khi ghi dở.
- Responsive test từng dùng sai root selector cho một số subject app.
- Offline browser test từng chờ Roadmap visible trước khi đăng nhập.
- CI validation từng gọi sai tên Direct Reader regression.
- Offline report từng ghi sandbox-block expected signal thành `ok:false` mà không giải thích; A20 bổ sung semantic-integrity gate.

## Rollback path

Nếu các lượt sau làm hỏng Web App runtime/offline:

1. Không rollback `main` vì `main` chưa nhận migration này.
2. So sánh thay đổi với checkpoint `checkpoint/l5-webapp-offline-pass-a20-20260824`.
3. Khôi phục các file runtime bị ảnh hưởng về source SHA `de34c960...` hoặc tạo recovery branch từ checkpoint.
4. Giữ `serviceWorkerCache:false` cho đến khi staging rollout có gate riêng.
5. Chạy lại toàn bộ L5 validation trước khi coi recovery là hoàn tất.

## Quyết định chuyển lượt

L5 được phép đóng vì toàn bộ deterministic + browser + offline + performance gates đã PASS trên cùng source checkpoint. Từ đây mới được bắt đầu L6 theo master plan mới: **Universal Lesson Architecture / Subject Factory**, không phá các content engine Tiếng Nga và Toán đang là reference implementation.

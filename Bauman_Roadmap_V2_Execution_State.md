# BAUMAN MASTER AI — ROADMAP V2

## Trạng thái triển khai tuần tự

- Mốc hoàn thành gần nhất: **Lượt 21 / Bước 84**.
- Mốc tiếp theo: **Lượt 22 / Bước 85 — BLOCKED do chưa có đặc tả bước**.
- Trạng thái: **PASS — read-only sidecar; migration/runtime activation chưa thực thi**.
- Ngày kiểm kê: **2026-08-10 (Asia/Bangkok)**.
- Repository: `BlueDragon33/Bauman-master-ai-system`.
- Baseline vật lý: `main@e383912354673bdce7a0059d6b9a23799d74e689`.
- Branch triển khai: `agent/roadmap-v2-l19-contract`.
- Draft PR: `https://github.com/BlueDragon33/Bauman-master-ai-system/pull/18`.

## Vấn đề đã xử lý dứt điểm tại Bước 73

Đặc tả Lượt 18 từng coi `E15 / Chương 7 covariance–correlation–PCA` là baseline
vật lý và coi lesson/formula/exercise/simulation/test đã đồng bộ. Kiểm tra trực
tiếp repository, toàn bộ branch hiện có và Library chứng minh mô tả này không đúng.

Trạng thái vật lý đã được khóa lại:

- `lessons.json`: 347 lesson ID duy nhất, 40 source chapter / 41 physical content group, 5.552 base slide.
- Covariance/correlation/PCA tồn tại dưới các legacy lesson C05/C10/C15.
- `MATH-L2-C07` là node logic composite, không phải số Chương 7 vật lý.
- `theory_lecture_content.json`: 18 overlay bền vững cho C01–C03.
- `theory-framework.json`: 21 chapter / 172 sublesson; `m_p07` và 8 mục con chỉ là outline phụ, chưa runtime-ready.
- `formulas.json`, `exercises.json`, `applications.json`, `simulations.json`, `professor_qa.json`: mảng rỗng tại baseline.
- `tests.json`: 4 level, 0 question.
- Các đường dẫn runtime/data quan trọng đã được fingerprint bằng Git blob SHA.

Không có dữ liệu học thuật nào bị xóa. Sai ở đây là naming/mapping của bàn giao,
không phải nội dung covariance/PCA bị mất.

## Kết quả Lượt 19 — Bước 73–76

| Bước | Trạng thái | Kết quả |
|---|---|---|
| 73 | PASS | Baseline inventory, fingerprint và mapping composite C07 |
| 74 | PASS | Registry: 10 kho, 85 node, 304 lesson đánh số, 8 node động |
| 75 | PASS | Graph: 450 node, 425 hierarchy edge, 185 prerequisite edge, 0 missing/self/cycle |
| 76 | PASS_CONTRACT_ONLY | Inventory 347 lesson + 18 overlay + 21/172 framework; 5 exact mapping, 342 preserved/unmapped, 0 record eligible |

Validation đã chạy hai lần liên tiếp; JSON sinh ra có hash không đổi. Sáu script
Node đã qua syntax check. Runtime/UI và 15 protected path không thay đổi.

## Kết quả Lượt 20 — Bước 77–80

- Repository baseline validator: PASS trên checkout GitHub thật.
- Migration dry-run: PASS, chỉ tạo 4 sidecar trong thư mục tạm ngoài worktree.
- Rollback test: PASS; 15 fingerprint và academic baseline giống hệt trước–sau.
- Deterministic regeneration: PASS, không phát sinh Git diff.
- GitHub Actions được tái kiểm tra trên canonical source tại run `31405787576`, conclusion `success`.
- Lỗi planned count `tests: 5` bị hiểu nhầm thành level count đã được sửa: dữ liệu
  thật là 4 level và 0 question.

## Quy trình bắt buộc tiếp tục

1. Thực hiện tuần tự từ Lượt 20 đến Lượt 50, mỗi lượt 4 bước.
2. Chỉ chuyển bước khi validator của bước hiện tại `PASS`.
3. Gặp thiếu nguồn, mapping mơ hồ, ID collision, cycle, fingerprint drift hoặc
   regression thì dừng và giải quyết dứt điểm trước khi đi tiếp.
4. Không dùng `PASS_BROWSER_SMOKE` nếu chưa chạy browser smoke thật.
5. Không rewrite legacy ID hoặc patch runtime/UI lõi khi migration dry-run và
   protected-fingerprint gate chưa đạt.

## Kết quả Lượt 21 — Bước 81–84

| Bước | Trạng thái | Kết quả |
|---|---|---|
| 81 | PASS | Sidecar canonical read-only gồm registry, graph, mapping, contract; 4 hash SHA-256 khóa trong manifest |
| 82 | PASS | Loader kiểm tra schema/hash/count, lập index tra cứu và deep-freeze toàn bộ dữ liệu công khai |
| 83 | PASS | 5/5 test đạt; sửa file hoặc thiếu file đều fail closed; mapping `m_p07` vẫn quarantine |
| 84 | PASS | CI checkout thật xác nhận production HTML/manifest không nối loader; runtime/UI thay đổi 0 |

- Commit kiểm định: `e9b15165ee0b7762eab97d23feb73a25230381dd`.
- GitHub Actions: `31405787576`, 15 gate thực thi đều success.
- PR: `https://github.com/BlueDragon33/Bauman-master-ai-system/pull/18` vẫn là draft.

## Điểm dừng trước Lượt 22

Không tìm thấy đặc tả chính xác cho **Lượt 22 / Bước 85–88** trong repository,
Library hoặc Personal Context. Theo quy tắc không tự đoán thứ tự, hệ thống dừng tại
Bước 84 và chờ kế hoạch Bước 85–88 được cung cấp hoặc phê duyệt.

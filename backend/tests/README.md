<!--
Công dụng: Thư mục chứa test (unit/integration) cho backend.
Hiện tại dự án chưa bắt buộc viết test ngay, nhưng để sẵn cấu trúc để sau này mở rộng.
Gợi ý: khi cần test API có DB thì dùng integration test (supertest + jest).
-->

# Tests

## 1) Khi nào cần test?
- Khi API bắt đầu nhiều endpoint, dễ lỗi “lan truyền” khi sửa code.
- Khi bạn muốn CI chạy tự động đảm bảo API vẫn đúng.

## 2) Gợi ý setup (khi bạn muốn làm)
Cài:
- jest
- supertest

Ví dụ scripts trong `package.json`:
- `"test": "jest"`

## 3) Gợi ý test nên có
- `GET /health` trả về status ok
- Auth: register/login/me
- Songs: list/getById/create/update/delete
- Favorites/Playlists/History: các luồng chính

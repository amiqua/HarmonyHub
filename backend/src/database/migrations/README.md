# Database Migrations

Mỗi file `*.sql` ở đây là một migration cần chạy 1 lần khi pull code mới.
Các migration dùng `IF NOT EXISTS` nên chạy lại nhiều lần vẫn an toàn.

## Cách chạy

### 1) Bằng `psql` (khuyến nghị)

```bash
# Cần DATABASE_URL trong .env (cùng kết nối backend đang dùng)
psql "$DATABASE_URL" -f src/database/migrations/001_add_role_genre_image_song_metadata.sql
```

### 2) Bằng Node runner đi kèm (Windows-friendly)

Trong thư mục `backend/`:

```bash
node src/database/migrations/run.js                                # chạy tất cả
node src/database/migrations/run.js 001_add_role_genre_image_song_metadata.sql  # chạy 1 file
```

Runner sẽ:
- Tải `DATABASE_URL` từ `.env`
- Chạy tuần tự các file `.sql` theo thứ tự tên
- Bao mỗi file trong một transaction (BEGIN/COMMIT có sẵn trong file)
- Báo lại số ms mỗi file mất

## Danh sách migration

| File | Mục đích |
|---|---|
| `001_add_role_genre_image_song_metadata.sql` | Thêm `users.role`, `genres.image_url/image_public_id/description`, `songs.audio_hash/bit_rate/codec/created_at/updated_at`. Bắt buộc cho code sau commit `571a985` (Tailwind + auth role + genre image + upload fix). |

## Promote một user lên ADMIN

Sau khi user `you@example.com` đã đăng ký:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

User cần đăng nhập lại để JWT mới có `role: 'ADMIN'`.

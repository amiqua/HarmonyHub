-- =============================================================
-- Migration: 001_add_role_genre_image_song_metadata
-- Tổng hợp các cột thiếu so với code hiện tại.
--
-- Áp dụng cho DB đã chạy schema cũ. An toàn để chạy lại nhiều lần
-- nhờ `IF NOT EXISTS`.
--
-- Cách chạy (psql):
--   psql "$DATABASE_URL" -f src/database/migrations/001_add_role_genre_image_song_metadata.sql
-- =============================================================

BEGIN;

-- ── users.role ────────────────────────────────────────────────
-- Backend (auth.service.js) đọc cột role để cấp JWT có quyền ADMIN/USER.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- ── genres: ảnh đại diện + mô tả ──────────────────────────────
-- Phục vụ tính năng "Admin upload/đổi ảnh chủ đề & thể loại".
ALTER TABLE genres
  ADD COLUMN IF NOT EXISTS image_url        TEXT,
  ADD COLUMN IF NOT EXISTS image_public_id  TEXT,
  ADD COLUMN IF NOT EXISTS description      TEXT;

-- ── songs: metadata audio đầy đủ ──────────────────────────────
-- Repository (songs.repository.js) cần các cột này khi INSERT/UPDATE
-- (findByAudioHash, updateAudioMetadata, updated_at).
ALTER TABLE songs
  ADD COLUMN IF NOT EXISTS audio_hash  TEXT,
  ADD COLUMN IF NOT EXISTS bit_rate    INT,
  ADD COLUMN IF NOT EXISTS codec       VARCHAR(50),
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_songs_audio_hash ON songs(audio_hash);

COMMIT;

-- ── Promote a user to ADMIN (chạy thủ công khi cần) ───────────
-- UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';

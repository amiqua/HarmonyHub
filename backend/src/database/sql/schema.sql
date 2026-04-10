-- SCHEMA CHUẨN BỊ CHO DATABASE (POSTGRESQL) - FILE DATABASE TEMPLATE CHO DEV MỚI --

-- Xóa bảng cũ nếu chúng tồn tại
DROP TABLE IF EXISTS "History" CASCADE;
DROP TABLE IF EXISTS "Playlists" CASCADE;
DROP TABLE IF EXISTS "Songs" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- Tạo bảng Users
CREATE TABLE "Users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Songs
CREATE TABLE "Songs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "artist" VARCHAR(255) NOT NULL,
    "audio_url" TEXT NOT NULL,
    "cover_url" TEXT,
    "release_date" DATE,
    "duration" INT
);

-- Tạo bảng History (Lưu lịch sử nghe nhạc)
CREATE TABLE "History" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "Users"("id") ON DELETE CASCADE,
    "song_id" UUID REFERENCES "Songs"("id") ON DELETE CASCADE,
    "played_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "duration_listened" INT DEFAULT 0
);

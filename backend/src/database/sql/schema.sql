-- SCHEMA CHUẨN BỊ CHO DATABASE (POSTGRESQL) - FILE DATABASE TEMPLATE CHO DEV MỚI --

-- Xóa bảng cũ nếu chúng tồn tại
DROP TABLE IF EXISTS token_blacklist CASCADE;
DROP TABLE IF EXISTS playlist_songs CASCADE;
DROP TABLE IF EXISTS favorite_songs CASCADE;
DROP TABLE IF EXISTS favorite_lists CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS play_history CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tạo bảng users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(50) DEFAULT 'USER', -- USER, ADMIN, MOD
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng token_blacklist (cho logout/revocation)
CREATE TABLE token_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Tạo bảng songs
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Chủ sở hữu bài hát
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255), -- Fallback field
    audio_url TEXT NOT NULL,
    audio_public_id TEXT, -- Public ID trên Cloudinary
    audio_hash TEXT, -- SHA256 hash để detect duplicates
    cover_url TEXT,
    cover_public_id TEXT, -- Public ID trên Cloudinary
    release_date DATE,
    duration INT,
    bit_rate INT, -- in kbps
    codec VARCHAR(50), -- mp3, aac, flac, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_songs_audio_hash ON songs(audio_hash);

-- Tạo bảng play_history (Lưu lịch sử nghe nhạc)
CREATE TABLE play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_listened INT DEFAULT 0,
    UNIQUE(user_id, song_id) -- Tránh trùng lặp, dùng ON CONFLICT để update
);

-- Tạo bảng favorite_lists
CREATE TABLE favorite_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng favorite_songs (Liên kết bài viết yêu thích)
CREATE TABLE favorite_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    favorite_list_id UUID REFERENCES favorite_lists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(favorite_list_id, song_id)
);

-- Tạo bảng playlists
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'user', -- system | user
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng playlist_songs
CREATE TABLE playlist_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    position INT, -- Thứ tự trong playlist
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, song_id)
);

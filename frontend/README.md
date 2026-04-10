===============================

HARMONY HUB - MUSIC FULLSTACK PROJECT

===============================

Node.js | Express | PostgreSQL | React | Vite | Tailwind | JWT | Cloudinary

===============================

GIỚI THIỆU

Dự án là hệ thống nghe nhạc (Music Platform) gồm:

- Backend API (Node.js + Express)
- Frontend (React + Vite + TailwindCSS)

Chức năng chính:

- Authentication (JWT)
- Quản lý bài hát
- Album & Artist
- Playlist (system + user)
- Favorite songs
- History nghe nhạc
- Upload audio (Cloudinary)

===============================

CÁC MODULE CHÍNH

AUTH MODULE (Xác thực)
- Đăng ký, đăng nhập
- JWT access + refresh token
- Lấy thông tin user (me)

USER MODULE
- Cập nhật thông tin
- Đổi mật khẩu

SONG MODULE
- CRUD bài hát
- Upload file audio
- Gán artist / genre / album

ALBUM MODULE
- Tạo album
- Thêm bài hát vào album
- Sắp xếp tracklist

ARTIST MODULE
- CRUD nghệ sĩ
- Lấy danh sách bài hát của nghệ sĩ

GENRE MODULE
- Quản lý thể loại
- Lọc bài hát theo genre

PLAYLIST MODULE
- Playlist hệ thống
- Playlist cá nhân
- Thêm / xoá bài hát
- Reorder playlist

FAVORITE MODULE
- Thêm bài hát yêu thích
- Xoá khỏi danh sách

HISTORY MODULE
- Lưu lịch sử nghe
- Thống kê

===============================

KIẾN TRÚC HỆ THỐNG

Frontend (React + Vite)
        ↓
Backend API (Express)
        ↓
Service Layer
        ↓
PostgreSQL Database

Cloudinary (Upload audio)

===============================

CÔNG NGHỆ

Backend:
- Node.js + Express
- PostgreSQL
- JWT Authentication

Frontend:
- React + Vite
- TailwindCSS
- shadcn/ui

Khác:
- Cloudinary (upload audio)

===============================

AUTHENTICATION

Header:

Authorization: Bearer <accessToken>

===============================

CÁCH CHẠY BACKEND

cd backend

npm install

Tạo file .env:

PORT=3000
DATABASE_URL=your_database_url
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

Chạy server:

npm run dev

===============================

CÁCH CHẠY FRONTEND

cd frontend

npm install

Tạo file .env:

VITE_API_BASE_URL=http://localhost:3000

Chạy project:

npm run dev

===============================

API OVERVIEW

AUTH
POST /api/v1/auth/register
POST /api/v1/auth/login

SONGS
GET /api/v1/songs
GET /api/v1/songs/:id

PLAYLIST
GET /api/v1/playlists
POST /api/v1/playlists

... (các API khác)

===============================

ERROR FORMAT

{
  "success": false,
  "message": "Error message"
}

===============================

TEST API

- Postman
- Thunder Client
- Curl

===============================

AUTHOR

Ngocnhat

===============================

NOTES

- Backend chạy port 3000
- Frontend gọi API qua VITE_API_BASE_URL
- Phân quyền: Public / User
- Chuẩn RESTful API

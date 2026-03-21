===============================

HARMONY HUB - MUSIC FULLSTACK PROJECT

===============================

Node.js | Express | PostgreSQL | React | Vite | Tailwind | JWT | Cloudinary

===============================

GIỚI THIỆU

Đây là project fullstack xây dựng một hệ thống nghe nhạc (Music Platform).

Bao gồm:

- Backend API (Node.js + Express)
- Frontend (React + Vite + TailwindCSS)

Chức năng chính:

- Authentication (JWT)
- Quản lý bài hát
- Album, Artist
- Playlist (system + user)
- Favorite songs
- History nghe nhạc
- Upload audio (Cloudinary)

===============================

CÁCH CHẠY PROJECT (QUAN TRỌNG)

⚠️ Làm theo từng bước để chạy được project

-------------------------------
1. Clone project về máy
-------------------------------

Mở terminal và chạy:

git clone <link-repo-của-bạn>

Sau đó vào thư mục project:

cd HarmonyHub

-------------------------------
2. Chạy BACKEND
-------------------------------

Di chuyển vào thư mục backend:

cd backend

Cài dependencies:

npm install

Tạo file .env trong thư mục backend:

touch .env

Mở file .env và thêm:

PORT=3000

DATABASE_URL=postgresql://username:password@localhost:5432/dbname

JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

👉 Lưu file lại

Chạy server backend:

npm run dev

👉 Nếu thành công:
Server chạy tại: http://localhost:3000

-------------------------------
3. Setup DATABASE
-------------------------------

Đảm bảo bạn đã cài PostgreSQL.

Tạo database:

CREATE DATABASE your_db_name;

Import schema:

psql -U postgres -d your_db_name -f schema.sql

-------------------------------
4. Chạy FRONTEND
-------------------------------

Mở terminal mới (không tắt backend)

Di chuyển vào thư mục frontend:

cd frontend

Cài dependencies:

npm install

Tạo file .env:

touch .env

Thêm:

VITE_API_BASE_URL=http://localhost:3000

Chạy frontend:

npm run dev

👉 Mở trình duyệt:

http://localhost:5173

===============================

AUTHENTICATION

Header cần gửi:

Authorization: Bearer <accessToken>

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

...

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

===============================

AUTHOR

Trinh An

===============================

NOTES

- Backend chạy port 3000
- Frontend chạy port 5173
- Nhớ chạy backend trước frontend
- Dùng Cloudinary để upload audio
- Chuẩn RESTful API

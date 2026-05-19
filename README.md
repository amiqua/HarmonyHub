

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

Tạo file .env


DATABASE_URL=postgresql://neondb_owner:npg_7yiR9BFEhjHb@ep-long-meadow-a19fkoar-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

CLOUDINARY_CLOUD_NAME=dhroj62fa

CLOUDINARY_API_KEY=547872612298595

CLOUDINARY_API_SECRET=LdXpcbUVtm0znGPjPL0OvTmWUOM

PORT=3000

JWT_ACCESS_SECRET=UNPZXfmorv_zO1bcesRWWMLdU_-OjJDT49DvlrVq8IUWiAhlTXgQGsVFnucBsHVL

JWT_REFRESH_SECRET=am4HSlNC9I1Wddt_peZ5XpSw8YumIEnduNncs-DoFQgPrEeCkXQgr5Zim4RzZzhU

CORS_ORIGIN=http://localhost:5173

LOG_LEVEL=info

NODE_ENV=production

👉 Lưu file lại

Chạy server backend:

npm run dev

👉 Nếu thành công:
Server chạy tại: http://localhost:3000


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
VITE_API_TIMEOUT=15000
VITE_API_BASE_URL=/api/v1

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
===============================
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

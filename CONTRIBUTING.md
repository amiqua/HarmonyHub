# Hướng dẫn đóng góp (Contributing Guidelines)

Chào mừng bạn đến với dự án **HarmonyHub**!

Vì dự án có cấu hình đặc thù để đảm bảo code sạch, xin vui lòng đọc kỹ trước khi bắt tay vào code.

## 1. Kiến trúc SCSS (SCSS 7-1 Architecture)
Dự án **KHÔNG TỒN TẠI TailwindCSS**. Mọi cố gắng sử dụng các class như `bg-white`, `flex`, `gap-2` sẽ không có tác dụng và làm vỡ giao diện.
Vui lòng sử dụng **BEM (Block Element Modifier)** và cấu trúc thư mục 7-1:
- Các biến màu trung tâm lấy từ: `src/styles/abstracts/_variables.scss`
- Các components (Button, Card, ...): Nằm ở `src/styles/components/`
- Tuyệt đối không viết CSS thả rông, luôn đặt tên class bám sát chức năng (Ví dụ: `.hero-carousel` - `.hero-carousel__image` - `.hero-carousel--active`).

## 2. Quản lý trạng thái (Zustand & React Query)
- Auth và Player hiện được gom lại ở store riêng (`authStore.js`, `playerStore.js`) -> Không dùng UseState bừa bãi hay pass param Props quá sâu.
- Lấy thông tin User qua hook custom: `const { user } = useAuth();`

## 3. Tạo Pull Request
- Hãy chắc chắn bạn đã mô phỏng Build tại máy local:
  ```bash
  npm run build
  ```
  Nếu Terminal không báo lỗi Exit 1 nào thì PR của bạn mới hợp lệ.
- Hãy dùng template Pull Request đã có sẵn để đánh dấu các checklist mình đã thực hiện.

Cảm ơn bạn!

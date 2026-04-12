# Hướng dẫn đóng góp (Contributing Guidelines)

Chào mừng bạn đến với dự án **HarmonyHub**!

Vì dự án có cấu hình đặc thù để đảm bảo code sạch, xin vui lòng đọc kỹ trước khi bắt tay vào code.

## 1. Kiến trúc Styling (TailwindCSS)
Dự án sử dụng **TailwindCSS** cho styling. Sử dụng các utility classes như `bg-white`, `flex`, `gap-2` trong JSX/HTML.

Ví dụ:
```jsx
<div className="flex gap-4 bg-white rounded-lg shadow-md p-6">
  <img className="w-12 h-12 rounded-full" src={avatar} />
  <div className="flex-1">
    <h3 className="font-bold text-lg">{title}</h3>
  </div>
</div>
```

**Không** sử dụng CSS file đơn lẻ hay BEM methodology. Tất cả styling phải qua TailwindCSS utility classes.

## 2. Quản lý trạng thái (Zustand & React Query)
- Auth và Player được gom lại ở store riêng (`authStore.js`, `playerStore.js`) -> Không dùng useState bừa bãi hay pass param props quá sâu.
- Lấy thông tin User qua hook custom: `const { user } = useAuth();`
- React Query cho server-side caching và synchronization

## 3. Tạo Pull Request
- Hãy chắc chắn bạn đã mô phỏng Build tại máy local:
  ```bash
  npm run build
  ```
  Nếu Terminal không báo lỗi Exit 1 nào thì PR của bạn mới hợp lệ.
- Hãy dùng template Pull Request đã có sẵn để đánh dấu các checklist mình đã thực hiện.

## 4. Code Style
- Sử dụng ESLint + Prettier để format code
- Run `npm run format` trước khi commit
- Viết comments bằng Tiếng Anh (English comments for international collaboration)
- Tránh console.log ở production code (dùng proper logger)

## 5. Testing
- Viết unit tests cho logic phức tạp
- Run `npm run test` để verify tests pass
- Targeting 50%+ code coverage

## 6. Git Commits
- Viết commit messages rõ ràng, ngắn gọn
- Prefix: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Ví dụ: `feat: add duplicate song detection` hoặc `fix: correct CORS configuration`

Cảm ơn bạn!

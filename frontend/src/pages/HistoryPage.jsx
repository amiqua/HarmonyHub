// FILE: src/pages/HistoryPage.jsx
// CHÚ THÍCH: Page wrapper cho route "/history" (Nghe gần đây).
// - Trang này KHÔNG tự render layout (Sidebar/TopBar) vì AppShell đã bọc ở App.jsx.
// - Chỉ mount HistoryPageContent để dễ tách nhỏ component + tái sử dụng data/state.
// - onRequireLogin (optional) dùng khi cần chặn tính năng yêu cầu đăng nhập.

import HistoryPageContent from "@/components/history/HistoryPageContent";

export default function HistoryPage({ onRequireLogin }) {
  return <HistoryPageContent onRequireLogin={onRequireLogin} />;
}

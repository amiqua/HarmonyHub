// FILE: src/pages/FavoritesPage.jsx
// CHÚ THÍCH:
// - Page wrapper cho route "/favorites".
// - Chỉ mount FavoritesPageContent đúng cấu trúc dự án của bạn.
// - Không fetch API tại đây để tránh phát sinh vấn đề.
// - Truyền onRequireLogin xuống dưới (App.jsx sẽ truyền handler mở LoginDialog).

import FavoritesPageContent from "@/components/favorites/FavoritesPageContent";

/**
 * Props:
 * - onRequireLogin?: () => void
 */
export default function FavoritesPage({ onRequireLogin }) {
  return (
    <div className="p-6">
      <FavoritesPageContent onRequireLogin={onRequireLogin} />
    </div>
  );
}

// FILE: src/pages/NewReleasesPage.jsx
// CHÚ THÍCH:
// - Page wrapper cho route "/new-releases" (BXH Nhạc Mới).
// - Chỉ mount NewReleasesPageContent đúng cấu trúc dự án của bạn.
// - Truyền onRequireLogin xuống dưới (App.jsx sẽ truyền handler mở LoginDialog).

import NewReleasesPageContent from "@/components/newreleases/NewReleasesPageContent";

/**
 * Props:
 * - onRequireLogin?: () => void
 */
export default function NewReleasesPage({ onRequireLogin }) {
  return (
    <div className="p-6">
      <NewReleasesPageContent onRequireLogin={onRequireLogin} />
    </div>
  );
}

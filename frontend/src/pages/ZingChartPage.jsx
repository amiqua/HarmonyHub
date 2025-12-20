// src/pages/ZingChartPage.jsx
import ZingChartPageContent from "@/components/zingchart/ZingChartPageContent";

/**
 * ZingChartPage
 * - Page wrapper cho route "/zingchart"
 * - Không xử lý logic tại đây, chuyển hết qua ZingChartPageContent
 *
 * Props:
 * - onRequireLogin?: () => void  (dùng khi bạn muốn yêu cầu đăng nhập từ page)
 */
export default function ZingChartPage({ onRequireLogin, onPlaySong }) {
  return (
    <ZingChartPageContent
      onRequireLogin={onRequireLogin}
      onPlaySong={onPlaySong}
    />
  );
}

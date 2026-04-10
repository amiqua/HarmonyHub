/**
 * AppShell
 * - Khung layout chung: Sidebar trái + Topbar + nội dung chính
 */
export default function AppShell({ sidebar, topbar, children }) {
  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="app-shell__sidebar">
        {sidebar ?? (
          <div className="text-secondary" style={{ padding: "16px" }}>
            Sidebar placeholder
          </div>
        )}
      </aside>

      {/* Main Column */}
      <div className="app-shell__main">
        {/* Topbar */}
        <header className="app-shell__topbar">
          {topbar ?? (
            <div className="text-secondary">Topbar placeholder</div>
          )}
        </header>

        {/* Page content */}
        <main className="app-shell__content">
          {children}
        </main>
      </div>
    </div>
  );
}

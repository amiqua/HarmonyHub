/**
 * AppShell
 * - Khung layout chung: Sidebar trái + Topbar + nội dung chính
 * - Chưa gọi API (an toàn để mount trước)
 * - Nhận props để sau này bạn gắn Sidebar/Topbar thật vào mà không sửa nhiều
 *
 * Props:
 * - sidebar: ReactNode (nội dung sidebar)
 * - topbar: ReactNode (thanh top search + actions)
 * - children: ReactNode (nội dung page)
 */
export default function AppShell({ sidebar, topbar, children }) {
  return (
    <div className="w-screen min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex">
          <div className="flex w-full flex-col p-4">
            {sidebar ?? (
              <div className="text-sm opacity-70">
                Sidebar placeholder (sẽ thay bằng component Sidebar sau)
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
            <div className="px-4 py-3">
              {topbar ?? (
                <div className="text-sm opacity-70">
                  Topbar placeholder (sẽ thay bằng component TopBar sau)
                </div>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

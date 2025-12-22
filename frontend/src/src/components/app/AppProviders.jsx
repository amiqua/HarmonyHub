// FILE: src/components/app/AppProviders.jsx
// CHÚ THÍCH:
// - FIX lỗi trắng màn hình do bị NESTED ROUTER:
//   Bạn đang bọc <BrowserRouter> ở main.jsx, nhưng AppProviders trước đó cũng bọc <BrowserRouter> → gây lỗi:
//   "You cannot render a <Router> inside another <Router>".
// - Bản này: CHỈ bọc React Query + Sonner Toaster.
// - BrowserRouter sẽ nằm DUY NHẤT ở main.jsx (đúng như bạn đang làm).

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

/**
 * QueryClient nên tạo ở scope module để tránh bị tạo lại nhiều lần.
 * (React StrictMode dev có thể render 2 lần)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* Sonner: dùng chung cho toàn app (chỉ 1 lần) */}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

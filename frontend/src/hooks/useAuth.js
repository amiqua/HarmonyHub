import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { http } from "@/lib/http";
import { toast } from "sonner";

export function useAuth() {
  const { user, isAuthLoading, setUser, setAuthLoading } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        console.log("[useAuth] No token found in localStorage");
        return;
      }

      console.log("[useAuth] Found token, fetching profile...", {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + "...",
      });

      setAuthLoading(true);
      try {
        const res = await http.get("/auth/me");
        const userData = res.data?.data?.user || res.data?.user || res.data?.data;
        console.log("[useAuth] Profile fetched successfully:", userData);
        setUser(userData);
      } catch (err) {
        console.error("[useAuth] Fetch profile failed:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
          tokenInStorage: !!localStorage.getItem("accessToken"),
        });
        // Show error to user
        const message = err?.response?.data?.message || "Lỗi tải thông tin người dùng";
        toast.error(message);
      } finally {
        setAuthLoading(false);
      }
    };

    if (!user && !isAuthLoading) {
      fetchProfile();
    }
  }, [user, isAuthLoading, setUser, setAuthLoading]);

  return { user, isLoading: isAuthLoading };
}

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { http } from "@/lib/http";

export function useAuth() {
  const { user, isAuthLoading, setUser, setAuthLoading } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      setAuthLoading(true);
      try {
        const res = await http.get("/users/profile");
        setUser(res.data?.data);
      } catch (err) {
        console.error("Fetch profile failed:", err);
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

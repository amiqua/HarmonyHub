import { useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "@/services/auth.api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * LoginDialog
 * - UI đăng nhập dạng Dialog (shadcn)
 * - Call API: POST /auth/login (baseURL đã là /api/v1)
 * - Lưu token vào localStorage: accessToken / refreshToken
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open:boolean) => void
 * - onSuccess?: ({ user, tokens, raw }) => void
 */
export default function LoginDialog({ open, onOpenChange, onSuccess }) {
  const qc = useQueryClient();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email("Email không hợp lệ"),
        password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
      }),
    []
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const mLogin = useMutation({
    mutationFn: login, // { email, password } -> { user, tokens }
    onSuccess: (data) => {
      const user = data?.user ?? null;
      const accessToken = data?.tokens?.accessToken ?? null;
      const refreshToken = data?.tokens?.refreshToken ?? null;

      if (!accessToken) {
        toast.error("Đăng nhập thất bại: Không nhận được accessToken.");
        return;
      }

      // Lưu token để gọi API protected
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      // (tuỳ chọn) lưu user
      if (user) localStorage.setItem("user", JSON.stringify(user));

      toast.success("Đăng nhập thành công!");
      try {
        onSuccess?.({
          user,
          tokens: { accessToken, refreshToken },
          raw: data,
        });
      } catch (err) {
        console.error("[LoginDialog] onSuccess callback failed:", err);
      }

      onOpenChange?.(false);
      form.reset({ email: "", password: "" });

      // refresh lại dữ liệu các trang cần auth (history/favorites/playlists...)
      qc.invalidateQueries();
    },
    onError: (err) => {
      console.error("[LoginDialog] Login failed:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      toast.error(err?.response?.data?.message ?? "Sai email hoặc mật khẩu.");
    },
  });

  const onSubmit = (values) => {
    mLogin.mutate({ email: values.email, password: values.password });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Đăng nhập</DialogTitle>
          <DialogDescription>
            Nhập email và mật khẩu để truy cập tài khoản của bạn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                      disabled={mLogin.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••"
                      autoComplete="current-password"
                      {...field}
                      disabled={mLogin.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={mLogin.isPending}
            >
              {mLogin.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

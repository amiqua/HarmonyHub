import { useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { register as registerApi } from "@/services/auth.api";

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
 * RegisterDialog
 * - UI đăng ký dạng Dialog (shadcn)
 * - Call API: POST /auth/register
 * - Lưu token vào localStorage: accessToken / refreshToken
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open:boolean) => void
 * - onSuccess?: ({ user, tokens, raw }) => void
 * - onSwitchLogin?: () => void
 */
export default function RegisterDialog({
  open,
  onOpenChange,
  onSuccess,
  onSwitchLogin,
}) {
  const qc = useQueryClient();

  const schema = useMemo(
    () =>
      z
        .object({
          username: z
            .string()
            .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
            .max(50, "Tên đăng nhập tối đa 50 ký tự"),
          email: z.string().email("Email không hợp lệ").max(100),
          password: z
            .string()
            .min(8, "Mật khẩu tối thiểu 8 ký tự")
            .max(100, "Mật khẩu tối đa 100 ký tự")
            .regex(/[A-Z]/, "Phải có ít nhất 1 chữ HOA")
            .regex(/[a-z]/, "Phải có ít nhất 1 chữ thường")
            .regex(/[0-9]/, "Phải có ít nhất 1 chữ số")
            .regex(/[^A-Za-z0-9]/, "Phải có ít nhất 1 ký tự đặc biệt"),
          confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
        })
        .refine((v) => v.password === v.confirmPassword, {
          message: "Mật khẩu nhập lại không khớp",
          path: ["confirmPassword"],
        }),
    []
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const mRegister = useMutation({
    mutationFn: registerApi, // { username, email, password } -> { user, tokens }
    onSuccess: (data) => {
      const user = data?.user ?? null;
      const accessToken = data?.tokens?.accessToken ?? null;
      const refreshToken = data?.tokens?.refreshToken ?? null;

      // Có backend trả token ngay, có backend chỉ trả user
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast.success("Đăng ký thành công!");

      try {
        onSuccess?.({
          user,
          tokens: { accessToken, refreshToken },
          raw: data,
        });
      } catch (err) {
        console.error("[RegisterDialog] onSuccess callback failed:", err);
      }

      onOpenChange?.(false);
      form.reset({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      qc.invalidateQueries();
    },
    onError: (err) => {
      console.error("[RegisterDialog] Register failed:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      const data = err?.response?.data;
      const detailMsg = Array.isArray(data?.payload?.details)
        ? data.payload.details.map((d) => `${d.field}: ${d.message}`).join("\n")
        : null;
      toast.error(detailMsg || data?.message || "Đăng ký thất bại.");
    },
  });

  const onSubmit = (values) => {
    mRegister.mutate({
      username: values.username,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Đăng ký</DialogTitle>
          <DialogDescription>
            Tạo tài khoản mới để sử dụng đầy đủ tính năng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Sơn Tùng"
                      autoComplete="nickname"
                      {...field}
                      disabled={mRegister.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      disabled={mRegister.isPending}
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
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                      disabled={mRegister.isPending}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Tối thiểu 8 ký tự, có chữ HOA, chữ thường, số và ký tự
                    đặc biệt (vd: <code>Pass1234!</code>).
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhập lại mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••"
                      autoComplete="new-password"
                      {...field}
                      disabled={mRegister.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={mRegister.isPending}
            >
              {mRegister.isPending ? "Đang đăng ký..." : "Đăng ký"}
            </Button>

            {onSwitchLogin && (
              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={onSwitchLogin}
                  className="font-medium text-emerald-500 hover:underline"
                >
                  Đăng nhập
                </button>
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

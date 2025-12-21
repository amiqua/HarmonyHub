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
 */
export default function RegisterDialog({ open, onOpenChange, onSuccess }) {
  const qc = useQueryClient();

  const schema = useMemo(
    () =>
      z
        .object({
          username: z.string().min(2, "Tên hiển thị tối thiểu 2 ký tự"),
          email: z.string().email("Email không hợp lệ"),
          password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
          confirmPassword: z.string().min(6, "Vui lòng nhập lại mật khẩu"),
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
      toast.error(err?.response?.data?.message ?? "Đăng ký thất bại.");
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

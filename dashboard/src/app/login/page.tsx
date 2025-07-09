"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Button, Link } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { api } from "@/lib/api";
import Image from "next/image";

const loginSchema = z.object({
  username: z.string().min(1, "用户名是必填项"),
  password: z.string().min(6, "密码必须至少包含 6 个字符"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    try {
      const { token } = await api<any>('/users/login', {
        method: 'POST',
        body: data,
      });
      localStorage.setItem("token", token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "出现意外错误");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="flex justify-center">
          <Image src="/window.svg" alt="Logo" width={40} height={40} />
        </div>
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            登录您的帐户
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("username")}
              label="用户名"
              placeholder="请输入您的用户名"
              isInvalid={!!errors.username}
              errorMessage={errors.username?.message}
              startContent={
                <Mail className="w-4 h-4 text-gray-400" />
              }
            />
            <Input
              {...register("password")}
              label="密码"
              placeholder="请输入您的密码"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              startContent={
                <Lock className="w-4 h-4 text-gray-400" />
              }
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
            />
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "登录中..." : "登录"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-center text-gray-600">
            还没有帐户？{" "}
            <Link href="/register" color="primary">
              注册
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
} 
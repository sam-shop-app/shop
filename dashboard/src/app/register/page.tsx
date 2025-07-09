"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Button, Link } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { api } from "@/lib/api";
import Image from "next/image";

const registerSchema = z
  .object({
    username: z.string().min(1, "用户名是必填项"),
    email: z.string().email("无效的电子邮件地址"),
    password: z.string().min(6, "密码必须至少包含 6 个字符"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不匹配",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");
    setSuccess(false);
    try {
      await api('/users/register', {
        method: 'POST',
        body: {
          username: data.username,
          email: data.email,
          password: data.password,
        }
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
            创建帐户
          </h1>
          {success ? (
            <div className="p-4 text-center text-green-800 bg-green-100 border border-green-200 rounded-md">
              <p>注册成功！正在跳转到登录页面...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <Input
                {...register("username")}
                label="用户名"
                placeholder="请选择一个用户名"
                isInvalid={!!errors.username}
                errorMessage={errors.username?.message}
                startContent={
                  <User className="w-4 h-4 text-gray-400" />
                }
              />
              <Input
                {...register("email")}
                label="电子邮件地址"
                placeholder="请输入您的电子邮件"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                startContent={
                  <Mail className="w-4 h-4 text-gray-400" />
                }
              />
              <Input
                {...register("password")}
                label="密码"
                placeholder="请创建一个密码"
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
              <Input
                {...register("confirmPassword")}
                label="确认密码"
                placeholder="请确认您的密码"
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                startContent={
                  <Lock className="w-4 h-4 text-gray-400" />
                }
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleConfirmVisibility}
                  >
                    {isConfirmVisible ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                }
                type={isConfirmVisible ? "text" : "password"}
              />
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                {isSubmitting ? "创建中..." : "创建帐户"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-sm text-center text-gray-600">
            已经有帐户了？{" "}
            <Link href="/login" color="primary">
              登录
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
} 
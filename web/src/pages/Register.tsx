import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Link,
  useToast,
} from "@heroui/react";
import { FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ApiResponse, LoginResponse } from "../types/api";
import { useNavigate } from "react-router-dom";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data: ApiResponse<LoginResponse> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Registration failed");
      }

      const { user, token } = data.data;
      login(user, token);

      toast({
        title: "Welcome to Sam Shop!",
        description: "Your account has been created successfully",
        status: "success",
      });

      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      setError(message);
      toast({
        title: "Registration Failed",
        description: message,
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-default-500">
            Join Sam Shop to start shopping
          </p>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange("name")}
              required
              autoComplete="name"
            />
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange("email")}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange("password")}
              required
              autoComplete="new-password"
            />
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              required
              autoComplete="new-password"
            />
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>
        </CardBody>
        <CardFooter className="text-center">
          <div className="text-sm">
            Already have an account?{" "}
            <Link href="/login" size="sm">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

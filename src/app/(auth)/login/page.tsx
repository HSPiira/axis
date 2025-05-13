"use client";

import { Button } from "@/components/ui";
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { loginSchema } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import SignIn from "@/components/auth/sign-in";
import { ZodError } from "zod";

interface FormData {
  email: string;
  password: string;
  remember?: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const parsed = loginSchema.parse(formData);
      setIsSubmitting(true);
      setErrors({});

      const result = await signIn("credentials", {
        email: parsed.email,
        password: parsed.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setErrors({ submit: result.error });
      } else if (result?.ok) {
        // Wait a brief moment to ensure the session is established
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push(result.url || callbackUrl);
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const fieldErrors: FormErrors = {};
        err.issues.forEach((issue: { path: (string | number)[]; message: string }) => {
          fieldErrors[issue.path[0] as keyof FormErrors] = issue.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: "Something went wrong. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-950 dark:via-black dark:to-gray-900 flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="container max-w-md mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 relative w-full">
        <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            Home
          </Link>
        </div>
        <div className="bg-white/80 dark:bg-black/70 shadow-xl rounded-2xl p-8 sm:p-12 flex flex-col items-center max-w-lg w-full border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Sign in to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2 text-sm rounded-lg bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={formData.remember ?? false}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, remember: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>

            {errors.submit && (
              <div className="text-red-500 text-sm text-center">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 dark:bg-black/70 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <SignIn />

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Link
                href="/register"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

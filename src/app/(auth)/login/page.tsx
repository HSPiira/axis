"use client";

import { Button } from "@/components/ui";
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
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
        const { [name as keyof FormErrors]: _, ...rest } = prev;
        return rest;
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
        email: parsed.email, // ✅ keep only if backend expects `email`
        password: parsed.password,
        redirect: false,
        callbackUrl: "/dashboard", // allows the server to over-ride if needed
      });

      if (result?.error) {
        setErrors({ submit: result.error });
      } else {
        router.push(result.url || "/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const fieldErrors: FormErrors = {};
        err.issues.forEach((issue: any) => {
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-2 sm:p-4 md:p-6">
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
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight mb-1 sm:mb-2">
            Welcome to careAxis
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign in to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 md:space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-black/40 dark:text-white/40" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-[#2A2A2A] border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-[10px] sm:text-xs">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-black/40 dark:text-white/40" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-[#2A2A2A] border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-[10px] sm:text-xs">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <label className="flex items-center gap-1.5 sm:gap-2">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember ?? false}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, remember: e.target.checked }))
                }
                className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded border-black/20 dark:border-white/20 text-black dark:text-white focus:ring-black dark:focus:ring-white"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-black dark:text-white hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {errors.submit && (
            <div className="text-red-500 text-xs sm:text-sm text-center">
              {errors.submit}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/10 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <SignIn />

          <div className="text-center text-xs sm:text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>
            <Link
              href="/register"
              className="text-black dark:text-white hover:underline"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

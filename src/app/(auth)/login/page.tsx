"use client";

import { Button } from "@/components/ui";
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loginSchema } from "@/lib/validations/auth";
import { signIn, useSession } from "next-auth/react";
import SignIn from "@/components/auth/sign-in";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
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
        email: parsed.email,
        password: parsed.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ submit: result.error });
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err?.issues) {
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6">
      <div className="container max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 relative w-full">
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Home
          </Link>
        </div>
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight mb-2">Welcome to careAxis</h1>
          <p className="text-sm text-muted-foreground">Sign in to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 dark:text-white/40" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white dark:bg-[#2A2A2A] border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 dark:text-white/40" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-2 text-sm rounded-lg bg-white dark:bg-[#2A2A2A] border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-black/20 dark:border-white/20 text-black dark:text-white focus:ring-black dark:focus:ring-white"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-black dark:text-white hover:underline">
              Forgot password?
            </Link>
          </div>

          {errors.submit && <div className="text-red-500 text-sm text-center">{errors.submit}</div>}

          <Button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 rounded-lg py-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/10 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <SignIn />

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-black dark:text-white hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

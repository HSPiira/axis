// components/auth-guard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login"); // or your custom login page
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="p-4">Loading...</p>;
  }

  return <>{children}</>;
}

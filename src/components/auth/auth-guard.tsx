// src/components/auth/auth-guard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({
  children,
  loginPath = "/login",
  loadingComponent = <p className="p-4">Loading...</p>,
}: {
  children: React.ReactNode;
  loginPath?: string;
  loadingComponent?: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(loginPath);
    }
  }, [status, router, loginPath]);

  if (status === "loading") {
    return loadingComponent;
  }

  return <>{children}</>;
}

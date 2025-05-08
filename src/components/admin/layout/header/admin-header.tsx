import React, { useState } from "react";
import { Button, ThemeToggle } from "@/components/ui";
import { Bell, LogIn, LogOut, MessageCircle } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { BrandGradientText } from "@/components/ui/brand-gradient-text";

export function AdminHeader({ title }: { title: string }) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const handleLogin = () => signIn("microsoft-entra-id");
  const handleLogout = () => signOut();

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-30 w-full md:left-16 md:w-[calc(100vw-4rem)]"
    >
      <div className="flex items-center justify-between h-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-8 w-full">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate max-w-[30%] sm:max-w-[40%] md:max-w-[50%]">
          <BrandGradientText>{title}</BrandGradientText>
        </h1>
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open messages"
            title="Open messages"
            className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="View notifications"
            title="View notifications"
            className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </Button>
          <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9">
            <ThemeToggle />
          </div>
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log out"
              title="Log out"
              onClick={handleLogout}
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log in"
              title="Log in"
              onClick={handleLogin}
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

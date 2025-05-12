import React, { useState } from "react";
import { Button, ThemeToggle } from "@/components/ui";
import { Bell, LogIn, LogOut, MessageCircle, Menu } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { BrandGradientText } from "@/components/ui/brand-gradient-text";

export function AdminHeader({ title, onSidebarToggle }: { title: string; onSidebarToggle: () => void }) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const handleLogin = () => signIn("microsoft-entra-id");
  const handleLogout = () => signOut();

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-30 w-full"
    >
      <div className="flex items-center justify-between h-full max-w-screen-2xl mx-auto px-2 sm:px-3 md:px-4 w-full">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-1"
            aria-label="Open sidebar"
            onClick={onSidebarToggle}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="flex items-center min-h-[1.75rem] text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate sm:whitespace-normal max-w-full">
            <BrandGradientText>{title}</BrandGradientText>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open messages"
            title="Open messages"
            className="h-8 w-8"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="View notifications"
            title="View notifications"
            className="h-8 w-8"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <div className="flex items-center justify-center h-8 w-8">
            <ThemeToggle />
          </div>
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log out"
              title="Log out"
              onClick={handleLogout}
              className="h-8 w-8"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log in"
              title="Log in"
              onClick={handleLogin}
              className="h-8 w-8"
            >
              <LogIn className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

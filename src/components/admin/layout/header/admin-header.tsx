import React, { useState } from "react";
import { Button, ThemeToggle } from "@/components/ui";
import { Bell, LogIn, LogOut, MessageCircle } from "lucide-react";

// Authentication hook for managing login state
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    // Implement actual login logic here
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Implement actual logout logic here
    setIsAuthenticated(false);
  };

  return { isAuthenticated, handleLogin, handleLogout };
}

export function AdminHeader({ title }: { title: string }) {
  const { isAuthenticated, handleLogin, handleLogout } = useAuth();
  return (
    <header className="h-16 border-b flex items-center justify-between px-4">
      {/* React escapes text by default, so this is safe */}
      <h1 className="text-2xl font-bold">{title}</h1>
      <nav
        className="flex items-center gap-2"
        role="navigation"
        aria-label="Header actions"
      >
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open messages"
          title="Open messages"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="View notifications"
          title="View notifications"
        >
          <Bell className="w-6 h-6" />
        </Button>
        <ThemeToggle />
        {isAuthenticated ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            title="Log out"
            onClick={handleLogout}
          >
            <LogOut className="w-6 h-6" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log in"
            title="Log in"
            onClick={handleLogin}
          >
            <LogIn className="w-6 h-6" />
          </Button>
        )}
      </nav>
    </header>
  );
}

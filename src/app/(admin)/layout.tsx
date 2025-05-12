// app/(admin)/layout.tsx
// This layout is used for the admin section of the application
// It wraps the admin pages with a specific layout
// and applies the admin theme
// Importing React
"use client";
import { AdminHeader } from "@/components/admin/layout/header/admin-header";
import { COMPANY_NAME } from "@/lib/constants";
import { AuthGuard, AuthProvider } from "@/components/auth";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/layout/sidebar/admin-sidebar";
import { Home, Users, Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: <Home className="w-4 h-4" />,
  },
  {
    href: "/clients",
    label: "Clients",
    icon: <Users className="w-4 h-4" />,
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    href: "/sessions",
    label: "Sessions",
    icon: <MessageSquare className="w-4 h-4" />,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex min-h-screen bg-background text-foreground">
          <AdminSidebar
            navItems={navigationItems}
            isOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <div className={cn(
            "flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden",
            "lg:ml-64"
          )}>
            <AdminHeader
              title={COMPANY_NAME}
              onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <main className="flex-1 pt-16 px-6 lg:px-4 overflow-auto">
              <div className="max-w-7xl mx-auto py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}

// app/(admin)/layout.tsx
// This layout is used for the admin section of the application
// It wraps the admin pages with a specific layout
// and applies the admin theme
// Importing React
"use client";
import { AdminSidebar } from "@/components/admin/layout/sidebar/admin-sidebar";
import { ReactNode } from "react";
import { MenuItem } from "@/types";
import { HomeIcon, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/layout/header/admin-header";
import { COMPANY_NAME } from "@/lib/constants";
import { AuthGuard, AuthProvider } from "@/components/auth";
export default function AdminLayout({ children }: { children: ReactNode }) {
  const menuItems: MenuItem[] = [
    { title: "Dashboard", href: "/", icon: HomeIcon },
    { icon: Users, title: "Clients", href: "/clients" },
  ];
  return (
    <AuthProvider session={null}>
      <AuthGuard>
        <div className="flex h-screen min-h-screen bg-background text-foreground">
          <AdminSidebar menuItems={menuItems} title={COMPANY_NAME} />
          <div className="flex-1 overflow-auto">
            <AdminHeader title={COMPANY_NAME} />
            <main className="p-4">{children}</main>
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}

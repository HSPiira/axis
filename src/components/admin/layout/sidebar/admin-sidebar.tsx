import React from "react";
import { Home, Users, Calendar, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface AdminSidebarProps {
    navItems?: NavItem[];
    isOpen?: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminSidebar({ navItems = [], isOpen = true, setSidebarOpen }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <aside
                className={cn(
                    "fixed top-16 left-0 h-[calc(100vh-64px)] z-20 bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
                    isOpen ? "w-64 translate-x-0" : "-translate-x-full",
                    "lg:w-64 lg:translate-x-0" // Always show on large screens
                )}
            >
                <nav className="flex-1 px-0 pt-6 h-full">
                    <ul className="space-y-0.5">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 pl-3 pr-6 py-1.5 mx-3 text-xs font-medium rounded transition-colors",
                                        pathname === item.href ? 'sidebar-active' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                    )}
                                    onClick={() => {
                                        // Close sidebar on mobile after clicking a link
                                        if (window.innerWidth < 1024) {
                                            setSidebarOpen(false);
                                        }
                                    }}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mt-auto p-0 pb-4 pt-2 text-xs text-sidebar-foreground">
                    <div className="my-4 border-t border-sidebar-border" />
                    <ul className="space-y-0.5">
                        <li>
                            <Link
                                href="/settings"
                                className={cn(
                                    "flex items-center gap-3 pl-3 pr-6 py-1.5 mx-3 text-xs font-medium rounded transition-colors",
                                    pathname === '/settings' ? 'sidebar-active' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                )}
                                onClick={() => {
                                    // Close sidebar on mobile after clicking a link
                                    if (window.innerWidth < 1024) {
                                        setSidebarOpen(false);
                                    }
                                }}
                            >
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    );
} 
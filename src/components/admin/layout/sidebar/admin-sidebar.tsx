import React from "react";
import { Home, Users, Calendar, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface AdminSidebarProps {
    navItems?: NavItem[];
}

export default function AdminSidebar({ navItems = [] }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="fixed top-16 left-0 w-64 p-0 flex flex-col border-r border-sidebar-border text-sidebar-foreground font-sans text-sm h-[calc(100vh-64px)] z-20 bg-sidebar">
            <nav className="flex-1 px-0 pt-6">
                <ul className="space-y-0.5">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 pl-3 pr-6 py-1.5 mx-3 text-xs font-medium rounded transition-colors
                                    ${pathname === item.href ? 'sidebar-active' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
                            >
                                {item.icon}
                                {item.label}
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
                            className={`flex items-center gap-3 pl-3 pr-6 py-1.5 mx-3 text-xs font-medium rounded transition-colors
                                ${pathname === '/settings' ? 'sidebar-active' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
                        >
                            <Settings className="w-4 h-4" /> Settings
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
} 
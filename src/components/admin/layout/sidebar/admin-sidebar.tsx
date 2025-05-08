"use client";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types";
import { usePathname } from "next/navigation";
import NavItem from "./nav-item";
import { Settings } from "lucide-react";
import { CompanyLogo } from "./company-logo";

interface SidebarProps {
    className?: string;
    menuItems: MenuItem[];
    title: string;
}

const settingsItem: MenuItem = {
    title: "Settings",
    href: `/settings`,
    icon: Settings,
};

export function AdminSidebar({ className, menuItems, title }: SidebarProps) {
    const pathname = usePathname();
    return (
        <aside
            role="navigation"
            aria-label="Main Navigation"
            className={cn(
                "w-16 bg-background flex flex-col border-r",
                "min-h-screen",
                "fixed md:static top-0 left-0 z-40",
                className
            )}
        >
            <div className="p-2 flex items-center justify-center">
                <CompanyLogo
                    companyName={title}
                    size="lg"
                    className="w-10 h-10"
                    alt={`${title} logo`}
                />
            </div>
            <nav className="flex-1 flex flex-col items-center py-4 space-y-1">
                {menuItems.map((item) => (
                    <NavItem key={`${item.href}-${item.title}`} {...item} />
                ))}
            </nav>
            <div className="p-4 flex flex-col items-center justify-center">
                <NavItem {...settingsItem} />
            </div>
        </aside>
    );
}

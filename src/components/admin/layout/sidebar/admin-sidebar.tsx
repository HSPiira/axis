"use client";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types";
import { usePathname } from "next/navigation";
import NavItem from "./nav-item";
import { Settings, Menu } from "lucide-react";
import { CompanyLogo } from "./company-logo";
import { Button } from "@/components/ui";

interface SidebarProps {
    className?: string;
    menuItems: MenuItem[];
    title: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const settingsItem: MenuItem = {
    title: "Settings",
    href: `/settings`,
    icon: Settings,
};

export function AdminSidebar({ className, menuItems, title, isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                role="navigation"
                aria-label="Main Navigation"
                className={cn(
                    "w-16 bg-background flex flex-col border-r transition-transform duration-200",
                    "min-h-screen",
                    "fixed md:static top-0 left-0 z-40",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    className
                )}
            >
                <div className="flex items-center justify-center h-16">
                    <CompanyLogo
                        companyName={title}
                        size="lg"
                        className="w-10 h-10"
                        alt={`${title} logo`}
                    />
                </div>
                <nav className="flex-1 flex flex-col items-center py-4 space-y-1">
                    {menuItems.map((item) => (
                        <NavItem
                            key={`${item.href}-${item.title}`}
                            {...item}
                            onClick={() => setIsOpen(false)}
                        />
                    ))}
                </nav>
                <div className="p-4 flex flex-col items-center justify-center">
                    <NavItem {...settingsItem} onClick={() => setIsOpen(false)} />
                </div>
            </aside>
        </>
    );
}

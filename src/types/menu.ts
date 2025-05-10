import { LucideIcon } from "lucide-react";

export interface MenuItem {
    /** The display title of the menu item */
    title: string;
    /** The URL path the menu item links to */
    href: string;
    /** The Lucide icon component to display */
    icon: LucideIcon;
    children?: MenuItem[];
} 
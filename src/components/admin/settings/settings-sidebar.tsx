import React from "react";
import { SettingCategory } from "@/types";

type Props = {
    categories: SettingCategory[];
    selected: string;
    onSelect: (key: string) => void;
};

export default function SettingsSidebar({
    categories,
    selected,
    onSelect,
}: Props) {
    return (
        <aside className="w-64 bg-background h-[calc(100vh-4rem)] border-r border-border fixed top-16 left-16 z-30 py-6 mx-4">
            <ul className="space-y-2">
                {categories.map((cat) => (
                    <li key={cat.key}>
                        <button
                            className={`w-full text-left px-6 py-2.5 text-sm rounded-lg flex items-center gap-3 transition-all duration-150
                                font-medium
                                hover:bg-accent/60 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary
                                ${selected === cat.key
                                    ? "bg-accent/80 border-l-4 border-emerald-400 text-foreground font-semibold shadow-sm"
                                    : "border-l-4 border-transparent text-muted-foreground"}
                            `}
                            onClick={() => onSelect(cat.key)}
                            aria-current={selected === cat.key ? "true" : "false"}
                        >
                            {cat.icon}
                            {cat.title}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

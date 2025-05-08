import React from "react";
import { SettingCategory } from "@/types";

type Props = {
    categories: SettingCategory[];
    selected: string;
    onSelect: (key: string) => void;
};

export default function SettingsSidebar({ categories, selected, onSelect }: Props) {
    return (
        <aside className="fixed top-20 left-20 w-64 bg-background h-[calc(100vh-4rem)] z-40">
            <ul>
                {categories.map(cat => (
                    <li key={cat.key}>
                        <button
                            className={`w-full text-left px-4 py-3 hover:bg-accent rounded-md flex items-center gap-2 ${selected === cat.key ? "bg-accent font-semibold" : ""
                                }`}
                            onClick={() => onSelect(cat.key)}
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

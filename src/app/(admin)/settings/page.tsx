// src/app/settings/page.tsx or src/app/settings/layout.tsx
"use client";
import React, { useState } from "react";
import { SettingsSidebar, SettingsPanel } from "@/components/admin/settings";
import { SettingCategory } from "@/types";
import { Monitor, Volume2, Bell } from "lucide-react"; // Example icons

const categories: SettingCategory[] = [
    { key: "display", title: "Display", icon: <Monitor className="w-5 h-5" /> },
    { key: "sound", title: "Sound", icon: <Volume2 className="w-5 h-5" /> },
    { key: "notifications", title: "Notifications", icon: <Bell className="w-5 h-5" /> },
    // ...add more
];

export default function SettingsPage() {
    const [selected, setSelected] = useState(categories[0].key);

    return (
        <div className="flex min-h-screen">
            <SettingsSidebar
                categories={categories}
                selected={selected}
                onSelect={setSelected}
            />
            <main className="flex-1 p-8">
                <SettingsPanel selected={selected} />
            </main>
        </div>
    );
}
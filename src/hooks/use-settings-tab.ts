'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseSettingsTabOptions {
    section: string;
    defaultTab: string;
}

export function useSettingsTab({ section, defaultTab }: UseSettingsTabOptions) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get the active tab from URL or use default
    const activeTab = searchParams.get('tab') || defaultTab;

    // Ensure default tab is reflected in URL on initial load
    useEffect(() => {
        if (!searchParams.get('tab')) {
            router.push(`/settings?section=${section}&tab=${defaultTab}`);
        }
    }, []);

    const handleTabChange = (value: string) => {
        router.push(`/settings?section=${section}&tab=${value}`);
    };

    return {
        activeTab,
        handleTabChange,
    };
} 
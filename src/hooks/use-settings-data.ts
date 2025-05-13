'use client';

import { useState, useEffect } from 'react';
import { useSettingsTab } from './use-settings-tab';
import { useSession } from 'next-auth/react';

interface UseSettingsDataOptions {
    section: string;
    defaultTab: string;
    dataLoaders: {
        [key: string]: () => Promise<any>;
    };
}

export function useSettingsData({ section, defaultTab, dataLoaders }: UseSettingsDataOptions) {
    const { activeTab, handleTabChange } = useSettingsTab({ section, defaultTab });
    const [data, setData] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<{ [key: string]: Error | null }>({});
    const { data: session } = useSession();

    // Load data for all tabs when component mounts
    useEffect(() => {
        const loadAllData = async () => {
            const loadPromises = Object.entries(dataLoaders).map(async ([tab, loader]) => {
                try {
                    setLoading(prev => ({ ...prev, [tab]: true }));
                    const result = await loader();
                    setData(prev => ({ ...prev, [tab]: result }));
                    setError(prev => ({ ...prev, [tab]: null }));
                } catch (err) {
                    setError(prev => ({ ...prev, [tab]: err as Error }));
                } finally {
                    setLoading(prev => ({ ...prev, [tab]: false }));
                }
            });

            await Promise.all(loadPromises);
        };

        if (session) {
            loadAllData();
        }
    }, [session]); // Add session as a dependency

    return {
        activeTab,
        handleTabChange,
        data,
        loading,
        error,
    };
} 
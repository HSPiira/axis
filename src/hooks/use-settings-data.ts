'use client';

import { useState, useEffect } from 'react';
import { useSettingsTab } from './use-settings-tab';
import { useSession } from 'next-auth/react';

interface UseSettingsDataOptions<T extends Record<string, any>> {
    section: string;
    defaultTab: string;
    dataLoaders: {
        [K in keyof T]: () => Promise<T[K]>;
    };
}

interface ApiError {
    error: string;
}

export function useSettingsData<T extends Record<string, any>>({ section, defaultTab, dataLoaders }: UseSettingsDataOptions<T>) {
    const { activeTab, handleTabChange } = useSettingsTab({ section, defaultTab });
    const [data, setData] = useState<T>({} as T);
    const [loading, setLoading] = useState<{ [K in keyof T]: boolean }>({} as { [K in keyof T]: boolean });
    const [error, setError] = useState<{ [K in keyof T]: ApiError | null }>({} as { [K in keyof T]: ApiError | null });
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
                    const apiError = err as ApiError;
                    setError(prev => ({ ...prev, [tab]: apiError }));
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
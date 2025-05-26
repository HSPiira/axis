'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'default' | 'blue' | 'green' | 'purple';
type FontSize = 'small' | 'medium' | 'large';

interface Settings {
    theme: Theme;
    colorScheme: ColorScheme;
    fontSize: FontSize;
    reducedMotion: boolean;
    highContrast: boolean;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const defaultSettings: Settings = {
    theme: 'system',
    colorScheme: 'default',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    // Load settings from localStorage on mount
    useEffect(() => {
        const loadSettings = () => {
            try {
                const savedSettings = localStorage.getItem('appSettings');
                if (savedSettings) {
                    setSettings(JSON.parse(savedSettings));
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    // Apply settings to document
    useEffect(() => {
        if (isLoading) return;

        // Apply theme
        const root = window.document.documentElement;
        if (settings.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
        } else {
            root.classList.remove('light', 'dark');
            root.classList.add(settings.theme);
        }

        // Apply color scheme
        root.classList.remove('color-scheme-default', 'color-scheme-blue', 'color-scheme-green', 'color-scheme-purple');
        root.classList.add(`color-scheme-${settings.colorScheme}`);

        // Apply font size
        root.classList.remove('text-sm', 'text-base', 'text-lg');
        root.classList.add(
            settings.fontSize === 'small' ? 'text-sm' :
                settings.fontSize === 'large' ? 'text-lg' : 'text-base'
        );

        // Apply reduced motion
        if (settings.reducedMotion) {
            root.classList.add('reduced-motion');
        } else {
            root.classList.remove('reduced-motion');
        }

        // Apply high contrast
        if (settings.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }
    }, [settings, isLoading]);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        try {
            const updatedSettings = { ...settings, ...newSettings };
            setSettings(updatedSettings);
            localStorage.setItem('appSettings', JSON.stringify(updatedSettings));

            // Here you would typically make an API call to persist settings
            // await api.updateSettings(updatedSettings);
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    };

    if (isLoading) {
        return null; // or a loading spinner
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
} 
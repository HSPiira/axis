'use client';

import React, { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const AppearanceSettingsPage = () => {
    const { settings, updateSettings } = useSettings();
    const [isUpdating, setIsUpdating] = useState(false);
    const [localSettings, setLocalSettings] = useState(settings);

    const handleUpdate = async () => {
        try {
            setIsUpdating(true);
            await updateSettings(localSettings);
        } catch (error) {
            console.error('Failed to update settings:', error);
            // You might want to show an error toast here
        } finally {
            setIsUpdating(false);
        }
    };

    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

    return (
        <div className="max-w-6xl mx-auto px-2 sm:px-4 space-y-6 lg:ml-56">
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">Appearance</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Customize how careAxis looks and feels</p>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Theme</label>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'light' }))}
                        className={`p-4 border rounded-lg text-center ${localSettings.theme === 'light'
                            ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-900'
                            : 'border-gray-200 dark:border-gray-800'
                            }`}
                    >
                        <div className="w-full h-24 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded mb-2"></div>
                        <span className="text-sm">Light</span>
                    </button>
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'dark' }))}
                        className={`p-4 border rounded-lg text-center ${localSettings.theme === 'dark'
                            ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-900'
                            : 'border-gray-200 dark:border-gray-800'
                            }`}
                    >
                        <div className="w-full h-24 bg-gray-900 border border-gray-800 rounded mb-2"></div>
                        <span className="text-sm">Dark</span>
                    </button>
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'system' }))}
                        className={`p-4 border rounded-lg text-center ${localSettings.theme === 'system'
                            ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-900'
                            : 'border-gray-200 dark:border-gray-800'
                            }`}
                    >
                        <div className="w-full h-24 bg-gradient-to-r from-white to-gray-900 border border-gray-200 dark:border-gray-800 rounded mb-2"></div>
                        <span className="text-sm">System</span>
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Color Scheme</label>
                <select
                    value={localSettings.colorScheme}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, colorScheme: e.target.value as any }))}
                    className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-black text-gray-900 dark:text-gray-200"
                >
                    <option value="default">Default</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                </select>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Font Size</label>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: 'small' }))}
                        className={`px-3 py-1 rounded ${localSettings.fontSize === 'small'
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                            }`}
                    >
                        Small
                    </button>
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: 'medium' }))}
                        className={`px-3 py-1 rounded ${localSettings.fontSize === 'medium'
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                            }`}
                    >
                        Medium
                    </button>
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: 'large' }))}
                        className={`px-3 py-1 rounded ${localSettings.fontSize === 'large'
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                            }`}
                    >
                        Large
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">Reduced motion</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Minimize animations and transitions</div>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={localSettings.reducedMotion}
                            onChange={() => setLocalSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:bg-black dark:peer-checked:bg-white transition-all"></div>
                        <div
                            className={`absolute ml-1 mt-1 w-4 h-4 bg-white dark:bg-black rounded-full shadow transition-all ${localSettings.reducedMotion ? 'translate-x-5' : ''
                                }`}
                        ></div>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">High contrast</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Increase contrast for better readability</div>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={localSettings.highContrast}
                            onChange={() => setLocalSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:bg-black dark:peer-checked:bg-white transition-all"></div>
                        <div
                            className={`absolute ml-1 mt-1 w-4 h-4 bg-white dark:bg-black rounded-full shadow transition-all ${localSettings.highContrast ? 'translate-x-5' : ''
                                }`}
                        ></div>
                    </label>
                </div>
            </div>

            <button
                onClick={handleUpdate}
                disabled={!hasChanges || isUpdating}
                className={`mt-6 px-6 py-2 rounded ${hasChanges
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
            >
                {isUpdating ? (
                    <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Updating...</span>
                    </div>
                ) : (
                    'Update'
                )}
            </button>
        </div>
    );
};

export default AppearanceSettingsPage; 
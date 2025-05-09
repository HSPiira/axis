'use client';

import React, { useState } from 'react';
import { Switch, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';

export function SystemSettings() {
    const [systemName, setSystemName] = useState('Care System');
    const [timezone, setTimezone] = useState('UTC');
    const [locale, setLocale] = useState('en-US');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const { theme, setTheme } = useTheme();
    const [featureFlags, setFeatureFlags] = useState({
        betaFeatures: false,
        darkMode: theme === 'dark',
        analytics: true,
    });

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <div>
                <h2 className="text-lg font-semibold">System Configuration</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your system settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-100 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-300">System Branding</CardTitle>
                        <CardDescription>Configure your system name and branding</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="systemName">System Name</Label>
                                <Input
                                    id="systemName"
                                    value={systemName}
                                    onChange={(e) => setSystemName(e.target.value)}
                                    placeholder="Enter system name"
                                    className="bg-white/50 dark:bg-gray-900/50"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-100 dark:border-purple-900">
                    <CardHeader>
                        <CardTitle className="text-purple-700 dark:text-purple-300">Regional Settings</CardTitle>
                        <CardDescription>Set default timezone and locale preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Default Timezone</Label>
                                <Select value={timezone} onValueChange={setTimezone}>
                                    <SelectTrigger className="bg-white/50 dark:bg-gray-900/50">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="locale">Default Locale</Label>
                                <Select value={locale} onValueChange={setLocale}>
                                    <SelectTrigger className="bg-white/50 dark:bg-gray-900/50">
                                        <SelectValue placeholder="Select locale" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en-US">English (US)</SelectItem>
                                        <SelectItem value="en-GB">English (UK)</SelectItem>
                                        <SelectItem value="es-ES">Spanish</SelectItem>
                                        <SelectItem value="fr-FR">French</SelectItem>
                                        <SelectItem value="de-DE">German</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-100 dark:border-amber-900">
                    <CardHeader>
                        <CardTitle className="text-amber-700 dark:text-amber-300">System Status</CardTitle>
                        <CardDescription>Control system maintenance and feature flags</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-gray-900/30">
                                <div className="space-y-0.5">
                                    <Label>Maintenance Mode</Label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Enable maintenance mode to restrict access to the system
                                    </p>
                                </div>
                                <Switch
                                    checked={maintenanceMode}
                                    onCheckedChange={setMaintenanceMode}
                                    className="bg-gray-200 dark:bg-gray-700 data-[state=checked]:bg-amber-500 dark:data-[state=checked]:bg-amber-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-100 dark:border-emerald-900">
                    <CardHeader>
                        <CardTitle className="text-emerald-700 dark:text-emerald-300">Feature Flags</CardTitle>
                        <CardDescription>Enable or disable system features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-gray-900/30">
                                <div className="space-y-0.5">
                                    <Label>Beta Features</Label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Enable experimental features
                                    </p>
                                </div>
                                <Switch
                                    checked={featureFlags.betaFeatures}
                                    onCheckedChange={(checked) =>
                                        setFeatureFlags(prev => ({ ...prev, betaFeatures: checked }))
                                    }
                                    className="bg-gray-200 dark:bg-gray-700 data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-gray-900/30">
                                <div className="space-y-0.5">
                                    <Label>Dark Mode</Label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Enable dark mode support
                                    </p>
                                </div>
                                <Switch
                                    checked={featureFlags.darkMode}
                                    onCheckedChange={(checked) => {
                                        setFeatureFlags(prev => ({ ...prev, darkMode: checked }));
                                        setTheme(checked ? 'dark' : 'light');
                                    }}
                                    className="bg-gray-200 dark:bg-gray-700 data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-gray-900/30">
                                <div className="space-y-0.5">
                                    <Label>Analytics</Label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Enable system analytics
                                    </p>
                                </div>
                                <Switch
                                    checked={featureFlags.analytics}
                                    onCheckedChange={(checked) =>
                                        setFeatureFlags(prev => ({ ...prev, analytics: checked }))
                                    }
                                    className="bg-gray-200 dark:bg-gray-700 data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
export default SystemSettings;
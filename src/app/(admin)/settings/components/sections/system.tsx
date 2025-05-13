'use client';

import React, { useState } from 'react';
import { Switch, Input, Label } from '@/components/ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-xl font-semibold">System Configuration</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your system settings and preferences
                </p>
            </div>

            {/* Top row: Branding & Regional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* System Branding */}
                <div className="rounded-lg border border-border p-5 flex flex-col gap-4">
                    <div>
                        <h3 className="text-base font-semibold mb-1">System Branding</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                            Configure your system name and branding
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded bg-muted flex items-center justify-center text-muted-foreground text-2xl font-bold">
                            <span>Logo</span>
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="systemName">System Name</Label>
                            <Input
                                id="systemName"
                                value={systemName}
                                onChange={(e) => setSystemName(e.target.value)}
                                placeholder="Enter system name"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Regional Settings */}
                <div className="rounded-lg border border-border p-5 flex flex-col gap-4">
                    <div>
                        <h3 className="text-base font-semibold mb-1">Regional Settings</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                            Set default timezone and locale preferences
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="timezone">Default Timezone</Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                                <SelectTrigger className="mt-1">
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
                        <div>
                            <Label htmlFor="locale">Default Locale</Label>
                            <Select value={locale} onValueChange={setLocale}>
                                <SelectTrigger className="mt-1">
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
                </div>
            </div>

            {/* Bottom row: Status & Feature Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* System Status */}
                <div className="rounded-lg border border-border p-5 flex flex-col gap-4">
                    <div>
                        <h3 className="text-base font-semibold mb-1">System Status</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                            Control system maintenance mode
                        </p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                        <div>
                            <Label>Maintenance Mode</Label>
                            <p className="text-xs text-muted-foreground">
                                Enable maintenance mode to restrict access
                            </p>
                        </div>
                        <Switch
                            checked={maintenanceMode}
                            onCheckedChange={setMaintenanceMode}
                        />
                    </div>
                </div>

                {/* Feature Flags */}
                <div className="rounded-lg border border-border p-5 flex flex-col gap-4">
                    <div>
                        <h3 className="text-base font-semibold mb-1">Feature Flags</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                            Enable or disable system features
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                            <div>
                                <Label>Beta Features</Label>
                                <p className="text-xs text-muted-foreground">
                                    Enable experimental features
                                </p>
                            </div>
                            <Switch
                                checked={featureFlags.betaFeatures}
                                onCheckedChange={(checked) =>
                                    setFeatureFlags((prev) => ({ ...prev, betaFeatures: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                            <div>
                                <Label>Dark Mode</Label>
                                <p className="text-xs text-muted-foreground">
                                    Enable dark mode support
                                </p>
                            </div>
                            <Switch
                                checked={featureFlags.darkMode}
                                onCheckedChange={(checked) => {
                                    setFeatureFlags((prev) => ({ ...prev, darkMode: checked }));
                                    setTheme(checked ? 'dark' : 'light');
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                            <div>
                                <Label>Analytics</Label>
                                <p className="text-xs text-muted-foreground">
                                    Enable system analytics
                                </p>
                            </div>
                            <Switch
                                checked={featureFlags.analytics}
                                onCheckedChange={(checked) =>
                                    setFeatureFlags((prev) => ({ ...prev, analytics: checked }))
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SystemSettings;
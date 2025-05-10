'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSettingsTab } from '@/hooks/use-settings-tab';

interface KPIDefinition {
    id: string;
    name: string;
    description: string;
    formula: string;
    unit: string;
    category: string;
    isActive: boolean;
}

interface DashboardConfig {
    id: string;
    name: string;
    description: string;
    widgets: string[];
    isDefault: boolean;
    isPublic: boolean;
}

export function AnalyticsSettings() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activeTab, handleTabChange } = useSettingsTab({
        section: 'analytics',
        defaultTab: 'period'
    });

    const [reportingPeriod, setReportingPeriod] = useState({
        defaultPeriod: 'monthly',
        fiscalYearStart: '01-01',
        customPeriods: ['weekly', 'monthly', 'quarterly', 'yearly'],
    });

    const [kpiDefinitions, setKpiDefinitions] = useState<KPIDefinition[]>([
        {
            id: '1',
            name: 'Revenue Growth',
            description: 'Percentage change in revenue over time',
            formula: '(Current Revenue - Previous Revenue) / Previous Revenue * 100',
            unit: '%',
            category: 'Financial',
            isActive: true,
        },
        {
            id: '2',
            name: 'Customer Acquisition Cost',
            description: 'Total cost of acquiring new customers',
            formula: 'Total Marketing Cost / Number of New Customers',
            unit: 'USD',
            category: 'Marketing',
            isActive: true,
        },
    ]);

    const [dashboardConfigs, setDashboardConfigs] = useState<DashboardConfig[]>([
        {
            id: '1',
            name: 'Executive Overview',
            description: 'Key metrics for executive decision making',
            widgets: ['Revenue Growth', 'Customer Acquisition Cost', 'User Engagement'],
            isDefault: true,
            isPublic: true,
        },
        {
            id: '2',
            name: 'Marketing Performance',
            description: 'Marketing campaign and channel performance',
            widgets: ['Campaign ROI', 'Channel Attribution', 'Conversion Rates'],
            isDefault: false,
            isPublic: false,
        },
    ]);

    const [exportSettings, setExportSettings] = useState({
        formats: ['csv', 'excel', 'pdf'],
        maxRowsPerExport: 10000,
        includeMetadata: true,
        compressionEnabled: true,
    });

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <div>
                <h2 className="text-lg font-semibold">Reporting & Analytics</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure reporting periods and analytics settings</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="period">Reporting Period</TabsTrigger>
                    <TabsTrigger value="kpi">KPI Definitions</TabsTrigger>
                    <TabsTrigger value="dashboard">Dashboards</TabsTrigger>
                    <TabsTrigger value="export">Export Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="period">
                    <Card>
                        <CardHeader>
                            <CardTitle>Default Reporting Period</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Default Period</Label>
                                    <Select
                                        value={reportingPeriod.defaultPeriod}
                                        onValueChange={(value) => setReportingPeriod({ ...reportingPeriod, defaultPeriod: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select default period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Fiscal Year Start</Label>
                                    <Input
                                        type="date"
                                        value={reportingPeriod.fiscalYearStart}
                                        onChange={(e) => setReportingPeriod({ ...reportingPeriod, fiscalYearStart: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Available Periods</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {reportingPeriod.customPeriods.map((period) => (
                                            <span
                                                key={period}
                                                className="px-2 py-1 bg-gray-100 rounded text-sm"
                                            >
                                                {period}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="kpi">
                    <Card>
                        <CardHeader>
                            <CardTitle>KPI Definitions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add KPI</Button>
                            </div>

                            <div className="space-y-4">
                                {kpiDefinitions.map((kpi) => (
                                    <Card key={kpi.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{kpi.name}</h3>
                                                        <p className="text-sm text-gray-500">{kpi.description}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={kpi.isActive} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Formula</Label>
                                                        <Input value={kpi.formula} readOnly />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Unit</Label>
                                                        <Input value={kpi.unit} readOnly />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Category</Label>
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                                                        {kpi.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dashboard">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dashboard Configurations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Dashboard</Button>
                            </div>

                            <div className="space-y-4">
                                {dashboardConfigs.map((dashboard) => (
                                    <Card key={dashboard.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{dashboard.name}</h3>
                                                        <p className="text-sm text-gray-500">{dashboard.description}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={dashboard.isPublic} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Widgets</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {dashboard.widgets.map((widget) => (
                                                            <span
                                                                key={widget}
                                                                className="px-2 py-1 bg-gray-100 rounded text-sm"
                                                            >
                                                                {widget}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch checked={dashboard.isDefault} />
                                                    <Label>Set as Default Dashboard</Label>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="export">
                    <Card>
                        <CardHeader>
                            <CardTitle>Export Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Export Formats</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {exportSettings.formats.map((format) => (
                                            <span
                                                key={format}
                                                className="px-2 py-1 bg-gray-100 rounded text-sm"
                                            >
                                                {format.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Maximum Rows per Export</Label>
                                    <Input
                                        type="number"
                                        value={exportSettings.maxRowsPerExport}
                                        onChange={(e) => setExportSettings({ ...exportSettings, maxRowsPerExport: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={exportSettings.includeMetadata}
                                            onCheckedChange={(checked) => setExportSettings({ ...exportSettings, includeMetadata: checked })}
                                        />
                                        <Label>Include Metadata in Exports</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={exportSettings.compressionEnabled}
                                            onCheckedChange={(checked) => setExportSettings({ ...exportSettings, compressionEnabled: checked })}
                                        />
                                        <Label>Enable Export Compression</Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
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

interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    steps: {
        id: string;
        name: string;
        type: 'approval' | 'notification' | 'action';
        assignee: string;
        sla: number;
    }[];
    isActive: boolean;
}

interface FormTemplate {
    id: string;
    name: string;
    description: string;
    fields: {
        id: string;
        name: string;
        type: string;
        required: boolean;
        defaultValue: string;
    }[];
    isDefault: boolean;
}

interface SearchPreset {
    id: string;
    name: string;
    description: string;
    filters: {
        field: string;
        operator: string;
        value: string;
    }[];
    isDefault: boolean;
}

export function BehaviorSettings() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activeTab, handleTabChange } = useSettingsTab({
        section: 'behavior',
        defaultTab: 'workflow'
    });

    const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([
        {
            id: '1',
            name: 'Expense Approval',
            description: 'Standard expense approval workflow',
            steps: [
                {
                    id: '1',
                    name: 'Manager Approval',
                    type: 'approval',
                    assignee: 'Direct Manager',
                    sla: 48,
                },
                {
                    id: '2',
                    name: 'Finance Review',
                    type: 'approval',
                    assignee: 'Finance Team',
                    sla: 72,
                },
            ],
            isActive: true,
        },
        {
            id: '2',
            name: 'Leave Request',
            description: 'Employee leave request workflow',
            steps: [
                {
                    id: '1',
                    name: 'Manager Approval',
                    type: 'approval',
                    assignee: 'Direct Manager',
                    sla: 24,
                },
                {
                    id: '2',
                    name: 'HR Notification',
                    type: 'notification',
                    assignee: 'HR Team',
                    sla: 0,
                },
            ],
            isActive: true,
        },
    ]);

    const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([
        {
            id: '1',
            name: 'Customer Onboarding',
            description: 'Standard customer onboarding form',
            fields: [
                {
                    id: '1',
                    name: 'Company Name',
                    type: 'text',
                    required: true,
                    defaultValue: '',
                },
                {
                    id: '2',
                    name: 'Industry',
                    type: 'select',
                    required: true,
                    defaultValue: 'Technology',
                },
            ],
            isDefault: true,
        },
    ]);

    const [searchPresets, setSearchPresets] = useState<SearchPreset[]>([
        {
            id: '1',
            name: 'Active Customers',
            description: 'Filter for active customers',
            filters: [
                {
                    field: 'status',
                    operator: 'equals',
                    value: 'active',
                },
            ],
            isDefault: true,
        },
    ]);

    const [uiSettings, setUiSettings] = useState({
        theme: 'light',
        layout: 'default',
        density: 'comfortable',
        animations: true,
        customColors: {
            primary: '#000000',
            secondary: '#666666',
            accent: '#0066cc',
        },
    });

    const [defaultValues, setDefaultValues] = useState({
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'en-US',
        currency: 'USD',
        language: 'en',
    });

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <div>
                <h2 className="text-lg font-semibold">Application Behavior</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure application workflows and behavior settings</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="workflow">Workflows</TabsTrigger>
                    <TabsTrigger value="ui">UI Customization</TabsTrigger>
                    <TabsTrigger value="forms">Form Templates</TabsTrigger>
                    <TabsTrigger value="search">Search Presets</TabsTrigger>
                    <TabsTrigger value="defaults">Default Values</TabsTrigger>
                </TabsList>

                <TabsContent value="workflow">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">Workflow Definitions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Workflow</Button>
                            </div>

                            <div className="space-y-4">
                                {workflows.map((workflow) => (
                                    <Card key={workflow.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{workflow.name}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{workflow.description}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={workflow.isActive} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Workflow Steps</Label>
                                                    <div className="space-y-2">
                                                        {workflow.steps.map((step) => (
                                                            <div key={step.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                                <div>
                                                                    <span className="font-medium">{step.name}</span>
                                                                    <span className="text-sm text-gray-500 ml-2">({step.type})</span>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    SLA: {step.sla}h
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ui">
                    <Card>
                        <CardHeader>
                            <CardTitle>UI Customization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Theme</Label>
                                    <Select
                                        value={uiSettings.theme}
                                        onValueChange={(value) => setUiSettings({ ...uiSettings, theme: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="system">System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Layout</Label>
                                    <Select
                                        value={uiSettings.layout}
                                        onValueChange={(value) => setUiSettings({ ...uiSettings, layout: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select layout" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="compact">Compact</SelectItem>
                                            <SelectItem value="spacious">Spacious</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Density</Label>
                                    <Select
                                        value={uiSettings.density}
                                        onValueChange={(value) => setUiSettings({ ...uiSettings, density: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select density" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="comfortable">Comfortable</SelectItem>
                                            <SelectItem value="compact">Compact</SelectItem>
                                            <SelectItem value="spacious">Spacious</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Custom Colors</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Primary</Label>
                                            <Input
                                                type="color"
                                                value={uiSettings.customColors.primary}
                                                onChange={(e) => setUiSettings({
                                                    ...uiSettings,
                                                    customColors: { ...uiSettings.customColors, primary: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Secondary</Label>
                                            <Input
                                                type="color"
                                                value={uiSettings.customColors.secondary}
                                                onChange={(e) => setUiSettings({
                                                    ...uiSettings,
                                                    customColors: { ...uiSettings.customColors, secondary: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Accent</Label>
                                            <Input
                                                type="color"
                                                value={uiSettings.customColors.accent}
                                                onChange={(e) => setUiSettings({
                                                    ...uiSettings,
                                                    customColors: { ...uiSettings.customColors, accent: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={uiSettings.animations}
                                        onCheckedChange={(checked) => setUiSettings({ ...uiSettings, animations: checked })}
                                    />
                                    <Label>Enable Animations</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="forms">
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Templates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Template</Button>
                            </div>

                            <div className="space-y-4">
                                {formTemplates.map((template) => (
                                    <Card key={template.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{template.name}</h3>
                                                        <p className="text-sm text-gray-500">{template.description}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={template.isDefault} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Fields</Label>
                                                    <div className="space-y-2">
                                                        {template.fields.map((field) => (
                                                            <div key={field.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                                <div>
                                                                    <span className="font-medium">{field.name}</span>
                                                                    <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Switch checked={field.required} />
                                                                    <span className="text-sm text-gray-500">
                                                                        Default: {field.defaultValue || 'None'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="search">
                    <Card>
                        <CardHeader>
                            <CardTitle>Search Presets</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Preset</Button>
                            </div>

                            <div className="space-y-4">
                                {searchPresets.map((preset) => (
                                    <Card key={preset.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{preset.name}</h3>
                                                        <p className="text-sm text-gray-500">{preset.description}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={preset.isDefault} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Filters</Label>
                                                    <div className="space-y-2">
                                                        {preset.filters.map((filter, index) => (
                                                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                                                <span className="font-medium">{filter.field}</span>
                                                                <span className="text-gray-500">{filter.operator}</span>
                                                                <span className="text-gray-700">{filter.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="defaults">
                    <Card>
                        <CardHeader>
                            <CardTitle>Default Values</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Timezone</Label>
                                        <Select
                                            value={defaultValues.timezone}
                                            onValueChange={(value) => setDefaultValues({ ...defaultValues, timezone: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTC">UTC</SelectItem>
                                                <SelectItem value="EST">EST</SelectItem>
                                                <SelectItem value="PST">PST</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Date Format</Label>
                                        <Select
                                            value={defaultValues.dateFormat}
                                            onValueChange={(value) => setDefaultValues({ ...defaultValues, dateFormat: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select date format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Number Format</Label>
                                        <Select
                                            value={defaultValues.numberFormat}
                                            onValueChange={(value) => setDefaultValues({ ...defaultValues, numberFormat: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select number format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en-US">US (1,234.56)</SelectItem>
                                                <SelectItem value="de-DE">German (1.234,56)</SelectItem>
                                                <SelectItem value="fr-FR">French (1 234,56)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Language</Label>
                                        <Select
                                            value={defaultValues.language}
                                            onValueChange={(value) => setDefaultValues({ ...defaultValues, language: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                            </SelectContent>
                                        </Select>
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
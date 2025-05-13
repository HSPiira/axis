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
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-xl font-semibold">Application Behavior</h2>
                <p className="text-sm text-muted-foreground">Configure application workflows and behavior settings</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="workflow">Workflows</TabsTrigger>
                    <TabsTrigger value="ui">UI Customization</TabsTrigger>
                    <TabsTrigger value="forms">Form Templates</TabsTrigger>
                    <TabsTrigger value="search">Search Presets</TabsTrigger>
                    <TabsTrigger value="defaults">Default Values</TabsTrigger>
                </TabsList>

                <TabsContent value="workflow">
                    <div className="flex justify-end mb-4">
                        <Button>Add Workflow</Button>
                    </div>
                    <div className="space-y-4">
                        {workflows.map((workflow) => (
                            <div key={workflow.id} className="border border-border rounded-lg p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-base">{workflow.name}</h3>
                                        <p className="text-xs text-muted-foreground">{workflow.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch checked={workflow.isActive} />
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Workflow Steps</Label>
                                    <div className="space-y-1">
                                        {workflow.steps.map((step) => (
                                            <div key={step.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                                <div>
                                                    <span className="font-medium">{step.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">({step.type})</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">SLA: {step.sla}h</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="ui">
                    <div className="border border-border rounded-lg p-4 flex flex-col gap-4 max-w-2xl">
                        <div className="space-y-2">
                            <Label>Theme</Label>
                            <Select value={uiSettings.theme} onValueChange={(value) => setUiSettings({ ...uiSettings, theme: value })}>
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
                            <Select value={uiSettings.layout} onValueChange={(value) => setUiSettings({ ...uiSettings, layout: value })}>
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
                            <Select value={uiSettings.density} onValueChange={(value) => setUiSettings({ ...uiSettings, density: value })}>
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
                                    <Input type="color" value={uiSettings.customColors.primary} onChange={(e) => setUiSettings({ ...uiSettings, customColors: { ...uiSettings.customColors, primary: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Secondary</Label>
                                    <Input type="color" value={uiSettings.customColors.secondary} onChange={(e) => setUiSettings({ ...uiSettings, customColors: { ...uiSettings.customColors, secondary: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Accent</Label>
                                    <Input type="color" value={uiSettings.customColors.accent} onChange={(e) => setUiSettings({ ...uiSettings, customColors: { ...uiSettings.customColors, accent: e.target.value } })} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={uiSettings.animations} onCheckedChange={(checked) => setUiSettings({ ...uiSettings, animations: checked })} />
                            <Label>Enable Animations</Label>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="forms">
                    <div className="flex justify-end mb-4">
                        <Button>Add Template</Button>
                    </div>
                    <div className="space-y-4">
                        {formTemplates.map((template) => (
                            <div key={template.id} className="border border-border rounded-lg p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-base">{template.name}</h3>
                                        <p className="text-xs text-muted-foreground">{template.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch checked={template.isDefault} />
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Fields</Label>
                                    <div className="space-y-1">
                                        {template.fields.map((field) => (
                                            <div key={field.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                                <div>
                                                    <span className="font-medium">{field.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">({field.type})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch checked={field.required} />
                                                    <span className="text-xs text-muted-foreground">Default: {field.defaultValue || 'None'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="search">
                    <div className="flex justify-end mb-4">
                        <Button>Add Preset</Button>
                    </div>
                    <div className="space-y-4">
                        {searchPresets.map((preset) => (
                            <div key={preset.id} className="border border-border rounded-lg p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-base">{preset.name}</h3>
                                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch checked={preset.isDefault} />
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Filters</Label>
                                    <div className="space-y-1">
                                        {preset.filters.map((filter, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                                <span className="font-medium">{filter.field}</span>
                                                <span className="text-xs text-muted-foreground">{filter.operator}</span>
                                                <span className="text-xs text-muted-foreground">{filter.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="defaults">
                    <div className="border border-border rounded-lg p-4 flex flex-col gap-4 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Timezone</Label>
                                <Select value={defaultValues.timezone} onValueChange={(value) => setDefaultValues({ ...defaultValues, timezone: value })}>
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
                                <Select value={defaultValues.dateFormat} onValueChange={(value) => setDefaultValues({ ...defaultValues, dateFormat: value })}>
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
                                <Select value={defaultValues.numberFormat} onValueChange={(value) => setDefaultValues({ ...defaultValues, numberFormat: value })}>
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
                                <Select value={defaultValues.language} onValueChange={(value) => setDefaultValues({ ...defaultValues, language: value })}>
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
                </TabsContent>
            </Tabs>
        </div>
    );
} 
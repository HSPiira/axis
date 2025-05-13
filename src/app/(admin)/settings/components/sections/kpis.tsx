'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettingsTab } from '@/hooks/use-settings-tab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface KPIDefinition {
    id: string;
    name: string;
    description: string;
    type: string;
    unit: string;
    isActive: boolean;
}

interface KPIAssignment {
    id: string;
    kpiId: string;
    contractId: string;
    targetValue: string;
    frequency: 'ONCE' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    status: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
    startDate: string;
    endDate?: string;
    contract: {
        id: string;
        startDate: string;
        endDate: string;
        status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWED';
        organization: {
            id: string;
            name: string;
        };
    };
}

export function KPIsSection() {
    const { activeTab, handleTabChange } = useSettingsTab({
        section: 'kpis',
        defaultTab: 'definitions'
    });

    const [kpiDefinitions, setKpiDefinitions] = useState<KPIDefinition[]>([
        {
            id: '1',
            name: 'Customer Satisfaction',
            description: 'Measure of customer satisfaction with services',
            type: 'Service Quality',
            unit: '%',
            isActive: true,
        },
        {
            id: '2',
            name: 'Response Time',
            description: 'Average time to respond to customer inquiries',
            type: 'Service Delivery',
            unit: 'minutes',
            isActive: true,
        },
    ]);

    const [assignments, setAssignments] = useState<KPIAssignment[]>([
        {
            id: '1',
            kpiId: '1',
            contractId: 'contract1',
            targetValue: '90%',
            frequency: 'MONTHLY',
            status: 'ONGOING',
            startDate: '2024-01-01',
            contract: {
                id: 'contract1',
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                status: 'ACTIVE',
                organization: {
                    id: 'org1',
                    name: 'Acme Corporation'
                }
            }
        },
    ]);

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <div>
                <h2 className="text-lg font-semibold">KPIs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure and manage your key performance indicators</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="definitions">KPI Definitions</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="status">Status Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="definitions">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Search KPIs..."
                                    className="w-64"
                                />
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="service">Service</SelectItem>
                                        <SelectItem value="financial">Financial</SelectItem>
                                        <SelectItem value="operational">Operational</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add KPI
                            </Button>
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kpiDefinitions.map((kpi) => (
                                        <TableRow key={kpi.id}>
                                            <TableCell className="font-medium whitespace-nowrap">{kpi.name}</TableCell>
                                            <TableCell className="whitespace-nowrap">{kpi.description}</TableCell>
                                            <TableCell className="whitespace-nowrap">{kpi.type}</TableCell>
                                            <TableCell className="whitespace-nowrap">{kpi.unit}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Switch checked={kpi.isActive} />
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="assignments">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Search assignments..."
                                    className="w-64"
                                />
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="ongoing">Ongoing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Assignment
                            </Button>
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Client</TableHead>
                                        <TableHead>KPI</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.map((assignment) => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {assignment.contract.organization.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {kpiDefinitions.find(k => k.id === assignment.kpiId)?.name}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{assignment.targetValue}</TableCell>
                                            <TableCell className="whitespace-nowrap">{assignment.frequency}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded text-xs ${assignment.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                                                        assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            assignment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}>
                                                    {assignment.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{new Date(assignment.startDate).toLocaleDateString()}</TableCell>
                                            <TableCell className="whitespace-nowrap">{assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="status">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active KPIs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpiDefinitions.filter(k => k.isActive).length}</div>
                                <p className="text-sm text-gray-500">Currently active KPIs</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Ongoing Assignments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {assignments.filter(a => a.status === 'ONGOING').length}
                                </div>
                                <p className="text-sm text-gray-500">Active KPI assignments</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Completion Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Math.round(
                                        (assignments.filter(a => a.status === 'COMPLETED').length / assignments.length) * 100
                                    )}%
                                </div>
                                <p className="text-sm text-gray-500">KPI completion rate</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
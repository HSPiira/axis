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

interface ServiceDefinition {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

interface ServiceAssignment {
    id: string;
    serviceId: string;
    contractId: string;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string;
    endDate?: string;
    frequency: 'ONCE' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
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

export function ServicesSection() {
    const { activeTab, handleTabChange } = useSettingsTab({
        section: 'services',
        defaultTab: 'categories'
    });

    const [serviceCategories, setServiceCategories] = useState([
        {
            id: '1',
            name: 'Consulting',
            description: 'Professional consulting services',
        },
        {
            id: '2',
            name: 'Training',
            description: 'Training and development services',
        },
    ]);

    const [services, setServices] = useState<ServiceDefinition[]>([
        {
            id: '1',
            name: 'Strategic Planning',
            description: 'Strategic business planning and consulting',
            categoryId: '1',
            status: 'ACTIVE',
        },
        {
            id: '2',
            name: 'Leadership Training',
            description: 'Executive leadership development programs',
            categoryId: '2',
            status: 'ACTIVE',
        },
    ]);

    const [assignments, setAssignments] = useState<ServiceAssignment[]>([
        {
            id: '1',
            serviceId: '1',
            contractId: 'contract1',
            status: 'ACTIVE',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            frequency: 'MONTHLY',
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
                <h2 className="text-lg font-semibold">Services</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure and manage your service offerings</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="status">Status Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="categories">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Search categories..."
                                    className="w-64"
                                />
                            </div>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {serviceCategories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="services">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Search services..."
                                    className="w-64"
                                />
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {serviceCategories.map(category => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Service
                            </Button>
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell>{service.description}</TableCell>
                                            <TableCell>
                                                {serviceCategories.find(c => c.id === service.categoryId)?.name}
                                            </TableCell>
                                            <TableCell>
                                                <Switch checked={service.status === 'ACTIVE'} />
                                            </TableCell>
                                            <TableCell className="text-right">
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
                                        <SelectItem value="active">Active</SelectItem>
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
                                        <TableHead>Service</TableHead>
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
                                            <TableCell className="font-medium">
                                                {assignment.contract.organization.name}
                                            </TableCell>
                                            <TableCell>
                                                {services.find(s => s.id === assignment.serviceId)?.name}
                                            </TableCell>
                                            <TableCell>{assignment.frequency}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs ${assignment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                        assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            assignment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}>
                                                    {assignment.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{new Date(assignment.startDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell className="text-right">
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
                                <CardTitle>Active Services</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {services.filter(s => s.status === 'ACTIVE').length}
                                </div>
                                <p className="text-sm text-gray-500">Currently active services</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Assignments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {assignments.filter(a => a.status === 'ACTIVE').length}
                                </div>
                                <p className="text-sm text-gray-500">Active service assignments</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {serviceCategories.length}
                                </div>
                                <p className="text-sm text-gray-500">Total service categories</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
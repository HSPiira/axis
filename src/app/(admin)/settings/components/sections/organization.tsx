import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Department {
    id: string;
    name: string;
    description: string;
    manager: string;
}

interface Region {
    id: string;
    name: string;
    country: string;
    timezone: string;
}

export function OrganizationSettings() {
    const [departments, setDepartments] = useState<Department[]>([
        { id: '1', name: 'Engineering', description: 'Software development and IT', manager: 'John Doe' },
        { id: '2', name: 'Sales', description: 'Sales and business development', manager: 'Jane Smith' },
    ]);

    const [regions, setRegions] = useState<Region[]>([
        { id: '1', name: 'North America', country: 'United States', timezone: 'America/New_York' },
        { id: '2', name: 'Europe', country: 'United Kingdom', timezone: 'Europe/London' },
    ]);

    const [businessHours, setBusinessHours] = useState({
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
    });

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold">Organization Settings</h1>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Company Profile</TabsTrigger>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="regions">Regions</TabsTrigger>
                    <TabsTrigger value="hours">Business Hours</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Company Logo</Label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
                                        <span className="text-gray-500">Logo</span>
                                    </div>
                                    <Button variant="outline">Upload Logo</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input placeholder="Enter company name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website</Label>
                                    <Input placeholder="https://company.com" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Contact Information</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input placeholder="Email address" />
                                    <Input placeholder="Phone number" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Textarea placeholder="Enter company address" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="departments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Departments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Department</Button>
                            </div>

                            <div className="space-y-4">
                                {departments.map((dept) => (
                                    <Card key={dept.id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold">{dept.name}</h3>
                                                    <p className="text-sm text-gray-500">{dept.description}</p>
                                                    <p className="text-sm">Manager: {dept.manager}</p>
                                                </div>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="regions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Operational Regions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Region</Button>
                            </div>

                            <div className="space-y-4">
                                {regions.map((region) => (
                                    <Card key={region.id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold">{region.name}</h3>
                                                    <p className="text-sm text-gray-500">{region.country}</p>
                                                    <p className="text-sm">Timezone: {region.timezone}</p>
                                                </div>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hours">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Hours & Holidays</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Business Hours</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-sm">Start Time</Label>
                                            <Input
                                                type="time"
                                                value={businessHours.startTime}
                                                onChange={(e) => setBusinessHours({ ...businessHours, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm">End Time</Label>
                                            <Input
                                                type="time"
                                                value={businessHours.endTime}
                                                onChange={(e) => setBusinessHours({ ...businessHours, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Timezone</Label>
                                    <Select
                                        value={businessHours.timezone}
                                        onValueChange={(value) => setBusinessHours({ ...businessHours, timezone: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                            <SelectItem value="Europe/London">London</SelectItem>
                                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Holiday Calendar</Label>
                                <div className="border rounded-lg p-4">
                                    <Calendar
                                        mode="multiple"
                                        selected={[]}
                                        onSelect={() => { }}
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Button variant="outline">Add Holiday</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
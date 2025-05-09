import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Label,
    Input,
    Switch,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsTab } from "@/hooks/use-settings-tab";
import { Button } from "@/components/ui/button";
import { UserDetailsCard } from "../detail-cards";
import { UsersTable } from "../tables";
interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    userRoles: {
        role: {
            name: string;
        };
    }[];
}

export function UserSettings() {
    const { activeTab, handleTabChange } = useSettingsTab({
        section: "users",
        defaultTab: "users",
    });

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(users.length / pageSize);
    const paginatedUsers = users.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [sessionTimeout, setSessionTimeout] = useState("30");
    const [passwordExpiry, setPasswordExpiry] = useState("90");
    const [require2FA, setRequire2FA] = useState(false);
    const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users");
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <div>
                <h2 className="text-lg font-semibold">User & Access Management</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage user roles, permissions, and security settings
                </p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="space-y-4"
            >
                <TabsList>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                    <TabsTrigger value="security">Security Settings</TabsTrigger>
                    <TabsTrigger value="policies">Access Policies</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <div className="flex items-start">
                        <Card className="shadow-none flex-1">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>User Management</CardTitle>
                                <Button>Add User</Button>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-4">Loading users...</div>
                                ) : error ? (
                                    <div className="text-center py-4 text-red-500">{error}</div>
                                ) : (
                                    <UsersTable
                                        users={users}
                                        paginatedUsers={paginatedUsers}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        setCurrentPage={setCurrentPage}
                                        selectedUser={selectedUser}
                                        setSelectedUser={setSelectedUser}
                                    />
                                )}
                            </CardContent>
                        </Card>
                        {selectedUser && (
                            <UserDetailsCard user={selectedUser} onClose={() => setSelectedUser(null)} />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="roles">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role-based Access Control</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Role</Label>
                                    <Select defaultValue="user">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select default role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Permission Matrix</Label>
                                <div className="border rounded-lg p-4">
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="text-left">Permission</th>
                                                <th className="text-center">Admin</th>
                                                <th className="text-center">Manager</th>
                                                <th className="text-center">User</th>
                                                <th className="text-center">Viewer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>View Dashboard</td>
                                                <td className="text-center">✓</td>
                                                <td className="text-center">✓</td>
                                                <td className="text-center">✓</td>
                                                <td className="text-center">✓</td>
                                            </tr>
                                            <tr>
                                                <td>Manage Users</td>
                                                <td className="text-center">✓</td>
                                                <td className="text-center">✓</td>
                                                <td className="text-center">✗</td>
                                                <td className="text-center">✗</td>
                                            </tr>
                                            <tr>
                                                <td>System Settings</td>
                                                <td className="text-center">✓</td>
                                                <td className="text-center">✗</td>
                                                <td className="text-center">✗</td>
                                                <td className="text-center">✗</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Session Timeout (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={sessionTimeout}
                                        onChange={(e) => setSessionTimeout(e.target.value)}
                                        min="5"
                                        max="1440"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password Expiry (days)</Label>
                                    <Input
                                        type="number"
                                        value={passwordExpiry}
                                        onChange={(e) => setPasswordExpiry(e.target.value)}
                                        min="30"
                                        max="365"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Require Two-Factor Authentication</Label>
                                    <Switch
                                        checked={require2FA}
                                        onCheckedChange={setRequire2FA}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Maximum Login Attempts</Label>
                                    <Input
                                        type="number"
                                        value={maxLoginAttempts}
                                        onChange={(e) => setMaxLoginAttempts(e.target.value)}
                                        min="3"
                                        max="10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="policies">
                    <Card>
                        <CardHeader>
                            <CardTitle>Access Policies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Password Complexity Requirements</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch defaultChecked />
                                        <Label>Require uppercase letters</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch defaultChecked />
                                        <Label>Require numbers</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch defaultChecked />
                                        <Label>Require special characters</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch defaultChecked />
                                        <Label>Minimum length (8 characters)</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Account Lockout Policy</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Lockout Duration (minutes)</Label>
                                        <Input type="number" defaultValue="30" min="5" max="1440" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reset Attempts After (hours)</Label>
                                        <Input type="number" defaultValue="24" min="1" max="72" />
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

export default UserSettings;

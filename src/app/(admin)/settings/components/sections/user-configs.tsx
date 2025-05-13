'use client';

import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Label,
    Input,
    Switch,
} from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsData } from "@/hooks/use-settings-data";
import { Button } from "@/components/ui/button";
import { UserDetailsCard } from "../detail-cards";
import { UsersTable } from "../tables";
import RolesTable from "../tables/roles-table";
import RolePermissionsModal from "../modals/role-permissions-modal";
import RoleCreateModal from "../modals/role-create-modal";
import { RoleDetailsCard } from "../detail-cards/role-detail-card";
import { Plus, Search } from "lucide-react";
import { UserEditModal } from '../modals/user-edit-modal';
import { RoleEditModal } from '../modals/role-edit-modal';
import { useSession } from "next-auth/react";

interface Permission {
    id: string;
    name: string;
    description: string | null;
}

interface UserRole {
    id: string;
    name: string;
    description: string | null;
    permissions: {
        permission: Permission;
    }[];
}

interface Role {
    id: string;
    name: string;
    description?: string | null;
    usersCount: number;
    permissions: { id: string; name: string }[];
    createdAt: string;
    updatedAt: string;
}

interface User {
    id: string;
    profile: {
        fullName: string;
        image: string | null;
        email: string | null;
        phone: string | null;
    };
    userRoles: {
        role: UserRole;
    }[];
    sessions: {
        expires: string;
    }[];
    accounts: {
        provider: string;
        type: string;
    }[];
    createdAt: string;
    updatedAt: string;
    profileUpdatedAt: string | null;
}

interface ApiError {
    error: string;
}

export function UserSettings() {
    const { data: session, status } = useSession();
    const settingsData = useSettingsData<{
        users: User[];
        roles: Role[];
        permissions: Permission[];
        security: Record<string, any>;
        policies: Record<string, any>[];
    }>({
        section: 'users',
        defaultTab: 'users',
        dataLoaders: {
            users: async () => {
                const response = await fetch('/api/users', { credentials: 'include' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw { error: typeof errorData === 'object' && 'error' in errorData ? errorData.error : 'Failed to fetch users' };
                }
                const data = await response.json();
                return Array.isArray(data) ? data : [];
            },
            roles: async () => {
                const response = await fetch('/api/roles', { credentials: 'include' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw { error: typeof errorData === 'object' && 'error' in errorData ? errorData.error : 'Failed to fetch roles' };
                }
                const data = await response.json();
                return Array.isArray(data.data) ? data.data : [];
            },
            permissions: async () => {
                const response = await fetch('/api/permissions', { credentials: 'include' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw { error: typeof errorData === 'object' && 'error' in errorData ? errorData.error : 'Failed to fetch permissions' };
                }
                const data = await response.json();
                return Array.isArray(data) ? data : [];
            },
            security: async () => {
                const response = await fetch('/api/security-settings', { credentials: 'include' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw { error: typeof errorData === 'object' && 'error' in errorData ? errorData.error : 'Failed to fetch security settings' };
                }
                const data = await response.json();
                return data || {};
            },
            policies: async () => {
                const response = await fetch('/api/access-policies', { credentials: 'include' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw { error: typeof errorData === 'object' && 'error' in errorData ? errorData.error : 'Failed to fetch access policies' };
                }
                const data = await response.json();
                return Array.isArray(data) ? data : [];
            },
        }
    });
    const { activeTab, handleTabChange, data, loading } = settingsData;
    const error: {
        users: ApiError | null;
        roles: ApiError | null;
        permissions: ApiError | null;
        security: ApiError | null;
        policies: ApiError | null;
    } = settingsData.error;

    const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
    const [showPermissionsModal, setShowPermissionsModal] = React.useState(false);
    const [showCreateRoleModal, setShowCreateRoleModal] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 10;
    const [roleSearch, setRoleSearch] = React.useState("");
    const [userSearch, setUserSearch] = React.useState("");

    // Add state for roles and users to allow local refresh
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [users, setUsers] = React.useState<User[]>([]);
    const [showEditRoleModal, setShowEditRoleModal] = React.useState(false);

    // Sync roles and users from data loader
    React.useEffect(() => {
        if (data.roles) {
            setRoles(Array.isArray(data.roles) ? data.roles : []);
        }
        if (data.users) {
            setUsers(Array.isArray(data.users) ? data.users : []);
        }
    }, [data.roles, data.users]);

    // Refresh roles from API and update details card if needed
    const refreshRoles = async () => {
        try {
            const response = await fetch('/api/roles', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch roles');
            const data = await response.json();
            setRoles(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error('Error refreshing roles:', error);
            setRoles([]);
        }
    };

    // Refresh users from API and update details card if needed
    const refreshUsers = async () => {
        try {
            const response = await fetch('/api/users', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error refreshing users:', error);
            setUsers([]);
        }
    };

    const handleEditPermissions = (role: Role) => {
        setSelectedRole(role);
        setShowPermissionsModal(true);
    };

    const handleSavePermissions = async (roleId: string, permissionIds: string[]) => {
        try {
            const response = await fetch(`/api/roles/${roleId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ permissionIds }),
            });

            if (!response.ok) throw new Error('Failed to update permissions');

            await refreshRoles();
        } catch (error) {
            console.error('Error updating permissions:', error);
        }
    };

    const handleSaveRole = async (roleId: string, data: { name: string; description?: string }) => {
        try {
            const response = await fetch(`/api/roles/${roleId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw error;
            }

            await refreshRoles();
            setShowEditRoleModal(false);
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    };

    // Calculate pagination values
    const totalPages = Math.ceil(users.length / pageSize);
    const paginatedUsers = users.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Filter users by search
    const filteredUsers = users.filter((user: User) => {
        const q = userSearch.toLowerCase();
        return (
            (user.profile.fullName?.toLowerCase().includes(q) ?? false) ||
            (user.profile.email?.toLowerCase().includes(q) ?? false)
        );
    });
    const usersTotalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedFilteredUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Filter roles by search
    const filteredRoles = Array.isArray(roles) ? roles.filter((role: Role) => {
        const q = roleSearch.toLowerCase();
        return (
            role.name.toLowerCase().includes(q) ||
            (role.description?.toLowerCase().includes(q) ?? false)
        );
    }) : [];

    const rolesTotalPages = Math.ceil(filteredRoles.length / pageSize);
    const paginatedRoles = filteredRoles.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Add loading state handling
    if (status === "loading" || loading.users) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-sm text-muted-foreground">Loading users...</div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-sm text-muted-foreground">Please sign in to view users.</div>
            </div>
        );
    }

    if ((error as any).users) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-sm text-destructive">Error loading users: {(error as any).users?.error ?? "Unknown error"}</div>
            </div>
        );
    }

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
                    {loading.users ? (
                        <div>Loading users...</div>
                    ) : (error as any).users ? (
                        <div>Error loading users: {(error as any).users?.error ?? "Unknown error"}</div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-4 gap-2">
                                <div className="relative flex-1 max-w-xs flex items-center gap-2">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        <Search className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={e => {
                                            setUserSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Search users..."
                                        className="pl-9 pr-3 py-2 w-full rounded-full border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                    />
                                    <Button
                                        size="icon"
                                        className="rounded-full h-10 w-10 ml-2"
                                        variant="outline"
                                        onClick={() => {/* TODO: open create user modal */ }}
                                        aria-label="Add User"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <UsersTable
                                users={filteredUsers}
                                paginatedUsers={paginatedFilteredUsers}
                                currentPage={currentPage}
                                totalPages={usersTotalPages}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="roles">
                    {loading.roles || loading.permissions ? (
                        <div>Loading roles and permissions...</div>
                    ) : error.roles || error.permissions ? (
                        <div>Error loading roles: {error.roles?.error ?? error.permissions?.error ?? "Unknown error"}</div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4 gap-2">
                                <div className="relative flex-1 max-w-xs flex items-center gap-2">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        <Search className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        value={roleSearch}
                                        onChange={e => {
                                            setRoleSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Search roles..."
                                        className="pl-9 pr-3 py-2 w-full rounded-full border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                    />
                                    <Button
                                        size="icon"
                                        className="rounded-full h-10 w-10 ml-2"
                                        variant="outline"
                                        onClick={() => setShowCreateRoleModal(true)}
                                        aria-label="Add Role"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <RolesTable
                                        roles={filteredRoles}
                                        paginatedRoles={paginatedRoles}
                                        currentPage={currentPage}
                                        totalPages={rolesTotalPages}
                                        setCurrentPage={setCurrentPage}
                                        selectedRole={selectedRole}
                                        setSelectedRole={setSelectedRole}
                                        onEditPermissions={handleEditPermissions}
                                    />
                                </div>
                                {selectedRole && (
                                    <RoleDetailsCard
                                        role={selectedRole}
                                        onClose={() => setSelectedRole(null)}
                                        onEdit={() => setShowEditRoleModal(true)}
                                        onEditPermissions={() => handleEditPermissions(selectedRole)}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="security">
                    {loading.security ? (
                        <div>Loading security settings...</div>
                    ) : error.security ? (
                        <div>Error loading security settings: {error.security?.error ?? "Unknown error"}</div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Security settings content */}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="policies">
                    {loading.policies ? (
                        <div>Loading access policies...</div>
                    ) : error.policies ? (
                        <div>Error loading access policies: {error.policies?.error ?? "Unknown error"}</div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Access Policies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Access policies content */}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {selectedRole && (
                <>
                    <RolePermissionsModal
                        open={showPermissionsModal}
                        onClose={() => setShowPermissionsModal(false)}
                        role={selectedRole}
                        allPermissions={data.permissions || []}
                        onSave={handleSavePermissions}
                    />
                    <RoleEditModal
                        open={showEditRoleModal}
                        onClose={() => setShowEditRoleModal(false)}
                        role={selectedRole}
                        onSave={handleSaveRole}
                    />
                </>
            )}

            <RoleCreateModal
                open={showCreateRoleModal}
                onClose={() => setShowCreateRoleModal(false)}
                allPermissions={data.permissions || []}
                onSave={async (roleData) => {
                    try {
                        const response = await fetch('/api/roles', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify(roleData),
                        });

                        if (!response.ok) throw new Error('Failed to create role');
                        const newRole = await response.json();
                        await refreshRoles();
                        setShowCreateRoleModal(false);
                    } catch (error) {
                        console.error('Error creating role:', error);
                    }
                }}
            />
        </div>
    );
}

export default UserSettings;

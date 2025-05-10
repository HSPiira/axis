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

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    userRoles: {
        role: {
            id: string;
            name: string;
        };
    }[];
    accounts?: {
        provider: string;
        type: string;
    }[];
}

interface Role {
    id: string;
    name: string;
    description?: string | null;
    usersCount: number;
    permissions: {
        id: string;
        name: string;
        description?: string | null;
    }[];
    createdAt: string;
    updatedAt: string;
}

interface Permission {
    id: string;
    name: string;
    description?: string | null;
}

export function UserSettings() {
    const {
        activeTab,
        handleTabChange,
        data,
        loading,
        error
    } = useSettingsData({
        section: 'users',
        defaultTab: 'users',
        dataLoaders: {
            users: async () => {
                const response = await fetch('/api/users');
                if (!response.ok) throw new Error('Failed to fetch users');
                return response.json();
            },
            roles: async () => {
                const response = await fetch('/api/roles');
                if (!response.ok) throw new Error('Failed to fetch roles');
                return response.json();
            },
            permissions: async () => {
                const response = await fetch('/api/permissions');
                if (!response.ok) throw new Error('Failed to fetch permissions');
                return response.json();
            },
            security: async () => {
                const response = await fetch('/api/security-settings');
                if (!response.ok) throw new Error('Failed to fetch security settings');
                return response.json();
            },
            policies: async () => {
                const response = await fetch('/api/access-policies');
                if (!response.ok) throw new Error('Failed to fetch access policies');
                return response.json();
            }
        }
    });

    const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
    const [showPermissionsModal, setShowPermissionsModal] = React.useState(false);
    const [showCreateRoleModal, setShowCreateRoleModal] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 10;
    const [roleSearch, setRoleSearch] = React.useState("");
    const [userSearch, setUserSearch] = React.useState("");

    // Add state for roles and users to allow local refresh
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [usersState, setUsersState] = React.useState<User[]>([]);
    const [showEditUserModal, setShowEditUserModal] = React.useState(false);
    const [showEditRoleModal, setShowEditRoleModal] = React.useState(false);

    // Sync roles and users from data loader
    React.useEffect(() => {
        if (data.roles) setRoles(data.roles);
        if (data.users) setUsersState(data.users);
    }, [data.roles, data.users]);

    // Refresh roles from API and update details card if needed
    const refreshRoles = async (selectId?: string) => {
        const response = await fetch('/api/roles');
        const updatedRoles = await response.json();
        setRoles(updatedRoles);
        if (selectId) {
            const updated = updatedRoles.find((r: Role) => r.id === selectId);
            if (updated) setSelectedRole(updated);
        } else if (selectedRole) {
            const updated = updatedRoles.find((r: Role) => r.id === selectedRole.id);
            if (updated) setSelectedRole(updated);
        }
    };

    // Refresh users from API and update details card if needed
    const refreshUsers = async (selectId?: string) => {
        const response = await fetch('/api/users');
        const updatedUsers = await response.json();
        setUsersState(updatedUsers);
        if (selectId) {
            const updated = updatedUsers.find((u: User) => u.id === selectId);
            if (updated) setSelectedUser(updated);
        } else if (selectedUser) {
            const updated = updatedUsers.find((u: User) => u.id === selectedUser.id);
            if (updated) setSelectedUser(updated);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissionIds }),
            });

            if (!response.ok) throw new Error('Failed to update permissions');

            await refreshRoles(roleId);
        } catch (error) {
            console.error('Error updating permissions:', error);
        }
    };

    const handleSaveUser = async (userId: string, data: { name?: string; roleId?: string }) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update user');

            await refreshUsers(userId);
            setShowEditUserModal(false);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };

    const handleEditUser = async (user: User) => {
        setSelectedUser(user);
        await refreshUsers(user.id);
        setShowEditUserModal(true);
    };

    const handleSaveRole = async (roleId: string, data: { name: string; description?: string }) => {
        try {
            const response = await fetch(`/api/roles/${roleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update role');

            await refreshRoles(roleId);
            setShowEditRoleModal(false);
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    };

    // Calculate pagination values
    const users = usersState || [];
    const totalPages = Math.ceil(users.length / pageSize);
    const paginatedUsers = users.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Filter users by search
    const filteredUsers = users.filter((user: User) => {
        const q = userSearch.toLowerCase();
        return (
            (user.name?.toLowerCase().includes(q) ?? false) ||
            (user.email?.toLowerCase().includes(q) ?? false)
        );
    });
    const usersTotalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedFilteredUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Filter roles by search
    const filteredRoles = (roles || []).filter((role: Role) => {
        const q = roleSearch.toLowerCase();
        return (
            role.name.toLowerCase().includes(q) ||
            (role.description?.toLowerCase().includes(q) ?? false)
        );
    });
    const rolesTotalPages = Math.ceil(filteredRoles.length / pageSize);
    const paginatedRoles = filteredRoles.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

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
                    ) : error.users ? (
                        <div>Error loading users: {error.users.message}</div>
                    ) : (
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
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
                                    selectedUser={selectedUser}
                                    setSelectedUser={setSelectedUser}
                                />
                            </div>
                            {selectedUser && (
                                <UserDetailsCard
                                    user={selectedUser}
                                    onClose={() => setSelectedUser(null)}
                                    onEdit={() => handleEditUser(selectedUser)}
                                />
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="roles">
                    {loading.roles || loading.permissions ? (
                        <div>Loading roles and permissions...</div>
                    ) : error.roles || error.permissions ? (
                        <div>Error loading roles: {error.roles?.message || error.permissions?.message}</div>
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
                        <div>Error loading security settings: {error.security.message}</div>
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
                        <div>Error loading access policies: {error.policies.message}</div>
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
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(roleData),
                        });

                        if (!response.ok) throw new Error('Failed to create role');
                        const newRole = await response.json();
                        await refreshRoles(newRole.id);
                        setShowCreateRoleModal(false);
                    } catch (error) {
                        console.error('Error creating role:', error);
                    }
                }}
            />

            {selectedUser && (
                <UserEditModal
                    open={showEditUserModal}
                    onClose={() => setShowEditUserModal(false)}
                    user={selectedUser}
                    roles={data.roles || []}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
}

export default UserSettings;

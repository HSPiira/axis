'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Calendar, Mail, Phone, Shield, User, Edit2, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

export default function UserManagementPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [expandedRole, setExpandedRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${params.id}`, {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchUser();
        }
    }, [params.id, status]);

    if (status === 'loading' || loading) {
        return (
            <div className="container mx-auto py-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[200px]" />
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please sign in to view user details.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'User not found'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    const formatDate = (date: string) => {
        return format(new Date(date), 'PPpp');
    };

    const handleEditProfile = () => {
        setIsEditing(true);
        // TODO: Implement profile editing
    };

    const handleAddRole = () => {
        // TODO: Implement role assignment
    };

    const handleRemoveRole = async (roleId: string) => {
        try {
            const response = await fetch(`/api/users/${params.id}/roles/${roleId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to remove role');
            // Refresh user data
            const updatedUser = await fetch(`/api/users/${params.id}`, {
                credentials: 'include'
            }).then(res => res.json());
            setUser(updatedUser);
        } catch (err) {
            console.error('Error removing role:', err);
        }
    };

    const toggleRoleExpansion = (roleId: string) => {
        setExpandedRole(expandedRole === roleId ? null : roleId);
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">View and manage user details</p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleEditProfile}
                    className="gap-2"
                >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Profile Information</CardTitle>
                        <Badge variant={user?.sessions[0]?.expires ? "default" : "secondary"}>
                            {user?.sessions[0]?.expires ? "Active" : "Inactive"}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user?.profile.image || undefined} />
                                <AvatarFallback>
                                    {getInitials(user?.profile.fullName || '')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">{user?.profile.fullName}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{user?.profile.email}</span>
                                </div>
                                {user?.profile.phone && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{user?.profile.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Member since</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(user?.createdAt || '')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Last updated</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(user?.updatedAt || '')}
                                </span>
                            </div>
                            {user?.profileUpdatedAt && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Profile updated</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDate(user.profileUpdatedAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="roles" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                    <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
                    <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
                </TabsList>

                <TabsContent value="roles">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Roles & Permissions</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddRole}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Role
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {user?.userRoles.map(({ role }) => (
                                    <div
                                        key={role.id}
                                        className="rounded-lg border p-4 transition-all hover:bg-muted/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <h4 className="font-medium">{role.name}</h4>
                                                {role.description && (
                                                    <span className="text-sm text-muted-foreground">
                                                        - {role.description}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleRoleExpansion(role.id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {expandedRole === role.id ? (
                                                        <XCircle className="h-4 w-4" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveRole(role.id)}
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {expandedRole === role.id && (
                                            <div className="mt-4 space-y-2">
                                                <h5 className="text-sm font-medium text-muted-foreground">
                                                    Permissions
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {role.permissions.map(({ permission }) => (
                                                        <Badge
                                                            key={permission.id}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {permission.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {user?.sessions.map((session, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex items-center justify-between rounded-lg border p-4",
                                            new Date(session.expires) > new Date()
                                                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                                                : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Session expires</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={new Date(session.expires) > new Date() ? "default" : "destructive"}
                                            >
                                                {new Date(session.expires) > new Date() ? "Active" : "Expired"}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(session.expires)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="accounts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Connected Accounts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {user?.accounts.map((account, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm capitalize">
                                                {account.provider} ({account.type})
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {account.provider}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
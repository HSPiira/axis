import React, { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Permission {
    id: string;
    name: string;
    description: string | null;
}

interface Role {
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
        role: Role;
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

interface UsersTableProps {
    users: User[];
    paginatedUsers: User[];
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, paginatedUsers, currentPage, totalPages, setCurrentPage }) => {
    const router = useRouter();

    // Add debug logging
    useEffect(() => {
        console.log('Users:', users);
        console.log('Paginated Users:', paginatedUsers);
        console.log('Current Page:', currentPage);
        console.log('Total Pages:', totalPages);
    }, [users, paginatedUsers, currentPage, totalPages]);

    // Add early return if no data
    if (!paginatedUsers || paginatedUsers.length === 0) {
        return (
            <div className="rounded-md border-gray-200 dark:border-gray-700 border p-4 text-center text-muted-foreground">
                No users found
            </div>
        );
    }

    return (
        <div className="rounded-md border-gray-200 dark:border-gray-700 border">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">User</th>
                        <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Roles</th>
                        <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Permissions</th>
                        <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Status</th>
                        <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Last Active</th>
                        <th className="h-10 px-3 text-right align-middle font-medium tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedUsers.map((user) => {
                        // Add debug logging for each user
                        console.log('Processing user:', user);

                        // Get unique permissions across all roles
                        const permissions = new Set(
                            user.userRoles.flatMap(({ role }) =>
                                role.permissions.map(p => p.permission.name)
                            )
                        );

                        // Check if user has an active session
                        const hasActiveSession = user.sessions.some(
                            session => new Date(session.expires) > new Date()
                        );

                        // Get last active time
                        const lastSession = user.sessions[0];
                        const lastActive = lastSession
                            ? formatDistanceToNow(new Date(lastSession.expires), { addSuffix: true })
                            : "Never";

                        return (
                            <tr
                                key={user.id}
                                className="border-b hover:bg-muted/50 transition-colors"
                            >
                                <td className="p-2">
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={user.profile.image || undefined} />
                                            <AvatarFallback className="text-[10px]">
                                                {user.profile.fullName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium truncate max-w-[150px]">
                                                {user.profile.fullName}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {user.profile.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-2">
                                    <div className="flex flex-wrap gap-1">
                                        {user.userRoles.map(({ role }) => (
                                            <Badge key={role.id} variant="secondary" className="text-[10px]">
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-2">
                                    <div className="flex flex-wrap gap-1">
                                        {Array.from(permissions).slice(0, 3).map(permission => (
                                            <Badge key={permission} variant="outline" className="text-[10px]">
                                                {permission}
                                            </Badge>
                                        ))}
                                        {permissions.size > 3 && (
                                            <Badge variant="outline" className="text-[10px]">
                                                +{permissions.size - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="p-2">
                                    <Badge
                                        variant={hasActiveSession ? "default" : "secondary"}
                                        className="text-[10px]"
                                    >
                                        {hasActiveSession ? "Active" : "Inactive"}
                                    </Badge>
                                </td>
                                <td className="p-2">
                                    <span className="font-medium text-muted-foreground whitespace-nowrap text-[10px]">
                                        {lastActive}
                                    </span>
                                </td>
                                <td className="p-2">
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => router.push(`/settings/users/${user.id}`)}
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-end mt-2 mb-4">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                            key={i + 1}
                            variant={currentPage === i + 1 ? 'default' : 'ghost'}
                            size="icon"
                            className={`h-8 w-8 rounded-full font-medium ${currentPage === i + 1 ? '' : 'bg-transparent'}`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UsersTable; 
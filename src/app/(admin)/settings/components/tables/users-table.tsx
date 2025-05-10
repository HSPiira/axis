import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, Shield, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface UsersTableProps {
    users: User[];
    paginatedUsers: User[];
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, paginatedUsers, currentPage, totalPages, setCurrentPage, selectedUser, setSelectedUser }) => (
    <div className="rounded-md border-gray-200 dark:border-gray-700 border">
        <table className="w-full text-xs">
            <thead>
                <tr className="border-b bg-muted/50">
                    <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">User</th>
                    <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Role</th>
                    <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Email</th>
                    <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Status</th>
                    <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Last Active</th>
                </tr>
            </thead>
            <tbody>
                {paginatedUsers.map((user) => (
                    <tr
                        key={user.id}
                        className={`border-b hover:bg-muted/50 transition-colors cursor-pointer ${selectedUser && selectedUser.id === user.id ? 'bg-muted/30' : ''}`}
                        onClick={() => setSelectedUser(selectedUser && selectedUser.id === user.id ? null : user)}
                    >
                        <td className="p-2">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={user.image || undefined} />
                                    <AvatarFallback className="text-[10px]">
                                        {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium truncate max-w-[150px]">{user.name || 'Unnamed User'}</span>
                            </div>
                        </td>
                        <td className="p-2">
                            <span className="font-medium text-muted-foreground whitespace-nowrap">
                                {user.userRoles[0]?.role.name || 'No Role'}
                            </span>
                        </td>
                        <td className="p-2">
                            <span className="font-medium text-muted-foreground whitespace-nowrap">
                                {user.email || '-'}
                            </span>
                        </td>
                        <td className="p-2">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                <span className="font-medium whitespace-nowrap">Active</span>
                            </div>
                        </td>
                        <td className="p-2">
                            <span className="font-medium text-muted-foreground whitespace-nowrap">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </td>
                    </tr>
                ))}
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

export default UsersTable; 
import React from "react";
import { Button } from "@/components/ui/button";
import { KeyRound, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { RoleDetailsCard } from "../detail-cards/role-detail-card";

interface Role {
    id: string;
    name: string;
    description?: string | null;
    usersCount: number;
    permissions: { id: string; name: string }[];
    createdAt: string;
    updatedAt: string;
}

interface RolesTableProps {
    roles: Role[];
    paginatedRoles: Role[];
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    selectedRole: Role | null;
    setSelectedRole: (role: Role | null) => void;
    onEditPermissions: (role: Role) => void;
}

export function RolesTable({
    roles,
    paginatedRoles,
    currentPage,
    totalPages,
    setCurrentPage,
    selectedRole,
    setSelectedRole,
    onEditPermissions
}: RolesTableProps) {
    return (
        <div className="rounded-md border-gray-200 dark:border-gray-700 border">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Role</th>
                        <th className="h-10 px-3 text-left align-middle font-medium tracking-wider whitespace-nowrap">Description</th>
                        <th className="h-10 px-3 text-center align-middle font-medium tracking-wider whitespace-nowrap">Users</th>
                        <th className="h-10 px-3 text-center align-middle font-medium tracking-wider whitespace-nowrap">Permissions</th>
                        <th className="h-10 px-3 text-center align-middle font-medium tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedRoles.map((role) => (
                        <tr
                            key={role.id}
                            className={`border-b hover:bg-muted/50 transition-colors cursor-pointer ${selectedRole && selectedRole.id === role.id ? 'bg-muted/30' : ''}`}
                            onClick={() => setSelectedRole(selectedRole && selectedRole.id === role.id ? null : role)}
                        >
                            <td className="p-2">
                                <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span className="font-medium truncate max-w-[150px]">{role.name}</span>
                                </div>
                            </td>
                            <td className="p-2">
                                <div className="truncate max-w-[200px]" title={role.description || '-'}>
                                    <span className="font-medium text-muted-foreground">
                                        {role.description || '-'}
                                    </span>
                                </div>
                            </td>
                            <td className="p-2 text-center">
                                <span className="font-medium text-muted-foreground whitespace-nowrap">
                                    {role.usersCount}
                                </span>
                            </td>
                            <td className="p-2 text-center">
                                <span className="font-medium text-muted-foreground whitespace-nowrap">
                                    {role.permissions.length}
                                </span>
                            </td>
                            <td className="p-2 text-center">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditPermissions(role);
                                                }}
                                                className="h-8 w-8 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-400 dark:border-blue-800"
                                            >
                                                <KeyRound className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Edit Permissions</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
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
}

export default RolesTable;
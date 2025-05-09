import React from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Info,
  Calendar,
  Users,
  KeyRound,
  CheckCircle2,
  X,
  FileText,
  MessageSquare,
  StickyNote,
  BookOpen,
  Clock,
  Trash2,
  Pencil,
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description?: string | null;
}

interface Role {
  id: string;
  name: string;
  description?: string | null;
  usersCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

interface RoleDetailsCardProps {
  role: Role;
  onClose: () => void;
  onEdit: () => void;
  onEditPermissions: () => void;
}

export function RoleDetailsCard({
  role,
  onClose,
  onEdit,
  onEditPermissions,
}: RoleDetailsCardProps) {
  return (
    <div className="w-[340px] bg-white dark:bg-muted rounded-xl shadow-sm p-4 ml-6 flex flex-col border border-gray-100 dark:border-gray-800">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
          <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold flex items-center gap-1.5"
            style={{ lineHeight: "1.2" }}
          >
            <span
              className={`${
                role.name.length > 22 ? "text-sm" : "text-base"
              } truncate`}
            >
              {role.name}
            </span>
            <CheckCircle2 className="text-green-500 h-4 w-4 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {role.usersCount} {role.usersCount === 1 ? "User" : "Users"}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(role.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1.5 rounded-full hover:bg-muted flex-shrink-0"
          aria-label="Close role details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-t my-2" />

      {/* Description Section */}
      <div className="mb-4">
        <div className="font-medium text-[12px] text-indigo-600 flex items-center gap-1.5 mb-1">
          <KeyRound className="h-4 w-4" />
          {role.permissions.length} Permissions
        </div>
        <div className="text-xs text-muted-foreground ml-5.5">
          {role.description || "No description provided."}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="space-y-2 mb-2">
        <div className="flex items-center gap-2 text-xs">
          <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium">Id:</span>
          <span className="font-mono text-xs truncate">{role.id}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium">Created:</span>
          <span>{new Date(role.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium">Updated:</span>
          <span>{new Date(role.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="border-t my-2" />

      {/* Permissions Section */}
      <div className="mb-4">
        <div className="font-semibold text-xs mb-2">Permissions</div>
        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
          {role.permissions.map((permission, index) => (
            <div
              key={permission.id}
              className="text-xs flex items-start gap-1.5"
            >
              <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground line-clamp-2">
                {permission.description || permission.name}
              </span>
            </div>
          ))}
        </div>
        {role.permissions.length > 5 && (
          <div className="text-xs text-muted-foreground mt-2 text-center">
            +{role.permissions.length - 5} more permissions
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="flex gap-1.5 mt-auto pt-3 border-t">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          aria-label="Edit role"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onEditPermissions}
          className="h-8 w-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          aria-label="Edit role permissions"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="View documentation"
        >
          <FileText className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Messages"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Notes"
        >
          <StickyNote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Documentation"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Delete role"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

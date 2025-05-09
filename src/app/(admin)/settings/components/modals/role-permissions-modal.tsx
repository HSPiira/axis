import React, { useState, useEffect } from "react";
import { Button, Checkbox } from "@/components/ui";
import { Modal } from "@/components/ui/modal";

interface Permission {
    id: string;
    name: string;
    description?: string | null;
}

interface Role {
    id: string;
    name: string;
    description?: string | null;
    permissions: Permission[];
}

interface RolePermissionsModalProps {
    open: boolean;
    onClose: () => void;
    role: Role | null;
    allPermissions: Permission[];
    onSave: (roleId: string, permissionIds: string[]) => void;
}

export function RolePermissionsModal({ open, onClose, role, allPermissions, onSave }: RolePermissionsModalProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (role) {
            setSelectedPermissions(role.permissions.map((p) => p.id));
        }
    }, [role]);

    const handleToggle = (permissionId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSave = async () => {
        if (!role) return;

        try {
            setIsSaving(true);
            await onSave(role.id, selectedPermissions);
            onClose();
        } catch (error) {
            console.error('Failed to save permissions:', error);
            // You might want to show an error message here
        } finally {
            setIsSaving(false);
        }
    };

    if (!role) return null;

    const footer = (
        <>
            <Button
                variant="outline"
                onClick={onClose}
                type="button"
                disabled={isSaving}
            >
                Cancel
            </Button>
            <Button
                onClick={handleSave}
                type="button"
                disabled={isSaving}
            >
                {isSaving ? 'Saving...' : 'Save'}
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={`Edit Permissions for ${role.name}`}
            maxWidth="lg"
            footer={footer}
        >
            <div className="space-y-2 max-h-72 overflow-y-auto">
                {allPermissions.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-2">
                        <Checkbox
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => handleToggle(perm.id)}
                            id={`perm-${perm.id}`}
                            disabled={isSaving}
                        />
                        <label
                            htmlFor={`perm-${perm.id}`}
                            className="text-sm cursor-pointer"
                        >
                            {perm.name}
                            {perm.description && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {perm.description}
                                </span>
                            )}
                        </label>
                    </div>
                ))}
            </div>
        </Modal>
    );
}

export default RolePermissionsModal;

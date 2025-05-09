import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui";
import { Checkbox } from "@/components/ui";
import { Modal } from "@/components/ui/modal";

interface Permission {
    id: string;
    name: string;
    description?: string | null;
}

interface RoleCreateModalProps {
    open: boolean;
    onClose: () => void;
    allPermissions: Permission[];
    onSave: (role: { name: string; description?: string; permissionIds: string[] }) => void;
}

export function RoleCreateModal({ open, onClose, allPermissions, onSave }: RoleCreateModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const handleToggle = (permissionId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name: name.trim(), description: description.trim(), permissionIds: selectedPermissions });
        }
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setSelectedPermissions([]);
        onClose();
    };

    const footer = (
        <>
            <Button variant="outline" onClick={handleClose} type="button">
                Cancel
            </Button>
            <Button onClick={handleSave} type="button" disabled={!name.trim()}>
                Save
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={open}
            onClose={handleClose}
            title="Create New Role"
            maxWidth="lg"
            footer={footer}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Role Name</label>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Role name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Role description (optional)"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Permissions</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {allPermissions.map((perm) => (
                            <div key={perm.id} className="flex items-center gap-2">
                                <Checkbox
                                    checked={selectedPermissions.includes(perm.id)}
                                    onCheckedChange={() => handleToggle(perm.id)}
                                    id={`perm-create-${perm.id}`}
                                />
                                <label
                                    htmlFor={`perm-create-${perm.id}`}
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
                </div>
            </div>
        </Modal>
    );
}

export default RoleCreateModal;

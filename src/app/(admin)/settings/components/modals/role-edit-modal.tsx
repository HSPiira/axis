import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

interface RoleEditModalProps {
    open: boolean;
    onClose: () => void;
    role: Role | null;
    onSave: (roleId: string, data: { name: string; description?: string }) => Promise<void>;
}

export function RoleEditModal({ open, onClose, role, onSave }: RoleEditModalProps) {
    const [name, setName] = useState(role?.name || '');
    const [description, setDescription] = useState(role?.description || '');
    const [isSaving, setIsSaving] = useState(false);

    // Reset state when role changes
    useEffect(() => {
        if (role) {
            setName(role.name);
            setDescription(role.description || '');
        }
    }, [role]);

    const handleSave = async () => {
        if (!role) return;

        try {
            setIsSaving(true);
            await onSave(role.id, {
                name,
                description: description || undefined
            });
            onClose();
        } catch (error) {
            console.error('Error saving role:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!role) return null;

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Edit Role"
            maxWidth="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} type="button" disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} type="button" disabled={isSaving || !name.trim()}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Role name"
                    />
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Role description"
                        rows={3}
                    />
                </div>

                {/* Read-only fields */}
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                        <span className="font-medium">Users:</span> {role.usersCount}
                    </div>
                    <div>
                        <span className="font-medium">Permissions:</span> {role.permissions.length}
                    </div>
                    <div>
                        <span className="font-medium">Created:</span> {new Date(role.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                        <span className="font-medium">Last Updated:</span> {new Date(role.updatedAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </Modal>
    );
} 
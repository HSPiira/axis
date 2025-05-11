import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

interface UserEditModalProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
    roles: Role[];
    onSave: (userId: string, data: { name?: string; roleId?: string }) => Promise<void>;
}

export function UserEditModal({ open, onClose, user, roles, onSave }: UserEditModalProps) {
    const [name, setName] = useState(user?.name || '');
    const [selectedRoleId, setSelectedRoleId] = useState(user?.userRoles[0]?.role.id || '');
    const [isSaving, setIsSaving] = useState(false);

    // Reset state when user changes
    React.useEffect(() => {
        if (user) {
            setName(user.name || '');
            setSelectedRoleId(user.userRoles[0]?.role.id || '');
        }
    }, [user]);

    // Check if user is from a credential provider
    const isCredentialUser = user?.accounts?.some(account => account.type === 'credentials');

    const handleSave = async () => {
        if (!user) return;

        try {
            setIsSaving(true);
            await onSave(user.id, {
                name: name !== user.name ? name : undefined,
                roleId: selectedRoleId !== user.userRoles[0]?.role.id ? selectedRoleId : undefined
            });
            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Edit User"
            maxWidth="md"
            footer={
                <div className="flex justify-center gap-2 mb-2 mr-2">
                    <Button variant="outline" onClick={onClose} type="button" disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} type="button" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Name field - only editable for non-credential users */}
                {!isCredentialUser && (
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="User's name"
                        />
                    </div>
                )}

                {/* Role selection - always editable */}
                <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                        value={selectedRoleId}
                        onValueChange={setSelectedRoleId}
                    >
                        <SelectTrigger id="role">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Read-only fields */}
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                        <span className="font-medium">Email:</span> {user.email || 'Not set'}
                    </div>
                    <div>
                        <span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                        <span className="font-medium">Last Updated:</span> {new Date(user.updatedAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </Modal>
    );
} 
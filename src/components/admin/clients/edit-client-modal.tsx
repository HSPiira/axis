import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface ClientEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    client?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
}

export function ClientEditModal({ isOpen, onClose, client }: ClientEditModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Client"
            maxWidth="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button>
                        Save Changes
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        defaultValue={client?.name}
                        placeholder="Enter client name"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        defaultValue={client?.email}
                        placeholder="Enter client email"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        type="tel"
                        defaultValue={client?.phone}
                        placeholder="Enter client phone number"
                    />
                </div>
            </div>
        </Modal>
    );
} 
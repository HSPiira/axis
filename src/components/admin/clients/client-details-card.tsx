"use client";

import React, { useState } from "react";
import { X, Users, Calendar, Mail, Phone, Building2, MapPin, CheckCircle, XCircle, Tag, User, Pencil, Users2, FilePenLineIcon, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgStatus } from "@/generated/prisma";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClientEditModal } from "./client-edit-modal";

interface Client {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    status: OrgStatus;
    createdAt: string;
    updatedAt: string;
    phone?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    industry?: {
        id: string;
        name: string;
        code?: string;
    };
}

interface ClientDetailsCardProps {
    client: Client;
    onClose: () => void;
}

export default function ClientDetailsCard({ client, onClose }: ClientDetailsCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <div className="w-[340px] p-4 flex flex-col border border-[#e5e7eb] dark:border-[#18191b] rounded-none bg-white dark:bg-[#000]">
                {/* Header Section */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium flex items-center gap-1.5 text-sm" style={{ lineHeight: "1.2" }}>
                            <span className="truncate">
                                {client.name}
                            </span>
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${client.status === OrgStatus.ACTIVE
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                {client.status === OrgStatus.ACTIVE ? (
                                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                                ) : (
                                    <XCircle className="h-3 w-3 flex-shrink-0" />
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Tag className="h-3 w-3 text-cyan-500 flex-shrink-0" />
                                {client.industry?.name || "No Industry"}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-2 p-1 rounded-full hover:bg-muted flex-shrink-0"
                        aria-label="Close client details"
                    >
                        <X className="h-3.5 w-3.5 flex-shrink-0" />
                    </button>
                </div>

                <div className="border-t my-2" />

                {/* Contact Information */}
                <div className="space-y-2">
                    {client.email && (
                        <div className="flex items-center gap-2 text-xs">
                            <Mail className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{client.email}</span>
                        </div>
                    )}
                    {client.phone && (
                        <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3.5 w-3.5 text-pink-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{client.phone}</span>
                        </div>
                    )}
                    {client.address && (
                        <div className="flex items-center gap-2 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{client.address}</span>
                        </div>
                    )}
                    {client.contactPerson && (
                        <div className="flex items-center gap-2 text-xs">
                            <User className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{client.contactPerson}</span>
                        </div>
                    )}
                    {client.contactEmail && (
                        <div className="flex items-center gap-2 text-xs">
                            <Mail className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{client.contactEmail}</span>
                        </div>
                    )}
                    {client.contactPhone && (
                        <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{client.contactPhone}</span>
                        </div>
                    )}
                </div>

                {/* Metadata Section */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                            <span className="text-gray-600 dark:text-gray-300">
                                {new Date(client.createdAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                            <span className="text-gray-600 dark:text-gray-300">
                                {new Date(client.updatedAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-4 flex justify-end gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <FilePenLineIcon className="h-4 w-4 flex-shrink-0" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Edit Client</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-400"
                                >
                                    <UserCog className="h-4 w-4 flex-shrink-0" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">View Users</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <ClientEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                client={client}
            />
        </>
    );
} 
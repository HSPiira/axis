"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, Upload, CheckCircle, XCircle, ArrowUpDown } from "lucide-react";
import { AddClientModal } from ".";
import { ClientDetailsCard } from ".";
import SearchAction from "@/components/search-action";
import { OrgStatus } from "@prisma/client";


/**
 * ClientsTable
 *
 * Displays a list of client organizations in a table format.
 *
 * Columns: Organization Name, Contact, Email, Status, Users, Created, Actions
 *
 * TODO: Connect to real data source and add sorting/filtering.
 */

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
    industryId?: string;
}

type SortField = 'name' | 'contactPerson' | 'email' | 'status' | 'industry' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function ClientsTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const ITEMS_PER_PAGE = 10;

    // Fetch clients from API (server-side pagination)
    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/organization?page=${currentPage}&limit=${ITEMS_PER_PAGE}&sort=${sortField}&direction=${sortDirection}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`);
            const data = await res.json();
            setClients(data.organizations || []);
            setTotalPages(data.pagination?.pages || 1);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [currentPage, sortField, sortDirection, searchQuery]);

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortField, sortDirection]);

    return (
        <div className="space-y-4">
            <SearchAction
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={() => { }}
                placeholder="Search clients..."
                importButton={{
                    icon: <Upload className="h-5 w-5" />,
                    ariaLabel: "Import clients",
                    onClick: () => { }
                }}
                addButton={{
                    icon: <Plus className="h-5 w-5" />,
                    ariaLabel: "Add client",
                    onClick: () => { setAddModalOpen(true) }
                }}
            />

            <div className="flex gap-6">
                <div className="flex-1">
                    <div className="p-4 shadow-none border-[0.5px] border-[#e5e7eb] dark:border-[#18191b] bg-white dark:bg-[#000]">
                        <table className="min-w-full divide-y divide-border text-xs">
                            <thead>
                                <tr className="bg-white dark:bg-[#000]">
                                    <th
                                        className="px-4 py-2 text-left whitespace-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                                        onClick={() => setSortField('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Organization
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </th>
                                    <th
                                        className={`px-4 py-2 text-left whitespace-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${selectedClient ? 'hidden' : ''}`}
                                        onClick={() => setSortField('contactPerson')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Contact
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </th>
                                    <th
                                        className={`px-4 py-2 text-left whitespace-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${selectedClient ? 'hidden' : ''}`}
                                        onClick={() => setSortField('email')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Email
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left whitespace-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                                        onClick={() => setSortField('status')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Status
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left whitespace-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                                        onClick={() => setSortField('industry')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Industry
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </th>
                                    <th
                                        className={`px-4 py-2 text-left whitespace-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${selectedClient ? 'hidden' : ''}`}
                                        onClick={() => setSortField('createdAt')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Created
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Loading clients...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No clients found
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map((client) => (
                                        <tr
                                            key={client.id}
                                            className={`transition-colors cursor-pointer border-b border-border last:border-0 bg-white dark:bg-[#111] hover:bg-accent/40 ${selectedClient?.id === client.id ? 'bg-primary/10 dark:bg-primary/20' : ''
                                                }`}
                                            onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                                        >
                                            <td className="px-4 py-2 font-medium whitespace-nowrap">{client.name}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap ${selectedClient ? 'hidden' : ''}`}>{client.contactPerson}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap ${selectedClient ? 'hidden' : ''}`}>{client.email}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                {client.status === OrgStatus.ACTIVE ? (
                                                    <span className="inline-flex items-center gap-1 text-green-500 font-medium">
                                                        <CheckCircle className="h-4 w-4" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                                                        <XCircle className="h-4 w-4" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">{client.industry?.name || "N/A"}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap ${selectedClient ? 'hidden' : ''}`}>
                                                {new Date(client.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {!isLoading && totalPages > 1 && (
                            <div className="flex justify-end mt-4">
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {(() => {
                                            const pages = [];
                                            const showEllipsis = totalPages > 3;

                                            // Always show first page
                                            pages.push(
                                                <Button
                                                    key={1}
                                                    variant={currentPage === 1 ? "default" : "ghost"}
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full font-medium"
                                                    onClick={() => setCurrentPage(1)}
                                                >
                                                    1
                                                </Button>
                                            );

                                            // Show ellipsis if needed
                                            if (showEllipsis && currentPage > 2) {
                                                pages.push(
                                                    <span key="start-ellipsis" className="px-2">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            // Show current page and one before/after if not at edges
                                            if (currentPage > 1 && currentPage < totalPages) {
                                                pages.push(
                                                    <Button
                                                        key={currentPage}
                                                        variant="default"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full font-medium"
                                                    >
                                                        {currentPage}
                                                    </Button>
                                                );
                                            }

                                            // Show ellipsis if needed
                                            if (showEllipsis && currentPage < totalPages - 1) {
                                                pages.push(
                                                    <span key="end-ellipsis" className="px-2">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            // Always show last page if more than 1 page
                                            if (totalPages > 1) {
                                                pages.push(
                                                    <Button
                                                        key={totalPages}
                                                        variant={currentPage === totalPages ? "default" : "ghost"}
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full font-medium"
                                                        onClick={() => setCurrentPage(totalPages)}
                                                    >
                                                        {totalPages}
                                                    </Button>
                                                );
                                            }

                                            return pages;
                                        })()}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(totalPages)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {selectedClient && (
                    <ClientDetailsCard
                        client={selectedClient}
                        onClose={() => setSelectedClient(null)}
                    />
                )}
            </div>

            <AddClientModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={async client => {
                    // Prepare form data for file upload if logo is present
                    const formData = new FormData();
                    formData.append("name", client.name);
                    formData.append("email", client.email);
                    formData.append("phone", client.phone || "");
                    formData.append("address", client.address || "");
                    formData.append("contactPerson", client.contactPerson);
                    formData.append("contactEmail", client.contactEmail || "");
                    formData.append("contactPhone", client.contactPhone || "");
                    formData.append("industryId", client.industryId);
                    formData.append("notes", client.notes || "");
                    if (client.logo) {
                        formData.append("logo", client.logo);
                    }

                    try {
                        // Create the new organization
                        const createResponse = await fetch("/api/organization", {
                            method: "POST",
                            body: formData,
                        });

                        if (!createResponse.ok) {
                            throw new Error('Failed to create organization');
                        }

                        const data = await createResponse.json();
                        console.log('API Response:', data); // Debug log

                        // Check if the response is the organization directly
                        const newOrganization = data.organization || data;

                        // Validate the response data
                        if (!newOrganization || !newOrganization.id) {
                            console.error('Invalid response structure:', newOrganization); // Debug log
                            throw new Error('Invalid response format from server');
                        }

                        // Add the new organization to the existing clients array
                        setClients(prevClients => {
                            // Since we're sorting by createdAt desc by default, add to the beginning
                            return [newOrganization, ...prevClients];
                        });

                        // Close the modal
                        setAddModalOpen(false);
                    } catch (error) {
                        console.error('Error adding client:', error);
                        // Fallback to fetching all clients if the optimistic update fails
                        await fetchClients();
                        // You might want to show an error toast/notification here
                    }
                }}
            />
        </div>
    );
} 
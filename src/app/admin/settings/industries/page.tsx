'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Trash, Edit, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { IndustrySelect } from '@/components/industries/IndustrySelect';
import type { IndustryModel } from '@/lib/providers/industry-provider';

export default function IndustriesPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState<IndustryModel | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['industries', { page, search }],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search,
            });
            const response = await fetch(`/api/industries?${params}`);
            if (!response.ok) throw new Error('Failed to fetch industries');
            return response.json();
        },
    });

    const handleCreate = async (formData: FormData) => {
        const name = formData.get('name') as string;
        const code = formData.get('code') as string;
        const description = formData.get('description') as string;
        const parentId = formData.get('parentId') as string;

        const response = await fetch('/api/industries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                code: code || undefined,
                description: description || undefined,
                parentId: parentId || undefined,
            }),
        });

        if (response.ok) {
            setIsCreateOpen(false);
            refetch();
        }
    };

    const handleDelete = async () => {
        if (!selectedIndustry) return;

        const response = await fetch(`/api/industries?id=${selectedIndustry.id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setIsDeleteOpen(false);
            setSelectedIndustry(null);
            refetch();
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-2 sm:px-4 space-y-6 lg:ml-56">
            <div className="flex justify-between items-center mt-8 sm:mt-10 md:mt-12">
                <div>
                    <h1 className="text-2xl font-bold">Industries</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage industry classifications for clients
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Industry
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Industry</DialogTitle>
                            <DialogDescription>
                                Add a new industry classification
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    name="name"
                                    placeholder="Industry name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Code</label>
                                <Input
                                    name="code"
                                    placeholder="Industry code (optional)"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    name="description"
                                    placeholder="Industry description (optional)"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Parent Industry</label>
                                <IndustrySelect
                                    placeholder="Select parent industry (optional)"
                                    onChange={() => { }}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search industries..."
                        className="pl-8"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center h-24"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : data?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center h-24"
                                >
                                    No industries found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data?.map((industry: IndustryModel) => (
                                <TableRow key={industry.id}>
                                    <TableCell>{industry.name}</TableCell>
                                    <TableCell>{industry.code || '-'}</TableCell>
                                    <TableCell>
                                        {industry.parent?.name || '-'}
                                    </TableCell>
                                    <TableCell className="truncate max-w-xs">{industry.description || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    // TODO: Implement edit
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedIndustry(industry);
                                                    setIsDeleteOpen(true);
                                                }}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    // TODO: View children
                                                }}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination Controls */}
            {data?.total && data?.limit && (
                <div className="flex justify-end items-center gap-2 mt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {page} of {Math.ceil(data.total / data.limit)}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= Math.ceil(data.total / data.limit)}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Industry</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this industry? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type { IndustryModel } from '@/lib/providers/industry-provider';

interface IndustrySelectProps {
    value?: string;
    onChange: (value: string | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function IndustrySelect({
    value,
    onChange,
    className,
    placeholder = 'Select industry...',
}: IndustrySelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const { data: industries, isLoading } = useQuery({
        queryKey: ['industries', { search }],
        queryFn: async () => {
            const params = new URLSearchParams({
                search,
                limit: '50',
            });
            const response = await fetch(`/api/industries?${params}`);
            if (!response.ok) throw new Error('Failed to fetch industries');
            const result = await response.json();
            return result.data as IndustryModel[];
        },
    });

    const selectedIndustry = industries?.find((industry) => industry.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', className)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        'Loading...'
                    ) : selectedIndustry ? (
                        <>
                            {selectedIndustry.name}
                            {selectedIndustry.code && (
                                <span className="ml-2 text-muted-foreground">
                                    ({selectedIndustry.code})
                                </span>
                            )}
                        </>
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-[9999] pointer-events-auto" forceMount>
                <Command>
                    <CommandInput
                        placeholder="Search industries..."
                        onValueChange={setSearch}
                    />
                    {industries && industries.length === 0 && (
                        <CommandEmpty>No industry found.</CommandEmpty>
                    )}
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {industries && industries.length > 0 && industries.map((industry) => (
                            <div
                                key={industry.id}
                                className={cn(
                                    'flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100',
                                    value === industry.id && 'bg-blue-50'
                                )}
                                onClick={() => {
                                    onChange(industry.id === value ? undefined : industry.id);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value === industry.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    )}
                                />
                                {industry.name}
                                {industry.code && (
                                    <span className="ml-2 text-muted-foreground">
                                        ({industry.code})
                                    </span>
                                )}
                            </div>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
} 
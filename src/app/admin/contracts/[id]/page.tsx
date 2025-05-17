'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export default function ContractDetailsPage() {
    const params = useParams();
    const contractId = params.id as string;

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: 'Clients', href: '/admin/clients' },
                    { label: 'Contracts', href: '/admin/contracts' },
                    { label: 'Contract Details' }
                ]}
            />
            {/* Contract details content will go here */}
        </div>
    );
} 
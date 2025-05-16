import { Metadata } from 'next';
import { Suspense } from 'react';
import { ClientHeader } from '../../components/ClientDetails/ClientHeader';
import { ClientInfo } from '../../components/ClientDetails/ClientInfo';
import { ClientContracts } from '../../components/ClientDetails/ClientContracts';
import { ClientDocuments } from '../../components/ClientDetails/ClientDocuments';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { QuickActions } from '../../components/ClientDetails/QuickActions';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PageProps {
    params: { clientId: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { clientId } = params;
    return {
        title: `Client Details - ${clientId}`,
        description: `View and manage client details, contracts, and documents for client ${clientId}`,
    };
}

function ClientDashboardContent({ clientId }: { clientId: string }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Breadcrumb
                    items={[
                        { label: 'Clients', href: '/admin/clients' },
                        { label: clientId, href: `/admin/clients/${clientId}` },
                    ]}
                />
                <QuickActions clientId={clientId} />
            </div>

            <ClientHeader clientId={clientId} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ErrorBoundary fallback={<div>Error loading client information</div>}>
                        <Suspense fallback={<LoadingSpinner />}>
                            <ClientInfo clientId={clientId} />
                        </Suspense>
                    </ErrorBoundary>

                    <ErrorBoundary fallback={<div>Error loading contracts</div>}>
                        <Suspense fallback={<LoadingSpinner />}>
                            <ClientContracts clientId={clientId} />
                        </Suspense>
                    </ErrorBoundary>
                </div>

                <div className="space-y-6">
                    <ErrorBoundary fallback={<div>Error loading documents</div>}>
                        <Suspense fallback={<LoadingSpinner />}>
                            <ClientDocuments clientId={clientId} />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
}

export default function ClientDetailPage({ params }: PageProps) {
    const { clientId } = params;

    return (
        <ErrorBoundary fallback={<div>Error loading client dashboard</div>}>
            <Suspense fallback={<LoadingSpinner />}>
                <ClientDashboardContent clientId={clientId} />
            </Suspense>
        </ErrorBoundary>
    );
} 
import { Metadata } from 'next';
import { ClientHeader } from '../components/ClientDetails/ClientHeader';
import { ClientInfo } from '../components/ClientDetails/ClientInfo';
import { ClientContracts } from '../components/ClientDetails/ClientContracts';
import { ClientDocuments } from '../components/ClientDetails/ClientDocuments';

interface Props {
    params: Promise<{ clientId: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { clientId } = await params;
    return {
        title: `Client Details - ${clientId}`,
    };
}

export default async function ClientDetailPage({ params }: Props) {
    const { clientId } = await params;

    return (
        <div className="space-y-6">
            <ClientHeader clientId={clientId} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ClientInfo clientId={clientId} />
                    <ClientContracts clientId={clientId} />
                </div>

                <div className="space-y-6">
                    <ClientDocuments clientId={clientId} />
                </div>
            </div>
        </div>
    );
} 
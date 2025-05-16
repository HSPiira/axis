import { Metadata } from 'next';
import { ClientHeader } from '../../components/ClientDetails/ClientHeader';
import { ContractList } from './components/ContractList';
import { ContractStats } from './components/ContractStats';

interface Props {
    params: Promise<{ clientId: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { clientId } = await params;
    return {
        title: `Contracts for Client ${clientId}`,
    };
}

export default async function ClientContractsPage({ params }: Props) {
    const { clientId } = await params;

    return (
        <div className="space-y-6">
            <ClientHeader clientId={clientId} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ContractList clientId={clientId} />
                </div>

                <div>
                    <ContractStats clientId={clientId} />
                </div>
            </div>
        </div>
    );
} 
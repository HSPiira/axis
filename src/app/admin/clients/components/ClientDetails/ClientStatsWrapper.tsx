import { unstable_cache } from 'next/cache';
import { ContractProvider } from '@/lib/providers/contract-provider';
import { DocumentProvider } from '@/lib/providers/document-provider';
import { StaffProvider } from '@/lib/providers/staff-provider';
import { BeneficiaryProvider } from '@/lib/providers/beneficiary-provider';
import { ClientStats } from './ClientStats';
import type { StaffModel } from '@/lib/providers/staff-provider';
import type { BeneficiaryModel } from '@/lib/providers/beneficiary-provider';
import type { ContractModel } from '@/lib/providers/contract-provider';

const getStats = unstable_cache(
    async (clientId: string) => {
        const [staff, beneficiaries, contracts, documents] = await Promise.all([
            new StaffProvider().list({ filters: { clientId } }),
            new BeneficiaryProvider().list({ filters: { clientId } }),
            new ContractProvider().list({ filters: { clientId } }),
            new DocumentProvider().list({ clientId })
        ]);

        return {
            activeStaff: staff.data.filter((s: StaffModel) => s.status === 'ACTIVE').length,
            activeBeneficiaries: beneficiaries.data.filter((b: BeneficiaryModel) => b.status === 'ACTIVE').length,
            activeContracts: contracts.data.filter((c: ContractModel) => c.status === 'ACTIVE').length,
            totalDocuments: documents.data.length
        };
    },
    ['client-stats'],
    {
        revalidate: 60,
        tags: ['client']
    }
);

export async function ClientStatsWrapper({ clientId }: { clientId: string }) {
    const stats = await getStats(clientId);
    return <ClientStats stats={stats} />;
} 
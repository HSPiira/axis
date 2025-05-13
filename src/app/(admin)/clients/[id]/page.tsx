import { notFound } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import ClientDetailContent from '@/components/admin/clients/client-detail-content';

interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    industry?: { id: string; name: string };
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    notes?: string;
}

async function getClient(id: string): Promise<Client | null> {
    const host = (await headers()).get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const cookie = (await cookies()).toString();
    const res = await fetch(`${protocol}://${host}/api/organization/${id}`, {
        cache: 'no-store',
        headers: {
            Cookie: cookie,
        },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.organization || data;
}

export default async function ClientPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const client = await getClient(id);
    if (!client) return notFound();
    return <ClientDetailContent client={client} />;
} 
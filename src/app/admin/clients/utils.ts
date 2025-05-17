import { unstable_cache } from 'next/cache';
import { ClientProvider } from '@/lib/providers/client-provider';

export const getClientData = unstable_cache(
    async (clientId: string) => {
        const clientProvider = new ClientProvider();
        const client = await clientProvider.get(clientId);
        return client;
    },
    ['client-data'],
    {
        revalidate: 60,
        tags: ['client']
    }
); 
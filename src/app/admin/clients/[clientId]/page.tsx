import { ClientProvider } from '@/lib/providers/client-provider';
import ClientDetailShell from './ClientDetailShell';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';

function SkeletonCard() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </Card>
  );
}

async function getClientData(clientId: string) {
  const provider = new ClientProvider();
  const client = await provider.get(clientId);
  return client;
}

export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await getClientData(clientId);
  if (!client) {
    throw new Error('Client not found');
  }
  const activeTab = 'overview';

  return (
    <Suspense fallback={<SkeletonCard />}>
      <ClientDetailShell
        clientId={clientId}
        activeTab={activeTab}
        client={client}
      />
    </Suspense>
  );
}

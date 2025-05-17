import { getClientData } from './layout';
import { ClientModel } from '@/lib/providers/client-provider';
import ClientDetailShell from './ClientDetailShell';

export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await getClientData(clientId);

  return (
    <ClientDetailShell
      clientId={clientId}
      activeTab="overview"
      client={client as ClientModel}
    />
  );
}

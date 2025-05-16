interface ClientHeaderProps {
    clientId: string;
}

export function ClientHeader({ clientId }: ClientHeaderProps) {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Client Details</h1>
            <p className="mt-1 text-sm text-gray-500">Client ID: {clientId}</p>
        </div>
    );
} 
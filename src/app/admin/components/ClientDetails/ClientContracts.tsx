interface ClientContractsProps {
    clientId: string;
}

export function ClientContracts({ clientId }: ClientContractsProps) {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contracts</h2>
            <div className="space-y-4">
                <p className="text-sm text-gray-500">No contracts found</p>
            </div>
        </div>
    );
} 
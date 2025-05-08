export function BillingSettings() {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Billing Information</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Current Plan</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Free Plan</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Payment Method</h3>
                    <div className="mt-2 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No payment method added</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BillingSettings;
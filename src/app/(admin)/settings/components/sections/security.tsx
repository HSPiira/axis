export function SecuritySettings() {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Security Settings</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Change Password</h3>
                    <div className="mt-2 space-y-4">
                        <input
                            type="password"
                            placeholder="Current Password"
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                        />
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600">
                        Enable 2FA
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SecuritySettings;
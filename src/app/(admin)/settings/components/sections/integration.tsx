export function IntegrationSettings() {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Integrations</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Google Calendar</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Connect your Google Calendar</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600">
                        Connect
                    </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Slack</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Connect your Slack workspace</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600">
                        Connect
                    </button>
                </div>
            </div>
        </div>
    );
}

export default IntegrationSettings;
export function ProfileSettings() {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile Settings</h2>
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                        Change Photo
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                        <textarea
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileSettings;
import React from 'react';
import { FiCalendar } from 'react-icons/fi';

export default function UpcomingSessionsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-16">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 mb-6">
                <FiCalendar className="text-5xl text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">No upcoming sessions</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                You have no upcoming sessions. As soon as someone books a time with you it will show up here.
            </p>
        </div>
    );
} 
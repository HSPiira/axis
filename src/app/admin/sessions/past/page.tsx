import React from 'react';
import { FiCalendar } from 'react-icons/fi';

export default function PastSessionsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-gray-200 rounded-2xl py-16">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <FiCalendar className="text-5xl text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">No past bookings</h2>
            <p className="text-gray-600 text-center max-w-md">
                You have no past bookings. Your past bookings will show up here.
            </p>
        </div>
    );
} 
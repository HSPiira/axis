'use client';

import React, { useState } from 'react';

const GeneralSettingsPage = () => {
    const [language, setLanguage] = useState('English');
    const [timezone, setTimezone] = useState('Africa/Kampala');
    const [timeFormat, setTimeFormat] = useState('12 hour');
    const [startOfWeek, setStartOfWeek] = useState('Sunday');
    const [dynamicGroupLinks, setDynamicGroupLinks] = useState(false);
    const [searchEngineIndexing, setSearchEngineIndexing] = useState(false);

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-black rounded-lg shadow p-6 mt-6">
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">General</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage settings for your language and timezone</p>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-black text-gray-900 dark:text-gray-200">
                    <option>English</option>
                    <option>French</option>
                    <option>Spanish</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Timezone</label>
                <div className="flex gap-2">
                    <select value={timezone} onChange={e => setTimezone(e.target.value)} className="flex-1 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-black text-gray-900 dark:text-gray-200">
                        <option>Africa/Kampala</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                    </select>
                    <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded flex items-center gap-1 text-sm bg-white dark:bg-black text-gray-700 dark:text-gray-200">
                        <span role="img" aria-label="calendar">📅</span> Schedule timezone change
                    </button>
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Time format</label>
                <select value={timeFormat} onChange={e => setTimeFormat(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-black text-gray-900 dark:text-gray-200">
                    <option>12 hour</option>
                    <option>24 hour</option>
                </select>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This is an internal setting and will not affect how times are displayed on public booking pages for you or anyone booking you.</p>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Start of week</label>
                <select value={startOfWeek} onChange={e => setStartOfWeek(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-black text-gray-900 dark:text-gray-200">
                    <option>Sunday</option>
                    <option>Monday</option>
                </select>
            </div>
            <button className="mt-2 mb-6 px-6 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" disabled>Update</button>
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">Dynamic group links</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Allow attendees to book you through dynamic group bookings</div>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={dynamicGroupLinks} onChange={() => setDynamicGroupLinks(v => !v)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:bg-black dark:peer-checked:bg-white transition-all"></div>
                        <div className={`absolute ml-1 mt-1 w-4 h-4 bg-white dark:bg-black rounded-full shadow transition-all ${dynamicGroupLinks ? 'translate-x-5' : ''}`}></div>
                    </label>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">Allow search engine indexing</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Allow search engines to access your public content</div>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={searchEngineIndexing} onChange={() => setSearchEngineIndexing(v => !v)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:bg-black dark:peer-checked:bg-white transition-all"></div>
                        <div className={`absolute ml-1 mt-1 w-4 h-4 bg-white dark:bg-black rounded-full shadow transition-all ${searchEngineIndexing ? 'translate-x-5' : ''}`}></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettingsPage; 
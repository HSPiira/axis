'use client';

import React, { useState } from 'react';

const ProfilePage = () => {
    const [username, setUsername] = useState('henry-ssekibo-pxu54t');
    const [fullName, setFullName] = useState('Henry Ssekibo');
    const [email, setEmail] = useState('sekiboh@gmail.com');
    const [about, setAbout] = useState('');
    const [avatar, setAvatar] = useState('https://i.pravatar.cc/100');

    return (
        <div className="max-w-6xl mx-auto px-2 sm:px-4 space-y-6 lg:ml-56">
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage settings for your careAxis profile</p>
            <div className="flex items-center gap-4 mb-6">
                <img src={avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded mr-2 bg-white dark:bg-black text-gray-700 dark:text-gray-200">Upload Avatar</button>
                    <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded text-red-500 bg-white dark:bg-black">Remove</button>
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Username</label>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-l">careAxis/</span>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="flex-1 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded-r bg-white dark:bg-black text-gray-900 dark:text-gray-200" />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Tip: You can add a '+' between usernames: careAxis/henry+ssekibo to make a dynamic group meeting</p>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Full name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-black text-gray-900 dark:text-gray-200" />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Email</label>
                <div className="flex items-center gap-2 mb-1">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded bg-white dark:bg-black text-gray-900 dark:text-gray-200" />
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded">Primary</span>
                    <button className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-700 dark:text-gray-200">+ Add Email</button>
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">About</label>
                <div className="border border-gray-300 dark:border-gray-700 rounded p-2 bg-gray-50 dark:bg-gray-900">
                    <div className="flex gap-2 mb-2">
                        <button className="px-1 text-gray-700 dark:text-gray-200"><b>B</b></button>
                        <button className="px-1 text-gray-700 dark:text-gray-200"><i>I</i></button>
                        <button className="px-1 text-gray-700 dark:text-gray-200">✎</button>
                    </div>
                    <textarea value={about} onChange={e => setAbout(e.target.value)} className="w-full bg-transparent outline-none resize-none text-gray-900 dark:text-gray-200" rows={4} />
                </div>
            </div>
            <button className="mt-4 px-6 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" disabled>Update</button>
        </div>
    );
};

export default ProfilePage; 
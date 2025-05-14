'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FiSettings } from 'react-icons/fi';

interface HeaderProps {
    logo?: React.ReactNode;
    user?: { avatar: string; name: string };
}

const Header: React.FC<HeaderProps> = ({ logo, user }) => {
    const router = useRouter();
    return (
        <header className="flex items-center justify-between px-4 h-14 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm fixed top-0 left-0 right-0 z-30 md:hidden">
            <div className="flex items-center gap-2">
                {logo || <span className="font-bold text-lg">Cal.com</span>}
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push('/admin/settings')}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none"
                    aria-label="Settings"
                >
                    <FiSettings className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
                {user && (
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
                        onError={(e) => {
                            e.currentTarget.src = '/placeholder-avatar.png'; // Fallback avatar
                        }}
                    />
            </div>
        </header>
    );
};

export default Header; 
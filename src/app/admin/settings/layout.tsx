'use client';
import React, { useState } from 'react';
import { FloatingActionButton } from '@/components/sidebar';
import AppSidebar from '@/components/sidebar/AppSidebar';
import { FiMenu, FiArrowLeft, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { settingsSections } from '@/components/sidebar/settingsSections';
import Link from 'next/link';
import * as Icons from 'react-icons/fi';

const user = {
    avatar: 'https://i.pravatar.cc/100',
    name: 'Henry Ssekibo',
};

function SettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <div className={`fixed inset-0 z-40 lg:hidden transition-all ${open ? 'visible' : 'invisible'}`}>
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            {/* Drawer */}
            <aside className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 shadow-lg transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { window.location.href = '/admin'; }} aria-label="Back" className="p-2">
                            <FiArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <span className="font-bold text-lg">Settings</span>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2">
                        <FiX className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex flex-col gap-2 p-4 overflow-y-auto h-full">
                    {settingsSections.map((section, idx) => (
                        <div key={idx} className="mb-2">
                            {section.title && <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 mt-2">{section.title}</div>}
                            <nav className="flex flex-col gap-1">
                                {section.items.map((item) => {
                                    const Icon = (Icons as Record<string, React.ElementType>)[item.icon] || Icons.FiUser;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200"
                                            onClick={onClose}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}

function SettingsHeader({ onMenuClick }: { onMenuClick: () => void }) {
    const router = useRouter();
    return (
        <header className="flex items-center gap-3 px-4 h-14 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm fixed top-0 left-0 right-0 z-30 flex lg:hidden">
            <button className="p-2" aria-label="Menu" onClick={onMenuClick}>
                <FiMenu className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2" aria-label="Back" onClick={() => router.push('/admin')}>
                <FiArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <span className="font-bold text-lg">Settings</span>
        </header>
    );
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    return (
        <div className="flex flex-col md:flex-row bg-white dark:bg-black min-h-[calc(100vh-56px)] lg:min-h-screen">
            <SettingsHeader onMenuClick={() => setDrawerOpen(true)} />
            <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <AppSidebar user={user} />
            <main className="flex-1 flex items-center justify-center overflow-y-visible lg:overflow-y-auto lg:pt-0">
                <div className="max-w-6xl w-full mx-auto px-4 py-2">
                    {children}
                </div>
            </main>
            <FloatingActionButton />
        </div>
    );
} 
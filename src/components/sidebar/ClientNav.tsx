"use client";
import React from 'react';
import { SidebarNav, SidebarNavItem, SidebarFooter, BottomNav, BottomNavItem, UserProfile } from '@/components/sidebar';
import { usePathname } from 'next/navigation';

const navItems = [
    { icon: 'FiHome', label: 'Home', to: '/admin' },
    { icon: 'FiCalendar', label: 'Sessions', to: '/admin/sessions/upcoming' },
    { icon: 'FiUsers', label: 'Clients', to: '/admin/clients' },
    { icon: 'FiSettings', label: 'Settings', to: '/admin/settings' },
];

export default function ClientNav({ user }: { user: any }) {
    const pathname = usePathname();
    return (
        <>
            {/* Sidebar for large screens */}
            <div className="hidden md:flex flex-col w-16 lg:w-56 h-screen bg-[#f8f4fc] dark:bg-[#171717] border-r border-gray-200 dark:border-gray-800 shadow-sm">
                <UserProfile user={user} />
                <SidebarNav>
                    {navItems.map((item) => (
                        <SidebarNavItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            to={item.to}
                            active={
                                item.to === '/admin'
                                    ? pathname === '/admin'
                                    : pathname.startsWith(item.to)
                            }
                        />
                    ))}
                </SidebarNav>
                <SidebarFooter>
                    <SidebarNavItem icon="FiSettings" label="Settings" to="/admin/settings" active={pathname.startsWith('/admin/settings')} />
                </SidebarFooter>
            </div>
            {/* Bottom navigation for small screens */}
            <BottomNav>
                {navItems.map((item) => (
                    <BottomNavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        to={item.to}
                        active={
                            item.to === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.to)
                        }
                    />
                ))}
            </BottomNav>
        </>
    );
} 
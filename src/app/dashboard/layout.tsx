import React from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import UserProfile from '@/components/sidebar/UserProfile';
import SidebarNav from '@/components/sidebar/SidebarNav';
import SidebarNavItem from '@/components/sidebar/SidebarNavItem';
import SidebarFooter from '@/components/sidebar/SidebarFooter';
import BottomNav from '@/components/sidebar/BottomNav';
import BottomNavItem from '@/components/sidebar/BottomNavItem';
import FloatingActionButton from '@/components/sidebar/FloatingActionButton';

const user = {
    avatar: 'https://i.pravatar.cc/100',
    name: 'Henry Ssekibo',
};

const navItems = [
    { icon: 'FiHome', label: 'Event Types', to: '/dashboard' },
    { icon: 'FiCalendar', label: 'Bookings', to: '/dashboard/bookings' },
    { icon: 'FiUsers', label: 'Teams', to: '/dashboard/teams' },
    { icon: 'FiSettings', label: 'Settings', to: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // For active nav highlighting
    // In Next.js app dir, usePathname is a client hook, so this must be a client component for active highlighting
    // For now, we can just mock active as the first item for SSR
    return (
        <div className="min-h-screen flex flex-row bg-gray-50">
            {/* Sidebar for large screens */}
            <div className="hidden md:flex flex-col w-16 lg:w-56 h-screen bg-white border-r border-gray-200 shadow-sm">
                <UserProfile user={user} />
                <SidebarNav>
                    {navItems.map((item, idx) => (
                        <SidebarNavItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            to={item.to}
                            active={idx === 0} // Mock active for now
                        />
                    ))}
                </SidebarNav>
                <SidebarFooter>
                    <SidebarNavItem icon="FiSettings" label="Settings" to="/dashboard/settings" />
                </SidebarFooter>
            </div>

            {/* Main content area */}
            <main className="flex-1 px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6 py-2">
                {children}
            </main>

            {/* Bottom navigation for small screens */}
            <BottomNav>
                {navItems.map((item, idx) => (
                    <BottomNavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        to={item.to}
                        active={idx === 0} // Mock active for now
                    />
                ))}
            </BottomNav>
            <FloatingActionButton />
        </div>
    );
} 
"use client";
import React from 'react';
import * as Icons from 'react-icons/fi';
import Link from 'next/link';

interface BottomNavItemProps {
    icon: string;
    label: string;
    to: string;
    active?: boolean;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ icon, label, to, active }) => {
    const Icon = (Icons as any)[icon] || Icons.FiHome;
    return (
        <Link
            href={to}
            className={`group flex flex-col items-center justify-center rounded-md px-2 py-[7px] text-base transition-colors
                ${active ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
        >
            <Icon className={`w-5 h-5 mb-1 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span>{label}</span>
        </Link>
    );
};

export default BottomNavItem; 
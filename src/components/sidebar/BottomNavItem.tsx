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
            className={`group flex flex-col items-center justify-center rounded-md px-2 py-[7px] text-base text-gray-700 hover:bg-gray-100 hover:text-black transition-colors ${active ? 'bg-gray-100 text-black font-semibold' : ''
                }`}
        >
            <Icon className="w-6 h-6 mb-1" />
            <span>{label}</span>
        </Link>
    );
};

export default BottomNavItem; 
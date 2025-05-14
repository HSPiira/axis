import React from 'react';

interface SidebarProps {
    children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    return (
        <aside className="hidden md:flex flex-col w-16 lg:w-56 h-screen bg-white border-r border-gray-200 shadow-sm fixed left-0 top-0 z-30">
            {children}
        </aside>
    );
};

export default Sidebar; 
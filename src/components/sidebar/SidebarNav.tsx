import React from 'react';

interface SidebarNavProps {
    children: React.ReactNode;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ children }) => {
    return (
        <nav className="flex-1 px-2 py-4 space-y-0.5">
            {children}
        </nav>
    );
};

export default SidebarNav; 
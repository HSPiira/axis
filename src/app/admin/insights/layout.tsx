import React from 'react';

export default function InsightsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="p-4 md:p-6">
            {children}
        </div>
    );
} 
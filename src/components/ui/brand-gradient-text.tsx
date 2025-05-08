import React from "react";

export function BrandGradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <span
            className={`bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent ${className}`}
        >
            {children}
        </span>
    );
} 
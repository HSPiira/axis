"use client";
import React from 'react';
import { FiPlus } from 'react-icons/fi';

const FloatingActionButton: React.FC = () => {
    const handleClick = () => {
        alert('Add new event type');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg lg:hidden hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            aria-label="Add New"
        >
            <FiPlus className="w-7 h-7" />
        </button>
    );
};

export default FloatingActionButton;

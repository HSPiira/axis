import React from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
};

export function Modal({
    isOpen,
    onClose,
    title,
    icon,
    children,
    footer,
    maxWidth = "md"
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <div className={`bg-white dark:bg-[#111] rounded-lg w-full ${maxWidthClasses[maxWidth]} shadow-lg my-4 text-[15px] max-h-[95vh] flex flex-col`}>
                <div className="flex flex-col h-auto max-h-[95vh]">
                    <div className="flex justify-between items-center sticky top-0 z-10 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 p-5 sm:p-4">
                        <span className="text-[18px] font-semibold flex items-center text-gray-900 dark:text-gray-100">{icon && <span className="mr-2">{icon}</span>}{title}</span>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 space-y-4 text-gray-700 dark:text-gray-300 overflow-y-auto py-5 px-5 sm:px-4">
                        {children}
                    </div>
                    {footer && (
                        <div className="flex justify-end gap-2">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
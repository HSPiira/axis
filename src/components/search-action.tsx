// src/components/search-action.tsx

import { Button, Input } from "@/components/ui";
import { Search } from "lucide-react";
import { FC, ReactNode } from "react";


interface ActionButtonProps {
    onClick: () => void;
    icon: ReactNode;
    ariaLabel: string;
}

interface SearchActionProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSearch: () => void;
    placeholder?: string;
    importButton?: ActionButtonProps;
    addButton?: ActionButtonProps;
}


const SearchAction: FC<SearchActionProps> = ({
    searchQuery,
    setSearchQuery,
    placeholder = "Search...",
    importButton,
    addButton,
}) => {
    return (
        <div className="flex items-center gap-2 max-w-xl w-full">
            <Input
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 flex-1 min-w-0 rounded-full"
            />
            {importButton && (
                <Button
                    size="icon"
                    className="ml-1 w-10 h-10 rounded-full bg-[#2563eb] text-white hover:bg-white hover:text-[#2563eb] dark:bg-white dark:text-[#2563eb] dark:hover:bg-[#2563eb] dark:hover:text-white border-none transition-colors"
                    aria-label={importButton.ariaLabel}
                    onClick={importButton.onClick}
                >
                    {importButton.icon}
                </Button>)}
            {addButton && (
                <Button
                    size="icon"
                    className="ml-1 w-10 h-10 rounded-full bg-[#2563eb] text-white hover:bg-white hover:text-[#2563eb] dark:bg-white dark:text-[#2563eb] dark:hover:bg-[#2563eb] dark:hover:text-white border-none transition-colors"
                    aria-label={addButton.ariaLabel}
                    onClick={addButton.onClick}
                >
                    {addButton.icon}
                </Button>)}
        </div>
    );
};

export default SearchAction;







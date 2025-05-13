import { useState } from 'react';
import { SettingSection } from '../page';
import {
    Cog6ToothIcon,
    UserGroupIcon,
    BuildingOfficeIcon,
    BellIcon,
    ShieldCheckIcon,
    PuzzlePieceIcon,
    ChartBarIcon,
    CreditCardIcon,
    CommandLineIcon,
    GlobeAltIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Bars3Icon,
} from '@heroicons/react/24/outline';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface SettingsSidebarProps {
    activeSection: SettingSection;
    onSectionChange: (section: SettingSection) => void;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
}

export function SettingsSidebar({ activeSection, onSectionChange, isExpanded, setIsExpanded }: SettingsSidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sections: { id: SettingSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
        { id: 'system', label: 'System', icon: Cog6ToothIcon },
        { id: 'users', label: 'Users & Access', icon: UserGroupIcon },
        { id: 'organization', label: 'Organization', icon: BuildingOfficeIcon },
        { id: 'notifications', label: 'Notifications', icon: BellIcon },
        { id: 'security', label: 'Security', icon: ShieldCheckIcon },
        { id: 'integrations', label: 'Integrations', icon: PuzzlePieceIcon },
        { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
        { id: 'billing', label: 'Billing', icon: CreditCardIcon },
        { id: 'behavior', label: 'Behavior', icon: CommandLineIcon },
        { id: 'localization', label: 'Localization', icon: GlobeAltIcon },
    ];

    const activeSectionData = sections.find(section => section.id === activeSection);
    const ActiveIcon = activeSectionData?.icon || Cog6ToothIcon;

    return (
        <div className={`h-full flex flex-col relative transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-slate-800 rounded-full p-2 shadow-md border border-slate-200 dark:border-slate-700"
            >
                <Bars3Icon className="h-5 w-5 text-slate-500" />
            </button>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar Content */}
            <div className={`transition-all duration-300 flex flex-col h-full z-40 border-r border-slate-200 dark:border-slate-800`}>
                {/* Scrollable Navigation */}
                <nav className="flex-1 overflow-y-auto py-1">
                    <div className="space-y-0.5 w-full">
                        {sections.map((section, idx) => {
                            const Icon = section.icon;
                            const button = (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        onSectionChange(section.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center px-2 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200
                                        ${activeSection === section.id
                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white mx-2 rounded'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md'
                                        }
                                        ${isExpanded ? 'w-full' : 'mx-auto'}
                                        ${idx === 0 ? 'mt-4' : ''}
                                    `}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {isExpanded && <span className="ml-2">{section.label}</span>}
                                </button>
                            );
                            return isExpanded ? button : (
                                <Tooltip key={section.id}>
                                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                                    <TooltipContent side="right">{section.label}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </nav>
                {/* Collapsible Toggle Button at the Bottom */}
                <div className="mt-auto flex items-center justify-start h-12 relative border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md border border-slate-200 dark:border-slate-700 hidden md:block"
                    >
                        {isExpanded ? (
                            <ChevronLeftIcon className="h-4 w-4 text-slate-500" />
                        ) : (
                            <ChevronRightIcon className="h-4 w-4 text-slate-500" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
} 
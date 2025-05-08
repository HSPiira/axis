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
} from '@heroicons/react/24/outline';

interface SettingsSidebarProps {
    activeSection: SettingSection;
    onSectionChange: (section: SettingSection) => void;
}

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
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

    return (
        <div className="p-2">
            <nav className="space-y-0.5">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.id}
                            onClick={() => onSectionChange(section.id)}
                            className={`w-full flex items-center px-2 py-1.5 text-xs font-semibold rounded-md ${activeSection === section.id
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <Icon className="h-3.5 w-3.5 mr-2" />
                            <span>{section.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
} 
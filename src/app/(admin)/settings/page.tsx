'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  ChartPieIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { SecuritySettings, UserSettings, NotificationSettings, SystemSettings, BillingSettings, IntegrationSettings, OrganizationSettings, AnalyticsSettings, BehaviorSettings, LocalizationSettings, KPIsSection, ServicesSection } from './components/sections';

export type SettingSection =
  | 'system'
  | 'users'
  | 'organization'
  | 'notifications'
  | 'security'
  | 'integrations'
  | 'analytics'
  | 'billing'
  | 'behavior'
  | 'localization'
  | 'kpis'
  | 'services';

type SettingsGroup = {
  label: string;
  sections: { id: SettingSection; label: string; icon: React.ComponentType<{ className?: string }> }[];
};

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    label: 'General',
    sections: [
      { id: 'system', label: 'System', icon: Cog6ToothIcon },
      { id: 'organization', label: 'Organization', icon: BuildingOfficeIcon },
      { id: 'users', label: 'Users & Access', icon: UserGroupIcon },
    ],
  },
  {
    label: 'Preferences',
    sections: [
      { id: 'notifications', label: 'Notifications', icon: BellIcon },
      { id: 'behavior', label: 'Behavior', icon: CommandLineIcon },
      { id: 'localization', label: 'Localization', icon: GlobeAltIcon },
    ],
  },
  {
    label: 'Security & Integration',
    sections: [
      { id: 'security', label: 'Security', icon: ShieldCheckIcon },
      { id: 'integrations', label: 'Integrations', icon: PuzzlePieceIcon },
    ],
  },
  {
    label: 'Billing & Analytics',
    sections: [
      { id: 'billing', label: 'Billing', icon: CreditCardIcon },
      { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
      { id: 'kpis', label: 'KPIs', icon: ChartPieIcon },
      { id: 'services', label: 'Services', icon: WrenchScrewdriverIcon },
    ],
  },
];

const SETTINGS_COMPONENTS = {
  system: SystemSettings,
  users: UserSettings,
  organization: OrganizationSettings,
  notifications: NotificationSettings,
  security: SecuritySettings,
  integrations: IntegrationSettings,
  analytics: AnalyticsSettings,
  billing: BillingSettings,
  behavior: BehaviorSettings,
  localization: LocalizationSettings,
  kpis: KPIsSection,
  services: ServicesSection,
} as const;

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = (searchParams.get('section') as SettingSection) || 'system';
  const ActiveSettingsComponent = SETTINGS_COMPONENTS[activeSection];

  const handleSectionChange = (section: SettingSection) => {
    router.push(`/settings?section=${section}`);
  };

  return (
    <div className="container mx-auto pt-1 px-2">
      <div className="flex flex-col md:flex-row">
        {/* Settings Navigation */}
        <div className="w-full md:w-56 lg:w-48 flex-shrink-0 mb-4 md:mb-0">
          <div>
            <div className="py-1.5">
              <h2 className="text-sm font-medium">Settings</h2>
            </div>
            <nav className="py-1">
              {SETTINGS_GROUPS.map((group, groupIndex) => (
                <div key={group.label} className={cn(
                  "space-y-0.5",
                  groupIndex !== 0 && "mt-2"
                )}>
                  <h3 className="px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </h3>
                  <ul className="space-y-0.5">
                    {group.sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <li key={section.id}>
                          <button
                            onClick={() => handleSectionChange(section.id)}
                            className={cn(
                              "w-full flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-sm transition-colors",
                              activeSection === section.id
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{section.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          <div className="p-3">
            <ActiveSettingsComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
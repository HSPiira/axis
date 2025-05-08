'use client';

import { useState } from 'react';
import { SettingsSidebar } from './components/settings-sidebar';
import { SecuritySettings, UserSettings, NotificationSettings, SystemSettings, BillingSettings, IntegrationSettings, OrganizationSettings, AnalyticsSettings, BehaviorSettings, LocalizationSettings } from './components/sections';

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
  | 'localization';

const SETTINGS_COMPONENTS = {
  system: SystemSettings,
  users: UserSettings, // Temporary, needs to be replaced with actual component
  organization: OrganizationSettings,
  notifications: NotificationSettings,
  security: SecuritySettings,
  integrations: IntegrationSettings,
  analytics: AnalyticsSettings,
  billing: BillingSettings,
  behavior: BehaviorSettings,
  localization: LocalizationSettings,
} as const;

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>('system');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const ActiveSettingsComponent = SETTINGS_COMPONENTS[activeSection];

  return (
    <div className="container mx-auto">
      <div className="flex">
        {/* Sidebar: fixed on desktop, offset for system sidebar and header */}
        <div className={`hidden md:block md:fixed md:top-16 md:left-16 md:h-[calc(100vh-4rem)] z-30 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 ${sidebarExpanded ? 'md:w-64' : 'md:w-16'}`}>
          <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />
        </div>
        {/* Main content: offset for both sidebars and header, margin matches sidebar width */}
        <div className={`flex-1 w-full min-h-screen md:mt-4 transition-all duration-300 ${sidebarExpanded ? 'md:ml-[16rem]' : 'md:ml-16'}`}>
          <ActiveSettingsComponent />
        </div>
      </div>
    </div>
  );
}
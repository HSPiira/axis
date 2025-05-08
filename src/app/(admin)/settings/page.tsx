'use client';

import { useState } from 'react';
import { SettingsSidebar, ProfileSettings, AccountSettings, NotificationSettings, SecuritySettings, BillingSettings, IntegrationSettings } from './components';

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
  system: ProfileSettings, // Temporary, needs to be replaced with actual component
  users: ProfileSettings, // Temporary, needs to be replaced with actual component
  organization: ProfileSettings, // Temporary, needs to be replaced with actual component
  notifications: NotificationSettings,
  security: SecuritySettings,
  integrations: IntegrationSettings,
  analytics: ProfileSettings, // Temporary, needs to be replaced with actual component
  billing: BillingSettings,
  behavior: ProfileSettings, // Temporary, needs to be replaced with actual component
  localization: ProfileSettings, // Temporary, needs to be replaced with actual component
} as const;

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>('system');

  const ActiveSettingsComponent = SETTINGS_COMPONENTS[activeSection];

  return (
    <div className="container mx-auto py-4">
      <div className="grid grid-cols-5 gap-4">
        <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="col-span-4 rounded-lg p-6">
          <ActiveSettingsComponent />
        </div>
      </div>
    </div>
  );
}
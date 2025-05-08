'use client';

import { useState } from 'react';

type SettingSection = 'profile' | 'account' | 'notifications' | 'security' | 'billing' | 'integrations';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>('profile');

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Change Photo
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                </div>
              </div>
            </div>
          </div>
        );
      case 'account':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option>UTC</option>
                  <option>EST</option>
                  <option>PST</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive email updates about your account</p>
                </div>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
                </div>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                <div className="mt-2 space-y-4">
                  <input type="password" placeholder="Current Password" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  <input type="password" placeholder="New Password" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  <input type="password" placeholder="Confirm New Password" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <button className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Current Plan</h3>
                <p className="mt-1 text-sm text-gray-500">Free Plan</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Payment Method</h3>
                <div className="mt-2 p-4 border rounded-md">
                  <p className="text-sm text-gray-500">No payment method added</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'integrations':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Integrations</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Google Calendar</h3>
                  <p className="text-sm text-gray-500">Connect your Google Calendar</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Connect
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Slack</h3>
                  <p className="text-sm text-gray-500">Connect your Slack workspace</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Connect
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="grid grid-cols-5 gap-4">
        {/* Settings Sidebar */}
        <div className="bg-white rounded-lg p-4">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'profile' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveSection('account')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'account' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span>Account</span>
            </button>
            <button
              onClick={() => setActiveSection('notifications')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'notifications' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'security' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveSection('billing')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'billing' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span>Billing</span>
            </button>
            <button
              onClick={() => setActiveSection('integrations')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'integrations' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span>Integrations</span>
            </button>
          </nav>
        </div>

        {/* Right Column */}
        <div className="col-span-4 bg-white rounded-lg p-6">
          {renderSettingsContent()}
        </div>
      </div>
    </div>
  );
}
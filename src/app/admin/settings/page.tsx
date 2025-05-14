import { redirect } from 'next/navigation';
import { settingsSections } from '@/components/sidebar/settingsSections';

export default function SettingsIndex() {
    const firstSection = settingsSections.find(section => section.items && section.items.length > 0);
    const firstHref = firstSection?.items[0]?.href || '/admin/settings/profile';
    redirect(firstHref);
    return null;
} 
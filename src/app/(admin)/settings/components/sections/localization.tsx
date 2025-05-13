'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSettingsTab } from '@/hooks/use-settings-tab';

interface Language {
    code: string;
    name: string;
    nativeName: string;
    isActive: boolean;
    isDefault: boolean;
    completion: number;
}

interface Translation {
    key: string;
    value: string;
    language: string;
    context: string;
    lastModified: string;
}

interface RegionalFormat {
    locale: string;
    dateFormat: string;
    timeFormat: string;
    numberFormat: string;
    currencyFormat: string;
    firstDayOfWeek: number;
    isDefault: boolean;
}

export function LocalizationSettings() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activeTab, handleTabChange } = useSettingsTab({
        section: 'localization',
        defaultTab: 'languages'
    });
    const [languages, setLanguages] = useState<Language[]>([
        {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            isActive: true,
            isDefault: true,
            completion: 100,
        },
        {
            code: 'es',
            name: 'Spanish',
            nativeName: 'Español',
            isActive: true,
            isDefault: false,
            completion: 85,
        },
        {
            code: 'fr',
            name: 'French',
            nativeName: 'Français',
            isActive: true,
            isDefault: false,
            completion: 75,
        },
    ]);

    const [translations, setTranslations] = useState<Translation[]>([
        {
            key: 'welcome.message',
            value: 'Welcome to our application',
            language: 'en',
            context: 'Homepage',
            lastModified: '2024-03-20',
        },
        {
            key: 'welcome.message',
            value: 'Bienvenido a nuestra aplicación',
            language: 'es',
            context: 'Homepage',
            lastModified: '2024-03-20',
        },
    ]);

    const [regionalFormats, setRegionalFormats] = useState<RegionalFormat[]>([
        {
            locale: 'en-US',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            numberFormat: '1,234.56',
            currencyFormat: '$1,234.56',
            firstDayOfWeek: 0,
            isDefault: true,
        },
        {
            locale: 'es-ES',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            numberFormat: '1.234,56',
            currencyFormat: '1.234,56 €',
            firstDayOfWeek: 1,
            isDefault: false,
        },
    ]);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-xl font-semibold">Localization & Internationalization</h2>
                <p className="text-sm text-muted-foreground">Manage languages, translations, and regional formats</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="languages">Languages</TabsTrigger>
                    <TabsTrigger value="translations">Translations</TabsTrigger>
                    <TabsTrigger value="formats">Regional Formats</TabsTrigger>
                </TabsList>

                <TabsContent value="languages">
                    <div className="flex justify-end mb-4">
                        <Button>Add Language</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {languages.map((language) => (
                            <div key={language.code} className="border border-border rounded-lg p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-base">{language.name}</h3>
                                        <p className="text-xs text-muted-foreground">{language.nativeName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch checked={language.isActive} />
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <Label>Translation Progress</Label>
                                    <span className="text-xs text-muted-foreground">{language.completion}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: `${language.completion}%` }} />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Switch checked={language.isDefault} />
                                    <Label>Set as Default Language</Label>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="translations">
                    <div className="flex flex-col md:flex-row md:items-end md:gap-4 mb-4 gap-2">
                        <div className="space-y-1 w-full md:w-1/3">
                            <Label>Filter by Language</Label>
                            <Select defaultValue="all">
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Languages</SelectItem>
                                    {languages.map((lang) => (
                                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 w-full md:w-1/3">
                            <Label>Filter by Context</Label>
                            <Input placeholder="e.g. Homepage" className="w-full" />
                        </div>
                        <div className="w-full md:w-auto flex justify-end md:justify-start">
                            <Button>Add Translation</Button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {translations.map((translation, index) => (
                            <div key={index} className="border border-border rounded-lg p-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
                                <div className="flex-1 flex flex-col md:flex-row md:items-center md:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-base truncate">{translation.key}</span>
                                            <span className="px-2 py-0.5 rounded bg-muted text-xs font-medium text-muted-foreground">{translation.language.toUpperCase()}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2 truncate">{translation.context}</div>
                                        <Textarea value={translation.value} readOnly className="h-16 resize-none" />
                                    </div>
                                    <div className="flex flex-col items-end md:items-start gap-2 min-w-[120px] md:min-w-[160px] mt-2 md:mt-0">
                                        <div className="text-xs text-muted-foreground">Last modified: {translation.lastModified}</div>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="formats">
                    <div className="flex justify-end mb-4">
                        <Button>Add Format</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {regionalFormats.map((format) => (
                            <div key={format.locale} className="border border-border rounded-lg p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-base">{format.locale}</h3>
                                        <p className="text-xs text-muted-foreground">Regional Format</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch checked={format.isDefault} />
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label>Date Format</Label>
                                        <Input value={format.dateFormat} readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Time Format</Label>
                                        <Input value={format.timeFormat} readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Number Format</Label>
                                        <Input value={format.numberFormat} readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Currency Format</Label>
                                        <Input value={format.currencyFormat} readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>First Day of Week</Label>
                                        <Select value={format.firstDayOfWeek.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select day" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Sunday</SelectItem>
                                                <SelectItem value="1">Monday</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
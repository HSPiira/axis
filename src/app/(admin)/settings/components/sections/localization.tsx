'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="space-y-4 max-w-6xl mx-auto">
            <div>
                <h2 className="text-lg font-semibold">Localization & Internationalization</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage languages, translations, and regional formats</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="languages">Languages</TabsTrigger>
                    <TabsTrigger value="translations">Translations</TabsTrigger>
                    <TabsTrigger value="formats">Regional Formats</TabsTrigger>
                </TabsList>

                <TabsContent value="languages">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supported Languages</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Language</Button>
                            </div>

                            <div className="space-y-4">
                                {languages.map((language) => (
                                    <Card key={language.code}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{language.name}</h3>
                                                        <p className="text-sm text-gray-500">{language.nativeName}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={language.isActive} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Translation Progress</Label>
                                                        <span className="text-sm text-gray-500">{language.completion}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${language.completion}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch checked={language.isDefault} />
                                                    <Label>Set as Default Language</Label>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="translations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Translation Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <Label>Filter by Language</Label>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Languages</SelectItem>
                                            {languages.map((lang) => (
                                                <SelectItem key={lang.code} value={lang.code}>
                                                    {lang.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button>Add Translation</Button>
                            </div>

                            <div className="space-y-4">
                                {translations.map((translation, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{translation.key}</h3>
                                                        <p className="text-sm text-gray-500">{translation.context}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-500">
                                                            {translation.language.toUpperCase()}
                                                        </span>
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Translation</Label>
                                                    <Textarea
                                                        value={translation.value}
                                                        readOnly
                                                        className="h-20"
                                                    />
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    Last modified: {translation.lastModified}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="formats">
                    <Card>
                        <CardHeader>
                            <CardTitle>Regional Formats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Format</Button>
                            </div>

                            <div className="space-y-4">
                                {regionalFormats.map((format) => (
                                    <Card key={format.locale}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{format.locale}</h3>
                                                        <p className="text-sm text-gray-500">Regional Format</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={format.isDefault} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Date Format</Label>
                                                        <Input value={format.dateFormat} readOnly />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Time Format</Label>
                                                        <Input value={format.timeFormat} readOnly />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Number Format</Label>
                                                        <Input value={format.numberFormat} readOnly />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Currency Format</Label>
                                                        <Input value={format.currencyFormat} readOnly />
                                                    </div>
                                                    <div className="space-y-2">
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
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
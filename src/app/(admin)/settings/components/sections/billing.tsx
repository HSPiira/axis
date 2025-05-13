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

interface BillingRate {
    id: string;
    name: string;
    description: string;
    rate: number;
    currency: string;
    billingUnit: 'hour' | 'day' | 'month' | 'year';
    isActive: boolean;
}

interface TaxRate {
    id: string;
    name: string;
    rate: number;
    country: string;
    isDefault: boolean;
}

interface InvoiceTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    isDefault: boolean;
}

export function BillingSettings() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activeTab, handleTabChange } = useSettingsTab({
        section: 'billing',
        defaultTab: 'rates'
    });

    const [billingRates, setBillingRates] = useState<BillingRate[]>([
        {
            id: '1',
            name: 'Standard Rate',
            description: 'Default billing rate for standard services',
            rate: 100,
            currency: 'USD',
            billingUnit: 'hour',
            isActive: true,
        },
        {
            id: '2',
            name: 'Premium Rate',
            description: 'Premium service billing rate',
            rate: 150,
            currency: 'USD',
            billingUnit: 'hour',
            isActive: true,
        },
    ]);

    const [taxRates, setTaxRates] = useState<TaxRate[]>([
        {
            id: '1',
            name: 'Standard VAT',
            rate: 20,
            country: 'United Kingdom',
            isDefault: true,
        },
        {
            id: '2',
            name: 'US Sales Tax',
            rate: 8.5,
            country: 'United States',
            isDefault: false,
        },
    ]);

    const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>([
        {
            id: '1',
            name: 'Standard Invoice',
            description: 'Default invoice template',
            content: 'Standard invoice content...',
            isDefault: true,
        },
        {
            id: '2',
            name: 'Detailed Invoice',
            description: 'Detailed invoice with item breakdown',
            content: 'Detailed invoice content...',
            isDefault: false,
        },
    ]);

    const [paymentTerms, setPaymentTerms] = useState({
        defaultTerm: 'net-30',
        availableTerms: ['net-15', 'net-30', 'net-45', 'net-60'],
        latePaymentFee: 2.5,
        gracePeriod: 5,
    });

    const [currencySettings, setCurrencySettings] = useState({
        defaultCurrency: 'USD',
        availableCurrencies: ['USD', 'EUR', 'GBP', 'JPY'],
        exchangeRateProvider: 'open-exchange-rates',
        autoUpdateRates: true,
    });

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <div>
                <h2 className="text-lg font-semibold">Billing & Finance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage billing rates, tax settings, and payment configurations</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="rates">Billing Rates</TabsTrigger>
                    <TabsTrigger value="tax">Tax Settings</TabsTrigger>
                    <TabsTrigger value="currency">Currency</TabsTrigger>
                    <TabsTrigger value="invoice">Invoice Templates</TabsTrigger>
                    <TabsTrigger value="payment">Payment Terms</TabsTrigger>
                </TabsList>

                <TabsContent value="rates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Rates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Rate</Button>
                            </div>

                            <div className="space-y-4">
                                {billingRates.map((rate) => (
                                    <Card key={rate.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{rate.name}</h3>
                                                        <p className="text-sm text-gray-500">{rate.description}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={rate.isActive} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Rate</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Input
                                                                type="number"
                                                                value={rate.rate}
                                                                readOnly
                                                                className="w-24"
                                                            />
                                                            <span className="text-sm text-gray-500">{rate.currency}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Billing Unit</Label>
                                                        <span className="px-2 py-1 rounded text-sm capitalize">
                                                            {rate.billingUnit}
                                                        </span>
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

                <TabsContent value="tax">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tax Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Tax Rate</Button>
                            </div>

                            <div className="space-y-4">
                                {taxRates.map((tax) => (
                                    <Card key={tax.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{tax.name}</h3>
                                                        <p className="text-sm text-gray-500">{tax.country}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={tax.isDefault} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Rate</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            type="number"
                                                            value={tax.rate}
                                                            readOnly
                                                            className="w-24"
                                                        />
                                                        <span className="text-sm text-gray-500">%</span>
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

                <TabsContent value="currency">
                    <Card>
                        <CardHeader>
                            <CardTitle>Currency Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Default Currency</Label>
                                    <Select
                                        value={currencySettings.defaultCurrency}
                                        onValueChange={(value) => setCurrencySettings({ ...currencySettings, defaultCurrency: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select default currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencySettings.availableCurrencies.map((currency) => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Exchange Rate Provider</Label>
                                    <Select
                                        value={currencySettings.exchangeRateProvider}
                                        onValueChange={(value) => setCurrencySettings({ ...currencySettings, exchangeRateProvider: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open-exchange-rates">Open Exchange Rates</SelectItem>
                                            <SelectItem value="fixer">Fixer.io</SelectItem>
                                            <SelectItem value="currencylayer">CurrencyLayer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={currencySettings.autoUpdateRates}
                                        onCheckedChange={(checked) => setCurrencySettings({ ...currencySettings, autoUpdateRates: checked })}
                                    />
                                    <Label>Auto-update Exchange Rates</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoice">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Templates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Template</Button>
                            </div>

                            <div className="space-y-4">
                                {invoiceTemplates.map((template) => (
                                    <Card key={template.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{template.name}</h3>
                                                        <p className="text-sm text-gray-500">{template.description}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={template.isDefault} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Template Content</Label>
                                                    <Textarea
                                                        value={template.content}
                                                        readOnly
                                                        className="h-32"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Default Payment Term</Label>
                                    <Select
                                        value={paymentTerms.defaultTerm}
                                        onValueChange={(value) => setPaymentTerms({ ...paymentTerms, defaultTerm: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select default term" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentTerms.availableTerms.map((term) => (
                                                <SelectItem key={term} value={term}>
                                                    {term.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Late Payment Fee (%)</Label>
                                        <Input
                                            type="number"
                                            value={paymentTerms.latePaymentFee}
                                            onChange={(e) => setPaymentTerms({ ...paymentTerms, latePaymentFee: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Grace Period (days)</Label>
                                        <Input
                                            type="number"
                                            value={paymentTerms.gracePeriod}
                                            onChange={(e) => setPaymentTerms({ ...paymentTerms, gracePeriod: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default BillingSettings;
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

interface Webhook {
    id: string;
    name: string;
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
}

interface IDPConfig {
    id: string;
    provider: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    isActive: boolean;
}

export function IntegrationSettings() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activeTab, handleTabChange } = useSettingsTab({
        section: 'integrations',
        defaultTab: 'api'
    });

    const [webhooks, setWebhooks] = useState<Webhook[]>([
        {
            id: '1',
            name: 'User Created',
            url: 'https://api.example.com/webhooks/user-created',
            events: ['user.created'],
            secret: 'whsec_123456',
            isActive: true,
        },
        {
            id: '2',
            name: 'Payment Processed',
            url: 'https://api.example.com/webhooks/payment',
            events: ['payment.succeeded', 'payment.failed'],
            secret: 'whsec_789012',
            isActive: true,
        },
    ]);

    const [idpConfigs, setIdpConfigs] = useState<IDPConfig[]>([
        {
            id: '1',
            provider: 'google',
            clientId: 'google-client-id',
            clientSecret: 'google-client-secret',
            redirectUri: 'https://app.example.com/auth/google/callback',
            isActive: true,
        },
        {
            id: '2',
            provider: 'azure',
            clientId: 'azure-client-id',
            clientSecret: 'azure-client-secret',
            redirectUri: 'https://app.example.com/auth/azure/callback',
            isActive: true,
        },
    ]);

    const [paymentConfig, setPaymentConfig] = useState({
        provider: 'stripe',
        publicKey: '',
        secretKey: '',
        webhookSecret: '',
        testMode: true,
    });

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <div>
                <h2 className="text-lg font-semibold">Integration Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage third-party integrations and API configurations</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="api">API Keys</TabsTrigger>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                    <TabsTrigger value="idp">Identity Providers</TabsTrigger>
                    <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
                    <TabsTrigger value="services">External Services</TabsTrigger>
                </TabsList>

                <TabsContent value="api">
                    <Card>
                        <CardHeader>
                            <CardTitle>Third-party API Keys</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Google Maps API Key</Label>
                                    <Input type="password" placeholder="Enter Google Maps API key" />
                                </div>
                                <div className="space-y-2">
                                    <Label>SendGrid API Key</Label>
                                    <Input type="password" placeholder="Enter SendGrid API key" />
                                </div>
                                <div className="space-y-2">
                                    <Label>AWS Access Keys</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input type="password" placeholder="Access Key ID" />
                                        <Input type="password" placeholder="Secret Access Key" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="webhooks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Webhook Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Webhook</Button>
                            </div>

                            <div className="space-y-4">
                                {webhooks.map((webhook) => (
                                    <Card key={webhook.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{webhook.name}</h3>
                                                        <p className="text-sm text-gray-500">{webhook.url}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={webhook.isActive} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Events</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {webhook.events.map((event) => (
                                                            <span
                                                                key={event}
                                                                className="px-2 py-1 bg-gray-100 rounded text-sm"
                                                            >
                                                                {event}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Webhook Secret</Label>
                                                    <Input type="password" value={webhook.secret} readOnly />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="idp">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identity Provider Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Provider</Button>
                            </div>

                            <div className="space-y-4">
                                {idpConfigs.map((config) => (
                                    <Card key={config.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold capitalize">{config.provider}</h3>
                                                        <p className="text-sm text-gray-500">{config.redirectUri}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={config.isActive} />
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Client ID</Label>
                                                        <Input type="password" value={config.clientId} readOnly />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Client Secret</Label>
                                                        <Input type="password" value={config.clientSecret} readOnly />
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

                <TabsContent value="payment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Gateway Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Payment Provider</Label>
                                    <Select
                                        value={paymentConfig.provider}
                                        onValueChange={(value) => setPaymentConfig({ ...paymentConfig, provider: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="stripe">Stripe</SelectItem>
                                            <SelectItem value="paypal">PayPal</SelectItem>
                                            <SelectItem value="square">Square</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Public Key</Label>
                                        <Input
                                            type="password"
                                            value={paymentConfig.publicKey}
                                            onChange={(e) => setPaymentConfig({ ...paymentConfig, publicKey: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secret Key</Label>
                                        <Input
                                            type="password"
                                            value={paymentConfig.secretKey}
                                            onChange={(e) => setPaymentConfig({ ...paymentConfig, secretKey: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Webhook Secret</Label>
                                    <Input
                                        type="password"
                                        value={paymentConfig.webhookSecret}
                                        onChange={(e) => setPaymentConfig({ ...paymentConfig, webhookSecret: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={paymentConfig.testMode}
                                        onCheckedChange={(checked) => setPaymentConfig({ ...paymentConfig, testMode: checked })}
                                    />
                                    <Label>Test Mode</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services">
                    <Card>
                        <CardHeader>
                            <CardTitle>External Service Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>CDN Endpoint</Label>
                                    <Input placeholder="https://cdn.example.com" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Storage Service</Label>
                                    <Input placeholder="https://storage.example.com" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Analytics Service</Label>
                                    <Input placeholder="https://analytics.example.com" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Monitoring Service</Label>
                                    <Input placeholder="https://monitoring.example.com" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Backup Service</Label>
                                    <Input placeholder="https://backup.example.com" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default IntegrationSettings;
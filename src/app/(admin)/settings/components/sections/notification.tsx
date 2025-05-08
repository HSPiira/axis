import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface NotificationTemplate {
    id: string;
    name: string;
    type: 'email' | 'sms' | 'push';
    subject?: string;
    content: string;
}

interface NotificationPreference {
    id: string;
    role: string;
    email: boolean;
    sms: boolean;
    push: boolean;
}

export function NotificationSettings() {
    const [smtpConfig, setSmtpConfig] = useState({
        host: '',
        port: '',
        username: '',
        password: '',
        encryption: 'tls',
    });

    const [smsConfig, setSmsConfig] = useState({
        provider: '',
        apiKey: '',
        senderId: '',
    });

    const [templates, setTemplates] = useState<NotificationTemplate[]>([
        {
            id: '1',
            name: 'Welcome Email',
            type: 'email',
            subject: 'Welcome to Our Platform',
            content: 'Dear {{name}},\n\nWelcome to our platform! We\'re excited to have you on board.',
        },
        {
            id: '2',
            name: 'Password Reset',
            type: 'sms',
            content: 'Your password reset code is: {{code}}. Valid for 10 minutes.',
        },
    ]);

    const [preferences, setPreferences] = useState<NotificationPreference[]>([
        { id: '1', role: 'admin', email: true, sms: true, push: true },
        { id: '2', role: 'user', email: true, sms: false, push: true },
    ]);

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notification Settings</h1>

            <Tabs defaultValue="email" className="space-y-4">
                <TabsList className="bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="email">Email Server</TabsTrigger>
                    <TabsTrigger value="sms">SMS Gateway</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">SMTP Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300">SMTP Host</Label>
                                    <Input
                                        placeholder="smtp.example.com"
                                        value={smtpConfig.host}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300">SMTP Port</Label>
                                    <Input
                                        placeholder="587"
                                        value={smtpConfig.port}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300">Username</Label>
                                    <Input
                                        placeholder="your-email@example.com"
                                        value={smtpConfig.username}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300">Password</Label>
                                    <Input
                                        type="password"
                                        value={smtpConfig.password}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700 dark:text-gray-300">Encryption</Label>
                                <Select
                                    value={smtpConfig.encryption}
                                    onValueChange={(value) => setSmtpConfig({ ...smtpConfig, encryption: value })}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                        <SelectValue placeholder="Select encryption" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                        <SelectItem value="tls">TLS</SelectItem>
                                        <SelectItem value="ssl">SSL</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end">
                                <Button>Test Connection</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sms">
                    <Card>
                        <CardHeader>
                            <CardTitle>SMS Gateway Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Provider</Label>
                                <Select
                                    value={smsConfig.provider}
                                    onValueChange={(value) => setSmsConfig({ ...smsConfig, provider: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="twilio">Twilio</SelectItem>
                                        <SelectItem value="messagebird">MessageBird</SelectItem>
                                        <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>API Key</Label>
                                <Input
                                    type="password"
                                    value={smsConfig.apiKey}
                                    onChange={(e) => setSmsConfig({ ...smsConfig, apiKey: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Sender ID</Label>
                                <Input
                                    placeholder="Your Company"
                                    value={smsConfig.senderId}
                                    onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button>Test SMS</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Templates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Template</Button>
                            </div>

                            <div className="space-y-4">
                                {templates.map((template) => (
                                    <Card key={template.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{template.name}</h3>
                                                        <p className="text-sm text-gray-500">Type: {template.type}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                </div>

                                                {template.type === 'email' && (
                                                    <div className="space-y-2">
                                                        <Label>Subject</Label>
                                                        <Input value={template.subject} readOnly />
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label>Content</Label>
                                                    <Textarea value={template.content} readOnly className="h-32" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {preferences.map((pref) => (
                                    <Card key={pref.id}>
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-semibold capitalize">{pref.role}</h3>
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={pref.email} />
                                                        <Label>Email Notifications</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={pref.sms} />
                                                        <Label>SMS Notifications</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch checked={pref.push} />
                                                        <Label>Push Notifications</Label>
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

export default NotificationSettings;
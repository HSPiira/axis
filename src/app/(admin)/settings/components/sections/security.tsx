import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface DataRetentionPolicy {
    id: string;
    dataType: string;
    retentionPeriod: number;
    unit: 'days' | 'months' | 'years';
    action: 'archive' | 'delete';
}

interface IPRule {
    id: string;
    ip: string;
    type: 'allow' | 'block';
    description: string;
}

export function SecuritySettings() {
    const [retentionPolicies, setRetentionPolicies] = useState<DataRetentionPolicy[]>([
        { id: '1', dataType: 'User Data', retentionPeriod: 365, unit: 'days', action: 'archive' },
        { id: '2', dataType: 'Audit Logs', retentionPeriod: 90, unit: 'days', action: 'delete' },
    ]);

    const [ipRules, setIpRules] = useState<IPRule[]>([
        { id: '1', ip: '192.168.1.0/24', type: 'allow', description: 'Internal Network' },
        { id: '2', ip: '10.0.0.0/8', type: 'block', description: 'Blocked Range' },
    ]);

    const [auditSettings, setAuditSettings] = useState({
        enabled: true,
        retentionPeriod: 90,
        logLevel: 'info',
        includeUserActions: true,
        includeSystemActions: true,
    });

    const [encryptionSettings, setEncryptionSettings] = useState({
        algorithm: 'aes-256-gcm',
        keyRotationPeriod: 90,
        enableAtRest: true,
        enableInTransit: true,
    });

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Security & Compliance</h1>

            <Tabs defaultValue="retention" className="space-y-4">
                <TabsList className="bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="retention">Data Retention</TabsTrigger>
                    <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                    <TabsTrigger value="encryption">Encryption</TabsTrigger>
                    <TabsTrigger value="api">API Security</TabsTrigger>
                    <TabsTrigger value="ip">IP Management</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="retention">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">Data Retention Policies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add Policy</Button>
                            </div>

                            <div className="space-y-4">
                                {retentionPolicies.map((policy) => (
                                    <Card key={policy.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                        <CardContent className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{policy.dataType}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Retain for {policy.retentionPeriod} {policy.unit}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Switch checked={policy.action === 'archive'} />
                                                    <Label className="text-gray-700 dark:text-gray-300">Archive before deletion</Label>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">Audit Trail Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-gray-700 dark:text-gray-300">Enable Audit Logging</Label>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Track all system and user actions</p>
                                    </div>
                                    <Switch
                                        checked={auditSettings.enabled}
                                        onCheckedChange={(checked) => setAuditSettings({ ...auditSettings, enabled: checked })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Log Retention Period (days)</Label>
                                        <Input
                                            type="number"
                                            value={auditSettings.retentionPeriod}
                                            onChange={(e) => setAuditSettings({ ...auditSettings, retentionPeriod: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Log Level</Label>
                                        <Select
                                            value={auditSettings.logLevel}
                                            onValueChange={(value) => setAuditSettings({ ...auditSettings, logLevel: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select log level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="debug">Debug</SelectItem>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="warn">Warning</SelectItem>
                                                <SelectItem value="error">Error</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Track Actions</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={auditSettings.includeUserActions}
                                                onCheckedChange={(checked) => setAuditSettings({ ...auditSettings, includeUserActions: checked })}
                                            />
                                            <Label>User Actions</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={auditSettings.includeSystemActions}
                                                onCheckedChange={(checked) => setAuditSettings({ ...auditSettings, includeSystemActions: checked })}
                                            />
                                            <Label>System Actions</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="encryption">
                    <Card>
                        <CardHeader>
                            <CardTitle>Encryption Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Encryption Algorithm</Label>
                                    <Select
                                        value={encryptionSettings.algorithm}
                                        onValueChange={(value) => setEncryptionSettings({ ...encryptionSettings, algorithm: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select algorithm" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="aes-256-gcm">AES-256-GCM</SelectItem>
                                            <SelectItem value="aes-256-cbc">AES-256-CBC</SelectItem>
                                            <SelectItem value="chacha20-poly1305">ChaCha20-Poly1305</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Key Rotation Period (days)</Label>
                                    <Input
                                        type="number"
                                        value={encryptionSettings.keyRotationPeriod}
                                        onChange={(e) => setEncryptionSettings({ ...encryptionSettings, keyRotationPeriod: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Encryption Scope</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={encryptionSettings.enableAtRest}
                                                onCheckedChange={(checked) => setEncryptionSettings({ ...encryptionSettings, enableAtRest: checked })}
                                            />
                                            <Label>Data at Rest</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={encryptionSettings.enableInTransit}
                                                onCheckedChange={(checked) => setEncryptionSettings({ ...encryptionSettings, enableInTransit: checked })}
                                            />
                                            <Label>Data in Transit</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="api">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Access Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>API Rate Limiting</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm">Requests per minute</Label>
                                            <Input type="number" defaultValue="60" />
                                        </div>
                                        <div>
                                            <Label className="text-sm">Burst limit</Label>
                                            <Input type="number" defaultValue="100" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>API Key Requirements</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch defaultChecked />
                                            <Label>Require API key for all endpoints</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch defaultChecked />
                                            <Label>Enforce key rotation</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ip">
                    <Card>
                        <CardHeader>
                            <CardTitle>IP Access Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button>Add IP Rule</Button>
                            </div>

                            <div className="space-y-4">
                                {ipRules.map((rule) => (
                                    <Card key={rule.id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded text-sm ${rule.type === 'allow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {rule.type.toUpperCase()}
                                                        </span>
                                                        <span className="font-mono">{rule.ip}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{rule.description}</p>
                                                </div>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compliance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>GDPR Compliance</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch defaultChecked />
                                            <Label>Enable data subject rights</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch defaultChecked />
                                            <Label>Data processing agreements</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch defaultChecked />
                                            <Label>Cookie consent management</Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>HIPAA Compliance</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch defaultChecked />
                                            <Label>PHI data protection</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch defaultChecked />
                                            <Label>Access logging</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch defaultChecked />
                                            <Label>Data backup requirements</Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Privacy Policy</Label>
                                    <Textarea
                                        placeholder="Enter your privacy policy"
                                        className="h-32"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Terms of Service</Label>
                                    <Textarea
                                        placeholder="Enter your terms of service"
                                        className="h-32"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default SecuritySettings;
"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface ClientSettingsProps {
    clientId: string
    initialData?: {
        name: string
        email: string
        phone: string
        address: string
        billingEmail: string
        billingAddress: string
        currency: string
        timezone: string
        notifications: boolean
    }
}

export function ClientSettings({ clientId, initialData }: ClientSettingsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)
            const data = {
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                address: formData.get("address"),
                billingEmail: formData.get("billingEmail"),
                billingAddress: formData.get("billingAddress"),
                currency: formData.get("currency"),
                timezone: formData.get("timezone"),
                notifications: formData.get("notifications") === "on",
            }

            const response = await fetch(`/api/clients/${clientId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to update client settings")
            }

            toast.success("Settings updated", {
                description: "Client settings have been updated successfully.",
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            toast.error("Error", {
                description: "Failed to update client settings. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!initialData) {
        return (
            <div className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-4">General Settings</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Client Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={initialData.name}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={initialData.email}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={initialData.phone}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                defaultValue={initialData.address}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Billing Settings</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="billingEmail">Billing Email</Label>
                            <Input
                                id="billingEmail"
                                name="billingEmail"
                                type="email"
                                defaultValue={initialData.billingEmail}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="billingAddress">Billing Address</Label>
                            <Input
                                id="billingAddress"
                                name="billingAddress"
                                defaultValue={initialData.billingAddress}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select name="currency" defaultValue={initialData.currency}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Additional Settings</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select name="timezone" defaultValue={initialData.timezone}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                    <SelectItem value="EST">EST</SelectItem>
                                    <SelectItem value="PST">PST</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="notifications">Email Notifications</Label>
                            <Switch
                                id="notifications"
                                name="notifications"
                                defaultChecked={initialData.notifications}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-sm text-red-500">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    )
} 
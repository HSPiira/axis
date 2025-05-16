'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IndustrySelect } from '@/components/industries/IndustrySelect';
import { toast } from 'sonner';
import { Check, ChevronRight } from 'lucide-react';
import { z } from 'zod';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const formSchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    address: z.string().optional(),
    billingAddress: z.string().optional(),
    taxId: z.string().optional(),
    contactPerson: z.string().optional(),
    contactEmail: z.string().email('Invalid contact email').optional().or(z.literal('')),
    contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid contact phone').optional().or(z.literal('')),
    industryId: z.string().optional(),
    preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'MAIL']).optional(),
    timezone: z.string().optional(),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewClientPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        billingAddress: '',
        taxId: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        preferredContactMethod: undefined,
        timezone: '',
        notes: '',
    });

    const steps = [
        { id: 1, title: 'Basic Information' },
        { id: 2, title: 'Contact Details' },
        { id: 3, title: 'Additional Information' },
    ];

    const validateStep = (step: number): boolean => {
        const stepFields: Record<number, (keyof FormData)[]> = {
            1: ['name', 'industryId', 'taxId', 'website'],
            2: ['email', 'phone', 'address', 'billingAddress'],
            3: ['contactPerson', 'contactEmail', 'contactPhone', 'preferredContactMethod', 'timezone', 'notes'],
        };

        const fieldsToValidate = stepFields[step];
        const stepData = fieldsToValidate.reduce((acc, field) => ({
            ...acc,
            [field]: formData[field],
        }), {} as Partial<FormData>);

        try {
            const stepSchema = formSchema.pick(
                Object.fromEntries(fieldsToValidate.map(field => [field, true])) as {
                    [K in keyof FormData]?: true;
                }
            );
            stepSchema.parse(stepData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Partial<Record<keyof FormData, string>> = {};
                error.errors.forEach((err) => {
                    const field = err.path[0] as keyof FormData;
                    newErrors[field] = err.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email || undefined,
                    phone: formData.phone || undefined,
                    website: formData.website || undefined,
                    address: formData.address || undefined,
                    billingAddress: formData.billingAddress || undefined,
                    taxId: formData.taxId || undefined,
                    contactPerson: formData.contactPerson || undefined,
                    contactEmail: formData.contactEmail || undefined,
                    contactPhone: formData.contactPhone || undefined,
                    industryId: formData.industryId || undefined,
                    preferredContactMethod: formData.preferredContactMethod || undefined,
                    timezone: formData.timezone || undefined,
                    notes: formData.notes || undefined,
                    status: 'PENDING',
                    isVerified: false,
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to create client';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            toast.success('Client created successfully');
            router.push(`/admin/clients/${data.id}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create client');
            console.error('Error creating client:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1);
            }
        } else {
            toast.error('Please fix the errors before proceeding');
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name *</label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter company name"
                                required
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Industry</label>
                            <IndustrySelect
                                value={formData.industryId}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev, industryId: value }));
                                    if (errors.industryId) {
                                        setErrors(prev => ({ ...prev, industryId: undefined }));
                                    }
                                }}
                                placeholder="Select industry"
                                className={errors.industryId ? 'border-red-500' : ''}
                            />
                            {errors.industryId && <p className="text-sm text-red-500">{errors.industryId}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tax ID</label>
                            <Input
                                name="taxId"
                                value={formData.taxId}
                                onChange={handleInputChange}
                                placeholder="Enter tax ID"
                                className={errors.taxId ? 'border-red-500' : ''}
                            />
                            {errors.taxId && <p className="text-sm text-red-500">{errors.taxId}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Website</label>
                            <Input
                                name="website"
                                type="url"
                                value={formData.website}
                                onChange={handleInputChange}
                                placeholder="https://example.com"
                                className={errors.website ? 'border-red-500' : ''}
                            />
                            {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="company@example.com"
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+1 (555) 000-0000"
                                className={errors.phone ? 'border-red-500' : ''}
                            />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter company address"
                                rows={3}
                                className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.address ? 'border-red-500' : ''}`}
                            />
                            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Billing Address</label>
                            <textarea
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleInputChange}
                                placeholder="Enter billing address"
                                rows={3}
                                className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.billingAddress ? 'border-red-500' : ''}`}
                            />
                            {errors.billingAddress && <p className="text-sm text-red-500">{errors.billingAddress}</p>}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact Person</label>
                                <Input
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleInputChange}
                                    placeholder="Enter contact person name"
                                    className={errors.contactPerson ? 'border-red-500' : ''}
                                />
                                {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact Email</label>
                                <Input
                                    name="contactEmail"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    placeholder="contact@example.com"
                                    className={errors.contactEmail ? 'border-red-500' : ''}
                                />
                                {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact Phone</label>
                                <Input
                                    name="contactPhone"
                                    type="tel"
                                    value={formData.contactPhone}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 000-0000"
                                    className={errors.contactPhone ? 'border-red-500' : ''}
                                />
                                {errors.contactPhone && <p className="text-sm text-red-500">{errors.contactPhone}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Preferred Contact Method</label>
                                <select
                                    name="preferredContactMethod"
                                    value={formData.preferredContactMethod}
                                    onChange={handleInputChange}
                                    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.preferredContactMethod ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select contact method</option>
                                    <option value="EMAIL">Email</option>
                                    <option value="PHONE">Phone</option>
                                    <option value="SMS">SMS</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                    <option value="OTHER">Other</option>
                                </select>
                                {errors.preferredContactMethod && <p className="text-sm text-red-500">{errors.preferredContactMethod}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Timezone</label>
                                <Input
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleInputChange}
                                    placeholder="e.g., America/New_York"
                                    className={errors.timezone ? 'border-red-500' : ''}
                                />
                                {errors.timezone && <p className="text-sm text-red-500">{errors.timezone}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Enter any additional notes"
                                rows={4}
                                className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.notes ? 'border-red-500' : ''}`}
                            />
                            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="max-w-4xl mx-auto px-4 space-y-6"
        >
            <Breadcrumbs
                items={[
                    { label: 'Clients', href: '/admin/clients' },
                    { label: 'Client List', href: '/admin/clients/list' },
                    { label: 'New Client' }
                ]}
            />

            <motion.div variants={item}>
                <h1 className="text-2xl font-bold mb-6">Create New Client</h1>

                {/* Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= step.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {currentStep > step.id ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <span>{step.id}</span>
                                    )}
                                </div>
                                <span className="ml-2 text-sm font-medium">{step.title}</span>
                                {index < steps.length - 1 && (
                                    <div className="w-24 h-0.5 mx-4 bg-muted" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    onKeyDown={e => {
                        if (
                            e.key === 'Enter' &&
                            currentStep < steps.length &&
                            e.target instanceof HTMLElement &&
                            e.target.tagName !== 'TEXTAREA'
                        ) {
                            e.preventDefault();
                        }
                    }}
                    className="space-y-6"
                >
                    {renderStep()}

                    <div className="flex justify-between gap-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <div className="flex gap-4">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                >
                                    Previous
                                </Button>
                            )}
                            {currentStep < steps.length ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                >
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Client'}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
} 
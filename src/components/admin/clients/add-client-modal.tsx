"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Building2, Mail, Phone, MapPin, User, Users, Tag, StickyNote, Upload, CheckCircle2, ArrowRight, Check, ArrowLeft, Search, ChevronDown, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Industry {
    id: string;
    name: string;
    code?: string;
}

interface AddClientModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (client: any) => void;
}

interface AddClientForm {
    name: string;
    email: string;
    phone: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    industryId: string;
    notes: string;
    logo: File | null;
    logoUrl: string;
}

export default function AddClientModal({ open, onClose, onAdd }: AddClientModalProps) {
    const [form, setForm] = useState<AddClientForm>({
        name: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        industryId: "",
        notes: "",
        logo: null,
        logoUrl: ""
    });
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            phone: "",
            address: "",
            contactPerson: "",
            contactEmail: "",
            contactPhone: "",
            industryId: "",
            notes: "",
            logo: null,
            logoUrl: ""
        });
        setStep(1);
        setSelectedIndustry(null);
        setSearchTerm("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    useEffect(() => {
        const fetchIndustries = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/industries?search=${searchTerm}`);
                const data = await response.json();
                setIndustries(data.data || []);
            } catch (error) {
                console.error("Error fetching industries:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            if (searchTerm) {
                fetchIndustries();
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleIndustrySelect = (industry: Industry) => {
        setSelectedIndustry(industry);
        setForm(f => ({ ...f, industryId: industry.id }));
        setShowDropdown(false);
        setSearchTerm(industry.name);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                alert("File size must be less than 3MB");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setForm(f => ({ ...f, logo: file, logoUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            setForm(f => ({ ...f, logo: null, logoUrl: "" }));
        }
    };

    const steps = [
        { label: "Client Details", icon: Building2 },
        { label: "Contact Person", icon: UserCheck },
        { label: "Confirmation", icon: CheckCircle2 }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
        } else {
            setIsSubmitting(true);
            try {
                await onAdd(form);
                // Reset form after successful submission
                setForm({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                    contactPerson: "",
                    contactEmail: "",
                    contactPhone: "",
                    industryId: "",
                    notes: "",
                    logo: null,
                    logoUrl: ""
                });
                setStep(1);
                setSelectedIndustry(null);
                setSearchTerm("");
                onClose();
            } catch (error) {
                console.error("Error adding client:", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Modal
            isOpen={open}
            onClose={handleClose}
            icon={<Building2 className="w-4 h-4" />}
            title="Add Organization"
            maxWidth="2xl"
            footer={null}
        >
            <div className="flex flex-col md:flex-row gap-6">
                {/* Stepper */}
                <div className="flex md:flex-col gap-4 md:w-40 w-full justify-center md:justify-center items-center md:items-start md:h-[400px] md:py-8">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        const isActive = step === i + 1;
                        const isCompleted = step > i + 1;

                        return (
                            <motion.div
                                key={i}
                                className="flex items-center gap-2 w-full"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={`
                                    rounded-full w-6 h-6 flex items-center justify-center border-2
                                    ${isActive ? 'bg-blue-600 text-white border-blue-600' : ''}
                                    ${isCompleted ? 'bg-green-500 text-white border-green-500' : ''}
                                    ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400 border-gray-300' : ''}
                                    transition-all duration-200
                                `}>
                                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                                        {s.label}
                                    </span>
                                    <span className="text-[10px] text-gray-400">Step {i + 1}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <form
                    id="add-client-form"
                    onSubmit={handleSubmit}
                    className="flex-1 w-full"
                >
                    <div className="relative h-[400px] overflow-visible px-1 flex flex-col">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-col gap-3 items-stretch"
                                >
                                    {/* Logo Upload */}
                                    <div className="flex flex-col items-center mb-2">
                                        <div
                                            className="group relative w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-600 mb-1 cursor-pointer hover:border-blue-400 transition-all duration-200"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {form.logoUrl ? (
                                                <img
                                                    src={form.logoUrl}
                                                    alt="Logo preview"
                                                    className="w-full h-full object-contain rounded-full border border-gray-300 dark:border-gray-600"
                                                />
                                            ) : (
                                                <>
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <Upload className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                                        <span className="text-[10px] text-gray-400 group-hover:text-blue-400">Upload</span>
                                                    </div>
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-full transition-all duration-200" />
                                                </>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center">JPEG, JPG, PNG up to 3MB</span>
                                    </div>

                                    {/* Client Details Fields */}
                                    <div className="flex flex-col gap-3">
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                                <Building2 className="w-3.5 h-3.5 text-blue-400" /> Organization Name *
                                            </label>
                                            <input
                                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                                placeholder="Enter organization name"
                                                value={form.name}
                                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                                <Tag className="w-3.5 h-3.5 text-cyan-400" /> Industry
                                            </label>
                                            <div className="relative z-30" ref={dropdownRef}>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 pr-8"
                                                        placeholder="Search industry..."
                                                        value={searchTerm}
                                                        onChange={(e) => {
                                                            setSearchTerm(e.target.value);
                                                            setShowDropdown(true);
                                                        }}
                                                        onFocus={() => setShowDropdown(true)}
                                                    />
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                </div>
                                                {showDropdown && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                        {isLoading ? (
                                                            <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                                                Loading...
                                                            </div>
                                                        ) : industries.length === 0 ? (
                                                            <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                                                No industries found
                                                            </div>
                                                        ) : (
                                                            industries.map((industry) => {
                                                                // Highlight match in name and code
                                                                const regex = new RegExp(`(${searchTerm})`, 'ig');
                                                                const nameParts = industry.name.split(regex);
                                                                const codeParts = industry.code ? industry.code.split(regex) : [];
                                                                return (
                                                                    <div
                                                                        key={industry.id}
                                                                        className="px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer flex items-center gap-2"
                                                                        onClick={() => handleIndustrySelect(industry)}
                                                                    >
                                                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                                                            {nameParts.map((part, idx) =>
                                                                                regex.test(part) ? (
                                                                                    <span key={idx} className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">{part}</span>
                                                                                ) : (
                                                                                    <span key={idx}>{part}</span>
                                                                                )
                                                                            )}
                                                                        </span>
                                                                        {industry.code && (
                                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                                (
                                                                                {codeParts.length > 0
                                                                                    ? codeParts.map((part, idx) =>
                                                                                        regex.test(part) ? (
                                                                                            <span key={idx} className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">{part}</span>
                                                                                        ) : (
                                                                                            <span key={idx}>{part}</span>
                                                                                        )
                                                                                    )
                                                                                    : industry.code
                                                                                }
                                                                                )
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                                <MapPin className="w-3.5 h-3.5 text-yellow-400" /> Address
                                            </label>
                                            <input
                                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                                placeholder="Enter organization address"
                                                value={form.address}
                                                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                                    <Mail className="w-3.5 h-3.5 text-emerald-400" /> Organization Email
                                                </label>
                                                <input
                                                    className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                                    type="email"
                                                    placeholder="Enter organization email"
                                                    value={form.email}
                                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                                    <Phone className="w-3.5 h-3.5 text-pink-400" /> Organization Phone
                                                </label>
                                                <input
                                                    className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                                    placeholder="Enter organization phone"
                                                    value={form.phone}
                                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-1 flex-col gap-3 justify-center"
                                >
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                            <User className="w-3.5 h-3.5 text-indigo-400" /> Contact Person
                                        </label>
                                        <input
                                            className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                            placeholder="Enter contact person name"
                                            value={form.contactPerson}
                                            onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                            <Mail className="w-3.5 h-3.5 text-orange-400" /> Contact Email
                                        </label>
                                        <input
                                            className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                            type="email"
                                            placeholder="Enter contact email"
                                            value={form.contactEmail}
                                            onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                            <Phone className="w-3.5 h-3.5 text-green-400" /> Contact Phone
                                        </label>
                                        <input
                                            className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                            placeholder="Enter contact phone"
                                            value={form.contactPhone}
                                            onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                            <StickyNote className="w-3.5 h-3.5 text-purple-400" /> Notes
                                        </label>
                                        <textarea
                                            className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 min-h-[80px]"
                                            placeholder="Enter any additional notes"
                                            value={form.notes}
                                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-1 flex-col justify-center gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        {form.logoUrl && (
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <img
                                                    src={form.logoUrl}
                                                    alt="Organization logo"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Review Details</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Organization Name:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{form.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Tag className="w-3.5 h-3.5 text-cyan-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Industry:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedIndustry?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Address:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{form.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Mail className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Organization Email:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{form.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Phone className="w-3.5 h-3.5 text-pink-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Organization Phone:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{form.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <User className="w-3.5 h-3.5 text-indigo-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Contact Person:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{form.contactPerson}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Mail className="w-3.5 h-3.5 text-orange-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Contact Email:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{form.contactEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Phone className="w-3.5 h-3.5 text-green-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Contact Phone:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{form.contactPhone}</span>
                                        </div>
                                        {form.notes && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-start gap-2 text-xs">
                                                    <StickyNote className="w-3.5 h-3.5 text-purple-400 mt-0.5" />
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                                            {form.notes}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        {step > 1 && (
                            <button
                                type="button"
                                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#222] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#333] transition-all duration-200 flex items-center justify-center"
                                onClick={() => setStep(step - 1)}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                                w-8 h-8 rounded-full text-white font-medium shadow-md transition-all duration-200 flex items-center justify-center
                                ${step < 3
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : step < 3 ? <ArrowRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
} 
import React, { useRef, useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrgStatus } from "@/generated/prisma";
import { Building2, Mail, Phone, MapPin, User, StickyNote, Upload, Tag, ChevronDown } from "lucide-react";

interface Industry {
    id: string;
    name: string;
    code?: string;
}

interface Client {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    status: OrgStatus;
    phone?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    industry?: Industry;
    industryId?: string;
    logo?: string;
    notes?: string;
}

interface ClientEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onSave?: (updated: Client) => void;
}

export function ClientEditModal({ isOpen, onClose, client, onSave }: ClientEditModalProps) {
    const [form, setForm] = useState({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        contactPerson: client.contactPerson || "",
        contactEmail: client.contactEmail || "",
        contactPhone: client.contactPhone || "",
        notes: client.notes || "",
        logo: null as File | null,
        logoUrl: client.logo || "",
        industryId: client.industryId || client.industry?.id || "",
    });
    const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(client.industry || null);
    const [industrySearch, setIndustrySearch] = useState(client.industry?.name || "");
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoadingIndustries, setIsLoadingIndustries] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const resetForm = () => {
        setForm({
            name: client.name || "",
            email: client.email || "",
            phone: client.phone || "",
            address: client.address || "",
            contactPerson: client.contactPerson || "",
            contactEmail: client.contactEmail || "",
            contactPhone: client.contactPhone || "",
            notes: client.notes || "",
            logo: null,
            logoUrl: client.logo || "",
            industryId: client.industryId || client.industry?.id || "",
        });
        setSelectedIndustry(client.industry || null);
        setIndustrySearch(client.industry?.name || "");
        setShowDropdown(false);
        setLoading(false);
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    useEffect(() => {
        resetForm();
    }, [client.id]);

    useEffect(() => {
        if (!industrySearch) return;
        setIsLoadingIndustries(true);
        const fetchIndustries = async () => {
            try {
                const response = await fetch(`/api/industries?search=${industrySearch}`);
                const data = await response.json();
                setIndustries(data.data || []);
            } catch (error) {
                setIndustries([]);
            } finally {
                setIsLoadingIndustries(false);
            }
        };
        const debounce = setTimeout(fetchIndustries, 300);
        return () => clearTimeout(debounce);
    }, [industrySearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(f => ({ ...f, logo: file, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setForm(f => ({ ...f, [id]: value }));
    };

    const handleIndustrySelect = (industry: Industry) => {
        setSelectedIndustry(industry);
        setForm(f => ({ ...f, industryId: industry.id }));
        setIndustrySearch(industry.name);
        setShowDropdown(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let logoUrl = form.logoUrl;
            if (form.logo) {
                const data = new FormData();
                data.append("file", form.logo);
                const uploadRes = await fetch("/api/upload", { method: "POST", body: data });
                if (!uploadRes.ok) throw new Error("Logo upload failed");
                const uploadData = await uploadRes.json();
                logoUrl = uploadData.url;
            }
            const payload = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                contactPerson: form.contactPerson,
                contactEmail: form.contactEmail,
                contactPhone: form.contactPhone,
                notes: form.notes,
                logo: logoUrl,
                industryId: form.industryId,
            };
            const res = await fetch(`/api/organization/${client.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to update client");
            const updated = await res.json();
            if (onSave) onSave(updated);
            resetForm();
            onClose();
        } catch (err: any) {
            alert(err.message || "Failed to save changes");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Edit Client"
            maxWidth="2xl"
            footer={
                <div className="flex justify-end gap-2 px-1 pb-1 pr-3">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-2 gap-6">
                {/* Client Information Column */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization Information</h3>
                    <div className="space-y-4">
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
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                <Building2 className="w-3.5 h-3.5 text-blue-400" /> Organization Name
                            </label>
                            <input
                                id="name"
                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter organization name"
                            />
                        </div>
                        {/* Industry Field */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                <Tag className="w-3.5 h-3.5 text-cyan-400" /> Industry
                            </label>
                            <div className="relative z-30" ref={dropdownRef}>
                                <div className="relative">
                                    <input
                                        id="industry"
                                        type="text"
                                        className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 pr-8"
                                        placeholder="Search industry..."
                                        value={industrySearch}
                                        onChange={e => {
                                            setIndustrySearch(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                    />
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                                {showDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {isLoadingIndustries ? (
                                            <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                                Loading...
                                            </div>
                                        ) : industries.length === 0 ? (
                                            <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                                No industries found
                                            </div>
                                        ) : (
                                            industries.map((industry) => {
                                                const regex = new RegExp(`(${industrySearch})`, 'ig');
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
                        {/* End Industry Field */}
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                <Mail className="w-3.5 h-3.5 text-emerald-400" /> Organization Email
                            </label>
                            <input
                                id="email"
                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter organization email"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                <Phone className="w-3.5 h-3.5 text-pink-400" /> Organization Phone
                            </label>
                            <input
                                id="phone"
                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Enter organization phone number"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                <MapPin className="w-3.5 h-3.5 text-yellow-400" /> Address
                            </label>
                            <input
                                id="address"
                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Enter organization address"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Person Column */}
                <div className="flex flex-col h-full">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Contact Person</h3>
                    <div className="flex flex-1 flex-col gap-4 justify-between">
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                <User className="w-3.5 h-3.5 text-indigo-400" /> Contact Person
                            </label>
                            <input
                                id="contactPerson"
                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                value={form.contactPerson}
                                onChange={handleChange}
                                placeholder="Enter contact person name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                <Mail className="w-3.5 h-3.5 text-orange-400" /> Contact Email
                            </label>
                            <input
                                id="contactEmail"
                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                type="email"
                                value={form.contactEmail}
                                onChange={handleChange}
                                placeholder="Enter contact person email"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                <Phone className="w-3.5 h-3.5 text-green-400" /> Contact Phone
                            </label>
                            <input
                                id="contactPhone"
                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                type="tel"
                                value={form.contactPhone}
                                onChange={handleChange}
                                placeholder="Enter contact person phone number"
                            />
                        </div>
                        <div className="space-y-1 flex-1 flex flex-col">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                                <StickyNote className="w-3.5 h-3.5 text-purple-400" /> Notes
                            </label>
                            <textarea
                                id="notes"
                                className="w-full rounded-sm border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-white dark:bg-[#222] focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 min-h-[120px] flex-1"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Enter any additional notes"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
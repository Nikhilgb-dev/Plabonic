// src/components/JobFormModal.tsx
import React, { useState, useEffect } from "react";

type JobFormProps = {
    initialData?: {
        _id?: string;
        title?: string;
        description?: string;
        roleAndResponsibility?: string;
        skillsRequired?: string;
        preferredQualifications?: string;
        location?: string;
        employmentType?: string;
        minSalary?: number;
        maxSalary?: number;
        status?: "open" | "closed";
    } | null;
    onClose: () => void;
    onCreate: (payload: any) => Promise<void>;
    onUpdate: (id: string, payload: any) => Promise<void>;
};

const JobFormModal: React.FC<JobFormProps> = ({ initialData, onClose, onCreate, onUpdate }) => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        roleAndResponsibility: "",
        skillsRequired: "",
        preferredQualifications: "",
        location: "",
        employmentType: "Full-time",
        minSalary: undefined as number | undefined,
        maxSalary: undefined as number | undefined,
        status: "open" as "open" | "closed",
    });
    const [submitting, setSubmitting] = useState(false);
    const formatNumberInput = (value: string) => {
        const digits = value.replace(/[^\d]/g, "");
        if (!digits) return "";
        return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    useEffect(() => {
        if (initialData) {
            setForm({
                title: initialData.title || "",
                description: initialData.description || "",
                roleAndResponsibility: initialData.roleAndResponsibility || "",
                skillsRequired: initialData.skillsRequired || "",
                preferredQualifications: initialData.preferredQualifications || "",
                location: initialData.location || "",
                employmentType: initialData.employmentType || "Full-time",
                minSalary: initialData.minSalary,
                maxSalary: initialData.maxSalary,
                status: initialData.status || "open",
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (initialData && initialData._id) {
                await onUpdate(initialData._id, form);
            } else {
                await onCreate(form);
            }
        } catch (err) {
            // handled by parent
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto py-10">
            <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{initialData ? "Edit Job" : "Create Job"}</h3>
                    <button onClick={onClose} className="text-gray-500">Close</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Location</label>
                        <input name="location" value={form.location} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Employment Type</label>
                        <select name="employmentType" value={form.employmentType} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                            <option>Remote</option>
                            <option>Hybrid</option>
                            <option>Work from home</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Min Salary (LPA)</label>
                            <input
                                name="minSalary"
                                type="text"
                                placeholder="e.g. 800,000"
                                value={form.minSalary ? form.minSalary.toLocaleString() : ""}
                                onChange={(e) => {
                                    const formatted = formatNumberInput(e.target.value);
                                    const numericValue = formatted ? Number(formatted.replace(/,/g, "")) : undefined;
                                    setForm({ ...form, minSalary: numericValue });
                                }}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Max Salary (LPA)</label>
                            <input
                                name="maxSalary"
                                type="text"
                                placeholder="e.g. 1,200,000"
                                value={form.maxSalary ? form.maxSalary.toLocaleString() : ""}
                                onChange={(e) => {
                                    const formatted = formatNumberInput(e.target.value);
                                    const numericValue = formatted ? Number(formatted.replace(/,/g, "")) : undefined;
                                    setForm({ ...form, maxSalary: numericValue });
                                }}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Role and Responsibility</label>
                        <textarea name="roleAndResponsibility" value={form.roleAndResponsibility} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Skills Required</label>
                        <textarea name="skillsRequired" value={form.skillsRequired} onChange={handleChange} rows={2} className="w-full px-3 py-2 border rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Preferred Qualifications</label>
                        <textarea name="preferredQualifications" value={form.preferredQualifications} onChange={handleChange} rows={2} className="w-full px-3 py-2 border rounded-md" />
                    </div>

                    <div className="flex items-center gap-4 justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                            {submitting ? "Saving..." : initialData ? "Update Job" : "Create Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobFormModal;

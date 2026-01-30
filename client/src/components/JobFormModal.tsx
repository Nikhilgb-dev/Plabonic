// src/components/JobFormModal.tsx
import React, { useMemo, useState, useEffect } from "react";
import SkillsInput from "@/components/SkillsInput";
import { formatIndianInput, parseIndianInput, SalaryType } from "@/utils/salary";

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
        salaryType?: SalaryType;
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
        salaryType: "Monthly" as SalaryType,
        status: "open" as "open" | "closed",
    });
    const [submitting, setSubmitting] = useState(false);
    const salaryOptions: SalaryType[] = ["Monthly", "LPA", "CTC"];
    const parseSkills = (value?: string) =>
        (value || "")
            .split(/[,\n]/)
            .map((part) => part.trim())
            .filter((part) => part.length > 0);
    const skillsList = useMemo(() => parseSkills(form.skillsRequired), [form.skillsRequired]);

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
                salaryType: initialData.salaryType || "Monthly",
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
                            <label className="block text-sm font-medium">Min Salary (Rupees)</label>
                            <input
                                name="minSalary"
                                type="text"
                                placeholder="e.g. 800,000"
                                value={form.minSalary ? form.minSalary.toLocaleString("en-IN") : ""}
                                onChange={(e) => {
                                    const formatted = formatIndianInput(e.target.value);
                                    const numericValue = parseIndianInput(formatted);
                                    setForm({ ...form, minSalary: numericValue });
                                }}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Max Salary (Rupees)</label>
                            <input
                                name="maxSalary"
                                type="text"
                                placeholder="e.g. 1,200,000"
                                value={form.maxSalary ? form.maxSalary.toLocaleString("en-IN") : ""}
                                onChange={(e) => {
                                    const formatted = formatIndianInput(e.target.value);
                                    const numericValue = parseIndianInput(formatted);
                                    setForm({ ...form, maxSalary: numericValue });
                                }}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Salary Type</label>
                        <div className="flex flex-wrap gap-2">
                            {salaryOptions.map((option) => (
                                <label
                                    key={option}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${form.salaryType === option
                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.salaryType === option}
                                        onChange={() => setForm({ ...form, salaryType: option })}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    {option}
                                </label>
                            ))}
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
                        <SkillsInput
                            value={skillsList}
                            onChange={(next) => setForm((s) => ({ ...s, skillsRequired: next.join(", ") }))}
                            inputClassName="w-full px-3 py-2 border rounded-md"
                        />
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

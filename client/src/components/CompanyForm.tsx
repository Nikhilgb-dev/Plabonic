import React, { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-hot-toast";
import TermsModal from "./TermsModal";

interface CompanyFormData {
    name: string;
    domain: string;
    industry: string;
    size: string;
    type: string;
    salary: string;
    registeredOfficeAddress: string;
    tagline: string;
    description: string;
    email: string;
    contactNumber: string;
    password: string;
    authorizedSignatoryName: string;
    authorizedSignatoryDesignation: string;
    acceptTerms: boolean;
    registrationName: string;
    panOrTanOrGst: string;
    dateOfIncorporation: string;
    directorAndKmpDetails: string;
}

interface Props {
    mode: "self" | "admin" | "edit";
    onSuccess?: () => void;
    initialData?: Partial<CompanyFormData>;
}

const CompanyForm: React.FC<Props> = ({ mode, onSuccess, initialData }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState<CompanyFormData>({
        name: "",
        domain: "",
        industry: "",
        size: "",
        type: "",
        salary: "",
        registeredOfficeAddress: "",
        tagline: "",
        description: "",
        email: "",
        contactNumber: "",
        password: "",
        authorizedSignatoryName: "",
        authorizedSignatoryDesignation: "",
        acceptTerms: false,
        registrationName: "",
        panOrTanOrGst: "",
        dateOfIncorporation: "",
        directorAndKmpDetails: "",
    });

    useEffect(() => {
        if (initialData) {
            let formattedDate = "";
            if (initialData.dateOfIncorporation) {
                const dateValue = new Date(
                    initialData.dateOfIncorporation as unknown as string
                );
                if (!isNaN(dateValue.getTime())) {
                    formattedDate = dateValue.toISOString().slice(0, 10);
                }
            }

            setForm(prev => ({
                ...prev,
                ...initialData,
                registeredOfficeAddress:
                    (initialData as any).registeredOfficeAddress ||
                    (initialData as any).address ||
                    prev.registeredOfficeAddress,
                dateOfIncorporation: formattedDate || prev.dateOfIncorporation,
            }));
        }
    }, [initialData]);

    const [logo, setLogo] = useState<File | null>(null);
    const [signature, setSignature] = useState<File | null>(null);
    const [verificationDocs, setVerificationDocs] = useState<FileList | null>(
        null
    );

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleNext = () => setStep((prev) => Math.min(prev + 1, 4));
    const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.acceptTerms) {
            toast.error("Please accept the terms and conditions");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) =>
                formData.append(key, value)
            );
            // keep legacy address field in sync with registered office
            formData.append("address", form.registeredOfficeAddress);

            if (logo) formData.append("logo", logo);
            if (signature) formData.append("authorizedSignatory[signature]", signature);
            if (verificationDocs)
                Array.from(verificationDocs).forEach((file) =>
                    formData.append("verificationDocs", file)
                );

            console.log("mode", mode);
            let endpoint = "/companies/register";
            let method = API.post;

            if (mode === "admin") {
                endpoint = "/companies/admin/create";
            } else if (mode === "edit") {
                endpoint = "/companies/me";
                method = API.put;
            }

            await method(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(mode === "edit" ? "✅ Company details updated successfully!" : "✅ Company registered successfully!");

            if (onSuccess) setTimeout(() => onSuccess(), 800);

            setForm({
                name: "",
                domain: "",
                industry: "",
                size: "",
                type: "",
                salary: "",
                registeredOfficeAddress: "",
                tagline: "",
                description: "",
                email: "",
                contactNumber: "",
                password: "",
                authorizedSignatoryName: "",
                authorizedSignatoryDesignation: "",
                acceptTerms: false,
                registrationName: "",
                panOrTanOrGst: "",
                dateOfIncorporation: "",
                directorAndKmpDetails: "",
            });
            setLogo(null);
            setSignature(null);
            setVerificationDocs(null);
            setStep(1);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "❌ Registration failed");
        } finally {
            setLoading(false);
        }
    };


    // 🟩 Step Progress Indicator
    const steps = ["Basic Info", "Details", "Signatory", "Uploads"];

    return (
        <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl p-6 sm:p-10 shadow-lg border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1 text-center sm:text-left">
                {mode === "edit" ? "Edit Company Details" : "Company Registration"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 text-center sm:text-left">
                Step {step} of 4 — {steps[step - 1]}
            </p>

            {/* Progress Bar */}
            <div className="flex mb-8">
                {steps.map((_, i) => (
                    <div
                        key={i}
                        className={`flex-1 h-2 rounded-full mx-0.5 sm:mx-1 transition-all ${i < step ? "bg-green-600" : "bg-gray-200"
                            }`}
                    />
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1 — Basic Info */}
                {step === 1 && (
                    <div className="grid gap-4 sm:gap-5 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Company Name"
                                required
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                            <input
                                name="domain"
                                value={form.domain}
                                onChange={handleChange}
                                placeholder="Company Domain / Website"
                                required
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                name="industry"
                                value={form.industry}
                                onChange={handleChange}
                                placeholder="Industry Type"
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                            <input
                                name="size"
                                value={form.size}
                                onChange={handleChange}
                                placeholder="Company Size (e.g., 51–200)"
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                        </div>

                        <input
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            placeholder="Company Type (Private / Public / Nonprofit)"
                            className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                        />
                    </div>
                )}

                {/* Step 2 — Details */}
                {step === 2 && (
                    <div className="grid gap-4 sm:gap-5 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                name="registrationName"
                                value={form.registrationName}
                                onChange={handleChange}
                                placeholder="Company Registration Name (optional)"
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                            <input
                                name="panOrTanOrGst"
                                value={form.panOrTanOrGst}
                                onChange={handleChange}
                                placeholder="PAN / TAN / GST (optional)"
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="date"
                                name="dateOfIncorporation"
                                value={form.dateOfIncorporation}
                                onChange={handleChange}
                                placeholder="Date of Incorporation"
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                            <input
                                name="contactNumber"
                                value={form.contactNumber}
                                onChange={handleChange}
                                placeholder="Contact Number"
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                        </div>
                        <textarea
                            name="registeredOfficeAddress"
                            value={form.registeredOfficeAddress}
                            onChange={handleChange}
                            placeholder="Registered Office Address"
                            className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                        />
                        <textarea
                            name="directorAndKmpDetails"
                            value={form.directorAndKmpDetails}
                            onChange={handleChange}
                            placeholder="Director and Key Managerial Personnel Details"
                            className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                        />
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Company Description"
                            className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                        />
                        <input
                            name="tagline"
                            value={form.tagline}
                            onChange={handleChange}
                            placeholder="Company Tagline"
                            className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                        />
                        <div className={`grid grid-cols-1 ${mode === "edit" ? "" : "sm:grid-cols-2"} gap-3`}>
                            <input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Official Business Email"
                                required
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                            {mode !== "edit" && (
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Set Company Account Password"
                                        required
                                        className="border rounded-md px-3 py-2 text-sm sm:text-base w-full pr-24"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-1 px-3 text-xs font-medium text-gray-600 hover:text-gray-800"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3 — Authorized Signatory */}
                {step === 3 && (
                    <div className="grid gap-4 sm:gap-5 animate-fadeIn">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                            Authorized Person
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                name="authorizedSignatoryName"
                                value={form.authorizedSignatoryName}
                                onChange={handleChange}
                                placeholder="Name"
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                            <input
                                name="authorizedSignatoryDesignation"
                                value={form.authorizedSignatoryDesignation}
                                onChange={handleChange}
                                placeholder="Designation"
                                className="border rounded-md px-3 py-2 text-sm sm:text-base w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">
                                Authorized persona [ID] (optional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSignature(e.target.files?.[0] || null)}
                                className="text-sm sm:text-base w-full"
                            />
                        </div>
                    </div>
                )}

                {/* Step 4 — Uploads */}
                {step === 4 && (
                    <div className="grid gap-4 sm:gap-5 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                    Company Logo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLogo(e.target.files?.[0] || null)}
                                    className="text-sm sm:text-base w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                    Verification Documents
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setVerificationDocs(e.target.files)}
                                    className="text-sm sm:text-base w-full"
                                />
                            </div>
                        </div>
                        <div className="flex items-center mt-4">
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                checked={form.acceptTerms}
                                onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                                className="mr-2"
                            />
                            <label htmlFor="acceptTerms" className="text-sm">
                              I accept the{" "}
                              <button
                                type="button"
                                onClick={() => setShowTermsModal(true)}
                                className="text-brand underline"
                              >
                                Terms and Conditions
                              </button>
                            </label>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="w-full sm:w-auto px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm sm:text-base font-medium"
                        >
                            Back
                        </button>
                    )}
                    {step < 4 && (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-full sm:w-auto ml-auto px-5 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base font-medium"
                        >
                            Next
                        </button>
                    )}
                    {step === 4 && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto ml-auto px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium text-sm sm:text-base disabled:opacity-60"
                        >
                            {loading ? "Submitting..." : "Submit Registration"}
                        </button>
                    )}
                </div>
              </form>
              <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
            </div>
          );
        };

export default CompanyForm;

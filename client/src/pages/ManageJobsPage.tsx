import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API from "@/api/api";
import { useCompany } from "../contexts/CompanyContext";

interface Job {
    _id?: string;
    title: string;
    description?: string;
    roleAndResponsibility?: string;
    skillsRequired?: string;
    preferredQualifications?: string;
    location?: string;
    employmentType?: string;
    minSalary?: number;
    maxSalary?: number;
    company?: string;
    applicantsCount?: number;
    status?: string;
    createdAt?: string;
    expiresAt?: string;
}

interface Company {
    _id: string;
    name: string;
    blocked?: boolean;
}

const ManageJobsPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [role, setRole] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    const [form, setForm] = useState<Job>({
        title: "",
        description: "",
        roleAndResponsibility: "",
        skillsRequired: "",
        preferredQualifications: "",
        location: "",
        employmentType: "Full-time",
        minSalary: undefined,
        maxSalary: undefined,
        company: "",
    });

    const { company } = useCompany();

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data } = await API.get("/users/me");
                setRole(data.role);
            } catch (err: any) {
                toast.error("Failed to fetch user role");
            }
        };
        getUser();
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const res =
                role === "admin"
                    ? await API.get("/jobs")
                    : await API.get("/companies/me/jobs");
            setJobs(res.data.jobs || res.data);
        } catch (err) {
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const loadCompanies = async () => {
        if (role !== "admin") return;
        try {
            const res = await API.get("/companies");
            setCompanies(res.data);
        } catch (err) {
            console.error("Failed to load companies");
        }
    };

    useEffect(() => {
        if (role) {
            loadJobs();
            loadCompanies();
        }
    }, [role]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            roleAndResponsibility: "",
            skillsRequired: "",
            preferredQualifications: "",
            location: "",
            employmentType: "Full-time",
            minSalary: undefined,
            maxSalary: undefined,
            company: role === "company_admin" ? company?._id : "",
        });
        setEditingJob(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingJob?._id) {
                const endpoint =
                    role === "admin"
                        ? `/jobs/${editingJob._id}`
                        : `/companies/me/jobs/${editingJob._id}`;
                await API.put(endpoint, form);
                toast.success("Job updated successfully");
            } else {
                const endpoint =
                    role === "admin" ? "/jobs" : "/companies/me/jobs";
                await API.post(endpoint, form);
                toast.success("Job posted successfully");
            }

            resetForm();
            loadJobs();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save job");
        }
    };

    const handleEdit = (job: Job) => {
        setEditingJob(job);
        setForm({
            title: job.title,
            description: job.description || "",
            roleAndResponsibility: job.roleAndResponsibility || "",
            skillsRequired: job.skillsRequired || "",
            preferredQualifications: job.preferredQualifications || "",
            location: job.location || "",
            employmentType: job.employmentType || "Full-time",
            minSalary: job.minSalary,
            maxSalary: job.maxSalary,
            company: job.company || "",
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        try {
            const endpoint =
                role === "admin" ? `/jobs/${id}` : `/companies/me/jobs/${id}`;
            await API.delete(endpoint);
            toast.success("Job deleted successfully");
            loadJobs();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete job");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-blue-100">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                Manage Jobs
                            </h2>
                            <p className="text-gray-600">
                                Create, edit, and manage your job postings
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                            disabled={role === "company_admin" && company?.blocked}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:transform-none shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {role === "company_admin" && company?.blocked ? "Posting Disabled - Contact Admin" : "Post New Job"}
                        </button>
                    </div>
                </div>

                {/* Job Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-blue-100 animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {editingJob ? "Edit Job Posting" : "Create New Job"}
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {role === "admin" && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Company
                                    </label>
                                    <select
                                        name="company"
                                        value={form.company}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    >
                                        <option value="">Select a company</option>
                                        {companies.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Job Title
                                </label>
                                <input
                                    name="title"
                                    placeholder="e.g. Senior Software Engineer"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        name="location"
                                        placeholder="e.g. New York, NY or Remote"
                                        value={form.location}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Employment Type
                                    </label>
                                    <select
                                        name="employmentType"
                                        value={form.employmentType}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                        <option>Remote</option>
                                        <option>Hybrid</option>
                                        <option>Work from home</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Min Salary (LPA)
                                    </label>
                                    <input
                                        name="minSalary"
                                        type="number"
                                        placeholder="e.g. 800,000"
                                        value={form.minSalary || ""}
                                        onChange={(e) => setForm({ ...form, minSalary: e.target.value ? parseFloat(e.target.value) : undefined })}
                                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Max Salary (LPA)
                                    </label>
                                    <input
                                        name="maxSalary"
                                        type="number"
                                        placeholder="e.g. 1,200,000"
                                        value={form.maxSalary || ""}
                                        onChange={(e) => setForm({ ...form, maxSalary: e.target.value ? parseFloat(e.target.value) : undefined })}
                                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Job Description
                                </label>
                                <textarea
                                    name="description"
                                    placeholder="Describe the role, responsibilities, and requirements..."
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    rows={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Role and Responsibility
                                </label>
                                <textarea
                                    name="roleAndResponsibility"
                                    placeholder="Detail the role and responsibilities..."
                                    value={form.roleAndResponsibility}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Skills Required
                                </label>
                                <textarea
                                    name="skillsRequired"
                                    placeholder="List the required skills..."
                                    value={form.skillsRequired}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Preferred Qualifications
                                </label>
                                <textarea
                                    name="preferredQualifications"
                                    placeholder="List preferred qualifications..."
                                    value={form.preferredQualifications}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={role === "company_admin" && company?.blocked}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 disabled:transform-none shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                                >
                                    {role === "company_admin" && company?.blocked ? "Posting Disabled" : (editingJob ? "Update Job" : "Post Job")}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Jobs List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading jobs...</p>
                        </div>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-blue-100">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No jobs posted yet</h3>
                        <p className="text-gray-600 mb-6">Start by creating your first job posting</p>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium inline-flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Post Your First Job
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div
                                key={job._id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                                        {job.title}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            {job.location || "Remote"}
                                                        </span>
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            {job.employmentType}
                                                        </span>
                                                        {(job.minSalary || job.maxSalary) && (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {job.minSalary && job.maxSalary ? `${job.minSalary}-${job.maxSalary} LPA` : job.minSalary ? `${job.minSalary} LPA` : `${job.maxSalary} LPA`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {job.description && (
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                                    {job.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <strong>{job.applicantsCount || 0}</strong> applicants
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Posted {new Date(job.createdAt || "").toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Expires {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : "N/A"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleEdit(job)}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-all flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job._id!)}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-all flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageJobsPage;
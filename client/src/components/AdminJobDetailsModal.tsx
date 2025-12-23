import React, { useState } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

interface Props {
    job: any;
    onClose: () => void;
    onRefresh: () => void;
}

const AdminJobDetailsModal: React.FC<Props> = ({ job, onClose, onRefresh }) => {
    const [remarks, setRemarks] = useState(job?.remarks || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSaveRemarks = async () => {
        setIsSaving(true);
        try {
            await API.put(`/admin/jobs/${job._id}`, { remarks });
            toast.success("Remarks updated successfully");
            onRefresh();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update remarks");
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            await API.put(`/admin/jobs/${job._id}/verify`);
            toast.success(`Job ${job.isVerified ? 'unverified' : 'verified'} successfully`);
            onRefresh();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to verify job");
        } finally {
            setIsVerifying(false);
        }
    };

    if (!job) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200"
                    >
                        ✕
                    </button>

                    <div className="flex items-start gap-4">
                        {job.company?.logo ? (
                            <img
                                src={job.company.logo}
                                alt={job.company.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-white p-2 shadow-lg"
                            />
                        ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-blue-700 flex items-center justify-center rounded-xl font-bold text-2xl shadow-lg">
                                {job.company?.name?.charAt(0) || "C"}
                            </div>
                        )}
                        <div className="flex-1 text-white pt-1">
                            <h2 className="text-xl sm:text-2xl font-bold mb-2 pr-8">{job.title}</h2>
                            <p className="text-blue-100 text-sm sm:text-base font-medium">{job.company?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Location</span>
                            </div>
                            <p className="text-gray-900 font-medium">{job.location || "Not specified"}</p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Type</span>
                            </div>
                            <p className="text-gray-900 font-medium">{job.employmentType}</p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Status</span>
                            </div>
                            <p className="text-gray-900 font-medium capitalize">{job.status}</p>
                        </div>

                        {(job.minSalary || job.maxSalary) && (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 sm:col-span-2 lg:col-span-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Salary Range</span>
                                </div>
                                <p className="text-gray-900 font-medium">
                                    {job.minSalary && job.maxSalary
                                        ? `₹${job.minSalary.toLocaleString()} - ₹${job.maxSalary.toLocaleString()} Rupees`
                                        : job.minSalary
                                        ? `From ₹${job.minSalary.toLocaleString()} Rupees`
                                        : job.maxSalary
                                        ? `Up to ₹${job.maxSalary.toLocaleString()} Rupees`
                                        : "Not specified"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900">Job Description</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                                {job.description || "No description available."}
                            </p>
                        </div>
                    </div>

                    {/* Additional Details */}
                    {(job.roleAndResponsibility || job.skillsRequired || job.preferredQualifications) && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Details</h3>
                            <div className="space-y-4">
                                {job.roleAndResponsibility && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Role & Responsibilities</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-gray-700 whitespace-pre-line">{job.roleAndResponsibility}</p>
                                        </div>
                                    </div>
                                )}
                                {job.skillsRequired && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Skills Required</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-gray-700 whitespace-pre-line">{job.skillsRequired}</p>
                                        </div>
                                    </div>
                                )}
                                {job.preferredQualifications && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Preferred Qualifications</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-gray-700 whitespace-pre-line">{job.preferredQualifications}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Admin Remarks */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900">Admin Remarks</h3>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Add remarks about this job posting..."
                                className="w-full border border-orange-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={isVerifying}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? "Verifying..." : (job.isVerified ? "Unverify" : "Verify")}
                        </button>
                        <button
                            onClick={handleSaveRemarks}
                            disabled={isSaving}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? "Saving..." : "Save Remarks"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminJobDetailsModal;
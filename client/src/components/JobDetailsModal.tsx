import React, { useState } from "react";
import ReportAbuseModal from "./ReportAbuseModal";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import { formatSalaryRange } from "@/utils/salary";

interface Props {
    job: any;
    onClose: () => void;
    onApply?: (jobId: string) => void;
    isUserBlocked?: boolean;
}

const JobDetailsModal: React.FC<Props> = ({ job, onClose, onApply, isUserBlocked }) => {
    const [showReportModal, setShowReportModal] = useState(false);

    if (!job) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-fade-in">
                {/* Header Section with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200"
                    >
                        ✕
                    </button>

                    <div className="flex items-start gap-4">
                        <Avatar
                            src={job.company?.logo}
                            alt={job.company?.name || "Company"}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white shadow-lg"
                        />
                        <div className="flex-1 text-white pt-1">
                            <h2 className="text-xl sm:text-2xl font-bold mb-2 pr-8">{job.title}</h2>
                            <p className="text-blue-100 text-sm sm:text-base font-medium">{job.company?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-8">
                    {/* Info Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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

                        {(job.minSalary || job.maxSalary) && (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 sm:col-span-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Salary</span>
                                </div>
                                <p className="text-gray-900 font-medium">
                                    {formatSalaryRange(job.minSalary, job.maxSalary, job.salaryType)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    <div className="mt-6">
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

                    {/* Role and Responsibility */}
                    {job.roleAndResponsibility && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Role and Responsibility</h3>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                                <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                                    {job.roleAndResponsibility}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Skills Required */}
                    {job.skillsRequired && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Skills Required</h3>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                                <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                                    {job.skillsRequired}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Preferred Qualifications */}
                    {job.preferredQualifications && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Preferred Qualifications</h3>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                                <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                                    {job.preferredQualifications}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Report Abuse Button */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        {onApply && (
                            <button
                                onClick={() => onApply(job._id)}
                                disabled={!!isUserBlocked}
                                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${isUserBlocked
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                {isUserBlocked ? "Account Blocked" : "Apply Now"}
                            </button>
                        )}
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Report Abuse
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Abuse Modal */}
            {showReportModal && (
                <ReportAbuseModal
                    jobId={job._id}
                    jobTitle={job.title}
                    onClose={() => setShowReportModal(false)}
                    onSuccess={() => {
                        toast.success("Report submitted successfully");
                    }}
                />
            )}
        </div>
    );
};

export default JobDetailsModal;

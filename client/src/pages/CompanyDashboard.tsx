import React, { useEffect, useState } from "react";
import API from "@/api/api";
import { useCompany } from "../contexts/CompanyContext";
import ApplicationStatusDropdown from "@/components/ApplicationStatusDropdown";
import ViewResumeModal from "@/components/ViewResumeModal";
import FeedbackButton from "@/components/FeedbackButton";
import ApplicantDetailsModal from "@/components/ApplicantDetailsModal";
import EditJobModal from "@/components/EditJobModal";
import CompanyForm from "@/components/CompanyForm";
import toast from "react-hot-toast";
import Avatar from "@/components/Avatar";

type DashboardData = {
    employeesCount: number;
    totalJobs: number;
    openJobs: number;
    totalApplicants: number;
    totalHired: number;
    activeJobs: number;
    expiredJobs: number;
    pendingJobs: number;
};

const StatCard: React.FC<{ title: string; value: number }> = ({
    title,
    value,
}) => (
    <div className="bg-white border rounded-lg p-3 sm:p-4 md:p-5 shadow-sm flex flex-col justify-center text-center sm:text-left">
        <div className="text-[11px] sm:text-xs md:text-sm text-gray-500">
            {title}
        </div>
        <div className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mt-1">
            {value}
        </div>
    </div>
);

const CompanyDashboard: React.FC = () => {
    const { company } = useCompany();
    const [data, setData] = useState<DashboardData | null>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
    const [companyJobs, setCompanyJobs] = useState<any[]>([]);
    const [showEditJobModal, setShowEditJobModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
    const [abuseReports, setAbuseReports] = useState<any[]>([]);
    const [showAbuseResponseModal, setShowAbuseResponseModal] = useState(false);
    const [selectedAbuseReport, setSelectedAbuseReport] = useState<any>(null);
    const [companyResponse, setCompanyResponse] = useState("");

    const fetchDashboard = async () => {
        const res = await API.get("/companies/me/dashboard");
        setData(res.data);
    };

    const fetchApplicants = async () => {
        const res = await API.get("/companies/me/applicants");
        setApplicants(res.data.applications || []);
    };

    const fetchAbuseReports = async () => {
        const res = await API.get("/companies/me/abuse-reports");
        setAbuseReports(res.data || []);
    };

    const handleResumeView = async (application: any) => {
        setResumeUrl(application?.resume || null);
        if (!application?._id) return;
        // Only auto-mark as reviewed when still in the applied state to avoid downgrading later stages.
        if (application.status !== "applied") return;
        try {
            await API.put(`/companies/me/applicants/${application._id}/status`, {
                status: "reviewed",
            });
            setApplicants((prev) =>
                prev.map((item) =>
                    item._id === application._id ? { ...item, status: "reviewed" } : item
                )
            );
        } catch (err) {
            console.error("Failed to auto-mark application as reviewed", err);
        }
    };

    useEffect(() => {
        const loadBaseData = async () => {
            try {
                const [dashboardRes, jobsRes] = await Promise.all([
                    API.get("/companies/me/dashboard"),
                    API.get("/companies/me/jobs"),
                ]);
                setData(dashboardRes.data);
                setCompanyJobs(jobsRes.data.jobs || []);
            } catch (err) {
                console.error(err);
            }
        };
        loadBaseData();
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchDashboard(),
                    fetchApplicants(),
                    fetchAbuseReports(),
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleEditJob = (jobId: string) => {
        setSelectedJobId(jobId);
        setShowEditJobModal(true);
    };

    const handleJobUpdated = () => {
        API.get("/companies/me/jobs").then((res) =>
            setCompanyJobs(res.data.jobs || [])
        );
    };

    const handleAbuseResponse = async () => {
        if (!selectedAbuseReport || !companyResponse.trim()) return;

        try {
            await API.put(`/companies/me/abuse-reports/${selectedAbuseReport._id}`, {
                companyResponse: companyResponse.trim(),
            });
            toast.success("Response submitted successfully");
            setShowAbuseResponseModal(false);
            setSelectedAbuseReport(null);
            setCompanyResponse("");
            fetchAbuseReports();
        } catch (err: any) {
            console.error("Failed to submit response", err);
            toast.error(err.response?.data?.message || "Failed to submit response");
        }
    };

    const openAbuseResponseModal = (report: any) => {
        setSelectedAbuseReport(report);
        setCompanyResponse(report.companyResponse || "");
        setShowAbuseResponseModal(true);
    };

    if (loading)
        return (
            <div className="text-gray-500 text-center py-10 text-sm sm:text-base">
                Loading dashboard...
            </div>
        );

    if (!data)
        return (
            <div className="text-red-500 text-center py-10 text-sm sm:text-base">
                Failed to load dashboard
            </div>
        );

    return (
        <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto px-3 sm:px-4 lg:px-0">
            {/* ====== STAT CARDS ====== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                <StatCard title="Employees" value={data.employeesCount} />
                <StatCard title="Jobs Posted" value={data.totalJobs} />
                <StatCard title="Applicants" value={data.totalApplicants} />
                <StatCard title="Total Hired" value={data.totalHired} />
                <StatCard title="Active Jobs" value={data.activeJobs} />
                <StatCard title="Expired Jobs" value={data.expiredJobs} />
                <div className="bg-white border rounded-lg p-3 sm:p-4 md:p-5 shadow-sm flex flex-col justify-center text-center sm:text-left">
                    <div className="text-[11px] sm:text-xs md:text-sm text-gray-500">
                        Terms Accepted
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mt-1">
                        {company?.termsAccepted ? "Yes" : "No"}
                    </div>
                </div>
            </div>

            {/* ====== JOB LIST WITH EXPIRY BADGES ====== */}
            <div className="bg-white border rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                        My Job Listings
                    </h2>
                </div>

                {companyJobs.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 text-sm">
                        No jobs found.
                    </p>
                ) : (
                    <>
                        {/* Mobile: Card view */}
                        <div className="space-y-3 sm:hidden">
                            {companyJobs.map((job) => {
                                let expDate: Date | null = null;
                                let daysLeft: number | null = null;

                                if (job.expiresAt) {
                                    expDate = new Date(job.expiresAt);
                                    daysLeft = Math.ceil(
                                        (expDate.getTime() - Date.now()) /
                                        (1000 * 60 * 60 * 24)
                                    );
                                }

                                let badgeClass =
                                    "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20";
                                let badgeText = "No Expiry";

                                if (job.expiresAt) {
                                    badgeClass =
                                        "bg-green-50 text-green-700 ring-1 ring-green-600/20";
                                    badgeText = "Active";

                                    if (
                                        (daysLeft !== null &&
                                            daysLeft <= 0) ||
                                        job.isExpired
                                    ) {
                                        badgeClass =
                                            "bg-red-50 text-red-700 ring-1 ring-red-600/20";
                                        badgeText = "Expired";
                                    } else if (
                                        daysLeft !== null &&
                                        daysLeft <= 7
                                    ) {
                                        badgeClass =
                                            "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20";
                                        badgeText = `Expiring Soon (${daysLeft}d)`;
                                    }
                                }

                                const applicantsCount = applicants.filter(
                                    (a) => a.job?._id === job._id
                                ).length;

                                return (
                                    <div
                                        key={job._id}
                                        className="border rounded-lg p-3 bg-white shadow-xs"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="font-medium text-gray-900 text-sm">
                                                {job.title}
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeClass}`}
                                            >
                                                {badgeText}
                                            </span>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                                            <div>
                                                <div className="font-semibold text-gray-700">
                                                    Expires
                                                </div>
                                                <div className="text-blue-600">
                                                    {job.expiresAt
                                                        ? new Date(
                                                            job.expiresAt
                                                        ).toLocaleDateString()
                                                        : "N/A"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-700">
                                                    Status
                                                </div>
                                                <div className="capitalize">
                                                    {job.status}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-700">
                                                    Applicants
                                                </div>
                                                <div>{applicantsCount}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleEditJob(job._id)
                                            }
                                            className="mt-3 inline-flex items-center text-[11px] font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            Edit Job
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tablet / Desktop: Table view */}
                        <div className="hidden sm:block">
                            <div className="overflow-x-auto">
                                <table className="min-w-full w-full text-xs sm:text-sm border-t">
                                    <thead className="bg-gray-50 text-gray-600 border-b">
                                        <tr>
                                            <th className="p-2 sm:p-3 text-left">
                                                Title
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Expires On
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Status
                                            </th>
                                            <th className="p-2 sm:p-3 text-left hidden md:table-cell">
                                                Expiry State
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Applicants
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companyJobs.map((job) => {
                                            let expDate: Date | null = null;
                                            let daysLeft: number | null = null;

                                            if (job.expiresAt) {
                                                expDate = new Date(
                                                    job.expiresAt
                                                );
                                                daysLeft = Math.ceil(
                                                    (expDate.getTime() -
                                                        Date.now()) /
                                                    (1000 *
                                                        60 *
                                                        60 *
                                                        24)
                                                );
                                            }

                                            let badgeClass =
                                                "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20";
                                            let badgeText = "No Expiry";

                                            if (job.expiresAt) {
                                                badgeClass =
                                                    "bg-green-50 text-green-700 ring-1 ring-green-600/20";
                                                badgeText = "Active";

                                                if (
                                                    (daysLeft !== null &&
                                                        daysLeft <= 0) ||
                                                    job.isExpired
                                                ) {
                                                    badgeClass =
                                                        "bg-red-50 text-red-700 ring-1 ring-red-600/20";
                                                    badgeText = "Expired";
                                                } else if (
                                                    daysLeft !== null &&
                                                    daysLeft <= 7
                                                ) {
                                                    badgeClass =
                                                        "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20";
                                                    badgeText = `Expiring Soon (${daysLeft}d)`;
                                                }
                                            }

                                            return (
                                                <tr
                                                    key={job._id}
                                                    className="border-b hover:bg-gray-50 transition"
                                                >
                                                    <td className="p-2 sm:p-3 font-medium text-gray-900 max-w-[220px] truncate">
                                                        {job.title}
                                                    </td>
                                                    <td className="p-2 sm:p-3 text-gray-600 font-semibold text-blue-600">
                                                        {job.expiresAt
                                                            ? new Date(
                                                                job.expiresAt
                                                            ).toLocaleDateString()
                                                            : "N/A"}
                                                    </td>
                                                    <td className="p-2 sm:p-3 capitalize text-gray-600">
                                                        {job.status}
                                                    </td>
                                                    <td className="p-2 sm:p-3 hidden md:table-cell">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium ${badgeClass}`}
                                                        >
                                                            {badgeText}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 sm:p-3 text-gray-600">
                                                        {
                                                            applicants.filter(
                                                                (a) =>
                                                                    a.job?._id ===
                                                                    job._id
                                                            ).length
                                                        }
                                                    </td>
                                                    <td className="p-2 sm:p-3">
                                                        <button
                                                            onClick={() =>
                                                                handleEditJob(
                                                                    job._id
                                                                )
                                                            }
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Edit Job"
                                                        >
                                                            <svg
                                                                className="w-5 h-5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ====== APPLICANTS TABLE ====== */}
            <div className="bg-white border rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-gray-800">
                    Recent Applicants
                </h2>

                {applicants.length === 0 ? (
                    <div className="text-gray-500 text-center py-6 text-sm">
                        No applicants yet.
                    </div>
                ) : (
                    <>
                        {/* Mobile: Card view */}
                        <div className="space-y-3 sm:hidden">
                            {applicants.map((a) => (
                                <div
                                    key={a._id}
                                    className="border rounded-lg p-3 bg-white shadow-xs text-[11px]"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={a.user?.profilePhoto}
                                            alt={a.user?.name || "Applicant"}
                                            className="w-9 h-9 rounded-full ring-1 ring-gray-200"
                                        />
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-900 text-sm truncate">
                                                {a.user?.name}
                                            </div>
                                            <div className="text-[11px] text-gray-500 truncate">
                                                {a.user?.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-1 text-gray-600">
                                        <div>
                                            <span className="font-semibold">
                                                Job:
                                            </span>{" "}
                                            {a.job?.title}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Applied:
                                            </span>{" "}
                                            {new Date(
                                                a.createdAt
                                            ).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">
                                                Status:
                                            </span>
                                            <ApplicationStatusDropdown
                                                id={a._id}
                                                currentStatus={a.status}
                                                onUpdated={fetchApplicants}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-4 text-[11px] font-medium">
                                        <button
                                            className="text-blue-600 hover:underline"
                                            onClick={() => handleResumeView(a)}
                                        >
                                            View Resume
                                        </button>
                                        <button
                                            className="text-blue-600 hover:underline"
                                            onClick={() =>
                                                setSelectedApplicant(a)
                                            }
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tablet / Desktop: Table view */}
                        <div className="hidden sm:block">
                            <div className="overflow-x-auto">
                                <table className="min-w-full w-full text-xs sm:text-sm border-t">
                                    <thead className="bg-gray-50 text-gray-600 border-b">
                                        <tr>
                                            <th className="p-2 sm:p-3 text-left">
                                                Candidate
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Job Title
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Status
                                            </th>
                                            <th className="p-2 sm:p-3 text-left hidden md:table-cell">
                                                Applied On
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Resume
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Details
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicants.map((a) => (
                                            <tr
                                                key={a._id}
                                                className="border-b hover:bg-gray-50 transition"
                                            >
                                                <td className="p-2 sm:p-3">
                                                    <div className="flex items-center gap-3 min-w-[180px]">
                                                        <Avatar
                                                            src={a.user?.profilePhoto}
                                                            alt={a.user?.name || "Applicant"}
                                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-1 ring-gray-200"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900 text-sm">
                                                                {a.user?.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 max-w-[180px] truncate">
                                                                {a.user?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-2 sm:p-3 max-w-[200px] truncate">
                                                    {a.job?.title}
                                                </td>
                                                <td className="p-2 sm:p-3">
                                                    <ApplicationStatusDropdown
                                                        id={a._id}
                                                        currentStatus={
                                                            a.status
                                                        }
                                                        onUpdated={
                                                            fetchApplicants
                                                        }
                                                    />
                                                </td>
                                                <td className="p-2 sm:p-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                                                    {new Date(
                                                        a.createdAt
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td
                                                    className="p-2 sm:p-3 text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
                                                    onClick={() => handleResumeView(a)}
                                                >
                                                    View Resume
                                                </td>
                                                <td
                                                    className="p-2 sm:p-3 text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
                                                    onClick={() =>
                                                        setSelectedApplicant(a)
                                                    }
                                                >
                                                    View Details
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ====== REPORTED ABUSES TABLE ====== */}
            <div className="bg-white border rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-gray-800">
                    Reported Abuses
                </h2>

                {abuseReports.length === 0 ? (
                    <div className="text-gray-500 text-center py-6 text-sm">
                        No abuse reports found.
                    </div>
                ) : (
                    <>
                        {/* Mobile: Card view */}
                        <div className="space-y-3 sm:hidden">
                            {abuseReports.map((report) => (
                                <div
                                    key={report._id}
                                    className="border rounded-lg p-3 bg-white shadow-xs text-[11px]"
                                >
                                    <div className="font-medium text-gray-900 text-sm">
                                        {report.job?.title || "N/A"}
                                    </div>
                                    <div className="mt-2 space-y-1 text-gray-600">
                                        <div>
                                            <span className="font-semibold">
                                                Reported By:
                                            </span>{" "}
                                            {report.reportedBy?.name ||
                                                "Anonymous"}
                                        </div>
                                        {report.reportedBy?.email && (
                                            <div className="text-gray-500 truncate">
                                                {report.reportedBy.email}
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-semibold">
                                                Reason:
                                            </span>{" "}
                                            {report.reason}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Reported On:
                                            </span>{" "}
                                            {new Date(
                                                report.createdAt
                                            ).toLocaleDateString()}
                                        </div>
                                        <div className="mt-1">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${report.status === "pending"
                                                        ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20"
                                                        : report.status ===
                                                            "reviewed"
                                                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                                                            : "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                                                    }`}
                                            >
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tablet / Desktop: Table view */}
                        <div className="hidden sm:block">
                            <div className="overflow-x-auto">
                                <table className="min-w-full w-full text-xs sm:text-sm border-t">
                                    <thead className="bg-gray-50 text-gray-600 border-b">
                                        <tr>
                                            <th className="p-2 sm:p-3 text-left">
                                                Job Title
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Reported By
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Reason
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Status
                                            </th>
                                            <th className="p-2 sm:p-3 text-left hidden md:table-cell">
                                                Reported On
                                            </th>
                                            <th className="p-2 sm:p-3 text-left">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {abuseReports.map((report) => (
                                            <tr
                                                key={report._id}
                                                className="border-b hover:bg-gray-50 transition"
                                            >
                                                <td className="p-2 sm:p-3 font-medium text-gray-900 max-w-[220px] truncate">
                                                    {report.job?.title || "N/A"}
                                                </td>
                                                <td className="p-2 sm:p-3">
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-sm">
                                                            {report
                                                                .reportedBy
                                                                ?.name ||
                                                                "Anonymous"}
                                                        </div>
                                                        <div className="text-xs text-gray-500 max-w-[180px] truncate">
                                                            {
                                                                report
                                                                    .reportedBy
                                                                    ?.email
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-2 sm:p-3 capitalize text-gray-600 max-w-[260px] truncate">
                                                    {report.reason}
                                                </td>
                                                <td className="p-2 sm:p-3">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium ${report.status ===
                                                                "pending"
                                                                ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20"
                                                                : report.status ===
                                                                    "reviewed"
                                                                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                                                                    : "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                                                            }`}
                                                    >
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="p-2 sm:p-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                                                    {new Date(
                                                        report.createdAt
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="p-2 sm:p-3">
                                                    <button
                                                        onClick={() => openAbuseResponseModal(report)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        {report.companyResponse ? "Update Response" : "Respond"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ====== MODALS ====== */}
            {resumeUrl && (
                <ViewResumeModal
                    resumeUrl={resumeUrl}
                    onClose={() => setResumeUrl(null)}
                />
            )}

            {selectedApplicant && (
                <ApplicantDetailsModal
                    applicant={selectedApplicant}
                    onClose={() => setSelectedApplicant(null)}
                />
            )}

            {showEditJobModal && selectedJobId && (
                <EditJobModal
                    jobId={selectedJobId}
                    onClose={() => setShowEditJobModal(false)}
                    onJobUpdated={handleJobUpdated}
                />
            )}

            {showEditCompanyModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-3">
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Edit Company Details
                            </h2>
                            <button
                                onClick={() => setShowEditCompanyModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <CompanyForm
                            mode="self"
                            onSuccess={() => {
                                setShowEditCompanyModal(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {showAbuseResponseModal && selectedAbuseReport && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-3">
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Respond to Abuse Report
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAbuseResponseModal(false);
                                    setSelectedAbuseReport(null);
                                    setCompanyResponse("");
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Report Details</h3>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                <p><strong>Job:</strong> {selectedAbuseReport.job?.title}</p>
                                <p><strong>Reported By:</strong> {selectedAbuseReport.reportedBy?.name || "Anonymous"}</p>
                                <p><strong>Reason:</strong> {selectedAbuseReport.reason}</p>
                                <p><strong>Description:</strong> {selectedAbuseReport.description}</p>
                                <p><strong>Status:</strong> {selectedAbuseReport.status}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Response *
                            </label>
                            <textarea
                                value={companyResponse}
                                onChange={(e) => setCompanyResponse(e.target.value)}
                                placeholder="Provide your response to this abuse report..."
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={6}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAbuseResponseModal(false);
                                    setSelectedAbuseReport(null);
                                    setCompanyResponse("");
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAbuseResponse}
                                disabled={!companyResponse.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Response
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyDashboard;

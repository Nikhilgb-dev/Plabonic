// UserDashboard.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import API from "@/api/api";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2, Eye, ExternalLink } from "lucide-react";
import JobDetailsModal from "@/components/JobDetailsModal";
import FreelancerApplicationDetailsModal from "@/components/FreelancerApplicationDetailsModal";
import OfferDetailsModal from "@/components/OfferDetailsModal";
import FeedbackButton from "@/components/FeedbackButton";
import ApplyModal from "@/components/ApplyModal";
import toast from "react-hot-toast";

type AnyObj = Record<string, any>;

const StatCard = ({ title, value }: { title: string; value: number }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <p className="text-xs sm:text-sm text-gray-500">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{value}</h3>
    </div>
);

/** Small utility to render readable date consistently */
const formatDate = (d?: string | number) => {
    if (!d) return "-";
    try {
        return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return "-";
    }
};

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-gray-500 py-6 text-center">{message}</div>
);

/** Mobile card for job application */
const JobAppCard = ({ a, onView, onWithdraw, onViewOffer }: { a: AnyObj; onView: (j: AnyObj) => void; onWithdraw: (id: string) => void; onViewOffer: (app: AnyObj, type: "job") => void }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
    >
        <div className="flex justify-between items-start gap-3">
            <div>
                <div className="text-sm font-semibold text-gray-900">{a.job?.title || "—"}</div>
                <div className="text-xs text-gray-500">{a.job?.company?.name || "—"}</div>
            </div>

            <div className="text-right">
                <div className="text-xs text-gray-500">{formatDate(a.createdAt || a.appliedAt)}</div>
                {a.status === "interview" && (
                    <div className="mt-1 text-xs text-gray-600">
                        {a.job?.company?.email && <div>Email: {a.job.company.email}</div>}
                        {a.job?.company?.contactNumber && <div>Phone: {a.job.company.contactNumber}</div>}
                    </div>
                )}
                <div className="mt-2">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "hired"
                            ? "bg-green-100 text-green-800"
                            : a.status === "accepted"
                                ? "bg-blue-100 text-blue-800"
                                : a.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {a.status || "applied"}
                    </span>
                    {a.status === "rejected" && a.rejectionReason && (
                        <div className="mt-1 text-xs text-red-600">
                            Reason: {a.rejectionReason}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-3 flex gap-2">
            {a.status === "hired" ? (
                <>
                    <button
                        onClick={() => onViewOffer(a, "job")}
                        aria-label="View job offer details"
                        className="flex-1 text-sm px-3 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                    >
                        <Eye className="w-4 h-4 inline-block mr-2" /> View Offer
                    </button>
                    <button
                        onClick={() => onWithdraw(a._id)}
                        aria-label="Withdraw application"
                        className="text-sm px-3 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 className="w-4 h-4 inline-block mr-2" /> Withdraw
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => onView(a.job)}
                        aria-label={`View job ${a.job?.title || ""}`}
                        className="flex-1 text-sm px-3 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                    >
                        <Eye className="w-4 h-4 inline-block mr-2" /> View
                    </button>
                    <button
                        onClick={() => onWithdraw(a._id)}
                        aria-label="Withdraw application"
                        className="text-sm px-3 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 className="w-4 h-4 inline-block mr-2" /> Withdraw
                    </button>
                </>
            )}
        </div>
    </motion.div>
);

/** Mobile card for freelancer application */
const FreelancerAppCard = ({ a, onView, onWithdraw, onViewOffer }: { a: AnyObj; onView: (app: AnyObj) => void; onWithdraw: (id: string) => void; onViewOffer: (app: AnyObj, type: "freelancer") => void }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
    >
        <div className="flex justify-between items-start gap-3">
            <div>
                <div className="text-sm font-semibold text-gray-900">{a.freelancer?.name || "—"}</div>
                <div className="text-xs text-gray-500">{a.freelancer?.qualification || a.serviceTitle || "—"}</div>
            </div>

            <div className="text-right">
                <div className="text-xs text-gray-500">{formatDate(a.appliedAt || a.createdAt)}</div>
                {a.status === "shortlisted" && (
                    <div className="mt-1 text-xs text-gray-600">
                        {a.freelancer?.email && <div>Email: {a.freelancer.email}</div>}
                        {a.freelancer?.contact && <div>Phone: {a.freelancer.contact}</div>}
                    </div>
                )}
                <div className="mt-2">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "hired"
                            ? "bg-green-100 text-green-800"
                            : a.status === "accepted"
                                ? "bg-blue-100 text-blue-800"
                                : a.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {a.status || "applied"}
                    </span>
                    {a.status === "rejected" && a.rejectionReason && (
                        <div className="mt-1 text-xs text-red-600">
                            Reason: {a.rejectionReason}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-3 flex gap-2">
            {a.status === "hired" ? (
                <>
                    <button
                        onClick={() => onViewOffer(a, "freelancer")}
                        aria-label="View freelancer offer details"
                        className="flex-1 text-sm px-3 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                    >
                        <Eye className="w-4 h-4 inline-block mr-2" /> View Offer
                    </button>
                    <button
                        onClick={() => onWithdraw(a._id)}
                        aria-label="Withdraw freelancer application"
                        className="text-sm px-3 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 className="w-4 h-4 inline-block mr-2" /> Withdraw
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => onView(a)}
                        aria-label="View freelancer application"
                        className="flex-1 text-sm px-3 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                    >
                        <Eye className="w-4 h-4 inline-block mr-2" /> View
                    </button>
                    <button
                        onClick={() => onWithdraw(a._id)}
                        aria-label="Withdraw freelancer application"
                        className="text-sm px-3 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 className="w-4 h-4 inline-block mr-2" /> Withdraw
                    </button>
                </>
            )}
        </div>
    </motion.div>
);

const UserDashboard: React.FC = () => {
    const [applications, setApplications] = useState<AnyObj[]>([]);
    const [freelancerApplications, setFreelancerApplications] = useState<AnyObj[]>([]);
    const [savedJobs, setSavedJobs] = useState<AnyObj[]>([]);
    const [notifications, setNotifications] = useState<AnyObj[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<AnyObj | null>(null);
    const [selectedFreelancerApplication, setSelectedFreelancerApplication] = useState<AnyObj | null>(null);
    const [selectedOffer, setSelectedOffer] = useState<{ application: AnyObj; type: "job" | "freelancer" } | null>(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyJobId, setApplyJobId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<AnyObj | null>(null);

    // Fetchers
    const fetchApplications = useCallback(async () => {
        const res = await API.get("/applications/me");
        // defensive: handle possible shapes
        const apps = res.data?.applications ?? res.data ?? [];
        setApplications(Array.isArray(apps) ? apps : []);
    }, []);

    const fetchFreelancerApplications = useCallback(async () => {
        const res = await API.get("/freelancers/me/applications");
        setFreelancerApplications(Array.isArray(res.data) ? res.data : res.data?.applications ?? []);
    }, []);

    const fetchSavedJobs = useCallback(async () => {
        try {
            const res = await API.get("/users/saved-jobs");
            const data = Array.isArray(res.data) ? res.data : res.data?.savedJobs;
            setSavedJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load saved jobs", err);
            setSavedJobs([]);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        const res = await API.get("/notifications");
        setNotifications(Array.isArray(res.data) ? res.data : res.data?.notifications ?? []);
    }, []);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const res = await API.get("/users/me");
            setCurrentUser(res.data);
        } catch (err) {
            setCurrentUser(null);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchApplications(), fetchFreelancerApplications(), fetchSavedJobs(), fetchNotifications(), fetchCurrentUser()]);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll to hash after loading
    useEffect(() => {
        if (!loading) {
            const hash = window.location.hash;
            if (hash) {
                const element = document.getElementById(hash.substring(1));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }, [loading]);

    const withdrawApplication = async (id: string) => {
        if (!window.confirm("Withdraw this application?")) return;
        await API.delete(`/applications/${id}`);
        await fetchApplications();
    };

    const withdrawFreelancerApplication = async (id: string) => {
        if (!window.confirm("Withdraw this freelancer application?")) return;
        await API.delete(`/freelancers/applications/${id}`);
        await fetchFreelancerApplications();
    };

    const respondToJobOffer = async (applicationId: string, action: "accept" | "reject") => {
        if (!window.confirm(`Are you sure you want to ${action} this job offer?`)) return;
        await API.put(`/applications/${applicationId}/respond`, { action });
        await fetchApplications();
        setSelectedOffer(null);
    };

    const respondToFreelancerOffer = async (applicationId: string, action: "accept" | "reject") => {
        if (!window.confirm(`Are you sure you want to ${action} this freelancer offer?`)) return;
        await API.put(`/freelancers/applications/${applicationId}/respond`, { action });
        await fetchFreelancerApplications();
        setSelectedOffer(null);
    };

    const unsaveJob = async (jobId: string) => {
        if (!window.confirm("Remove this job from saved jobs?")) return;
        await API.delete(`/users/jobs/${jobId}/save`);
        await fetchSavedJobs();
    };
    const startApply = (jobId?: string) => {
        if (!jobId) return;
        if (currentUser?.blocked) {
            toast.error("Your account is blocked. Please contact admin.");
            return;
        }
        setApplyJobId(jobId);
        setShowApplyModal(true);
    };

    // memoized stats so re-renders don't recompute
    const stats = useMemo(() => {
        const jobApplications = applications.length;
        const freelanceApps = freelancerApplications.length;
        const savedJobsCount = savedJobs.length;
        const totalApplications = jobApplications + freelanceApps;
        const hired = (applications.filter((a) => a.status === "hired") || []).length;
        const interview = (applications.filter((a) => a.status === "interview") || []).length;
        const rejected = (applications.filter((a) => a.status === "rejected") || []).length;
        return { jobApplications, freelanceApps, savedJobsCount, totalApplications, hired, interview, rejected };
    }, [applications, freelancerApplications, savedJobs]);

    // granular job-application pipeline counts for candidate view
    const statusCounts = useMemo(() => {
        const counts = {
            applied: 0,
            reviewed: 0,
            interview: 0,
            offer: 0,
            hired: 0,
            accepted: 0,
            rejected: 0,
            denied: 0,
        };
        applications.forEach((a) => {
            const status = (a.status || "applied").toLowerCase();
            if (status === "accepted") counts.accepted += 1;
            if (status === "rejected") counts.denied += 1;
            if (status in counts) counts[status as keyof typeof counts] += 1;
            else counts.applied += 1;
        });
        return counts;
    }, [applications]);

    const firstHiredApplication = useMemo(
        () => applications.find((a) => (a.status || "").toLowerCase() === "hired") || null,
        [applications]
    );

    if (loading) return <div className="text-gray-500 p-6">Loading...</div>;

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Dashboard</h1>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard title="Total Applications" value={stats.totalApplications} />
                <StatCard title="Job Applications" value={stats.jobApplications} />
                <StatCard title="Freelancer Applications" value={stats.freelanceApps} />
                <StatCard title="Saved Jobs" value={stats.savedJobsCount} />
                <StatCard title="Hired" value={stats.hired} />
            </div>

            {/* Profile Overview */}
            {currentUser && (
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">My Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentUser.name && <div><strong>Name:</strong> {currentUser.name}</div>}
                        {currentUser.email && <div><strong>Email:</strong> {currentUser.email}</div>}
                        {currentUser.phone && <div><strong>Phone:</strong> {currentUser.phone}</div>}
                        {currentUser.whatsappNumber && <div><strong>WhatsApp:</strong> {currentUser.whatsappNumber}</div>}
                        {currentUser.dateOfBirth && <div><strong>Date of Birth:</strong> {new Date(currentUser.dateOfBirth).toLocaleDateString()}</div>}
                        {currentUser.gender && <div><strong>Gender:</strong> {currentUser.gender}</div>}
                        {currentUser.currentLocation && <div><strong>Current Location:</strong> {currentUser.currentLocation}</div>}
                        {currentUser.preferredJobLocation && <div><strong>Preferred Job Location:</strong> {currentUser.preferredJobLocation}</div>}
                        {currentUser.educationalQualification && <div><strong>Educational Qualification:</strong> {currentUser.educationalQualification}</div>}
                        {currentUser.yearOfGraduation && <div><strong>Year of Graduation:</strong> {currentUser.yearOfGraduation}</div>}
                        {currentUser.workExperienceYears && <div><strong>Work Experience (Years):</strong> {currentUser.workExperienceYears}</div>}
                        {currentUser.currentEmployer && <div><strong>Current Employer:</strong> {currentUser.currentEmployer}</div>}
                        {currentUser.currentDesignation && <div><strong>Current Designation:</strong> {currentUser.currentDesignation}</div>}
                        {currentUser.noticePeriod && <div><strong>Notice Period:</strong> {currentUser.noticePeriod}</div>}
                        {currentUser.currentSalary && <div><strong>Current Salary:</strong> ₹{currentUser.currentSalary.toLocaleString()}</div>}
                        {currentUser.expectedSalary && <div><strong>Expected Salary:</strong> ₹{currentUser.expectedSalary.toLocaleString()}</div>}
                        {currentUser.technicalSkills && currentUser.technicalSkills.length > 0 && <div><strong>Technical Skills:</strong> {currentUser.technicalSkills.join(", ")}</div>}
                        {currentUser.softSkills && currentUser.softSkills.length > 0 && <div><strong>Soft Skills:</strong> {currentUser.softSkills.join(", ")}</div>}
                        {currentUser.interestedSkills && currentUser.interestedSkills.length > 0 && <div><strong>Interested Skills:</strong> {currentUser.interestedSkills.join(", ")}</div>}
                        {currentUser.certifications && currentUser.certifications.length > 0 && <div><strong>Certifications:</strong> {currentUser.certifications.join(", ")}</div>}
                        {currentUser.languagesKnown && currentUser.languagesKnown.length > 0 && <div><strong>Languages Known:</strong> {currentUser.languagesKnown.join(", ")}</div>}
                        {currentUser.projects && currentUser.projects.length > 0 && <div><strong>Projects:</strong> {currentUser.projects.length} project(s)</div>}
                        {currentUser.resume && <div><strong>Resume:</strong> Uploaded</div>}
                        {currentUser.about && <div><strong>About:</strong> {currentUser.about}</div>}
                        {currentUser.headline && <div><strong>Headline:</strong> {currentUser.headline}</div>}
                        {currentUser.description && <div><strong>Description:</strong> {currentUser.description}</div>}
                        {currentUser.location && <div><strong>Location:</strong> {currentUser.location}</div>}
                        {currentUser.website && <div><strong>Website:</strong> {currentUser.website}</div>}
                        {currentUser.socialLinks?.linkedin && <div><strong>LinkedIn:</strong> {currentUser.socialLinks.linkedin}</div>}
                        {currentUser.socialLinks?.github && <div><strong>GitHub:</strong> {currentUser.socialLinks.github}</div>}
                        {currentUser.socialLinks?.twitter && <div><strong>Twitter:</strong> {currentUser.socialLinks.twitter}</div>}
                        {currentUser.skills && currentUser.skills.length > 0 && <div><strong>Skills:</strong> {currentUser.skills.join(", ")}</div>}
                        {currentUser.experience && currentUser.experience.length > 0 && <div><strong>Experience:</strong> {currentUser.experience.length} entry(ies)</div>}
                        {currentUser.education && currentUser.education.length > 0 && <div><strong>Education:</strong> {currentUser.education.length} entry(ies)</div>}
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => window.location.href = "/settings"}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Edit Profile
                        </button>
                    </div>
                </section>
            )}

            {/* Application status pipeline */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Application Status Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                    <StatCard title="Applied" value={statusCounts.applied} />
                    <StatCard title="Reviewed" value={statusCounts.reviewed} />
                    <StatCard title="Interview Call" value={statusCounts.interview} />
                    <StatCard title="Job Offer" value={statusCounts.offer} />
                    <StatCard title="Rejected" value={statusCounts.rejected} />
                    <StatCard title="Offer Accepted" value={statusCounts.accepted} />
                    <StatCard title="Offer Denied" value={statusCounts.denied} />
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
                        <p className="text-xs sm:text-sm text-gray-500">Hired</p>
                    </div>
                </div>
            </section>

            {/* Applications block */}
            <section id="applications" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">My Applications</h2>

                {/* MOBILE: card list */}
                <div className="space-y-3 md:hidden">
                    {applications.length === 0 ? (
                        <EmptyState message="You haven’t applied to any jobs yet." />
                    ) : (
                        applications.map((a) => (
                            <JobAppCard
                                key={a._id}
                                a={a}
                                onView={(j) => setSelectedJob(j)}
                                onWithdraw={withdrawApplication}
                                onViewOffer={(app, type) => setSelectedOffer({ application: app, type })}
                            />
                        ))
                    )}
                </div>

                {/* DESKTOP / TABLET: table view */}
                <div className="hidden md:block overflow-x-auto">
                    {applications.length === 0 ? (
                        <EmptyState message="You haven’t applied to any jobs yet." />
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="p-3 text-left">Job Title</th>
                                    <th className="p-3 text-left">Company</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Applied On</th>
                                    <th className="p-3 text-left">Contact Details</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((a) => (
                                    <tr key={a._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{a.job?.title || "—"}</td>
                                        <td className="p-3">{a.job?.company?.name || "—"}</td>
                                        <td className="p-3 capitalize">
                                            {a.status === "hired" ? (
                                                <CheckCircle className="w-4 h-4 text-green-600 inline-block mr-1" />
                                            ) : a.status === "accepted" ? (
                                                <CheckCircle className="w-4 h-4 text-blue-600 inline-block mr-1" />
                                            ) : a.status === "rejected" ? (
                                                <XCircle className="w-4 h-4 text-red-600 inline-block mr-1" />
                                            ) : null}
                                            {a.status || "applied"}
                                            {a.status === "rejected" && a.rejectionReason && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Reason: {a.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-gray-500">{formatDate(a.createdAt || a.appliedAt)}</td>
                                        <td className="p-3 text-gray-500">
                                            {a.status === "interview" && (
                                                <div className="text-xs">
                                                    {a.job?.company?.email && <div>Email: {a.job.company.email}</div>}
                                                    {a.job?.company?.contactNumber && <div>Phone: {a.job.company.contactNumber}</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-right space-x-3">
                                            {a.status === "hired" ? (
                                                <>
                                                    <button onClick={() => setSelectedOffer({ application: a, type: "job" })} className="text-blue-600 hover:underline text-sm inline-flex items-center">
                                                        <Eye className="w-4 h-4 inline-block mr-1" /> View Offer
                                                    </button>
                                                    <button onClick={() => withdrawApplication(a._id)} className="text-red-600 hover:underline text-sm inline-flex items-center">
                                                        <Trash2 className="w-4 h-4 inline-block mr-1" /> Withdraw
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => setSelectedJob(a.job)} className="text-blue-600 hover:underline text-sm inline-flex items-center">
                                                        <Eye className="w-4 h-4 inline-block mr-1" /> View
                                                    </button>
                                                    <button onClick={() => withdrawApplication(a._id)} className="text-red-600 hover:underline text-sm inline-flex items-center">
                                                        <Trash2 className="w-4 h-4 inline-block mr-1" /> Withdraw
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Freelancer Applications block */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">My Freelancer Applications</h2>

                {/* MOBILE */}
                <div className="space-y-3 md:hidden">
                    {freelancerApplications.length === 0 ? (
                        <EmptyState message="You haven't applied to any freelancer services yet." />
                    ) : (
                        freelancerApplications.map((a) => (
                            <FreelancerAppCard
                                key={a._id}
                                a={a}
                                onView={(app) => setSelectedFreelancerApplication(app)}
                                onWithdraw={withdrawFreelancerApplication}
                                onViewOffer={(app, type) => setSelectedOffer({ application: app, type })}
                            />
                        ))
                    )}
                </div>

                {/* DESKTOP / TABLET */}
                <div className="hidden md:block overflow-x-auto">
                    {freelancerApplications.length === 0 ? (
                        <EmptyState message="You haven't applied to any freelancer services yet." />
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="p-3 text-left">Freelancer</th>
                                    <th className="p-3 text-left">Service</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Applied On</th>
                                    <th className="p-3 text-left">Contact Details</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {freelancerApplications.map((a) => (
                                    <tr key={a._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{a.freelancer?.name || "—"}</td>
                                        <td className="p-3">{a.freelancer?.qualification || a.serviceTitle || "—"}</td>
                                        <td className="p-3 capitalize">
                                            {a.status === "hired" ? (
                                                <CheckCircle className="w-4 h-4 text-green-600 inline-block mr-1" />
                                            ) : a.status === "accepted" ? (
                                                <CheckCircle className="w-4 h-4 text-blue-600 inline-block mr-1" />
                                            ) : a.status === "rejected" ? (
                                                <XCircle className="w-4 h-4 text-red-600 inline-block mr-1" />
                                            ) : null}
                                            {a.status || "applied"}
                                            {a.status === "rejected" && a.rejectionReason && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Reason: {a.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-gray-500">{formatDate(a.appliedAt || a.createdAt)}</td>
                                        <td className="p-3 text-gray-500">
                                            {a.status === "shortlisted" && (
                                                <div className="text-xs">
                                                    {a.freelancer?.email && <div>Email: {a.freelancer.email}</div>}
                                                    {a.freelancer?.contact && <div>Phone: {a.freelancer.contact}</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-right space-x-3">
                                            {a.status === "hired" ? (
                                                <>
                                                    <button onClick={() => setSelectedOffer({ application: a, type: "freelancer" })} className="text-blue-600 hover:underline text-sm inline-flex items-center">
                                                        <Eye className="w-4 h-4 inline-block mr-1" /> View Offer
                                                    </button>
                                                    <button onClick={() => withdrawFreelancerApplication(a._id)} className="text-red-600 hover:underline text-sm inline-flex items-center">
                                                        <Trash2 className="w-4 h-4 inline-block mr-1" /> Withdraw
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => setSelectedFreelancerApplication(a)} className="text-blue-600 hover:underline text-sm inline-flex items-center">
                                                        <Eye className="w-4 h-4 inline-block mr-1" /> View
                                                    </button>
                                                    <button onClick={() => withdrawFreelancerApplication(a._id)} className="text-red-600 hover:underline text-sm inline-flex items-center">
                                                        <Trash2 className="w-4 h-4 inline-block mr-1" /> Withdraw
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Saved Jobs block */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Saved Jobs</h2>

                {/* DESKTOP / TABLET */}
                <div className="hidden md:block overflow-x-auto">
                    {savedJobs.length === 0 ? (
                        <EmptyState message="You haven't saved any jobs yet." />
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="p-3 text-left">Job Title</th>
                                    <th className="p-3 text-left">Company</th>
                                    <th className="p-3 text-left">Location</th>
                                    <th className="p-3 text-left">Salary</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedJobs.map((job) => (
                                    <tr key={job._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{job.title || "—"}</td>
                                        <td className="p-3">{job.company?.name || "—"}</td>
                                        <td className="p-3">{job.location || "—"}</td>
                                        <td className="p-3">
                                            {job.minSalary && job.maxSalary
                                                ? `₹${job.minSalary.toLocaleString()} - ₹${job.maxSalary.toLocaleString()}`
                                                : job.minSalary
                                                    ? `From ₹${job.minSalary.toLocaleString()}`
                                                    : job.maxSalary
                                                        ? `Up to ₹${job.maxSalary.toLocaleString()}`
                                                        : "Not specified"
                                            }
                                        </td>
                                        <td className="p-3 text-right space-x-3">
                                            <button onClick={() => setSelectedJob(job)} className="text-blue-600 hover:underline text-sm inline-flex items-center">
                                                <Eye className="w-4 h-4 inline-block mr-1" /> View
                                            </button>
                                            <button
                                                onClick={() => startApply(job._id)}
                                                disabled={!!currentUser?.blocked}
                                                className={`text-blue-600 text-sm inline-flex items-center ${currentUser?.blocked ? "opacity-50 cursor-not-allowed" : "hover:underline"}`}
                                            >
                                                <ExternalLink className="w-4 h-4 inline-block mr-1" /> Apply
                                            </button>
                                            <button onClick={() => unsaveJob(job._id)} className="text-red-600 hover:underline text-sm inline-flex items-center">
                                                <Trash2 className="w-4 h-4 inline-block mr-1" /> Unsave
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* MOBILE: card list */}
                <div className="space-y-3 md:hidden">
                    {savedJobs.length === 0 ? (
                        <EmptyState message="You haven't saved any jobs yet." />
                    ) : (
                        savedJobs.map((job) => (
                            <div key={job._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start gap-3">
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{job.title || "—"}</div>
                                        <div className="text-xs text-gray-500">{job.company?.name || "—"}</div>
                                        <div className="text-xs text-gray-500">{job.location || "—"}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedJob(job)}
                                            aria-label={`View job ${job.title || ""}`}
                                            className="text-sm px-3 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                                        >
                                            <Eye className="w-4 h-4 inline-block mr-2" /> View
                                        </button>
                                        <button
                                            onClick={() => startApply(job._id)}
                                            aria-label="Apply to job"
                                            disabled={!!currentUser?.blocked}
                                            className={`text-sm px-3 py-2 rounded-md border border-blue-600 text-blue-600 transition ${currentUser?.blocked ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-50"}`}
                                        >
                                            <ExternalLink className="w-4 h-4 inline-block mr-2" /> Apply
                                        </button>
                                        <button
                                            onClick={() => unsaveJob(job._id)}
                                            aria-label="Unsave job"
                                            className="text-sm px-3 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50 transition"
                                        >
                                            <Trash2 className="w-4 h-4 inline-block mr-2" /> Unsave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {selectedJob && (
                <JobDetailsModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onApply={(jobId) => startApply(jobId)}
                    isUserBlocked={!!currentUser?.blocked}
                />
            )}

            {selectedFreelancerApplication && (
                <FreelancerApplicationDetailsModal application={selectedFreelancerApplication} onClose={() => setSelectedFreelancerApplication(null)} />
            )}

            {selectedOffer && (
                <OfferDetailsModal
                    isOpen={true}
                    onClose={() => setSelectedOffer(null)}
                    application={selectedOffer.application}
                    type={selectedOffer.type}
                    onAccept={() => {
                        if (selectedOffer.type === "job") {
                            respondToJobOffer(selectedOffer.application._id, "accept");
                        } else {
                            respondToFreelancerOffer(selectedOffer.application._id, "accept");
                        }
                    }}
                    onReject={() => {
                        if (selectedOffer.type === "job") {
                            respondToJobOffer(selectedOffer.application._id, "reject");
                        } else {
                            respondToFreelancerOffer(selectedOffer.application._id, "reject");
                        }
                    }}
                />
            )}

            {showApplyModal && applyJobId && (
                <ApplyModal
                    jobId={applyJobId}
                    onClose={() => {
                        setShowApplyModal(false);
                        setApplyJobId(null);
                    }}
                    onApplied={() => {
                        setShowApplyModal(false);
                        setApplyJobId(null);
                        fetchApplications();
                    }}
                />
            )}

            <FeedbackButton targetType="platform" />
        </div>
    );
};

export default UserDashboard;

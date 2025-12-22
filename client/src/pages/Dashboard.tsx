import React, { useEffect, useState, useMemo, useRef } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import CreateCandidateModal from "../components/CreateCandidateModal";
import EditJobModal from "../components/EditJobModal";
import EditCommunityModal from "../components/EditCommunityModal";
import CreateCompanyModal from "../components/CreateCompanyModal";
import CompanyDetailsModal from "../components/CompanyDetailsModal";
import { motion, AnimatePresence } from "framer-motion";
import ApplicantDetailsModal from "@/components/ApplicantDetailsModal";
import FreelancerList from "./FreelancerList";
import MarketingAdminPanel from "@/components/MarketingAdminPanel";
import AdminJobDetailsModal from "@/components/AdminJobDetailsModal";

import {
  Briefcase,
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  ArrowRight,
  Star,
  Download
} from "lucide-react";
import ApplicationStatusDropdown from "@/components/ApplicationStatusDropdown";
import ViewResumeModal from "@/components/ViewResumeModal";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [abuseReports, setAbuseReports] = useState<any[]>([]);
  const [showCreateCandidateModal, setShowCreateCandidateModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showEditCommunityModal, setShowEditCommunityModal] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [orderFilter, setOrderFilter] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");

  // Filters for Manage Companies
  const [companyNameFilter, setCompanyNameFilter] = useState<string>("");
  const [companyIndustryFilter, setCompanyIndustryFilter] = useState<string>("all");
  const [companyStatusFilter, setCompanyStatusFilter] = useState<string>("all");
  const [companyOrderFilter, setCompanyOrderFilter] = useState<"asc" | "desc">("desc");

  // Filters for Recent Applications
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [appCompanyFilter, setAppCompanyFilter] = useState<string>("all");
  const [appOrderFilter, setAppOrderFilter] = useState<"asc" | "desc">("desc");

  // Filters for Manage Users
  const [userOrderFilter, setUserOrderFilter] = useState<"asc" | "desc">("desc");

  // Filters for Abuse Reports
  const [abuseCompanyFilter, setAbuseCompanyFilter] = useState<string>("all");
  const [abuseStatusFilter, setAbuseStatusFilter] = useState<string>("all");
  const [abuseOrderFilter, setAbuseOrderFilter] = useState<"asc" | "desc">("desc");

  const [exportStartDate, setExportStartDate] = useState<string>("");
  const [exportEndDate, setExportEndDate] = useState<string>("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    employmentType: "Full-time",
    minSalary: undefined as number | undefined,
    maxSalary: undefined as number | undefined,
    company: "",
  });

  const formatNumberInput = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const navigate = useNavigate();


  // ===== Fetch Logged-in User =====
  useEffect(() => {
    API.get("/users/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const fetchUsers = () => API.get("/admin/users").then((res) => setUsers(res.data));
  const fetchCompanies = () => API.get("/companies").then((res) => setCompanies(res.data));

  const fetchApplications = async () => {
    try {
      const res = await API.get("/admin/applications");
      setApplications(res.data.applications);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAbuseReports = async () => {
    try {
      const res = await API.get("/admin/abuse-reports");
      setAbuseReports(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await API.get("/admin/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      if (companyFilter !== "all" && job.company?._id !== companyFilter) return false;
      if (statusFilter === "open" && job.status !== "open") return false;
      if (statusFilter === "pending" && job.isVerified) return false;
      if (statusFilter === "expired") {
        const expDate = job.expiresAt ? new Date(job.expiresAt) : new Date(new Date(job.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
        if (expDate >= new Date()) return false;
      }
      if (verifiedFilter === "pending" && job.isVerified) return false;
      if (verifiedFilter === "verified" && !job.isVerified) return false;
      return true;
    });
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return orderFilter === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    return filtered;
  }, [jobs, companyFilter, orderFilter, statusFilter, verifiedFilter]);

  const filteredCompanies = useMemo(() => {
    let filtered = companies.filter(company => {
      if (companyNameFilter && !company.name.toLowerCase().includes(companyNameFilter.toLowerCase())) return false;
      if (companyIndustryFilter !== "all" && company.industry !== companyIndustryFilter) return false;
      if (companyStatusFilter === "verified" && !company.verified) return false;
      if (companyStatusFilter === "pending" && company.verified) return false;
      return true;
    });
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return companyOrderFilter === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    return filtered;
  }, [companies, companyNameFilter, companyIndustryFilter, companyStatusFilter, companyOrderFilter]);

  const filteredApplications = useMemo(() => {
    let filtered = applications.filter(app => {
      if (appStatusFilter !== "all" && app.status !== appStatusFilter) return false;
      if (appCompanyFilter !== "all" && app.job?.company?._id !== appCompanyFilter) return false;
      return true;
    });
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return appOrderFilter === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    return filtered;
  }, [applications, appStatusFilter, appCompanyFilter, appOrderFilter]);

  const filteredUsers = useMemo(() => {
    let filtered = [...users];
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return userOrderFilter === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    return filtered;
  }, [users, userOrderFilter]);

  const filteredAbuseReports = useMemo(() => {
    let filtered = abuseReports.filter(report => {
      if (abuseCompanyFilter !== "all" && report.job?.company?._id !== abuseCompanyFilter) return false;
      if (abuseStatusFilter !== "all" && report.status !== abuseStatusFilter) return false;
      return true;
    });
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return abuseOrderFilter === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    return filtered;
  }, [abuseReports, abuseCompanyFilter, abuseStatusFilter, abuseOrderFilter]);

  const abuseTableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // always reset horizontal scroll so first column is visible
    abuseTableRef.current?.scrollTo({ left: 0 });
  }, [abuseCompanyFilter, abuseStatusFilter, abuseOrderFilter, filteredAbuseReports.length]);


  const handleExport = async (endpoint: string, filename: string) => {
    try {
      if ((exportStartDate && !exportEndDate) || (!exportStartDate && exportEndDate)) {
        toast.error("Select both start and end dates to export a range.");
        return;
      }
      if (exportStartDate && exportEndDate) {
        const start = new Date(exportStartDate);
        const end = new Date(exportEndDate);
        if (start > end) {
          toast.error("Start date must be before end date.");
          return;
        }
      }

      const params = new URLSearchParams();
      if (exportStartDate) params.append("startDate", exportStartDate);
      if (exportEndDate) params.append("endDate", exportEndDate);
      const exportEndpoint = params.toString()
        ? `${endpoint}?${params.toString()}`
        : endpoint;

      const res = await API.get(exportEndpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${filename}`);
    } catch (err: any) {
      console.error("Failed to export data", err);
      toast.error(err?.response?.data?.message || "Failed to export data");
    }
  };

  const handleResumeView = async (application: any) => {
    setResumeUrl(application?.resume || null);
    if (!application?._id) return;
    // Only auto-mark as reviewed if the application is still in applied state to avoid overriding later steps.
    if (application.status !== "applied") return;
    try {
      await API.put(`/admin/applications/${application._id}/status`, {
        status: "reviewed",
      });
      setApplications((prev) =>
        prev.map((item) =>
          item._id === application._id ? { ...item, status: "reviewed" } : item
        )
      );
    } catch (err) {
      console.error("Failed to auto-mark as reviewed", err);
    }
  };


  useEffect(() => {
    if (user?.role === "admin") {
      fetchJobs();
      API.get("/communities").then((res) => setCommunities(res.data));
      fetchUsers();
      fetchCompanies();
      fetchApplications();
      fetchAbuseReports();
    } else if (user?.role === "user") {
      API.get("/posts").then((res) => setPosts(res.data));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===== Submit New Job =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/jobs", form);
      toast.success("Job posted successfully!");
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        location: "",
        employmentType: "Full-time",
        minSalary: undefined,
        maxSalary: undefined,
        company: "",
      });
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post job");
    }
  };


  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-lg text-gray-600"
      >
        Loading dashboard...
      </motion.div>
    </div>
  );

  // ===== Action Handlers =====
  const handleDeleteJob = (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      API.delete(`/jobs/${jobId}`).then(() => {
        setJobs(jobs.filter((job) => job._id !== jobId));
      });
    }
  };

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      API.delete(`/companies/${companyId}`).then(() => {
        setCompanies(companies.filter((c) => c._id !== companyId));
      });
    }
  };

  const handleVerifyCompany = async (companyId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unverify" : "verify";
    if (window.confirm(`Are you sure you want to ${action} this company?`)) {
      await API.put(`/companies/${companyId}/verify`);
      fetchCompanies();
    }
  };

  const handleBlockCompany = async (companyId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unblock" : "block";
    if (window.confirm(`Are you sure you want to ${action} this company?`)) {
      try {
        await API.put(`/admin/companies/${companyId}/block`);
        toast.success(`Company ${action}ed successfully`);
        fetchCompanies();
        fetchAbuseReports();
      } catch (err: any) {
        toast.error(err.response?.data?.message || `Failed to ${action} company`);
      }
    }
  };

  const handleBlockJob = async (jobId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unblock" : "block";
    if (window.confirm(`Are you sure you want to ${action} this job?`)) {
      try {
        await API.put(`/admin/jobs/${jobId}/block`);
        toast.success(`Job ${action}ed successfully`);
        fetchAbuseReports();
      } catch (err: any) {
        toast.error(err.response?.data?.message || `Failed to ${action} job`);
      }
    }
  };

  const handleUpdateAbuseReportStatus = async (reportId: string, status: string) => {
    try {
      await API.put(`/admin/abuse-reports/${reportId}/status`, { status });
      fetchAbuseReports();
      toast.success("Abuse report status updated");
    } catch (err) {
      toast.error("Failed to update report status");
    }
  };

  const handleReviewCompanyResponse = async (reportId: string, action: string) => {
    try {
      await API.put(`/admin/abuse-reports/${reportId}/review`, { action });
      fetchAbuseReports();
      toast.success(`Company response ${action}d`);
    } catch (err) {
      toast.error("Failed to review response");
    }
  };


  const handleBlockUser = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unblock" : "block";
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await API.put(`/admin/users/${userId}/block`);
        toast.success(`User ${action}ed successfully`);
        fetchUsers();
      } catch (err: any) {
        toast.error(err.response?.data?.message || `Failed to ${action} user`);
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      API.delete(`/admin/users/${userId}`).then(() => {
        setUsers(users.filter((u) => u._id !== userId));
      });
    }
  };

  const handleEditJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowEditJobModal(true);
  };

  const handleVerifyJob = async (jobId: string, currentStatus: boolean) => {
    const action = currentStatus ? "unverify" : "verify";
    if (window.confirm(`Are you sure you want to ${action} this job?`)) {
      await API.put(`/admin/jobs/${jobId}/verify`);
      fetchJobs();
    }
  };


  const pendingAbuseReports = abuseReports.filter(
    (report) => report.status === "pending"
  ).length;

  const statsData = [
    {
      icon: Briefcase,
      label: "Total Jobs",
      value: jobs.length,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      link: "/admin/jobs",
      linkText: "Post a new job"
    },
    {
      icon: Building2,
      label: "Total Companies",
      value: companies.length,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      action: () => setShowCreateCompanyModal(true),
      linkText: "Add new company"
    },
    {
      icon: Shield,
      label: "Abuse Reports",
      value: abuseReports.length,
      subtext: `${pendingAbuseReports} pending`,
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600",
      action: () =>
        document
          .getElementById("abuse-reports-section")
          ?.scrollIntoView({ behavior: "smooth" }),
      linkText: "Review reports"
    },
    {
      icon: Users,
      label: "Total Users",
      value: users.length,
      bgColor: "bg-sky-50",
      iconColor: "text-sky-600",
      action: () => setShowCreateCandidateModal(true),
      linkText: "Create new user"
    }
  ];

  const exportOptions = [
    { label: "Jobs", endpoint: "/admin/export/jobs", filename: "jobs.xlsx" },
    { label: "Companies", endpoint: "/admin/export/companies", filename: "companies.xlsx" },
    { label: "Users", endpoint: "/admin/export/users", filename: "users.xlsx" },
    { label: "Freelancers", endpoint: "/admin/export/freelancers", filename: "freelancers.xlsx" },
  ];


  // ===== Render =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Here's an overview of your platform</p>
        </motion.div>

        <Link
          to="/dashboard/feedbacks"
          className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View All Feedback
        </Link>


        {user.role === "admin" && (
          <>
            {/* ===== Dashboard Stats ===== */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
            >
              {statsData.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg`}>
                      <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{stat.value}</h3>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500 -mt-2 sm:-mt-3 mb-3 sm:mb-4">{stat.subtext}</p>
                  )}
                  {stat.link ? (
                    <Link
                      to={stat.link}
                      className={`${stat.iconColor} text-xs sm:text-sm font-medium hover:underline flex items-center gap-1 group`}
                    >
                      {stat.linkText}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <button
                      onClick={stat.action}
                      className={`${stat.iconColor} text-xs sm:text-sm font-medium hover:underline flex items-center gap-1 group`}
                    >
                      {stat.linkText}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 mb-6 sm:mb-8 overflow-hidden"
            >
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-2 sm:p-2.5 rounded-lg">
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Data Exports</h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Download admin Excel snapshots without sensitive credentials
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExportStartDate("");
                      setExportEndDate("");
                    }}
                    disabled={!exportStartDate && !exportEndDate}
                    className="h-10 px-3 sm:px-4 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave blank to export all data.
                </p>
              </div>
              <div className="px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {exportOptions.map((opt) => (
                  <motion.button
                    key={opt.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport(opt.endpoint, opt.filename)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-800 font-medium transition-colors text-sm sm:text-base"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    Export {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <MarketingAdminPanel />

            {/* ===== Manage Companies ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 mb-6 sm:mb-8 overflow-hidden"
            >
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 sm:p-2.5 rounded-lg">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Manage Companies</h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Verify and manage all companies</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateCompanyModal(true)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Company
                  </motion.button>
                </div>
                <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyNameFilter}
                      onChange={(e) => setCompanyNameFilter(e.target.value)}
                      placeholder="Search by name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      value={companyIndustryFilter}
                      onChange={(e) => setCompanyIndustryFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Industries</option>
                      {Array.from(new Set(companies.map(c => c.industry).filter(Boolean))).map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={companyStatusFilter}
                      onChange={(e) => setCompanyStatusFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Order</label>
                    <select
                      value={companyOrderFilter}
                      onChange={(e) => setCompanyOrderFilter(e.target.value as "asc" | "desc")}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                        Domain
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                        Industry
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredCompanies.map((company, index) => (
                        <motion.tr
                          key={company._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedCompany(company)}
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {company.logo ? (
                                <img
                                  src={company.logo}
                                  alt={company.name}
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-gray-100"
                                />
                              ) : (
                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm ring-2 ring-gray-100">
                                  {company.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-medium text-gray-900 text-sm sm:text-base block truncate max-w-[120px] sm:max-w-none">{company.name}</span>
                                <span className="text-xs text-gray-500 sm:hidden">{company.domain}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                            {company.domain}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                            {company.industry || "-"}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${company.verified
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                                }`}
                            >
                              {company.verified ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  <span className="hidden sm:inline">Verified</span>
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3 h-3" />
                                  <span className="hidden sm:inline">Pending</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerifyCompany(company._id, company.verified);
                                }}
                                className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={company.verified ? "Unverify" : "Verify"}
                              >
                                {company.verified ? <XCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCompany(company._id);
                                }}
                                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {filteredCompanies.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No companies found matching the current filters.
                </div>
              )}

              {selectedCompany && (
                <CompanyDetailsModal
                  company={selectedCompany}
                  onClose={() => setSelectedCompany(null)}
                  onRefresh={fetchCompanies}
                  isAdmin={user.role === "admin"}
                />
              )}

              {selectedJob && (
                <AdminJobDetailsModal
                  job={selectedJob}
                  onClose={() => setSelectedJob(null)}
                  onRefresh={fetchJobs}
                />
              )}
            </motion.div>

            {/* ===== Manage Jobs ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className=" bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome back, {user.name}! 👋
                    </h1>
                    <p className="text-gray-600">Here's an overview of your platform</p>
                  </motion.div>

                  {user.role === "admin" && (
                    <>
                      {/* ===== Manage Jobs ===== */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                      >
                        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 sm:p-2.5 rounded-lg">
                              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div>
                              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Manage Jobs</h2>
                              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                View, post, and manage all job openings
                              </p>
                            </div>
                          </div>

                          {/* ✅ Updated Post Job Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowForm(true)}
                            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            Post New Job
                          </motion.button>
                        </div>

                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company</label>
                              <select
                                value={companyFilter}
                                onChange={(e) => setCompanyFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="all">All Companies</option>
                                {companies.map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Order</label>
                              <select
                                value={orderFilter}
                                onChange={(e) => setOrderFilter(e.target.value as "asc" | "desc")}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="all">All</option>
                                <option value="open">Open</option>
                                <option value="pending">Pending</option>
                                <option value="expired">Expired</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Verified</label>
                              <select
                                value={verifiedFilter}
                                onChange={(e) => setVerifiedFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Title
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                                  Location
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                                  Type
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                                  Verified
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">
                                  Expires On
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                                  Applicants
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">
                                  Remarks
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              <AnimatePresence>
                                {filteredJobs.map((job, index) => (
                                  <motion.tr
                                    key={job._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                                    onClick={() => setSelectedJob(job)}
                                  >
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                      <div className="min-w-0">
                                        <div className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{job.title}</div>
                                        <div className="text-xs text-gray-500 sm:hidden">{job.location || "N/A"}</div>
                                      </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                                      {job.location || "N/A"}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                                      {job.employmentType || "N/A"}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                                        {job.status || "open"}
                                      </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${job.isVerified
                                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                                          }`}
                                      >
                                        {job.isVerified ? (
                                          <>
                                            <CheckCircle className="w-3 h-3" />
                                            <span className="hidden xl:inline">Verified</span>
                                          </>
                                        ) : (
                                          <>
                                            <Shield className="w-3 h-3" />
                                            <span className="hidden xl:inline">Pending</span>
                                          </>
                                        )}
                                      </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">
                                      {(() => {
                                        if (!job.expiresAt) {
                                          const fallback = new Date(job.createdAt);
                                          fallback.setDate(fallback.getDate() + 30);
                                          return fallback.toLocaleDateString();
                                        }
                                        const expDate = new Date(job.expiresAt);
                                        return isNaN(expDate.getTime())
                                          ? "N/A"
                                          : expDate.toLocaleDateString();
                                      })()}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                                      {applications.filter(a => a.job._id === job._id).length}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate hidden xl:table-cell" title={job.remarks}>
                                      {job.remarks || "-"}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleVerifyJob(job._id, job.isVerified)}
                                          className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                          title={job.isVerified ? "Unverify" : "Verify"}
                                        >
                                          {job.isVerified ? <XCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                          title="Edit"
                                          onClick={() => navigate("/dashboard/manage-jobs")}
                                        >
                                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </motion.button>
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>

                        {filteredJobs.length === 0 && (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            No jobs found matching the current filters.
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </div>

                {/* 🧩 Post Job Modal */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative"
                      >
                        <button
                          onClick={() => setShowForm(false)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>

                        <h3 className="text-2xl font-bold text-gray-800 mb-6">
                          Post New Job
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Job Title
                            </label>
                            <input
                              name="title"
                              value={form.title}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Company
                            </label>
                            <select
                              name="company"
                              value={form.company}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select Company</option>
                              {companies.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                              </label>
                              <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employment Type
                              </label>
                              <select
                                name="employmentType"
                                value={form.employmentType}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
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

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Salary (LPA)
                              </label>
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
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Salary (LPA)
                              </label>
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
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={form.description}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={5}
                            />
                          </div>

                          <div className="flex justify-end gap-3 pt-4">
                            <button
                              type="button"
                              onClick={() => setShowForm(false)}
                              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Post Job
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ===== Freelancers Section ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-2.5 rounded-lg">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Manage Freelancers</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Add, edit and manage all freelancers
                    </p>
                  </div>
                </div>

              </div>

              <FreelancerList />
            </motion.div>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6 sm:mt-8"
            >
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-2 sm:p-2.5 rounded-lg">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Applications</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      View all job applications across the platform
                    </p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={appStatusFilter}
                      onChange={(e) => setAppStatusFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="applied">Applied</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company</label>
                    <select
                      value={appCompanyFilter}
                      onChange={(e) => setAppCompanyFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Companies</option>
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Order</label>
                    <select
                      value={appOrderFilter}
                      onChange={(e) => setAppOrderFilter(e.target.value as "asc" | "desc")}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed min-w-[1200px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[200px]">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[180px]">
                        Job
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[180px]">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[180px]">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[160px]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[120px]">
                        Resume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[140px]">
                        Applied On
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-[120px]">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredApplications.map((application, index) => (
                        <motion.tr
                          key={application._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-blue-50/30 transition-colors align-top"
                        >
                          <td className="px-6 py-4 align-top">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {application.user?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {application.user?.email || "-"}
                            </div>
                          </td>

                          <td className="px-6 py-4 align-top text-sm text-gray-700">
                            {application.job?.title || "N/A"}
                          </td>

                          <td className="px-6 py-4 align-top text-sm text-gray-600">
                            <div className="line-clamp-2 break-words" title={application.user?.headline}>
                              {application.user?.headline || "-"}
                            </div>
                          </td>

                          <td className="px-6 py-4 align-top text-sm text-gray-600">
                            {application.job?.company?.name || "N/A"}
                          </td>

                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-col gap-1">
                              <ApplicationStatusDropdown
                                id={application._id}
                                currentStatus={application.status}
                                isAdmin
                                onUpdated={fetchApplications}
                              />
                              {application.status === "rejected" && application.rejectionReason && (
                                <span className="text-xs text-red-600">
                                  Reason: {application.rejectionReason}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 align-top text-sm text-gray-500">
                            {application.resume ? (
                              <button
                                onClick={() => handleResumeView(application)}
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="px-6 py-4 align-top text-sm text-gray-500 whitespace-nowrap">
                            {application.createdAt
                              ? new Date(application.createdAt).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-6 py-4 align-top text-right">
                            <button
                              onClick={() => setSelectedApplicant(application)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Details
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {filteredApplications.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No applications found.
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8"
            >
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-50 p-2.5 rounded-lg">
                      <Users className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Manage Users</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        View and manage all registered users
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateCandidateModal(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </motion.button>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <select
                      value={userOrderFilter}
                      onChange={(e) => setUserOrderFilter(e.target.value as "asc" | "desc")}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredUsers.map((u, index) => (
                        <motion.tr
                          key={u._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {u.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {u.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {u.phone || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-600">
                            {u.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBlockUser(u._id, u.blocked)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${u.blocked
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                                  }`}
                              >
                                {u.blocked ? "Unblock" : "Block"}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* ===== Abuse Reports ===== */}
            <motion.div
              id="abuse-reports-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8"
            >
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2.5 rounded-lg">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Abuse Reports</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      View and manage reported abuse across the platform
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <select
                      value={abuseCompanyFilter}
                      onChange={(e) => setAbuseCompanyFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Companies</option>
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={abuseStatusFilter}
                      onChange={(e) => setAbuseStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="responded">Responded</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <select
                      value={abuseOrderFilter}
                      onChange={(e) => setAbuseOrderFilter(e.target.value as "asc" | "desc")}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Reported By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Company Response
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Reported On
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredAbuseReports.map((report, index) => (
                        <motion.tr
                          key={report._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {report.job?.title || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {report.job?.company?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {report.reportedBy?.name || "Anonymous"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {report.reportedBy?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                            {report.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate" title={report.description}>
                            {report.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate" title={report.companyResponse}>
                            {report.companyResponse || "No response yet"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${report.status === "pending"
                                ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20"
                                : report.status === "responded"
                                  ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
                                  : report.status === "reviewed"
                                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                                    : "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                                }`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
                              <select
                                value={report.status}
                                onChange={(e) => handleUpdateAbuseReportStatus(report._id, e.target.value)}
                                className="h-8 text-xs px-2.5 pr-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-w-[110px]"
                              >
                                <option value="pending">Pending</option>
                                <option value="responded">Responded</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                              </select>
                              {report.job?.company && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleBlockCompany(report.job.company._id, report.job.company.blocked)}
                                  className={`h-8 px-3 text-xs font-medium rounded-lg transition-colors inline-flex items-center justify-center ${report.job.company.blocked
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                    }`}
                                >
                                  {report.job.company.blocked ? "Unblock Company" : "Block Company"}
                                </motion.button>
                              )}
                              {report.status === "responded" && (
                                <div className="flex gap-1">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReviewCompanyResponse(report._id, "approve")}
                                    className="h-8 px-3 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center justify-center"
                                    title="Approve Response"
                                  >
                                    ✓
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReviewCompanyResponse(report._id, "reject")}
                                    className="h-8 px-3 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center justify-center"
                                    title="Reject Response"
                                  >
                                    ✗
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {filteredAbuseReports.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No abuse reports found.
                </div>
              )}
            </motion.div>

            {/* ===== Modals ===== */}
            {showCreateCompanyModal && (
              <CreateCompanyModal
                onClose={() => setShowCreateCompanyModal(false)}
                onCreated={fetchCompanies}
              />
            )}

            {showCreateCandidateModal && (
              <CreateCandidateModal
                onClose={() => setShowCreateCandidateModal(false)}
                onCandidateCreated={fetchUsers}
              />
            )}

            {showEditJobModal && selectedJobId && (
              <EditJobModal
                jobId={selectedJobId}
                onClose={() => setShowEditJobModal(false)}
                onJobUpdated={() => {
                  setShowEditJobModal(false);
                  API.get("/jobs").then((res) => setJobs(res.data));
                }}
              />
            )}

            {showEditCommunityModal && selectedCommunityId && (
              <EditCommunityModal
                communityId={selectedCommunityId}
                onClose={() => setShowEditCommunityModal(false)}
                onCommunityUpdated={() => {
                  setShowEditCommunityModal(false);
                  API.get("/communities").then((res) => setCommunities(res.data));
                }}
              />
            )}

            {selectedApplicant && (
              <ApplicantDetailsModal
                applicant={selectedApplicant}
                onClose={() => setSelectedApplicant(null)}
              />
            )}

            {resumeUrl && (
              <ViewResumeModal
                resumeUrl={resumeUrl}
                onClose={() => setResumeUrl(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

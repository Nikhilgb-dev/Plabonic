import React, { useEffect, useState } from "react";
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

  const handleExport = async (endpoint: string, filename: string) => {
    try {
      const res = await API.get(endpoint, { responseType: "blob" });
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {statsData.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{stat.value}</h3>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500 -mt-3 mb-4">{stat.subtext}</p>
                  )}
                  {stat.link ? (
                    <Link
                      to={stat.link}
                      className={`${stat.iconColor} text-sm font-medium hover:underline flex items-center gap-1 group`}
                    >
                      {stat.linkText}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <button
                      onClick={stat.action}
                      className={`${stat.iconColor} text-sm font-medium hover:underline flex items-center gap-1 group`}
                    >
                      {stat.linkText}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <Download className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Data Exports</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Download admin Excel snapshots without sensitive credentials
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {exportOptions.map((opt) => (
                  <motion.button
                    key={opt.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport(opt.endpoint, opt.filename)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-800 font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2.5 rounded-lg">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Manage Companies</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Verify and manage all companies</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateCompanyModal(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Company
                  </motion.button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Domain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {companies.map((company, index) => (
                        <motion.tr
                          key={company._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedCompany(company)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {company.logo ? (
                                <img
                                  src={company.logo}
                                  alt={company.name}
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-gray-100">
                                  {company.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-gray-900">{company.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {company.domain}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {company.industry || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${company.verified
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                                }`}
                            >
                              {company.verified ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3.5 h-3.5" />
                                  Pending
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerifyCompany(company._id, company.verified);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={company.verified ? "Unverify" : "Verify"}
                              >
                                {company.verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCompany(company._id);
                                }}
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
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2.5 rounded-lg">
                              <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-gray-900">Manage Jobs</h2>
                              <p className="text-sm text-gray-500 mt-0.5">
                                View, post, and manage all job openings
                              </p>
                            </div>
                          </div>

                          {/* ✅ Updated Post Job Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowForm(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Post New Job
                          </motion.button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Verified
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Expires On
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Applicants
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Remarks
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              <AnimatePresence>
                                {jobs.map((job, index) => (
                                  <motion.tr
                                    key={job._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                                    onClick={() => setSelectedJob(job)}
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                      {job.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                      {job.location || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                      {job.employmentType || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                                        {job.status || "open"}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${job.isVerified
                                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                                          }`}
                                      >
                                        {job.isVerified ? (
                                          <>
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Verified
                                          </>
                                        ) : (
                                          <>
                                            <Shield className="w-3.5 h-3.5" />
                                            Pending
                                          </>
                                        )}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                      {applications.filter(a => a.job._id === job._id).length}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate" title={job.remarks}>
                                      {job.remarks || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1.5">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleVerifyJob(job._id, job.isVerified)}
                                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                          title={job.isVerified ? "Unverify" : "Verify"}
                                        >
                                          {job.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                          title="Edit"
                                          onClick={() => navigate("/dashboard/manage-jobs")}
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
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

                        {jobs.length === 0 && (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            No job postings found. Click “Post New Job” to create one.
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
                                type="number"
                                placeholder="e.g. 800,000"
                                value={form.minSalary || ""}
                                onChange={(e) => setForm({ ...form, minSalary: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Salary (LPA)
                              </label>
                              <input
                                name="maxSalary"
                                type="number"
                                placeholder="e.g. 1,200,000"
                                value={form.maxSalary || ""}
                                onChange={(e) => setForm({ ...form, maxSalary: e.target.value ? parseFloat(e.target.value) : undefined })}
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-emerald-50 p-2.5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    View all job applications across the platform
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Resume</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied On</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {applications.map((a, index) => (
                        <motion.tr
                          key={a._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-6 py-4 flex items-center gap-3 whitespace-nowrap">
                            {a.user?.profilePhoto ? (
                              <img
                                src={a.user.profilePhoto}
                                alt={a.user.name}
                                className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                                {a.user?.name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{a.user?.name}</div>
                              <div className="text-xs text-gray-500">{a.user?.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {a.job?.title || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap flex items-center gap-2">
                            {a.job?.company?.logo && (
                              <img
                                src={a.job.company.logo}
                                alt={a.job.company.name}
                                className="w-6 h-6 rounded-full ring-1 ring-gray-200"
                              />
                            )}
                            {a.job?.company?.name || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              <ApplicationStatusDropdown
                                id={a._id}
                                currentStatus={a.status}
                                isAdmin
                                onUpdated={fetchApplications}
                              />
                            </td>

                          </td>
                          <td
                            className="px-6 py-4 text-sm text-blue-600 underline cursor-pointer"
                            onClick={() => handleResumeView(a)}
                          >
                            View Resume
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </td>
                          {resumeUrl && (
                            <ViewResumeModal resumeUrl={resumeUrl} onClose={() => setResumeUrl(null)} />
                          )}


                          <td
                            className="px-6 py-4 text-sm text-blue-600 underline cursor-pointer"
                            onClick={() => setSelectedApplicant(a)}
                          >
                            View Details
                          </td>

                          {selectedApplicant && (
                            <ApplicantDetailsModal
                              applicant={selectedApplicant}
                              onClose={() => setSelectedApplicant(null)}
                            />
                          )}

                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>

                {applications.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No applications found.
                  </div>
                )}
              </div>
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
                      {users.map((u, index) => (
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
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
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
                      {abuseReports.map((report, index) => (
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
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                report.status === "pending"
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
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <select
                                value={report.status}
                                onChange={(e) => handleUpdateAbuseReportStatus(report._id, e.target.value)}
                                className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="responded">Responded</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                              </select>
                              {report.status === "responded" && (
                                <div className="flex gap-1">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReviewCompanyResponse(report._id, "approve")}
                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                    title="Approve Response"
                                  >
                                    ✓
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReviewCompanyResponse(report._id, "reject")}
                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    title="Reject Response"
                                  >
                                    ✗
                                  </motion.button>
                                </div>
                              )}
                              {report.job && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleBlockJob(report.job._id, report.job.blocked)}
                                  className={`p-1 rounded transition-colors ${
                                    report.job.blocked
                                      ? "text-green-600 hover:bg-green-50"
                                      : "text-orange-600 hover:bg-orange-50"
                                  }`}
                                  title={report.job.blocked ? "Unblock Job" : "Block Job"}
                                >
                                  {report.job.blocked ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                </motion.button>
                              )}
                              {report.job?.company && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleBlockCompany(report.job.company._id, report.job.company.blocked)}
                                  className={`p-1 rounded transition-colors ${
                                    report.job.company.blocked
                                      ? "text-green-600 hover:bg-green-50"
                                      : "text-red-600 hover:bg-red-50"
                                  }`}
                                  title={report.job.company.blocked ? "Unblock Company" : "Block Company"}
                                >
                                  {report.job.company.blocked ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {abuseReports.length === 0 && (
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
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/api";
import ApplyModal from "../components/ApplyModal";
import JobDetailsModal from "./JobDetailsModal";
import ReportAbuseModal from "../components/ReportAbuseModal";
import { Bookmark, Share2, Shield } from "lucide-react";
import toast from "react-hot-toast";

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportJob, setReportJob] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasFilters = companyFilter || locationFilter || jobTypeFilter;

  useEffect(() => {
    const company = searchParams.get("company") || "";
    const loc = searchParams.get("location") || "";
    const type = searchParams.get("type") || "";
    if (company !== companyFilter) setCompanyFilter(company);
    if (loc !== locationFilter) setLocationFilter(loc);
    if (type !== jobTypeFilter) setJobTypeFilter(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (companyFilter.trim()) params.set("company", companyFilter.trim());
    if (locationFilter.trim()) params.set("location", locationFilter.trim());
    if (jobTypeFilter.trim()) params.set("type", jobTypeFilter.trim());
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      setSearchParams(params, { replace: true });
    }
  }, [companyFilter, locationFilter, jobTypeFilter, searchParams, setSearchParams]);

  const markJobApplied = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job._id === jobId
          ? {
              ...job,
              hasApplied: true,
              applicantsCount: (job.applicantsCount || 0) + 1,
            }
          : job
      )
    );
  };

  useEffect(() => {
    setLoading(true);
    API.get("/jobs")
      .then((res) => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch user and saved jobs
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/users/me")
        .then((res) => {
          setUser(res.data);
          setSavedJobs(res.data.savedJobs?.map((j: any) => j._id || j) || []);
        })
        .catch(() => setUser(null));
    }
  }, []);

  const handleApply = (jobId: string) => {
    if (!user) {
      toast.error("Please login to apply for jobs");
      return;
    }
    if (user?.blocked) {
      toast.error("Your account is blocked. Please contact admin.");
      return;
    }
    setSelectedJobId(jobId);
    setShowModal(true);
  };

  const handleSave = async (jobId: string) => {
    if (!user) {
      toast.error("Please login to save jobs");
      return;
    }
    try {
      if (savedJobs.includes(jobId)) {
        await API.delete(`/users/jobs/${jobId}/save`);
        setSavedJobs(savedJobs.filter(id => id !== jobId));
        toast.success("Job unsaved");
      } else {
        await API.post(`/users/jobs/${jobId}/save`);
        setSavedJobs([...savedJobs, jobId]);
        toast.success("Job saved");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save job");
    }
  };

  const handleShare = (job: any) => {
    const url = `${window.location.origin}/jobs/${job._id}`;
    const text = `Check out this job: ${job.title} at ${job.company?.name || "Company"}`;

    if (navigator.share) {
      navigator.share({
        title: job.title,
        text,
        url,
      });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Link copied to clipboard");
    }
  };

  const handleReportAbuse = (job: any) => {
    if (!user) {
      toast.error("Please login to report abuse");
      return;
    }
    setReportJob(job);
    setShowReportModal(true);
  };

  const filtered = jobs.filter((j) => {
    const companyQuery = companyFilter.trim().toLowerCase();
    const locationQuery = locationFilter.trim().toLowerCase();
    const typeQuery = jobTypeFilter.trim().toLowerCase();
    const locationField = (j.location || "").toLowerCase();

    const matchesCompany =
      !companyQuery ||
      (j.company?.name || "").toLowerCase().includes(companyQuery);

    const matchesLocation = !locationQuery || locationField.includes(locationQuery);

    const jobTypeField = (j.employmentType || j.jobType || "").toLowerCase();
    const matchesJobType = !typeQuery || jobTypeField.includes(typeQuery);

    return matchesCompany && matchesLocation && matchesJobType;
  });

  const companyOptions = Array.from(
    new Set(
      jobs
        .map((j) => j.company?.name)
        .filter((name): name is string => !!name)
    )
  );
  const locationOptions = Array.from(
    new Set(
      jobs
        .map((j) => j.location)
        .filter((loc): loc is string => !!loc)
    )
  );
  const jobTypeOptions = Array.from(
    new Set(
      jobs
        .map((j) => j.employmentType || j.jobType)
        .filter((type): type is string => !!type)
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="text-zinc-900 py-10 px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Discover Your Career
          </h1>
          <p className="text-zinc-800 text-base sm:text-lg">
            Explore opportunities that match your skills and passion
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Filters */}
        <div className="mb-6 sm:mb-10 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm text-gray-700 bg-white"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
              >
                <option value="">All companies</option>
                {companyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm text-gray-700 bg-white"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All locations</option>
                {locationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm text-gray-700 bg-white"
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
              >
                <option value="">All job types</option>
                {jobTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <strong>{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "job" : "jobs"} found
            </span>
            <button
              onClick={() => {
                setCompanyFilter("");
                setLocationFilter("");
                setJobTypeFilter("");
              }}
              className={`text-blue-600 hover:underline transition-opacity ${hasFilters ? "opacity-100" : "opacity-60"}`}
              disabled={!hasFilters}
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Loading / Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-lg">
                Loading opportunities...
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              No Jobs Found
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Try adjusting the filters
            </p>
          </div>
        ) : (
          // Job Cards (Responsive Grid)
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {filtered.map((job) => (
              <div
                key={job._id}
                onClick={() => {
                  if (!job.blocked) {
                    setSelectedJob(job._id);
                    setShowDetails(true);
                  }
                }}
                className={`${
                  job.blocked
                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                    : "cursor-pointer bg-white hover:shadow-xl"
                } rounded-xl sm:rounded-2xl shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col justify-between`}
              >
                <div className="p-5 sm:p-6 flex-1 flex flex-col relative">
                  {/* Save, Share, and Report Buttons - Top Right */}
                  {user && !job.blocked && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave(job._id);
                        }}
                        className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                          savedJobs.includes(job._id)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        title={savedJobs.includes(job._id) ? "Unsave" : "Save"}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(job);
                        }}
                        className="p-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-all"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReportAbuse(job);
                        }}
                        className="p-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-red-200 hover:text-red-700 transition-all"
                        title="Report Abuse"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Company Info */}
                  {job.company && (
                    <div className="flex items-center gap-3 mb-3">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-gray-200"
                        />
                      ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                          {job.company?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                          {job.company.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Posted by {job.company.authorizedSignatory?.name || "Company"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    {job.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                    {job.location && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-700">
                        📍 {job.location}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-700">
                        🕒 {job.employmentType}
                      </span>
                    )}
                    {job.minSalary && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-700">
                        ₹{job.minSalary}{job.maxSalary ? ` - ${job.maxSalary}` : ''} Rupees
                      </span>
                    )}
                    {job.blocked && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-700">
                        🚫 Blocked
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3">
                    {job.description}
                  </p>

                  {/* Footer Info */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex flex-col text-xs text-gray-500">
                        <span>
                          Posted{" "}
                          {new Date(job.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {job.applicantsCount !== undefined && (
                          <span>
                            👥 {job.applicantsCount}{" "}
                            {job.applicantsCount === 1
                              ? "applicant"
                              : "applicants"}
                          </span>
                        )}
                      </div>

                      {/* Apply Button */}
                      {job.hasApplied ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed flex items-center gap-1"
                        >
                          ✓ Applied
                        </button>
                      ) : user?.blocked ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed"
                        >
                          Account Blocked
                        </button>
                      ) : job.blocked ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed"
                        >
                          Blocked
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(job._id);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-600 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && selectedJobId && (
        <ApplyModal
          jobId={selectedJobId}
          onClose={() => setShowModal(false)}
          onApplied={(jobId: string) => {
            markJobApplied(jobId);
            setShowModal(false);
          }}
        />
      )}
      {showDetails && selectedJob && (
        <JobDetailsModal
          jobId={selectedJob}
          onClose={() => setShowDetails(false)}
          hasApplied={!!jobs.find((j) => j._id === selectedJob)?.hasApplied}
          isUserBlocked={!!user?.blocked}
          onApply={(jobId: string) => {
            setShowDetails(false);
            handleApply(jobId);
          }}
        />
      )}
      {showReportModal && reportJob && (
        <ReportAbuseModal
          jobId={reportJob._id}
          jobTitle={reportJob.title}
          onClose={() => {
            setShowReportModal(false);
            setReportJob(null);
          }}
          onSuccess={() => {
            setShowReportModal(false);
            setReportJob(null);
            toast.success("Report submitted successfully");
          }}
        />
      )}
    </div>
  );
};

export default Jobs;

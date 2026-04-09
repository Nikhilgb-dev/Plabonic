import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/api";
import { formatSalaryRange } from "@/utils/salary";
import Avatar from "@/components/Avatar";

const normalizeJobDetail = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(", ");
  }

  return typeof value === "string" ? value.trim() : "";
};

const InfoCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) => (
  <div className={`rounded-2xl border p-4 shadow-sm ${accent}`}>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

const SectionCard = ({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: string;
}) => (
  <section className={`rounded-2xl border p-6 shadow-sm ${accent}`}>
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">{body}</p>
  </section>
);

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    API.get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  const roleAndResponsibility = useMemo(
    () => normalizeJobDetail(job?.roleAndResponsibility),
    [job?.roleAndResponsibility]
  );
  const skillsRequired = useMemo(
    () => normalizeJobDetail(job?.skillsRequired),
    [job?.skillsRequired]
  );
  const preferredQualifications = useMemo(
    () => normalizeJobDetail(job?.preferredQualifications),
    [job?.preferredQualifications]
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Job Not Found</h1>
          <p className="mt-3 text-gray-600">
            The shared job could not be loaded. It may have been removed or is no longer available.
          </p>
          <Link
            to="/jobs"
            className="mt-6 inline-flex items-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/jobs"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to Jobs
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            Login to Apply
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-100">Shared Job</p>
                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{job.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50">
                  Complete job details and requirements are shown below.
                </p>
                {job.blocked && (
                  <span className="mt-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    This job is blocked
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <Avatar
                  src={job.company?.logo}
                  alt={job.company?.name || job.postedBy?.name || "Company"}
                  className="h-16 w-16 rounded-2xl border border-white/20 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {job.company?.name && (
                <InfoCard
                  label="Company"
                  value={job.company.name}
                  accent="bg-green-50 border-green-100"
                />
              )}
              {job.location && (
                <InfoCard
                  label="Location"
                  value={job.location}
                  accent="bg-blue-50 border-blue-100"
                />
              )}
              {job.employmentType && (
                <InfoCard
                  label="Employment Type"
                  value={job.employmentType}
                  accent="bg-purple-50 border-purple-100"
                />
              )}
            </div>

            {(job.minSalary || job.maxSalary) && (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Salary Range</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {formatSalaryRange(job.minSalary, job.maxSalary, job.salaryType)}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-6">
              <SectionCard
                title="Job Description"
                body={job.description || "No description provided."}
                accent="bg-gray-50 border-gray-200"
              />

              {roleAndResponsibility && (
                <SectionCard
                  title="Role and Responsibility"
                  body={roleAndResponsibility}
                  accent="bg-blue-50 border-blue-200"
                />
              )}

              {skillsRequired && (
                <SectionCard
                  title="Skills Required"
                  body={skillsRequired}
                  accent="bg-purple-50 border-purple-200"
                />
              )}

              {preferredQualifications && (
                <SectionCard
                  title="Preferred Qualifications"
                  body={preferredQualifications}
                  accent="bg-orange-50 border-orange-200"
                />
              )}

              {job.requirements && (
                <SectionCard
                  title="Requirements"
                  body={job.requirements}
                  accent="bg-sky-50 border-sky-200"
                />
              )}
            </div>

            {(job.postedBy || job.createdAt || job.applicantsCount !== undefined) && (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {job.postedBy && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Posted By</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      {job.company?.authorizedSignatory?.name || job.postedBy.name}
                    </p>
                    {job.createdAt && (
                      <p className="mt-2 text-sm text-gray-500">
                        Posted on{" "}
                        {new Date(job.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                )}

                {job.applicantsCount !== undefined && (
                  <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Applicants</p>
                    <p className="mt-2 text-lg font-semibold text-purple-700">
                      {job.applicantsCount} {job.applicantsCount === 1 ? "candidate" : "candidates"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

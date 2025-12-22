import React from "react";
import { X, Building, MapPin, Calendar } from "lucide-react";

interface OfferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  type: "job" | "freelancer";
  onAccept: () => void;
  onReject: () => void;
}

const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  isOpen,
  onClose,
  application,
  type,
  onAccept,
  onReject,
}) => {
  if (!isOpen || !application) return null;

  const isJobApplication = type === "job";
  const job = isJobApplication ? application.job : null;
  const freelancer = !isJobApplication ? application.freelancer : null;
  const company = isJobApplication ? job?.company : null;

  return (
    // ✅ Clicking outside closes the modal
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* ✅ Clicking inside should NOT close */}
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Job Offer Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Job/Freelancer Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-4">
              {isJobApplication ? (
                <>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {job?.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Building className="w-4 h-4" />
                      <span>{company?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{job?.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{job?.employmentType}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${job?.minSalary || 0} - ${job?.maxSalary || 0}
                    </div>
                    <div className="text-sm text-gray-500">per annum</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {freelancer?.name}
                    </h3>
                    <div className="text-gray-600 mb-2">
                      {freelancer?.qualification}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{freelancer?.location}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      Contact: {application?.contactNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application?.officialEmail}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Application Details
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Applied On
                    </span>
                    <p className="text-gray-900">
                      {new Date(
                        application.createdAt || application.appliedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Status
                    </span>
                    <p className="text-gray-900 capitalize">
                      {application.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isJobApplication && job && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Job Description
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {job.description}
                  </p>

                  {job.roleAndResponsibility && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Responsibilities
                      </h5>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {job.roleAndResponsibility}
                      </p>
                    </div>
                  )}

                  {job.skillsRequired && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Required Skills
                      </h5>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {job.skillsRequired}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isJobApplication && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Project Requirements
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {application.requirements}
                  </p>

                  {application.message && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Additional Message
                      </h5>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {application.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={onReject}
              className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              Reject Offer
            </button>
            <button
              onClick={onAccept}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Accept Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailsModal;

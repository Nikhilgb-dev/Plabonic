import React, { useState, useEffect } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

interface FreelancerApplyModalProps {
  freelancerId: string;
  freelancerName: string;
  application?: any;
  onClose: () => void;
  onSaved?: () => void;
}

const FreelancerApplyModal: React.FC<FreelancerApplyModalProps> = ({
  freelancerId,
  freelancerName,
  application,
  onClose,
  onSaved,
}) => {
  const [formData, setFormData] = useState({
    clientName: "",
    contactNumber: "",
    officialEmail: "",
    requirements: "",
    message: "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [prepopulating, setPrepopulating] = useState(true);
  const isEdit = !!application?._id;

  const computeWordCount = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    // split on spaces/newlines/tabs and filter out empty tokens
    return trimmed.split(/\s+/).filter(Boolean).length;
  };

  // Prepopulate form with user's previous application data
  useEffect(() => {
    const prepopulateForm = async () => {
      if (application) {
        setFormData({
          clientName: application.clientName || "",
          contactNumber: application.contactNumber || "",
          officialEmail: application.officialEmail || "",
          requirements: application.requirements || "",
          message: application.message || "",
        });
        setWordCount(computeWordCount(application.requirements || ""));
        setPrepopulating(false);
        return;
      }

      try {
        const response = await API.get("/freelancers/me/applications");
        const applications = response.data;

        if (applications && applications.length > 0) {
          // Use data from the most recent application
          const latestApplication = applications[applications.length - 1];
          setFormData({
            clientName: latestApplication.clientName || "",
            contactNumber: latestApplication.contactNumber || "",
            officialEmail: latestApplication.officialEmail || "",
            requirements: "",
            message: latestApplication.message || "",
          });
          // Note: Resume cannot be prepopulated for security reasons
        }
      } catch (error) {
        // keep silent — not critical
        console.log("No previous applications found", error);
      } finally {
        setPrepopulating(false);
      }
    };

    prepopulateForm();
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (wordCount < 50) {
      toast.error("Requirements must be at least 50 words");
      return;
    }

    if (!resume && !isEdit) {
      toast.error("Please upload your resume");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("clientName", formData.clientName);
      formDataToSend.append("contactNumber", formData.contactNumber);
      formDataToSend.append("officialEmail", formData.officialEmail);
      formDataToSend.append("requirements", formData.requirements);
      formDataToSend.append("message", formData.message);
      if (resume) {
        formDataToSend.append("resume", resume);
      }

      if (isEdit) {
        await API.put(`/freelancers/applications/${application._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Application updated successfully!");
      } else {
        await API.post(`/freelancers/${freelancerId}/apply`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Application submitted successfully!");
      }
      onSaved?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "requirements") {
      setWordCount(computeWordCount(value));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      {/* Modal box: responsive widths and internal scrolling */}
      <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl shadow-2xl overflow-hidden">
        {/* Make the content area scrollable on small screens */}
        <div className="max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-5 sm:p-6 relative">
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-3 right-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 id="apply-modal-title" className="text-lg sm:text-2xl font-bold mb-1">
              {isEdit ? "Edit Application" : "Apply for Service"}
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm truncate">
              {isEdit ? `Update your application to ${freelancerName}` : `Apply to work with ${freelancerName}`}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {prepopulating && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading your information...</p>
              </div>
            )}

            {/* Responsive grid: single column on small screens, two on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Official Email *
              </label>
              <input
                type="email"
                name="officialEmail"
                value={formData.officialEmail}
                onChange={handleInputChange}
                required
                placeholder="your.email@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Requirements * (Minimum 50 words)
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={6}
                required
                placeholder="Describe your project requirements in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
              />
              <p className="text-sm text-gray-500 mt-1">Word count: {wordCount} (minimum 50)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Supporting Document {isEdit ? "(Optional)" : "*"}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                required={!isEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base
                  file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {isEdit && (
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep your existing resume.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional information you'd like to share..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
              />
            </div>

            {/* Footer: stacks on small screens, inline on larger */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-1/2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-md"
              >
                {loading ? (isEdit ? "Saving..." : "Applying...") : isEdit ? "Save Changes" : "Apply"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FreelancerApplyModal;


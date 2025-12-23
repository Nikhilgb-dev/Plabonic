import React, { useEffect, useState } from "react";
import API from "../api/api";
import { MapPin, Bookmark, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import FreelancerApplyModal from "../components/FreelancerApplyModal";

const Freelancers: React.FC = () => {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedFreelancers, setSavedFreelancers] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [locationFilter, setLocationFilter] = useState("");
  const [preferenceFilter, setPreferenceFilter] = useState("");
  const hasFilters = locationFilter || preferenceFilter;

  useEffect(() => {
    fetchFreelancers();

    const token = localStorage.getItem("token");
    if (token) {
      API.get("/users/me")
        .then((res) => {
          setUser(res.data);
          setSavedFreelancers(res.data.savedFreelancers?.map((f: any) => f._id || f) || []);
        })
        .catch(() => setUser(null));
    }
  }, []);

  const locationOptions = Array.from(
    new Set(
      freelancers
        .map((f) => f.location)
        .filter((loc): loc is string => !!loc)
    )
  );

  const preferenceOptions = Array.from(
    new Set(
      freelancers
        .flatMap((f) => f.preferences || [])
        .filter((p): p is string => !!p)
    )
  );

  const fetchFreelancers = async () => {
    try {
      const res = await API.get("/freelancers");
      setFreelancers(res.data);
    } catch (err) {
      toast.error("Failed to load freelancers");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (id: string) => {
    if (!user) {
      toast.error("Please login to apply for this service");
      return;
    }
    if (user?.blocked) {
      toast.error("Your account is blocked. Please contact admin.");
      return;
    }
    setSelectedFreelancerId(id);
    setShowModal(true);
  };

  const handleSave = async (freelancerId: string) => {
    if (!user) {
      toast.error("Please login to save freelancers");
      return;
    }
    try {
      if (savedFreelancers.includes(freelancerId)) {
        await API.delete(`/users/freelancers/${freelancerId}/save`);
        setSavedFreelancers((prev) => prev.filter((id) => id !== freelancerId));
        toast.success("Freelancer unsaved");
      } else {
        await API.post(`/users/freelancers/${freelancerId}/save`);
        setSavedFreelancers((prev) => [...prev, freelancerId]);
        toast.success("Freelancer saved");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save freelancer");
    }
  };

  const handleShare = (freelancer: any) => {
    const url = `${window.location.origin}/freelancers/${freelancer._id}`;
    const text = `Check out this freelancer: ${freelancer.name} - ${freelancer.qualification}`;

    if (navigator.share) {
      navigator.share({
        title: freelancer.name,
        text,
        url,
      });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Link copied to clipboard");
    }
  };

  const filteredFreelancers = freelancers.filter((f) => {
    const matchesLocation =
      !locationFilter || (f.location || "").toLowerCase() === locationFilter.toLowerCase();
    const matchesPreference =
      !preferenceFilter ||
      (f.preferences || []).some(
        (pref: string) => pref && pref.toLowerCase() === preferenceFilter.toLowerCase()
      );
    return matchesLocation && matchesPreference;
  });

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getDescriptionText = (text: string, expanded: boolean) => {
    if (!text) return "";
    const limit = 150; // chars to show in collapsed mode
    if (expanded || text.length <= limit) return text;
    return text.slice(0, limit) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading freelancers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Explore Freelancers &amp; Independent Services
        </h1>

        <div className="mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-gray-700 bg-white"
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
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-gray-700 bg-white"
              value={preferenceFilter}
              onChange={(e) => setPreferenceFilter(e.target.value)}
            >
              <option value="">All preferences</option>
              {preferenceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setLocationFilter("");
                setPreferenceFilter("");
              }}
              className={`text-indigo-600 hover:underline text-sm transition-opacity ${hasFilters ? "opacity-100" : "opacity-60"}`}
              disabled={!hasFilters}
            >
              Clear filters
            </button>
          </div>
        </div>

        {filteredFreelancers.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center text-gray-500">
            No freelance opportunities available right now.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredFreelancers.map((f) => {
              const isExpanded = !!expandedCards[f._id];
              const description = f.descriptionOfWork || "";
              const isLong = description.length > 150;

              return (
                <div
                  key={f._id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 overflow-hidden flex flex-col ${
                    isExpanded ? "h-auto" : "h-[410px]" // collapsed = fixed height, expanded = auto
                  }`}
                >
                  {/* Top */}
                  <div className="p-5 flex items-start gap-4">
                    <img
                      src={f.photo || "https://via.placeholder.com/160"}
                      alt={f.name}
                      className="w-20 h-20 rounded-full border border-gray-200 object-cover shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                            {f.name}
                          </h3>
                          <p className="text-sm text-gray-600">{f.qualification}</p>
                        </div>
                        {user && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave(f._id);
                              }}
                              className={`p-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                                savedFreelancers.includes(f._id)
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }`}
                              title={savedFreelancers.includes(f._id) ? "Unsave" : "Save"}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(f);
                              }}
                              className="p-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all shadow-sm"
                              title="Share"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {f.isVerified && (
                        <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-5 pb-5 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-3 text-sm text-gray-700 mb-3">
                      {f.location && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
                          <MapPin className="w-4 h-4 text-indigo-500" />
                          <span>{f.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {f.preferences?.map((pref: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>

                    {/* Description with Read more */}
                    {description && (
                      <div className="mb-3 text-sm text-gray-700">
                        <p>{getDescriptionText(description, isExpanded)}</p>
                        {isLong && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(f._id)}
                            className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="text-sm text-gray-800 font-semibold mb-4">
                      Pricing:{" "}
                      {f.pricing?.min && f.pricing?.max ? (
                        <>INR {f.pricing.min} - INR {f.pricing.max} Rupees</>
                      ) : (
                        <span className="font-normal text-gray-500">Not specified</span>
                      )}
                    </div>

                    {/* Button pinned at bottom */}
                    {f.hasApplied ? (
                      <button
                        disabled
                        className="w-full mt-auto py-2.5 bg-gray-200 text-gray-600 rounded-xl cursor-not-allowed font-medium"
                      >
                        Applied
                      </button>
                    ) : user?.blocked ? (
                      <button
                        disabled
                        className="w-full mt-auto py-2.5 bg-gray-200 text-gray-600 rounded-xl cursor-not-allowed font-medium"
                      >
                        Account Blocked
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(f._id)}
                        className="w-full mt-auto py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium shadow"
                      >
                        Apply for Service
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedFreelancerId && (
        <FreelancerApplyModal
          freelancerId={selectedFreelancerId}
          freelancerName={
            freelancers.find((f) => f._id === selectedFreelancerId)?.name || "Freelancer"
          }
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Freelancers;

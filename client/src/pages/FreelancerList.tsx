import React, { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import {
    Trash2,
    MapPin,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    CalendarDays,
} from "lucide-react";
import AddFreelancer from "./AddFreelancer";
import toast from "react-hot-toast";

const FreelancerList: React.FC = () => {
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewingFreelancer, setViewingFreelancer] = useState<any | null>(null);
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
        {}
    );
    const [locationFilter, setLocationFilter] = useState("");
    const [preferenceFilter, setPreferenceFilter] = useState("");

    const fetchFreelancers = async () => {
        const res = await API.get("/freelancers");
        setFreelancers(res.data);
    };

    useEffect(() => {
        fetchFreelancers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this freelancer?"))
            return;
        await API.delete(`/freelancers/${id}`);
        toast.success("Freelancer deleted!");
        fetchFreelancers();
    };

    const handleVerify = async (id: string, currentStatus: boolean) => {
        const action = currentStatus ? "unverify" : "verify";
        if (!window.confirm(`Are you sure you want to ${action} this freelancer?`))
            return;
        await API.put(`/admin/freelancers/${id}/verify`);
        toast.success(`Freelancer ${action}d!`);
        fetchFreelancers();
    };

    const toggleExpand = (id: string) => {
        setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const getDescriptionText = (text: string, expanded: boolean) => {
        if (!text) return "";
        const limit = 150;
        if (expanded || text.length <= limit) return text;
        return `${text.slice(0, limit)}...`;
    };

    const locationOptions = useMemo(
        () => Array.from(new Set(freelancers.map((f) => f.location).filter(Boolean))),
        [freelancers]
    );

    const preferenceOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    freelancers
                        .flatMap((f) => f.preferences || [])
                        .filter((p): p is string => !!p)
                )
            ),
        [freelancers]
    );

    const hasFilters = locationFilter || preferenceFilter;

    const filteredFreelancers = useMemo(() => {
        return freelancers.filter((f) => {
            const matchesLocation =
                !locationFilter ||
                (f.location || "").toLowerCase() === locationFilter.toLowerCase();
            const matchesPreference =
                !preferenceFilter ||
                (f.preferences || []).some(
                    (pref: string) =>
                        pref && pref.toLowerCase() === preferenceFilter.toLowerCase()
                );
            return matchesLocation && matchesPreference;
        });
    }, [freelancers, locationFilter, preferenceFilter]);

    const formatDate = (d: any) => {
        if (!d) return "";
        try {
            return new Date(d).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "";
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Freelancers</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Browse, verify, and manage freelancer profiles.
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm active:scale-[0.99] transition"
                >
                    + Add Freelancer
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-gray-800 bg-white"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-gray-800 bg-white"
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
                    className={`text-indigo-700 hover:underline text-sm transition-opacity ${hasFilters ? "opacity-100" : "opacity-60"
                        }`}
                    disabled={!hasFilters}
                >
                    Clear filters
                </button>
            </div>

            {/* Cards */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredFreelancers.map((freelancer) => {
                    const expanded = !!expandedCards[freelancer._id];
                    const min = freelancer.pricing?.min;
                    const max = freelancer.pricing?.max;

                    return (
                        <div
                            key={freelancer._id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setViewingFreelancer(freelancer)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setViewingFreelancer(freelancer);
                                }
                            }}
                            className="group bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            title="Click to view details"
                        >
                            {/* Top accent */}
                            <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600" />

                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <img
                                            src={freelancer.photo || "https://via.placeholder.com/160"}
                                            alt={freelancer.name}
                                            className="w-16 h-16 rounded-2xl object-cover ring-1 ring-gray-200 shadow-sm"
                                        />
                                        {freelancer.isVerified && (
                                            <span className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 shadow-sm">
                                                <CheckCircle className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
                                            {freelancer.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 truncate">
                                            {freelancer.qualification || "—"}
                                        </p>

                                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                                            {freelancer.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-indigo-600" />
                                                    <span className="truncate">{freelancer.location}</span>
                                                </div>
                                            )}
                                            {freelancer.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-indigo-600" />
                                                    <span className="truncate">{freelancer.email}</span>
                                                </div>
                                            )}
                                            {freelancer.contact && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-indigo-600" />
                                                    <span className="truncate">{freelancer.contact}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Chips */}
                                {freelancer.preferences?.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {freelancer.preferences.map((pref: string, idx: number) => (
                                            <span
                                                key={idx}
                                                className="text-[11px] px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide"
                                            >
                                                {pref}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Description */}
                                {freelancer.descriptionOfWork && (
                                    <div className="mt-4 text-sm text-gray-700">
                                        <p className="leading-relaxed">
                                            {getDescriptionText(
                                                freelancer.descriptionOfWork,
                                                expanded
                                            )}
                                        </p>

                                        {freelancer.descriptionOfWork.length > 150 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // don't open view modal
                                                    toggleExpand(freelancer._id);
                                                }}
                                                className="mt-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                                            >
                                                {expanded ? "Show less" : "Read more"}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Pricing + Expiry */}
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <div className="text-xs text-gray-500">Pricing</div>
                                        <div className="text-sm font-semibold text-gray-900 mt-1">
                                            {min && max ? (
                                                <>
                                                    INR {min} - INR {max}{" "}
                                                    <span className="text-gray-500 font-medium">Rupees</span>
                                                </>
                                            ) : (
                                                <span className="font-medium text-gray-500">
                                                    Not specified
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-indigo-600" />
                                            Expiry
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900 mt-1">
                                            {freelancer.expiryDate ? (
                                                formatDate(freelancer.expiryDate)
                                            ) : (
                                                <span className="font-medium text-gray-500">—</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions (stopPropagation so card click doesn't trigger) */}
                                <div className="mt-5 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVerify(freelancer._id, freelancer.isVerified);
                                        }}
                                        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${freelancer.isVerified
                                                ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                                                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                            }`}
                                    >
                                        {freelancer.isVerified ? (
                                            <XCircle className="w-4 h-4" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        {freelancer.isVerified ? "Unverify" : "Verify"}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(freelancer._id);
                                        }}
                                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>

                                <p className="mt-3 text-[11px] text-gray-500">
                                    Tip: click anywhere on this card to view details.
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl max-w-3xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                        <AddFreelancer
                            onAdded={() => {
                                fetchFreelancers();
                                setShowAddModal(false);
                            }}
                            onClose={() => setShowAddModal(false)}
                        />
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* View Details Modal ✅ click outside closes */}
            {viewingFreelancer && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setViewingFreelancer(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] p-6 relative"
                        onClick={(e) => e.stopPropagation()} // ✅ prevent close when clicking inside
                    >
                        <button
                            onClick={() => setViewingFreelancer(null)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Freelancer Details
                        </h2>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <img
                                        src={
                                            viewingFreelancer.photo ||
                                            "https://via.placeholder.com/300x200"
                                        }
                                        alt={viewingFreelancer.name}
                                        className="w-full h-48 object-cover rounded-xl mb-4"
                                    />
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {viewingFreelancer.name}
                                        </h3>
                                        {viewingFreelancer.isVerified && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                <CheckCircle className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-2">
                                        {viewingFreelancer.qualification}
                                    </p>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-600" />{" "}
                                            {viewingFreelancer.location}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-blue-600" />{" "}
                                            {viewingFreelancer.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-blue-600" />{" "}
                                            {viewingFreelancer.contact}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">About</h4>
                                        <p className="text-gray-700">
                                            {viewingFreelancer.aboutFreelancer ||
                                                "No description available"}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">
                                            Work Description
                                        </h4>
                                        <p className="text-gray-700">
                                            {viewingFreelancer.descriptionOfWork}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">
                                            Preferences
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingFreelancer.preferences?.map(
                                                (pref: string, idx: number) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                    >
                                                        {pref}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Pricing</h4>
                                        <p className="text-gray-700">
                                            ₹{viewingFreelancer.pricing?.min} - ₹
                                            {viewingFreelancer.pricing?.max}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">
                                            Expiry Date
                                        </h4>
                                        <p className="text-gray-700">
                                            {viewingFreelancer.expiryDate
                                                ? new Date(
                                                    viewingFreelancer.expiryDate
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            {viewingFreelancer.services &&
                                viewingFreelancer.services.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-4">
                                            Services Offered
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {viewingFreelancer.services.map(
                                                (service: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="border border-gray-200 rounded-lg p-4"
                                                    >
                                                        <h5 className="font-medium text-gray-800 mb-2">
                                                            {service.title}
                                                        </h5>
                                                        <p className="text-gray-600 text-sm mb-2">
                                                            {service.description}
                                                        </p>
                                                        {service.link && (
                                                            <p className="text-blue-600 text-sm mb-2">
                                                                <a
                                                                    href={service.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    View Service Link
                                                                </a>
                                                            </p>
                                                        )}
                                                        {service.otherDetails && (
                                                            <p className="text-gray-600 text-sm">
                                                                {service.otherDetails}
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setViewingFreelancer(null)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FreelancerList;

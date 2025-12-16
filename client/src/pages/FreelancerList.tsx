import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Trash2, Edit2, MapPin, Mail, Phone, CheckCircle, XCircle, Eye } from "lucide-react";
import AddFreelancer from "./AddFreelancer";
import EditFreelancerModal from "@/components/EditFreelancerModal";
import toast from "react-hot-toast";

const FreelancerList: React.FC = () => {
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingFreelancer, setViewingFreelancer] = useState<any | null>(null);
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
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
        if (!window.confirm("Are you sure you want to delete this freelancer?")) return;
        await API.delete(`/freelancers/${id}`);
        toast.success("Freelancer deleted!");
        fetchFreelancers();
    };

    const handleVerify = async (id: string, currentStatus: boolean) => {
        const action = currentStatus ? "unverify" : "verify";
        if (!window.confirm(`Are you sure you want to ${action} this freelancer?`)) return;
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

    const locationOptions = Array.from(new Set(freelancers.map((f) => f.location).filter(Boolean)));
    const preferenceOptions = Array.from(
        new Set(
            freelancers
                .flatMap((f) => f.preferences || [])
                .filter((p): p is string => !!p)
        )
    );

    const hasFilters = locationFilter || preferenceFilter;
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

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 rounded-2xl">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Freelancers</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
                >
                    + Add Freelancer
                </button>
            </div>

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

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredFreelancers.map((freelancer) => (
                    <div
                        key={freelancer._id}
                        className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 overflow-hidden flex flex-col ${expandedCards[freelancer._id] ? "h-auto" : "h-[440px]"}`}
                    >
                        <div className="p-5 flex items-start gap-4">
                            <img
                                src={freelancer.photo || "https://via.placeholder.com/160"}
                                alt={freelancer.name}
                                className="w-20 h-20 rounded-full border border-gray-200 object-cover shadow-sm"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                            {freelancer.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{freelancer.qualification}</p>
                                    </div>
                                    {freelancer.isVerified && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                                            <CheckCircle className="w-3 h-3" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                    {freelancer.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-indigo-500" /> {freelancer.location}
                                        </div>
                                    )}
                                    {freelancer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-indigo-500" /> {freelancer.email}
                                        </div>
                                    )}
                                    {freelancer.contact && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-indigo-500" /> {freelancer.contact}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-5 pb-5 flex flex-col flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {freelancer.preferences?.map((pref: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide"
                                    >
                                        {pref}
                                    </span>
                                ))}
                            </div>

                            {freelancer.descriptionOfWork && (
                                <div className="mb-3 text-sm text-gray-700">
                                    <p>{getDescriptionText(freelancer.descriptionOfWork, !!expandedCards[freelancer._id])}</p>
                                    {freelancer.descriptionOfWork.length > 150 && (
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(freelancer._id)}
                                            className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                        >
                                            {expandedCards[freelancer._id] ? "Show less" : "Read more"}
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="text-sm text-gray-800 font-semibold mb-4">
                                Pricing:{" "}
                                {freelancer.pricing?.min && freelancer.pricing?.max ? (
                                    <>INR {freelancer.pricing.min} - INR {freelancer.pricing.max} LPA</>
                                ) : (
                                    <span className="font-normal text-gray-500">Not specified</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                                <button
                                    onClick={() => setViewingFreelancer(freelancer)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                                >
                                    <Eye className="w-4 h-4" /> View
                                </button>
                                <button
                                    onClick={() => handleVerify(freelancer._id, freelancer.isVerified)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                        freelancer.isVerified
                                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                            : "bg-green-50 text-green-700 hover:bg-green-100"
                                    }`}
                                >
                                    {freelancer.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    {freelancer.isVerified ? "Unverify" : "Verify"}
                                </button>
                                <button
                                    onClick={() => setEditingId(freelancer._id)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(freelancer._id)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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

            {/* Edit Modal */}
            {editingId && (
                <EditFreelancerModal
                    freelancerId={editingId}
                    onClose={() => setEditingId(null)}
                    onUpdated={fetchFreelancers}
                />
            )}

            {/* View Details Modal */}
            {viewingFreelancer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] p-6 relative">
                        <button
                            onClick={() => setViewingFreelancer(null)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Freelancer Details</h2>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <img
                                        src={viewingFreelancer.photo || "https://via.placeholder.com/300x200"}
                                        alt={viewingFreelancer.name}
                                        className="w-full h-48 object-cover rounded-xl mb-4"
                                    />
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold text-gray-800">{viewingFreelancer.name}</h3>
                                        {viewingFreelancer.isVerified && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                <CheckCircle className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-2">{viewingFreelancer.qualification}</p>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-600" /> {viewingFreelancer.location}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-blue-600" /> {viewingFreelancer.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-blue-600" /> {viewingFreelancer.contact}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">About</h4>
                                        <p className="text-gray-700">{viewingFreelancer.aboutFreelancer || "No description available"}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Work Description</h4>
                                        <p className="text-gray-700">{viewingFreelancer.descriptionOfWork}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Preferences</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingFreelancer.preferences?.map((pref: string, idx: number) => (
                                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                    {pref}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Pricing</h4>
                                        <p className="text-gray-700">
                                            ₹{viewingFreelancer.pricing?.min} - ₹{viewingFreelancer.pricing?.max}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Expiry Date</h4>
                                        <p className="text-gray-700">
                                            {new Date(viewingFreelancer.expiryDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            {viewingFreelancer.services && viewingFreelancer.services.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-4">Services Offered</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {viewingFreelancer.services.map((service: any, idx: number) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                                <h5 className="font-medium text-gray-800 mb-2">{service.title}</h5>
                                                <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                                                {service.link && (
                                                    <p className="text-blue-600 text-sm mb-2">
                                                        <a href={service.link} target="_blank" rel="noopener noreferrer">
                                                            View Service Link
                                                        </a>
                                                    </p>
                                                )}
                                                {service.otherDetails && (
                                                    <p className="text-gray-600 text-sm">{service.otherDetails}</p>
                                                )}
                                            </div>
                                        ))}
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

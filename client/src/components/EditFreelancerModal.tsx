import React, { useState, useEffect } from "react";
import API from "../api/api";
import toast from "react-hot-toast";

interface EditFreelancerModalProps {
    freelancerId: string;
    onClose: () => void;
    onUpdated: () => void;
}

const EditFreelancerModal: React.FC<EditFreelancerModalProps> = ({
    freelancerId,
    onClose,
    onUpdated,
}) => {
    const [freelancer, setFreelancer] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const preferenceOptions = ["Remote", "On-site", "Contract", "Agreement", "MOU"];

    useEffect(() => {
        const fetchFreelancer = async () => {
            const res = await API.get(`/freelancers/${freelancerId}`);
            setFreelancer(res.data);
        };
        fetchFreelancer();
    }, [freelancerId]);

    const togglePreference = (pref: string) => {
        setFreelancer((prev: any) => ({
            ...prev,
            preferences: prev.preferences.includes(pref)
                ? prev.preferences.filter((p: string) => p !== pref)
                : [...prev.preferences, pref],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updatedData = {
                ...freelancer,
                preferences: freelancer.preferences || [],
            };

            await API.put(`/freelancers/${freelancerId}`, updatedData);
            toast.success("Freelancer updated successfully!");
            onUpdated();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "We couldn't save your changes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!freelancer) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-2xl">
                    <p>Loading freelancer...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh] p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Freelancer</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={freelancer.name}
                            onChange={(e) =>
                                setFreelancer({ ...freelancer, name: e.target.value })
                            }
                            placeholder="Name"
                            className="input"
                        />
                        <input
                            type="text"
                            value={freelancer.qualification}
                            onChange={(e) =>
                                setFreelancer({ ...freelancer, qualification: e.target.value })
                            }
                            placeholder="Qualification"
                            className="input"
                        />
                        <input
                            type="text"
                            value={freelancer.contact}
                            onChange={(e) =>
                                setFreelancer({ ...freelancer, contact: e.target.value })
                            }
                            placeholder="Contact"
                            className="input"
                        />
                        <input
                            type="email"
                            value={freelancer.email}
                            onChange={(e) =>
                                setFreelancer({ ...freelancer, email: e.target.value })
                            }
                            placeholder="Email"
                            className="input"
                        />
                        <input
                            type="text"
                            value={freelancer.location}
                            onChange={(e) =>
                                setFreelancer({ ...freelancer, location: e.target.value })
                            }
                            placeholder="Location"
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">
                            Preferences
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {preferenceOptions.map((pref) => (
                                <label
                                    key={pref}
                                    className={`px-3 py-1 border rounded-lg cursor-pointer ${freelancer.preferences?.includes(pref)
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={freelancer.preferences?.includes(pref)}
                                        onChange={() => togglePreference(pref)}
                                        className="hidden"
                                    />
                                    {pref}
                                </label>
                            ))}
                        </div>
                    </div>

                    <textarea
                        value={freelancer.descriptionOfWork}
                        onChange={(e) =>
                            setFreelancer({
                                ...freelancer,
                                descriptionOfWork: e.target.value,
                            })
                        }
                        placeholder="Description of work"
                        className="textarea"
                    />

                    <textarea
                        value={freelancer.aboutFreelancer || ""}
                        onChange={(e) =>
                            setFreelancer({
                                ...freelancer,
                                aboutFreelancer: e.target.value,
                            })
                        }
                        placeholder="About Freelancer"
                        className="textarea"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Starting Price"
                            value={freelancer.pricing?.min || 0}
                            onChange={(e) =>
                                setFreelancer({
                                    ...freelancer,
                                    pricing: {
                                        ...freelancer.pricing,
                                        min: Number(e.target.value),
                                    },
                                })
                            }
                            className="input"
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={freelancer.pricing?.max || 0}
                            onChange={(e) =>
                                setFreelancer({
                                    ...freelancer,
                                    pricing: {
                                        ...freelancer.pricing,
                                        max: Number(e.target.value),
                                    },
                                })
                            }
                            className="input"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 border rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditFreelancerModal;


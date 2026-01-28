import React, { useState } from "react";
import API from "@/api/api";
import { toast } from "react-hot-toast";

interface Props {
    id: string;
    currentStatus: string;
    isAdmin?: boolean;
    onUpdated?: () => void;
}

const statuses = [
    "applied",
    "reviewed",
    "interview",
    "offer",
    "hired",
    "rejected",
];

const ApplicationStatusDropdown: React.FC<Props> = ({
    id,
    currentStatus,
    isAdmin = false,
    onUpdated,
}) => {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Sync internal state when parent-provided status changes
    React.useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        if (newStatus === "rejected") {
            setShowRejectModal(true);
            // Reset select to previous status
            e.target.value = status;
            return;
        }
        setStatus(newStatus);
        setLoading(true);
        try {
            const endpoint = isAdmin
                ? `/admin/applications/${id}/status`
                : `/companies/me/applicants/${id}/status`;

            await API.put(endpoint, { status: newStatus });
            toast.success("Status updated");
            onUpdated?.();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "We couldn't update this item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }
        setLoading(true);
        try {
            const endpoint = isAdmin
                ? `/admin/applications/${id}/status`
                : `/companies/me/applicants/${id}/status`;

            console.log("Sending payload:", { status: "rejected", rejectionReason });
            await API.put(endpoint, { status: "rejected", rejectionReason });
            setStatus("rejected");
            toast.success("Status updated");
            onUpdated?.();
            setShowRejectModal(false);
            setRejectionReason("");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "We couldn't update this item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <select
                value={status}
                onChange={handleChange}
                disabled={loading}
                className="border rounded-md text-sm px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
            >
                {statuses.map((s) => (
                    <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                ))}
            </select>

            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please provide a reason for rejection (required):
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full border rounded-md p-2 text-sm mb-4 resize-none"
                            rows={3}
                            required
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                }}
                                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                disabled={loading || !rejectionReason.trim()}
                            >
                                {loading ? "Rejecting..." : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ApplicationStatusDropdown;


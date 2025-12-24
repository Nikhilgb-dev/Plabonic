import React, { useState } from "react";
import API from "../api/api";
import { toast } from "react-hot-toast";

interface Props {
    company: any;
    onClose: () => void;
    onRefresh: () => void;
    isAdmin?: boolean;
}

const CompanyDetailsModal: React.FC<Props> = ({ company, onClose, onRefresh, isAdmin }) => {
    if (!company) return null;

    const handleVerifyToggle = async () => {
        try {
            await API.put(`/companies/${company._id}/verify`);
            toast.success(
                company.verified ? "Company unverified successfully" : "Company verified successfully"
            );
            onRefresh();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    const [remark, setRemark] = useState("");

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this company?")) {
            try {
                await API.delete(`/companies/${company._id}`);
                toast.success("Company deleted successfully");
                onRefresh();
                onClose();
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to delete company");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative animate-fadeIn">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src={company.logo || "https://via.placeholder.com/80"}
                        alt={company.name}
                        className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <div>
                        <h2 className="text-2xl font-bold">{company.name}</h2>
                        <p className="text-gray-600">{company.tagline}</p>
                        <span
                            className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${company.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                }`}
                        >
                            {company.verified ? "Verified" : "Pending Verification"}
                        </span>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Domain</h3>
                        <p className="text-gray-800">{company.domain}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Industry</h3>
                        <p className="text-gray-800">{company.industry || "-"}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Company Size</h3>
                        <p className="text-gray-800">{company.size}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Type</h3>
                        <p className="text-gray-800">{company.type}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Registration Name</h3>
                        <p className="text-gray-800">{company.registrationName || "-"}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">PAN / TAN / GST</h3>
                        <p className="text-gray-800">{company.panOrTanOrGst || "-"}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Incorporation Date</h3>
                        <p className="text-gray-800">
                            {company.dateOfIncorporation
                                ? new Date(company.dateOfIncorporation).toLocaleDateString()
                                : "-"}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700">Description</h3>
                    <p className="text-gray-800 mt-1">{company.description}</p>
                </div>

                {/* Contact Info */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Business Email</h3>
                        <p className="text-gray-800">{company.email}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Contact Number</h3>
                        <p className="text-gray-800">{company.contactNumber || "-"}</p>
                    </div>
                    <div className="sm:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-700">Registered Office Address</h3>
                        <p className="text-gray-800">
                            {company.registeredOfficeAddress || company.address || "-"}
                        </p>
                    </div>
                </div>

                {company.directorAndKmpDetails && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Director & Key Managerial Personnel Details
                        </h3>
                        <p className="text-gray-800 mt-1 whitespace-pre-line">
                            {company.directorAndKmpDetails}
                        </p>
                    </div>
                )}

                {/* Authorized Signatory */}
                <div className="border-t pt-4 mb-6">
                    <h3 className="text-lg font-semibold mb-2">Authorized person</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700">Name</h4>
                            <p className="text-gray-800">{company.authorizedSignatory?.name || "-"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700">Designation</h4>
                            <p className="text-gray-800">{company.authorizedSignatory?.designation || "-"}</p>
                        </div>
                        {company.authorizedSignatory?.signature && (
                            <div className="sm:col-span-2 mt-2">
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Authorized person [ ID Card ]</h4>
                                <img
                                    src={company.authorizedSignatory.signature}
                                    alt="Signature"
                                    className="w-32 border rounded-md"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Verification Documents */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Verification Documents</h3>
                    {company.verificationDocs && company.verificationDocs.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {company.verificationDocs.map((doc: string, idx: number) => (
                                <a
                                    key={idx}
                                    href={doc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border rounded-lg p-2 text-sm hover:bg-gray-50"
                                >
                                    📄 Document {idx + 1}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm">No documents uploaded.</p>
                    )}
                </div>

                <div className="mt-6 border-t pt-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Remarks</h4>
                    <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Add any missing information notes..."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={async () => {
                                await API.put(`/companies/${company._id}/remark`, { remark });
                                toast.success("Remark added successfully");
                                onRefresh();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Submit Remark
                        </button>
                    </div>
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                    <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
                        <button
                            onClick={handleVerifyToggle}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            {company.verified ? "Unverify Company" : "Verify Company"}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                        >
                            Delete Company
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyDetailsModal;

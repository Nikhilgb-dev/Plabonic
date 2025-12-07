import React, { useEffect, useState } from "react";
import API from "@/api/api";
import { toast } from "react-hot-toast";
import EditProfileModal from "../components/EditProfileModal";

interface CompanyData {
    name: string;
    email: string;
    logo?: string;
    description?: string;
    industry?: string;
    website?: string;
    address?: string;
    isVerified?: boolean;
    createdAt?: string;
    registrationName?: string;
    panOrTanOrGst?: string;
    dateOfIncorporation?: string;
    registeredOfficeAddress?: string;
    directorAndKmpDetails?: string;
}

const CompanyProfilePage: React.FC = () => {
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const loadCompany = async () => {
            try {
                const res = await API.get("/companies/me");
                setCompany(res.data);
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        loadCompany();
    }, []);

    if (loading) return <div>Loading profile...</div>;
    if (!company) return <div className="text-red-500">Company not found</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <img
                        src={company.logo || "https://via.placeholder.com/80"}
                        alt="Company Logo"
                        className="w-20 h-20 rounded object-cover border"
                    />
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">{company.name}</h2>
                        <p className="text-sm text-gray-500">{company.industry || "-"}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Edit Details
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="font-medium text-gray-600">Email</div>
                    <div>{company.email}</div>
                </div>
                <div>
                    <div className="font-medium text-gray-600">Registration Name</div>
                    <div>{company.registrationName || "-"}</div>
                </div>
                <div>
                    <div className="font-medium text-gray-600">Website</div>
                    <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                    >
                        {company.website || "-"}
                    </a>
                </div>
                <div>
                    <div className="font-medium text-gray-600">PAN / TAN / GST</div>
                    <div>{company.panOrTanOrGst || "-"}</div>
                </div>
                <div>
                    <div className="font-medium text-gray-600">Address</div>
                    <div>{company.registeredOfficeAddress || company.address || "-"}</div>
                </div>
                <div>
                    <div className="font-medium text-gray-600">Date of Incorporation</div>
                    <div>
                        {company.dateOfIncorporation
                            ? new Date(company.dateOfIncorporation).toLocaleDateString()
                            : "-"}
                    </div>
                </div>
                <div>
                    <div className="font-medium text-gray-600">Verification</div>
                    <div>
                        {company.isVerified ? (
                            <span className="text-green-600 font-medium">Verified</span>
                        ) : (
                            <span className="text-gray-500">Pending</span>
                        )}
                    </div>
                </div>
                <div className="sm:col-span-2">
                    <div className="font-medium text-gray-600">Description</div>
                    <p className="text-gray-700 mt-1">{company.description || "-"}</p>
                </div>
                {company.directorAndKmpDetails && (
                    <div className="sm:col-span-2">
                        <div className="font-medium text-gray-600">
                            Director & Key Managerial Personnel Details
                        </div>
                        <p className="text-gray-700 mt-1 whitespace-pre-line">
                            {company.directorAndKmpDetails}
                        </p>
                    </div>
                )}
            </div>

            <div className="text-xs text-gray-500 mt-6">
                Joined on {new Date(company.createdAt || "").toLocaleDateString()}
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                companyData={company}
                onSuccess={() => {
                    // Reload company data
                    const loadCompany = async () => {
                        try {
                            const res = await API.get("/companies/me");
                            setCompany(res.data);
                        } catch (err: any) {
                            toast.error(err.response?.data?.message || "Failed to reload profile");
                        }
                    };
                    loadCompany();
                }}
            />
        </div>
    );
};

export default CompanyProfilePage;

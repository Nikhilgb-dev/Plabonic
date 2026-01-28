import React, { useEffect, useState } from "react";
import API from "@/api/api";
import { toast } from "react-hot-toast";
import ApplicationStatusDropdown from "@/components/ApplicationStatusDropdown";

interface Applicant {
    _id: string;
    user?: { name: string; email: string };
    job?: { title: string };
    experience?: {
        isFresher: boolean;
        years: number;
    };
    status: string;
    rejectionReason?: string;
    resume: string;
    createdAt?: string;
}

const statusColors: Record<string, string> = {
    applied: "bg-blue-100 text-blue-700",
    reviewed: "bg-yellow-100 text-yellow-700",
    interview: "bg-purple-100 text-purple-700",
    offer: "bg-green-100 text-green-700",
    hired: "bg-emerald-100 text-emerald-700",
    accepted: "bg-cyan-100 text-cyan-700",
    rejected: "bg-red-100 text-red-700",
};

const CompanyApplicantsPage: React.FC = () => {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);

    const loadApplicants = async () => {
        try {
            const res = await API.get("/companies/me/applicants");
            setApplicants(res.data.applications || res.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "We couldn't load applicants. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplicants();
    }, []);

    if (loading) return <div>Loading applicants...</div>;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Applicants ({applicants.length})</h2>

            {applicants.length === 0 ? (
                <div className="text-gray-500">No applicants found.</div>
            ) : (
                <table className="w-full text-sm border-t">
                    <thead className="bg-gray-50 text-gray-600 border-b">
                        <tr>
                            <th className="p-2 text-left">Candidate</th>
                            <th className="p-2 text-left">Job</th>
                            <th className="p-2 text-left">Experience</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Applied On</th>
                            <th className="p-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applicants.map((a) => (
                            <tr key={a._id} className="border-b hover:bg-gray-50">
                                <td className="p-2">
                                    <div className="font-medium text-gray-800">{a.user?.name || "—"}</div>
                                    <div className="text-xs text-gray-500">{a.user?.email}</div>
                                </td>
                                <td className="p-2">{a.job?.title || "—"}</td>
                                <td className="p-2">
                                    {a.experience?.isFresher
                                        ? "Fresher"
                                        : `${a.experience?.years || 0} yrs`}
                                </td>
                                <td className="p-2">
                                    <ApplicationStatusDropdown
                                        id={a._id}
                                        currentStatus={a.status}
                                        onUpdated={loadApplicants}
                                    />
                                    {a.status === 'rejected' && a.rejectionReason && (
                                        <div className="text-xs text-red-600 mt-1">
                                            Reason: {a.rejectionReason}
                                        </div>
                                    )}
                                </td>
                                <td className="p-2 text-gray-500">
                                    {new Date(a.createdAt || "").toLocaleDateString()}
                                </td>
                                <td className="p-2 text-right">
                                    <a
                                        href={a.resume}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        View Resume
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CompanyApplicantsPage;


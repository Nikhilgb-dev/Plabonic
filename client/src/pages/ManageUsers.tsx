import React, { useEffect, useState } from "react";
import API from "@/api/api";
import { toast } from "react-hot-toast";
import Avatar from "@/components/Avatar";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    whatsappNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    currentLocation?: string;
    preferredJobLocation?: string;
    educationalQualification?: string;
    yearOfGraduation?: number;
    workExperienceYears?: number;
    currentEmployer?: string;
    currentDesignation?: string;
    noticePeriod?: string;
    currentSalary?: number;
    expectedSalary?: number;
    technicalSkills?: string[];
    softSkills?: string[];
    interestedSkills?: string[];
    projects?: any[];
    certifications?: string[];
    languagesKnown?: string[];
    resume?: string;
    about?: string;
    headline?: string;
    description?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        linkedin?: string;
        github?: string;
        twitter?: string;
    };
    skills?: string[];
    experience?: any[];
    education?: any[];
    profilePhoto?: string;
    blocked?: boolean;
}

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await API.get("/admin/users");
                setUsers(res.data);
            } catch (err) {
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const calculateCompletion = (user: User) => {
        const fields = [
            user.phone,
            user.whatsappNumber,
            user.dateOfBirth,
            user.gender,
            user.currentLocation,
            user.preferredJobLocation,
            user.educationalQualification,
            user.yearOfGraduation,
            user.workExperienceYears,
            user.currentEmployer,
            user.currentDesignation,
            user.noticePeriod,
            user.currentSalary,
            user.expectedSalary,
            user.technicalSkills?.length ? true : false,
            user.softSkills?.length ? true : false,
            user.interestedSkills?.length ? true : false,
            user.projects?.length ? true : false,
            user.certifications?.length ? true : false,
            user.languagesKnown?.length ? true : false,
            user.resume,
            user.about,
            user.headline,
            user.description,
            user.location,
            user.website,
            user.socialLinks?.linkedin,
            user.socialLinks?.github,
            user.socialLinks?.twitter,
            user.skills?.length ? true : false,
            user.experience?.length ? true : false,
            user.education?.length ? true : false,
            user.profilePhoto,
        ];
        const filled = fields.filter(field => field !== undefined && field !== null && field !== "" && field !== false).length;
        return Math.round((filled / fields.length) * 100);
    };

    const toggleBlock = async (userId: string, blocked: boolean) => {
        try {
            await API.put(`/admin/users/${userId}/block`);
            setUsers(users.map(u => u._id === userId ? { ...u, blocked: !blocked } : u));
            toast.success(`User ${!blocked ? "blocked" : "unblocked"}`);
        } catch (err) {
            toast.error("Failed to update user");
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await API.delete(`/admin/users/${userId}`);
            setUsers(users.filter((u) => u._id !== userId));
            toast.success("User deleted");
        } catch (err) {
            toast.error("Failed to delete user");
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-blue-100">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Manage Users</h2>
                    <p className="text-gray-600">View and manage user profiles and completion status</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Completion</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <Avatar src={user.profilePhoto} alt={user.name} className="h-10 w-10 rounded-full" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role.replace("_", " ")}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${calculateCompletion(user)}%` }}></div>
                                                </div>
                                                <span className="text-sm text-gray-500">{calculateCompletion(user)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                                {user.blocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => toggleBlock(user._id, user.blocked || false)}
                                                className={`px-3 py-1 rounded-md text-xs ${user.blocked ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"}`}
                                            >
                                                {user.blocked ? "Unblock" : "Block"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="ml-2 px-3 py-1 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;

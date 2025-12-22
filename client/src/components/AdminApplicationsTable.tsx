import formatDate from '../utils/formatDate';
import React from 'react';

interface Application {
    _id: string;
    job: {
        title: string;
        company: string;
    };
    user: {
        name: string;
        email: string;
        phone: string;
        termsAccepted?: boolean;
    };
    resume: string;
    coverLetter: string;
    status: string;
    rejectionReason?: string;
    createdAt: string;
}

const AdminApplicationsTable = ({ applications }: { applications: Application[] }) => {
    return (
        <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terms Accepted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                        <tr key={app._id}>
                            <td className="px-6 py-4 whitespace-nowrap">{app.job.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{app.job.company}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{app.user.name}</td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{app.user.email}</div>
                                <div className="text-sm text-gray-500">{app.user.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {app.user.termsAccepted ? "Yes" : "No"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        app.status === 'hired' ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {app.status}
                                </span>
                                {app.status === 'rejected' && app.rejectionReason && (
                                    <div className="text-xs text-red-600 mt-1">
                                        Reason: {app.rejectionReason}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(app.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <a
                                    href={app.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    Resume
                                </a>
                                {app.coverLetter && (
                                    <button
                                        onClick={() => alert(app.coverLetter)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Cover Letter
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminApplicationsTable;
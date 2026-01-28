import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { toast } from 'react-hot-toast';
import AdminApplicationsTable from '../components/AdminApplicationsTable';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const { data } = await API.get('/admin/applications');
                setApplications(data);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'We couldn't load applications. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
                <p className="mt-2 text-gray-600">Manage and review all job applications</p>
            </div>
            <AdminApplicationsTable applications={applications} />
        </div>
    );
};

export default AdminApplications;

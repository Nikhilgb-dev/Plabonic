import React, { useEffect, useState } from "react";
import API from "@/api/api";
import { toast } from "react-hot-toast";
import AddEmployeeModal from "./AddEmployeeModal";

interface Employee {
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    position?: string;
    phone?: string;
    createdAt?: string;
}

const CompanyEmployeesPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const loadEmployees = async () => {
        try {
            const res = await API.get("/companies/me/employees");
            setEmployees(res.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "We couldn't load employees. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fireEmployee = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this employee?")) return;
        try {
            await API.put(`/companies/me/employees/${id}/fire`);
            toast.success("Employee removed");
            loadEmployees();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "We couldn't remove this employee. Please try again.");
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    if (loading) return <div>Loading employees...</div>;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Employees ({employees.length})</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    + Add Employee
                </button>
            </div>

            {employees.length === 0 ? (
                <div className="text-gray-500">No employees found.</div>
            ) : (
                <table className="w-full text-sm border-t">
                    <thead className="bg-gray-50 text-gray-600 border-b">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Email</th>
                            <th className="p-2 text-left">Department</th>
                            <th className="p-2 text-left">Position</th>
                            <th className="p-2 text-left">Phone</th>
                            <th className="p-2 text-left">Joined</th>
                            <th className="p-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((e) => (
                            <tr key={e._id} className="border-b hover:bg-gray-50">
                                <td className="p-2 font-medium">{e.name}</td>
                                <td className="p-2">{e.email}</td>
                                <td className="p-2">{e.department || "-"}</td>
                                <td className="p-2">{e.position || "-"}</td>
                                <td className="p-2">{e.phone || "-"}</td>
                                <td className="p-2 text-gray-500">
                                    {new Date(e.createdAt || "").toLocaleDateString()}
                                </td>
                                <td className="p-2 text-right">
                                    <button
                                        onClick={() => fireEmployee(e._id)}
                                        className="text-red-600 hover:underline text-sm"
                                    >
                                        Relive Employee
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal for adding employee */}
            {showModal && (
                <AddEmployeeModal
                    onClose={() => setShowModal(false)}
                    onCreated={loadEmployees}
                />
            )}
        </div>
    );
};

export default CompanyEmployeesPage;


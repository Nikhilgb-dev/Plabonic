import React, { useState } from "react";
import API from "@/api/api";
import { toast } from "react-hot-toast";

interface Props {
    onClose: () => void;
    onCreated: () => void;
}

const AddEmployeeModal: React.FC<Props> = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        department: "",
        position: "",
        phone: "",
        joinDate: "",
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(form).forEach(([key, val]) => data.append(key, val));
            if (photo) data.append("profilePhoto", photo);

            await API.post("/companies/me/employees", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Employee created successfully");
            onCreated();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create employee");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add New Employee</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full"
                            required
                        />
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Temporary Password"
                            value={form.password}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full pr-24"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-2 px-3 text-sm text-gray-600 hover:text-gray-800"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="department"
                            placeholder="Department"
                            value={form.department}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full"
                        />
                        <input
                            type="text"
                            name="position"
                            placeholder="Position / Role"
                            value={form.position}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full"
                        />
                        <input
                            type="date"
                            name="joinDate"
                            value={form.joinDate}
                            onChange={handleChange}
                            className="border rounded-md p-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-600">Profile Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                            className="border rounded-md p-2 w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;

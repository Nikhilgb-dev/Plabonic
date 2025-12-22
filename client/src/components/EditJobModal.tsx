import React, { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-hot-toast";

interface EditJobModalProps {
  jobId: string;
  onClose: () => void;
  onJobUpdated: () => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ jobId, onClose, onJobUpdated }) => {
  const [form, setForm] = useState({ title: "", description: "", roleAndResponsibility: "", skillsRequired: "", preferredQualifications: "", location: "", minSalary: undefined as number | undefined, maxSalary: undefined as number | undefined, employmentType: "Full-time", expiresAt: "" });
  const formatNumberInput = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    API.get(`/jobs/${jobId}`).then((res) => {
      setForm(res.data);
    });
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put(`/jobs/${jobId}`, form);
      toast.success("Job updated successfully!");
      onJobUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update job");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Job</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} className="w-full mb-2 p-2 border" />
          <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} className="w-full mb-2 p-2 border" />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input type="text" name="minSalary" placeholder="Min Salary (LPA)" value={form.minSalary ? form.minSalary.toLocaleString() : ""} onChange={(e) => {
              const formatted = formatNumberInput(e.target.value);
              const numericValue = formatted ? Number(formatted.replace(/,/g, "")) : undefined;
              setForm({ ...form, minSalary: numericValue });
            }} className="w-full p-2 border" />
            <input type="text" name="maxSalary" placeholder="Max Salary (LPA)" value={form.maxSalary ? form.maxSalary.toLocaleString() : ""} onChange={(e) => {
              const formatted = formatNumberInput(e.target.value);
              const numericValue = formatted ? Number(formatted.replace(/,/g, "")) : undefined;
              setForm({ ...form, maxSalary: numericValue });
            }} className="w-full p-2 border" />
          </div>
          <select name="employmentType" value={form.employmentType} onChange={handleChange} className="w-full mb-2 p-2 border">
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Work from home</option>
          </select>
          <textarea name="description" placeholder="Job Description" value={form.description} onChange={handleChange} className="w-full mb-2 p-2 border" />
          <textarea name="roleAndResponsibility" placeholder="Role and Responsibility" value={form.roleAndResponsibility} onChange={handleChange} className="w-full mb-2 p-2 border" />
          <textarea name="skillsRequired" placeholder="Skills Required" value={form.skillsRequired} onChange={handleChange} className="w-full mb-2 p-2 border" />
          <textarea name="preferredQualifications" placeholder="Preferred Qualifications" value={form.preferredQualifications} onChange={handleChange} className="w-full mb-2 p-2 border" />
          <input type="date" name="expiresAt" placeholder="Expiry Date" value={form.expiresAt ? new Date(form.expiresAt).toISOString().split('T')[0] : ""} onChange={handleChange} className="w-full mb-2 p-2 border" />
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Update Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;

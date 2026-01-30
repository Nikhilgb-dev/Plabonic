import React, { useMemo, useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-hot-toast";
import SkillsInput from "@/components/SkillsInput";
import { formatIndianInput, parseIndianInput, SalaryType } from "@/utils/salary";

interface EditJobModalProps {
  jobId: string;
  onClose: () => void;
  onJobUpdated: () => void;
  saveEndpointBase?: string;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ jobId, onClose, onJobUpdated, saveEndpointBase }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    roleAndResponsibility: "",
    skillsRequired: "",
    preferredQualifications: "",
    location: "",
    minSalary: undefined as number | undefined,
    maxSalary: undefined as number | undefined,
    salaryType: "Monthly" as SalaryType,
    employmentType: "Full-time",
    expiresAt: "",
  });
  const salaryOptions: SalaryType[] = ["Monthly", "LPA", "CTC"];
  const parseSkills = (value?: string) =>
    (value || "")
      .split(/[,\n]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  const skillsList = useMemo(() => parseSkills(form.skillsRequired), [form.skillsRequired]);

  useEffect(() => {
    API.get(`/jobs/${jobId}`).then((res) => {
      const jobData = res.data || {};
      setForm({
        ...jobData,
        salaryType: jobData.salaryType || "Monthly",
      });
    });
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpointBase = saveEndpointBase || "/jobs";
      await API.put(`${endpointBase}/${jobId}`, form);
      toast.success("Job updated successfully!");
      onJobUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "We couldn't update the job. Please try again.");
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
            <input type="text" name="minSalary" placeholder="Min Salary (Rupees)" value={form.minSalary ? form.minSalary.toLocaleString("en-IN") : ""} onChange={(e) => {
              const formatted = formatIndianInput(e.target.value);
              const numericValue = parseIndianInput(formatted);
              setForm({ ...form, minSalary: numericValue });
            }} className="w-full p-2 border" />
            <input type="text" name="maxSalary" placeholder="Max Salary (Rupees)" value={form.maxSalary ? form.maxSalary.toLocaleString("en-IN") : ""} onChange={(e) => {
              const formatted = formatIndianInput(e.target.value);
              const numericValue = parseIndianInput(formatted);
              setForm({ ...form, maxSalary: numericValue });
            }} className="w-full p-2 border" />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Type
            </label>
            <div className="flex flex-wrap gap-2">
              {salaryOptions.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${form.salaryType === option
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={form.salaryType === option}
                    onChange={() => setForm({ ...form, salaryType: option })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {option}
                </label>
              ))}
            </div>
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
          <SkillsInput
            value={skillsList}
            onChange={(next) => setForm({ ...form, skillsRequired: next.join(", ") })}
            inputClassName="w-full mb-2 p-2 border"
          />
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


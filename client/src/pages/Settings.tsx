import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/api";
import { motion } from "framer-motion";
import { Camera, Trash2, Save, Building2, User, Shield } from "lucide-react";
import Avatar from "@/components/Avatar";
import SkillsInput from "@/components/SkillsInput";

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [freelancer, setFreelancer] = useState<any>(null);
    const [form, setForm] = useState<any>({});
    const [freelancerForm, setFreelancerForm] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [experience, setExperience] = useState<any[]>(form.experience || []);
    const [education, setEducation] = useState<any[]>(form.education || []);
    const [services, setServices] = useState<any[]>(freelancerForm.services || []);

    // Load user + company/freelancer info
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const userRes = await API.get("/users/me");
                setUser(userRes.data);
                setForm(userRes.data);
                if (userRes.data.role === "company_admin") {
                    const compRes = await API.get("/companies/me");
                    setCompany(compRes.data);
                } else if (userRes.data.role === "freelancer") {
                    const freeRes = await API.get("/freelancers/me");
                    setFreelancer(freeRes.data);
                    setFreelancerForm(freeRes.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleSave = async () => {
        setSaving(true);
        try {
            if (user.role === "company_admin") {
                await API.put("/companies/me", company);
            } else if (user.role === "freelancer") {
                await API.put("/users/me", form);
                await API.put("/freelancers/me", freelancerForm);
            } else {
                await API.put("/users/me", form);
            }
            alert("Profile updated successfully!");
            const getDashboardPath = () => {
                if (user?.role === "admin") return "/dashboard";
                if (user?.role === "company_admin") return "/company/dashboard";
                if (user?.role === "freelancer") return "/freelancer/dashboard";
                return "/user/dashboard";
            };
            navigate(getDashboardPath());
        } catch (err) {
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append("profilePhoto", file);

        try {
            const res = await API.put("/users/me", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUser(res.data.user);
            setForm(res.data.user);
            alert("Profile photo updated successfully!");
        } catch (err) {
            alert("Failed to update profile photo.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your account?")) return;
        try {
            await API.delete("/users/me");
            alert("Account deleted successfully.");
            localStorage.removeItem("token");
            window.location.href = "/";
        } catch {
            alert("Failed to delete account.");
        }
    };

    if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

    const isCompanyAdmin = user?.role === "company_admin";
    const isFreelancer = user?.role === "freelancer";
    const isAdmin = user?.role === "admin";
    const showUserFields = !isCompanyAdmin && !isFreelancer;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 border"
            >
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {isAdmin ? <Shield className="w-6 h-6 text-blue-600" /> :
                            isCompanyAdmin ? <Building2 className="w-6 h-6 text-blue-600" /> :
                                <User className="w-6 h-6 text-blue-600" />}
                        Account Settings
                    </h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 shadow"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {/* Profile Photo */}
                <div className="flex items-center gap-6 mb-8">
                    <Avatar
                        src={user?.profilePhoto}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-2 border-gray-200"
                    />
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="photo-upload"
                            disabled={uploadingPhoto}
                        />
                        <label
                            htmlFor="photo-upload"
                            className="px-3 py-2 border rounded-md flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                        >
                            <Camera className="w-4 h-4" />
                            {uploadingPhoto ? "Uploading..." : "Change Photo"}
                        </label>
                    </div>
                </div>

                {/* User Fields */}
                {showUserFields && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-gray-600">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email || ""}
                                onChange={handleChange}
                                disabled
                                className="w-full border rounded-md p-2 bg-gray-50"
                            />
                        </div>
                        {!isAdmin && (
                            <>
                                <div>
                                    <label className="text-sm text-gray-600">Headline</label>
                                    <input
                                        type="text"
                                        name="headline"
                                        value={form.headline || ""}
                                        onChange={handleChange}
                                        className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            <div>
                                <label className="text-sm text-gray-600">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">WhatsApp Number</label>
                                <input
                                    type="text"
                                    name="whatsappNumber"
                                    value={form.whatsappNumber || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={form.dateOfBirth ? form.dateOfBirth.split('T')[0] : ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Gender</label>
                                <select
                                    name="gender"
                                    value={form.gender || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Current Location (City, State)</label>
                                <input
                                    type="text"
                                    name="currentLocation"
                                    value={form.currentLocation || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Preferred Job Location</label>
                                <input
                                    type="text"
                                    name="preferredJobLocation"
                                    value={form.preferredJobLocation || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Educational Qualification</label>
                                <input
                                    type="text"
                                    name="educationalQualification"
                                    value={form.educationalQualification || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Year of Graduation</label>
                                <input
                                    type="number"
                                    name="yearOfGraduation"
                                    value={form.yearOfGraduation || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Work Experience (in years)</label>
                                <input
                                    type="number"
                                    name="workExperienceYears"
                                    value={form.workExperienceYears || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Current Employer</label>
                                <input
                                    type="text"
                                    name="currentEmployer"
                                    value={form.currentEmployer || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Current Designation</label>
                                <input
                                    type="text"
                                    name="currentDesignation"
                                    value={form.currentDesignation || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Notice Period</label>
                                <input
                                    type="text"
                                    name="noticePeriod"
                                    value={form.noticePeriod || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Current Salary</label>
                                <input
                                    type="number"
                                    name="currentSalary"
                                    value={form.currentSalary || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Expected Salary</label>
                                <input
                                    type="number"
                                    name="expectedSalary"
                                    value={form.expectedSalary || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Technical Skills (comma separated)</label>
                                <SkillsInput
                                    value={form.technicalSkills || []}
                                    onChange={(next) => setForm({ ...form, technicalSkills: next })}
                                    inputClassName="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Soft Skills (comma separated)</label>
                                <SkillsInput
                                    value={form.softSkills || []}
                                    onChange={(next) => setForm({ ...form, softSkills: next })}
                                    inputClassName="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Interested Skills to Learn (comma separated)</label>
                                <SkillsInput
                                    value={form.interestedSkills || []}
                                    onChange={(next) => setForm({ ...form, interestedSkills: next })}
                                    inputClassName="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Languages Known (comma separated)</label>
                                <input
                                    type="text"
                                    name="languagesKnown"
                                    value={form.languagesKnown ? form.languagesKnown.join(", ") : ""}
                                    onChange={(e) => setForm({ ...form, languagesKnown: e.target.value.split(", ").filter(s => s.trim()) })}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Certifications (comma separated)</label>
                                <input
                                    type="text"
                                    name="certifications"
                                    value={form.certifications ? form.certifications.join(", ") : ""}
                                    onChange={(e) => setForm({ ...form, certifications: e.target.value.split(", ").filter(s => s.trim()) })}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Website</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={form.website || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {(user?.role === "employee" || user?.role === "freelancer") && (
                                <>
                                    <div>
                                        <label className="text-sm text-gray-600">Department</label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={form.department || ""}
                                            onChange={handleChange}
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Position</label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={form.position || ""}
                                            onChange={handleChange}
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            {user?.role !== "company_admin" && (
                                <>
                                    <div>
                                        <label className="text-sm text-gray-600">Skills (comma separated)</label>
                                        <SkillsInput
                                            value={form.skills || []}
                                            onChange={(next) => setForm({ ...form, skills: next })}
                                            inputClassName="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">LinkedIn</label>
                                        <input
                                            type="text"
                                            name="socialLinks.linkedin"
                                            value={form.socialLinks?.linkedin || ""}
                                            onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })}
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">GitHub</label>
                                        <input
                                            type="text"
                                            name="socialLinks.github"
                                            value={form.socialLinks?.github || ""}
                                            onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, github: e.target.value } })}
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Twitter</label>
                                        <input
                                            type="text"
                                            name="socialLinks.twitter"
                                            value={form.socialLinks?.twitter || ""}
                                            onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })}
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-600">Experience</label>
                                        {(form.experience || []).map((exp: any, index: number) => (
                                            <div key={index} className="border rounded-md p-4 mb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Company"
                                                        value={exp.company || ""}
                                                        onChange={(e) => {
                                                            const newExp = [...(form.experience || [])];
                                                            newExp[index] = { ...newExp[index], company: e.target.value };
                                                            setForm({ ...form, experience: newExp });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Position"
                                                        value={exp.position || ""}
                                                        onChange={(e) => {
                                                            const newExp = [...(form.experience || [])];
                                                            newExp[index] = { ...newExp[index], position: e.target.value };
                                                            setForm({ ...form, experience: newExp });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                    <input
                                                        type="date"
                                                        placeholder="Start Date"
                                                        value={exp.startDate ? exp.startDate.split('T')[0] : ""}
                                                        onChange={(e) => {
                                                            const newExp = [...(form.experience || [])];
                                                            newExp[index] = { ...newExp[index], startDate: e.target.value };
                                                            setForm({ ...form, experience: newExp });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                    <input
                                                        type="date"
                                                        placeholder="End Date"
                                                        value={exp.endDate ? exp.endDate.split('T')[0] : ""}
                                                        onChange={(e) => {
                                                            const newExp = [...(form.experience || [])];
                                                            newExp[index] = { ...newExp[index], endDate: e.target.value };
                                                            setForm({ ...form, experience: newExp });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                    <textarea
                                                        placeholder="Description"
                                                        value={exp.description || ""}
                                                        onChange={(e) => {
                                                            const newExp = [...(form.experience || [])];
                                                            newExp[index] = { ...newExp[index], description: e.target.value };
                                                            setForm({ ...form, experience: newExp });
                                                        }}
                                                        className="border rounded-md p-2 md:col-span-2"
                                                        rows={2}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newExp = (form.experience || []).filter((_: any, i: number) => i !== index);
                                                        setForm({ ...form, experience: newExp });
                                                    }}
                                                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newExp = [...(form.experience || []), { company: "", position: "", startDate: "", endDate: "", description: "" }];
                                                setForm({ ...form, experience: newExp });
                                            }}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                        >
                                            Add Experience
                                        </button>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-600">Education</label>
                                        {(form.education || []).map((edu: any, index: number) => (
                                            <div key={index} className="border rounded-md p-4 mb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="School"
                                                        value={edu.school || ""}
                                                        onChange={(e) => {
                                                            const newEdu = [...(form.education || [])];
                                                            newEdu[index] = { ...newEdu[index], school: e.target.value };
                                                            setForm({ ...form, education: newEdu });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Degree"
                                                        value={edu.degree || ""}
                                                        onChange={(e) => {
                                                            const newEdu = [...(form.education || [])];
                                                            newEdu[index] = { ...newEdu[index], degree: e.target.value };
                                                            setForm({ ...form, education: newEdu });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Field of Study"
                                                        value={edu.fieldOfStudy || ""}
                                                        onChange={(e) => {
                                                            const newEdu = [...(form.education || [])];
                                                            newEdu[index] = { ...newEdu[index], fieldOfStudy: e.target.value };
                                                            setForm({ ...form, education: newEdu });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                    <input
                                                        type="date"
                                                        placeholder="Start Date"
                                                        value={edu.startDate ? edu.startDate.split('T')[0] : ""}
                                                        onChange={(e) => {
                                                            const newEdu = [...(form.education || [])];
                                                            newEdu[index] = { ...newEdu[index], startDate: e.target.value };
                                                            setForm({ ...form, education: newEdu });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                    <input
                                                        type="date"
                                                        placeholder="End Date"
                                                        value={edu.endDate ? edu.endDate.split('T')[0] : ""}
                                                        onChange={(e) => {
                                                            const newEdu = [...(form.education || [])];
                                                            newEdu[index] = { ...newEdu[index], endDate: e.target.value };
                                                            setForm({ ...form, education: newEdu });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newEdu = (form.education || []).filter((_: any, i: number) => i !== index);
                                                        setForm({ ...form, education: newEdu });
                                                    }}
                                                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newEdu = [...(form.education || []), { school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" }];
                                                setForm({ ...form, education: newEdu });
                                            }}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                        >
                                            Add Education
                                        </button>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-600">Projects</label>
                                        {(form.projects || []).map((proj: any, index: number) => (
                                            <div key={index} className="border rounded-md p-4 mb-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Project Title"
                                                        value={proj.title || ""}
                                                        onChange={(e) => {
                                                            const newProj = [...(form.projects || [])];
                                                            newProj[index] = { ...newProj[index], title: e.target.value };
                                                            setForm({ ...form, projects: newProj });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                    <textarea
                                                        placeholder="Description"
                                                        value={proj.description || ""}
                                                        onChange={(e) => {
                                                            const newProj = [...(form.projects || [])];
                                                            newProj[index] = { ...newProj[index], description: e.target.value };
                                                            setForm({ ...form, projects: newProj });
                                                        }}
                                                        className="border rounded-md p-2"
                                                        rows={2}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Link"
                                                        value={proj.link || ""}
                                                        onChange={(e) => {
                                                            const newProj = [...(form.projects || [])];
                                                            newProj[index] = { ...newProj[index], link: e.target.value };
                                                            setForm({ ...form, projects: newProj });
                                                        }}
                                                        className="border rounded-md p-2"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newProj = (form.projects || []).filter((_: any, i: number) => i !== index);
                                                        setForm({ ...form, projects: newProj });
                                                    }}
                                                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newProj = [...(form.projects || []), { title: "", description: "", link: "" }];
                                                setForm({ ...form, projects: newProj });
                                            }}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                        >
                                            Add Project
                                        </button>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-600">About you (50 words or 2-3 lines)</label>
                                        <textarea
                                            name="about"
                                            value={form.about || ""}
                                            onChange={handleChange}
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            maxLength={300}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-600">Resume Upload</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append("resume", file);
                                                try {
                                                    const res = await API.put("/users/me", formData, {
                                                        headers: { "Content-Type": "multipart/form-data" },
                                                    });
                                                    setForm(res.data);
                                                    alert("Resume uploaded successfully!");
                                                } catch (err) {
                                                    alert("Failed to upload resume.");
                                                }
                                            }}
                                            className="w-full border rounded-md p-2"
                                        />
                                        {form.resume && (
                                            <p className="text-sm text-gray-500 mt-1">Resume uploaded</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
                )}

                {/* Company Info Section */}
                {isCompanyAdmin && company && (
                    <div className="mt-10 border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-600">Company Name</label>
                                <input
                                    type="text"
                                    value={company.name}
                                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Domain</label>
                                <input
                                    type="text"
                                    value={company.domain}
                                    onChange={(e) => setCompany({ ...company, domain: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Year of Establishment</label>
                                <input
                                    type="number"
                                    value={company.yearOfEstablishment || ""}
                                    onChange={(e) => setCompany({ ...company, yearOfEstablishment: Number(e.target.value) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Industry / Sector</label>
                                <input
                                    type="text"
                                    value={company.industry || ""}
                                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Company Registration Number</label>
                                <input
                                    type="text"
                                    value={company.companyRegistrationNumber || ""}
                                    onChange={(e) => setCompany({ ...company, companyRegistrationNumber: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">GST</label>
                                <input
                                    type="text"
                                    value={company.gst || ""}
                                    onChange={(e) => setCompany({ ...company, gst: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">PAN</label>
                                <input
                                    type="text"
                                    value={company.pan || ""}
                                    onChange={(e) => setCompany({ ...company, pan: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Headquarters Location (City, State, Country)</label>
                                <input
                                    type="text"
                                    value={company.headquartersLocation || ""}
                                    onChange={(e) => setCompany({ ...company, headquartersLocation: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Branch Locations (comma separated)</label>
                                <input
                                    type="text"
                                    value={company.branchLocations ? company.branchLocations.join(", ") : ""}
                                    onChange={(e) => setCompany({ ...company, branchLocations: e.target.value.split(", ").filter(l => l.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Contact Person Name</label>
                                <input
                                    type="text"
                                    value={company.contactPersonName || ""}
                                    onChange={(e) => setCompany({ ...company, contactPersonName: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Contact Person Designation</label>
                                <input
                                    type="text"
                                    value={company.contactPersonDesignation || ""}
                                    onChange={(e) => setCompany({ ...company, contactPersonDesignation: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Official Email Address</label>
                                <input
                                    type="email"
                                    value={company.officialEmail || ""}
                                    onChange={(e) => setCompany({ ...company, officialEmail: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Company Website URL</label>
                                <input
                                    type="text"
                                    value={company.companyWebsiteUrl || ""}
                                    onChange={(e) => setCompany({ ...company, companyWebsiteUrl: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">LinkedIn / Social Media Profiles (comma separated)</label>
                                <input
                                    type="text"
                                    value={company.socialMediaProfiles ? company.socialMediaProfiles.join(", ") : ""}
                                    onChange={(e) => setCompany({ ...company, socialMediaProfiles: e.target.value.split(", ").filter(p => p.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Number of Employees</label>
                                <input
                                    type="number"
                                    value={company.numberOfEmployees || ""}
                                    onChange={(e) => setCompany({ ...company, numberOfEmployees: Number(e.target.value) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Annual Turnover / Revenue Range</label>
                                <input
                                    type="text"
                                    value={company.annualTurnover || ""}
                                    onChange={(e) => setCompany({ ...company, annualTurnover: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Services Offered (comma separated)</label>
                                <input
                                    type="text"
                                    value={company.servicesOffered ? company.servicesOffered.join(", ") : ""}
                                    onChange={(e) => setCompany({ ...company, servicesOffered: e.target.value.split(", ").filter(s => s.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Products Offered (comma separated)</label>
                                <input
                                    type="text"
                                    value={company.productsOffered ? company.productsOffered.join(", ") : ""}
                                    onChange={(e) => setCompany({ ...company, productsOffered: e.target.value.split(", ").filter(s => s.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Certifications / Accreditations (comma separated)</label>
                                <input
                                    type="text"
                                    value={company.certificationsAccreditations ? company.certificationsAccreditations.join(", ") : ""}
                                    onChange={(e) => setCompany({ ...company, certificationsAccreditations: e.target.value.split(", ").filter(c => c.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Key Clients / Partners (comma separated)</label>
                                <input
                                    type="text"
                                    value={company.keyClientsPartners ? company.keyClientsPartners.join(", ") : ""}
                                    onChange={(e) => setCompany({ ...company, keyClientsPartners: e.target.value.split(", ").filter(c => c.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Preferred Mode of Communication</label>
                                <input
                                    type="text"
                                    value={company.preferredModeOfCommunication || ""}
                                    onChange={(e) => setCompany({ ...company, preferredModeOfCommunication: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Billing Address</label>
                                <textarea
                                    value={company.billingAddress || ""}
                                    onChange={(e) => setCompany({ ...company, billingAddress: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Payment Method Preference</label>
                                <input
                                    type="text"
                                    value={company.paymentMethodPreference || ""}
                                    onChange={(e) => setCompany({ ...company, paymentMethodPreference: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Description</label>
                                <textarea
                                    value={company.description}
                                    onChange={(e) => setCompany({ ...company, description: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Freelancer Info Section */}
                {user?.role === "freelancer" && freelancer && (
                    <div className="mt-10 border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Freelancer Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-600">Qualification</label>
                                <input
                                    type="text"
                                    value={freelancerForm.qualification || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, qualification: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Contact</label>
                                <input
                                    type="text"
                                    value={freelancerForm.contact || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, contact: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Min Pricing</label>
                                <input
                                    type="number"
                                    value={freelancerForm.pricing?.min || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, pricing: { ...freelancerForm.pricing, min: Number(e.target.value) } })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Max Pricing</label>
                                <input
                                    type="number"
                                    value={freelancerForm.pricing?.max || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, pricing: { ...freelancerForm.pricing, max: Number(e.target.value) } })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Description of Work</label>
                                <textarea
                                    value={freelancerForm.descriptionOfWork || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, descriptionOfWork: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                    rows={3}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">About Freelancer</label>
                                <textarea
                                    value={freelancerForm.aboutFreelancer || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, aboutFreelancer: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Date of Birth</label>
                                <input
                                    type="date"
                                    value={freelancerForm.dateOfBirth ? freelancerForm.dateOfBirth.split('T')[0] : ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, dateOfBirth: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Gender</label>
                                <select
                                    value={freelancerForm.gender || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, gender: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Educational Qualification</label>
                                <input
                                    type="text"
                                    value={freelancerForm.educationalQualification || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, educationalQualification: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Skills / Expertise (comma separated)</label>
                                <SkillsInput
                                    value={freelancerForm.skills || []}
                                    onChange={(next) => setFreelancerForm({ ...freelancerForm, skills: next })}
                                    inputClassName="w-full border rounded-md p-2"
                                    chipClassName="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Years of Experience</label>
                                <input
                                    type="number"
                                    value={freelancerForm.yearsOfExperience || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, yearsOfExperience: Number(e.target.value) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Current Occupation / Employer</label>
                                <input
                                    type="text"
                                    value={freelancerForm.currentEmployer || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, currentEmployer: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Portfolio / Website URL</label>
                                <input
                                    type="text"
                                    value={freelancerForm.portfolioUrl || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, portfolioUrl: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">LinkedIn Profile URL</label>
                                <input
                                    type="text"
                                    value={freelancerForm.linkedin || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, linkedin: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">GitHub URL</label>
                                <input
                                    type="text"
                                    value={freelancerForm.github || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, github: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Twitter URL</label>
                                <input
                                    type="text"
                                    value={freelancerForm.twitter || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, twitter: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">WhatsApp Number</label>
                                <input
                                    type="text"
                                    value={freelancerForm.whatsappNumber || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, whatsappNumber: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Certifications (comma separated)</label>
                                <input
                                    type="text"
                                    value={freelancerForm.certifications ? freelancerForm.certifications.join(", ") : ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, certifications: e.target.value.split(", ").filter(c => c.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Languages Known (comma separated)</label>
                                <input
                                    type="text"
                                    value={freelancerForm.languagesKnown ? freelancerForm.languagesKnown.join(", ") : ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, languagesKnown: e.target.value.split(", ").filter(l => l.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Availability (Hours per week)</label>
                                <input
                                    type="number"
                                    value={freelancerForm.availabilityHours || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, availabilityHours: Number(e.target.value) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Preferred Working Time</label>
                                <input
                                    type="text"
                                    value={freelancerForm.preferredWorkingTime || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, preferredWorkingTime: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Expected Hourly Rate</label>
                                <input
                                    type="number"
                                    value={freelancerForm.expectedHourlyRate || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, expectedHourlyRate: Number(e.target.value) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Expected Project Rate</label>
                                <input
                                    type="number"
                                    value={freelancerForm.expectedProjectRate || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, expectedProjectRate: Number(e.target.value) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Payment Method Preference</label>
                                <input
                                    type="text"
                                    value={freelancerForm.paymentMethodPreference || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, paymentMethodPreference: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Tools / Software Proficiency (comma separated)</label>
                                <input
                                    type="text"
                                    value={freelancerForm.toolsProficiency ? freelancerForm.toolsProficiency.join(", ") : ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, toolsProficiency: e.target.value.split(", ").filter(t => t.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Past Clients / References (comma separated)</label>
                                <input
                                    type="text"
                                    value={freelancerForm.pastClients ? freelancerForm.pastClients.join(", ") : ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, pastClients: e.target.value.split(", ").filter(c => c.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Availability for Interview (Date & Time)</label>
                                <input
                                    type="text"
                                    value={freelancerForm.interviewAvailability || ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, interviewAvailability: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Resume Upload</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append("resume", file);
                                        try {
                                            const res = await API.put("/freelancers/me", formData, {
                                                headers: { "Content-Type": "multipart/form-data" },
                                            });
                                            setFreelancerForm(res.data);
                                            alert("Resume uploaded successfully!");
                                        } catch (err) {
                                            alert("Failed to upload resume.");
                                        }
                                    }}
                                    className="w-full border rounded-md p-2"
                                />
                                {freelancerForm.resume && (
                                    <p className="text-sm text-gray-500 mt-1">Resume uploaded</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Preferences (comma separated)</label>
                                <input
                                    type="text"
                                    value={freelancerForm.preferences ? freelancerForm.preferences.join(", ") : ""}
                                    onChange={(e) => setFreelancerForm({ ...freelancerForm, preferences: e.target.value.split(", ").filter(p => p.trim()) })}
                                    className="w-full border rounded-md p-2"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Services</label>
                                {(freelancerForm.services || []).map((serv: any, index: number) => (
                                    <div key={index} className="border rounded-md p-4 mb-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Title"
                                                value={serv.title || ""}
                                                onChange={(e) => {
                                                    const newServ = [...(freelancerForm.services || [])];
                                                    newServ[index] = { ...newServ[index], title: e.target.value };
                                                    setFreelancerForm({ ...freelancerForm, services: newServ });
                                                }}
                                                className="border rounded-md p-2"
                                            />
                                            <textarea
                                                placeholder="Description"
                                                value={serv.description || ""}
                                                onChange={(e) => {
                                                    const newServ = [...(freelancerForm.services || [])];
                                                    newServ[index] = { ...newServ[index], description: e.target.value };
                                                    setFreelancerForm({ ...freelancerForm, services: newServ });
                                                }}
                                                className="border rounded-md p-2"
                                                rows={2}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Link"
                                                value={serv.link || ""}
                                                onChange={(e) => {
                                                    const newServ = [...(freelancerForm.services || [])];
                                                    newServ[index] = { ...newServ[index], link: e.target.value };
                                                    setFreelancerForm({ ...freelancerForm, services: newServ });
                                                }}
                                                className="border rounded-md p-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Achievements (comma separated)"
                                                value={serv.achievements ? serv.achievements.join(", ") : ""}
                                                onChange={(e) => {
                                                    const newServ = [...(freelancerForm.services || [])];
                                                    newServ[index] = { ...newServ[index], achievements: e.target.value.split(", ").filter(a => a.trim()) };
                                                    setFreelancerForm({ ...freelancerForm, services: newServ });
                                                }}
                                                className="border rounded-md p-2"
                                            />
                                            <textarea
                                                placeholder="Other Details"
                                                value={serv.otherDetails || ""}
                                                onChange={(e) => {
                                                    const newServ = [...(freelancerForm.services || [])];
                                                    newServ[index] = { ...newServ[index], otherDetails: e.target.value };
                                                    setFreelancerForm({ ...freelancerForm, services: newServ });
                                                }}
                                                className="border rounded-md p-2"
                                                rows={2}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newServ = (freelancerForm.services || []).filter((_: any, i: number) => i !== index);
                                                setFreelancerForm({ ...freelancerForm, services: newServ });
                                            }}
                                            className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newServ = [...(freelancerForm.services || []), { title: "", description: "", link: "", achievements: [], otherDetails: "" }];
                                        setFreelancerForm({ ...freelancerForm, services: newServ });
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                >
                                    Add Service
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Section */}
                {!isAdmin && (
                    <div className="mt-10 border-t pt-6">
                        <h2 className="text-lg font-semibold  mb-3 text-red-600">Danger Zone</h2>
                        <button
                            onClick={handleDelete}
                            className="px-5 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete My Account
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Settings;

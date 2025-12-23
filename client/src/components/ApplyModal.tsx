import { toast } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import API from "../api/api";

interface ApplyModalProps {
  jobId: string;
  onClose: () => void;
  initialContact?: { name?: string; email?: string; phone?: string; altPhone?: string };
  onApplied?: (jobId: string) => void;
}

interface ExperienceItem {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ jobId, onClose, initialContact, onApplied }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [educationHistory, setEducationHistory] = useState([
    { school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" },
  ]);

  const [projects, setProjects] = useState([
    { name: "", description: "", link: "", startDate: "", endDate: "" },
  ]);

  type ResumeMode = "existing" | "upload";
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [name, setName] = useState<string>(initialContact?.name || "");
  const [email, setEmail] = useState<string>(initialContact?.email || "");
  const [phone, setPhone] = useState<string>(initialContact?.phone || "");
  const [altPhone, setAltPhone] = useState<string>(initialContact?.altPhone || "");

  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isFresher, setIsFresher] = useState<boolean>(true);
  const [years, setYears] = useState<number>(0);
  const [experienceHistory, setExperienceHistory] = useState<ExperienceItem[]>([
    { companyName: "", jobTitle: "", startDate: "", endDate: "", currentlyWorking: false, description: "" },
  ]);
  const [existingResumes, setExistingResumes] = useState<string[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [resumeMode, setResumeMode] = useState<ResumeMode>("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [hasProjects, setHasProjects] = useState<boolean>(true);


  useEffect(() => {
    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const res = await API.get("/jobs/my-profile");
        if (res.data) {
          const p: any = res.data;
          const resumesFromProfile: string[] = Array.isArray(p?.resumes) && p.resumes.length
            ? p.resumes.filter(Boolean).map((r: unknown) => String(r))
            : p?.resume
              ? [String(p.resume)]
              : [];
          const uniqueResumes: string[] = Array.from(new Set(resumesFromProfile)).slice(0, 3);
          setExistingResumes(uniqueResumes);
          setSelectedResume(uniqueResumes.length ? uniqueResumes[0] : null);
          setResumeMode(uniqueResumes.length ? "existing" : "upload");

          setName(p.contact?.name || "");
          setEmail(p.contact?.email || "");
          setPhone(p.contact?.phone || "");
          setAltPhone(p.contact?.altPhone || "");
          setCoverLetter(p.coverLetter || "");
          setResumeFile(null); // You can show note “Existing resume will be used”
          setIsFresher(p.experience?.isFresher ?? true);
          setYears(p.experience?.years ?? 0);
          setExperienceHistory(
            p.experience?.history?.map((h: any) => ({
              ...h,
              startDate: h.startDate ? h.startDate.slice(0, 10) : "",
              endDate: h.endDate ? h.endDate.slice(0, 10) : "",
            })) || []
          );

          setEducationHistory(
            p.education?.map((e: any) => ({
              ...e,
              startDate: e.startDate ? e.startDate.slice(0, 10) : "",
              endDate: e.endDate ? e.endDate.slice(0, 10) : "",
            })) || []
          );

          setProjects(
            p.projects?.map((proj: any) => ({
              ...proj,
              startDate: proj.startDate ? proj.startDate.slice(0, 10) : "",
              endDate: proj.endDate ? proj.endDate.slice(0, 10) : "",
            })) || []
          );

        }
      } catch (err) {
        console.error("No saved profile found for user.");
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumeMode("upload");
      setSelectedResume(null);
      setResumeFile(e.target.files[0]);
      toast.success("Resume ready to upload. Submit to save it.");
    }
  };

  const handleExperienceChange = (index: number, field: keyof ExperienceItem, value: string | boolean) => {
    const updated = [...experienceHistory];
    (updated[index] as any)[field] = value;
    setExperienceHistory(updated);
  };

  const addExperienceField = () => {
    setExperienceHistory([
      ...experienceHistory,
      { companyName: "", jobTitle: "", startDate: "", endDate: "", currentlyWorking: false, description: "" },
    ]);
  };

  const removeExperienceField = (index: number) => {
    setExperienceHistory(experienceHistory.filter((_, i) => i !== index));
  };

  const validateEmail = (em: string) => /\S+@\S+\.\S+/.test(em);
  const validatePhone = (p: string) => p.trim().length >= 7;

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!name || !email || !phone) {
        toast.error("Please fill all required contact fields.");
        return false;
      }
      if (!validateEmail(email)) {
        toast.error("Please enter a valid email.");
        return false;
      }
      if (!validatePhone(phone)) {
        toast.error("Please enter a valid phone number.");
        return false;
      }
      return true;
    }
    if (step === 2) {
    if (resumeMode === "upload") {
      if (!resumeFile) {
        toast.error("Please upload a resume.");
        return false;
      }
      return true;
    }
    if (resumeMode === "existing") {
      if (!selectedResume) {
        toast.error("Please select a saved resume or upload a new one.");
        return false;
      }
      return true;
    }
    return true;
  }

    if (step === 3) {
      if (!isFresher) {
        if (years === 0) {
          toast.error("Please specify years of experience.");
          return false;
        }
        for (let exp of experienceHistory) {
          if (!exp.companyName || !exp.jobTitle) {
            toast.error("Please complete all experience fields.");
            return false;
          }
        }
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleProjectChange = (index: number, field: keyof (typeof projects)[0], value: string) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const addProjectField = () => {
    setProjects([
      ...projects,
      { name: "", description: "", link: "", startDate: "", endDate: "" },
    ]);
  };

  const removeProjectField = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);

    const contact = { name, email, phone, altPhone };
    const experienceData = {
      isFresher,
      years: isFresher ? 0 : years,
      history: isFresher ? [] : experienceHistory,
    };

    const formData = new FormData();
    // formData.append("resume", resumeFile!);
    if (resumeMode === "upload" && resumeFile) {
      formData.append("resume", resumeFile);
    }
    if (resumeMode === "existing" && selectedResume) {
      formData.append("selectedResume", selectedResume);
    }

    formData.append("coverLetter", coverLetter);
    formData.append("contact", JSON.stringify(contact));
    formData.append("experience", JSON.stringify(experienceData));
    formData.append("education", JSON.stringify(educationHistory));
    formData.append("project", JSON.stringify(hasProjects ? projects : []));

    try {
      await API.post(`/jobs/${jobId}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (resumeFile) {
        toast.success("Resume uploaded successfully.");
      }
      toast.success("Application submitted successfully!");
      onApplied?.(jobId);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Contact Info", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { number: 2, title: "Resume & Letter", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { number: 3, title: "Experience", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { number: 4, title: "Education", icon: "M12 14l9-5-9-5-9 5 9 5zm0 7V14" },
    { number: 5, title: "Projects", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold mb-2">Apply for Position</h2>
          <p className="text-blue-100 text-sm">Complete all steps to submit your application</p>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-5 bg-gray-50 border-b">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.number
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {currentStep > step.number ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium text-center ${currentStep >= step.number ? "text-blue-600" : "text-gray-500"
                      }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 mb-6">
                    <div
                      className={`h-full rounded transition-all duration-300 ${currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                        }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Contact Info */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Contact Information
                </h3>
                <p className="text-gray-600 text-sm mb-6">Let us know how to reach you</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp Number
                    </label>

                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="sameAsPhone"
                        checked={altPhone === phone}
                        onChange={(e) => setAltPhone(e.target.checked ? phone : "")}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="sameAsPhone" className="text-sm text-gray-700">
                        Same as Phone Number
                      </label>
                    </div>

                    {altPhone !== phone && (
                      <input
                        type="tel"
                        placeholder="+1 (555) 987-6543"
                        value={altPhone}
                        onChange={(e) => setAltPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Resume & Cover Letter */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Resume & Cover Letter
                </h3>
                <p className="text-gray-600 text-sm mb-6">Upload your documents and tell us about yourself</p>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resume <span className="text-red-500">*</span>
                    </label>
                    {isProfileLoading && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-20" />
                          <path d="M22 12a10 10 0 00-10-10" strokeWidth="4" className="opacity-60" />
                        </svg>
                        Loading profile...
                      </span>
                    )}
                  </div>

                  {existingResumes.length > 0 && (
                    <div className="flex gap-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                        {existingResumes.map((resumeUrl, idx) => (
                          <label
                            key={resumeUrl}
                            className={`flex flex-col gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${resumeMode === "existing" && selectedResume === resumeUrl ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400"}`}
                            onClick={() => {
                              setResumeMode("existing");
                              setSelectedResume(resumeUrl);
                              setResumeFile(null);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                className="text-blue-600"
                                checked={resumeMode === "existing" && selectedResume === resumeUrl}
                                onChange={() => {
                                  setResumeMode("existing");
                                  setSelectedResume(resumeUrl);
                                  setResumeFile(null);
                                }}
                              />
                              <span className="font-semibold text-gray-800">Resume #{idx + 1}</span>
                            </div>
                            <a
                              href={resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 underline"
                            >
                              Preview
                            </a>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      onClick={() => setResumeMode("upload")}
                      className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${resumeMode === "upload" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"}`}
                    >
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>

                        {resumeFile ? (
                          <p className="text-sm text-gray-700 font-medium">{resumeFile.name}</p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-700 font-medium">Click to upload resume</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={8}
                    placeholder="Tell us why you're a great fit for this position..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Professional Experience
                </h3>
                <p className="text-gray-600 text-sm mb-6">Share your work history with us</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 px-6 py-4 border-2 rounded-xl cursor-pointer transition-all flex-1 hover:bg-blue-50" style={{ borderColor: isFresher ? '#2563eb' : '#d1d5db', backgroundColor: isFresher ? '#eff6ff' : 'transparent' }}>
                    <input
                      type="radio"
                      checked={isFresher}
                      onChange={() => setIsFresher(true)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 block">Fresher</span>
                      <span className="text-xs text-gray-600">No prior experience</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 px-6 py-4 border-2 rounded-xl cursor-pointer transition-all flex-1 hover:bg-blue-50" style={{ borderColor: !isFresher ? '#2563eb' : '#d1d5db', backgroundColor: !isFresher ? '#eff6ff' : 'transparent' }}>
                    <input
                      type="radio"
                      checked={!isFresher}
                      onChange={() => setIsFresher(false)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 block">Experienced</span>
                      <span className="text-xs text-gray-600">I have work experience</span>
                    </div>
                  </label>
                </div>

                {!isFresher && (
                  <div className="space-y-4 pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Years of Experience <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={years}
                        onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">Work History</h4>
                        <button
                          type="button"
                          onClick={addExperienceField}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Experience
                        </button>
                      </div>

                      {experienceHistory.map((exp, idx) => (
                        <div key={idx} className="p-5 border-2 border-gray-200 rounded-xl bg-gray-50 space-y-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800 flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                              </div>
                              Experience #{idx + 1}
                            </span>
                            {experienceHistory.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExperienceField(idx)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            placeholder="Company Name"
                            value={exp.companyName}
                            onChange={(e) => handleExperienceChange(idx, "companyName", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Job Title"
                            value={exp.jobTitle}
                            onChange={(e) => handleExperienceChange(idx, "jobTitle", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                              <input
                                type="date"
                                value={exp.startDate}
                                onChange={(e) => handleExperienceChange(idx, "startDate", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                              <input
                                type="date"
                                value={exp.endDate}
                                onChange={(e) => handleExperienceChange(idx, "endDate", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <textarea
                            placeholder="Brief description of your role and achievements..."
                            value={exp.description}
                            onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Education */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7V14" />
                  </svg>
                  Education Qualifications
                </h3>
                <p className="text-gray-600 text-sm mb-6">Add your academic background</p>
              </div>

              <div className="space-y-4">
                {educationHistory.map((edu, idx) => (
                  <div key={idx} className="p-5 border-2 border-gray-200 rounded-xl bg-gray-50 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        Education #{idx + 1}
                      </span>
                      {educationHistory.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEducationHistory(educationHistory.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="School / University"
                      value={edu.school}
                      onChange={(e) => {
                        const updated = [...educationHistory];
                        updated[idx].school = e.target.value;
                        setEducationHistory(updated);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Degree (e.g. B.Tech, MBA)"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...educationHistory];
                        updated[idx].degree = e.target.value;
                        setEducationHistory(updated);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study (e.g. Computer Science)"
                      value={edu.fieldOfStudy}
                      onChange={(e) => {
                        const updated = [...educationHistory];
                        updated[idx].fieldOfStudy = e.target.value;
                        setEducationHistory(updated);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => {
                            const updated = [...educationHistory];
                            updated[idx].startDate = e.target.value;
                            setEducationHistory(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                        <input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => {
                            const updated = [...educationHistory];
                            updated[idx].endDate = e.target.value;
                            setEducationHistory(updated);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setEducationHistory([...educationHistory, { school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" }])
                  }
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Education
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Projects
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Showcase your personal or professional projects
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Do you have projects to showcase?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-3 px-6 py-4 border-2 rounded-xl cursor-pointer transition-all flex-1 hover:bg-blue-50" style={{ borderColor: hasProjects ? '#2563eb' : '#d1d5db', backgroundColor: hasProjects ? '#eff6ff' : 'transparent' }}>
                      <input
                        type="radio"
                        checked={hasProjects}
                        onChange={() => setHasProjects(true)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-800 block">Yes</span>
                        <span className="text-xs text-gray-600">I have projects to add</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 px-6 py-4 border-2 rounded-xl cursor-pointer transition-all flex-1 hover:bg-blue-50" style={{ borderColor: !hasProjects ? '#2563eb' : '#d1d5db', backgroundColor: !hasProjects ? '#eff6ff' : 'transparent' }}>
                      <input
                        type="radio"
                        checked={!hasProjects}
                        onChange={() => setHasProjects(false)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-800 block">No</span>
                        <span className="text-xs text-gray-600">No projects to add</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {hasProjects && projects.map((proj, idx) => (
                <div key={idx} className="p-5 border-2 border-gray-200 rounded-xl bg-gray-50 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      Project #{idx + 1}
                    </span>
                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProjectField(idx)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Project Name"
                    value={proj.name}
                    onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />

                  <textarea
                    placeholder="Project Description"
                    value={proj.description}
                    onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />

                  <input
                    type="text"
                    placeholder="Project Link (optional)"
                    value={proj.link}
                    onChange={(e) => handleProjectChange(idx, "link", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={proj.startDate}
                        onChange={(e) => handleProjectChange(idx, "startDate", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={proj.endDate}
                        onChange={(e) => handleProjectChange(idx, "endDate", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {hasProjects && (
                <button
                  type="button"
                  onClick={addProjectField}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Project
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : handleBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-medium flex items-center gap-2 disabled:opacity-60"
              disabled={isSubmitting}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-medium flex items-center gap-2 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                    <path d="M22 12a10 10 0 00-10-10" strokeWidth="4" className="opacity-75" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;

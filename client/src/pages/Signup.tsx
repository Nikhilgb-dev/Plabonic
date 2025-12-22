import { toast } from "react-hot-toast";
import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    linkedin: "",
    github: "",
    twitter: "",
    acceptTerms: false,
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setProfilePhoto(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!form.acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value as string));
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);

      const { data } = await API.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("token", data.token);
      toast.success("Signup successful!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 border"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Create your account</h2>
        <p className="text-gray-600 text-center mb-6">For job seekers and professionals</p>

        {/* Step 1: Basic Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <div>
            <label className="text-sm text-gray-700 block mb-1">Profile Photo</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password *"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-2 pr-24 border rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 px-3 text-sm text-gray-600 hover:text-gray-800"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={form.acceptTerms}
              onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="acceptTerms" className="text-sm">
              I accept the{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-brand underline"
              >
                Terms and Conditions
              </button>
            </label>
          </div>
        </div>

        {/* Step 2: Social Links - Commented out */}
        {/* {step === 2 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg mb-3">Social Links</h3>
            <p className="text-sm text-gray-600 mb-4">Connect your social profiles (optional)</p>
            <input
              type="text"
              name="linkedin"
              placeholder="LinkedIn"
              value={form.linkedin}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="github"
              placeholder="GitHub"
              value={form.github}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="twitter"
              placeholder="Twitter"
              value={form.twitter}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        )} */}

        {/* Register Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-brand text-white py-2 rounded-md font-medium hover:bg-brand-dark transition"
          >
            Register
          </button>
        </div>

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-medium hover:underline">
            Log in
          </Link>
        </p>

        {/* <p className="mt-3 text-sm text-center text-gray-600">
          Are you a company?{" "}
          <Link to="/register-company" className="text-green-600 font-medium hover:underline">
            Register your company →
          </Link>
        </p>

        <p className="mt-3 text-sm text-center text-gray-600">
          Are you a freelancer?{" "}
          <Link to="/freelancers/register" className="text-green-600 font-medium hover:underline">
            Register as freelancer →
          </Link>
        </p> */}
      </form>
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
};

export default Signup;

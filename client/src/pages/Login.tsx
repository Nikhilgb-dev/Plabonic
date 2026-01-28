import { Mail, Lock } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/login", form);

      if (keepLoggedIn) {
        localStorage.setItem("token", data.token);
      } else {
        localStorage.setItem("token", data.token);
      }

      window.dispatchEvent(new Event("auth-change"));
      const decoded: any = jwtDecode(data.token);

      console.log('decoded', decoded);

      toast.success("Login successful!");

      if (decoded.role === "company_admin") {
        localStorage.setItem("company_token", data.token);
        navigate("/company/dashboard");
      } else if (decoded.role === "admin") {
        navigate("/dashboard");
      } else if (decoded.role === "freelancer") {
        localStorage.setItem("token", data.token);
        navigate("/freelancer/dashboard");
      } else {
        navigate("/user/dashboard");
      }

    } catch (err: any) {
      toast.error(err.response?.data?.message || "We couldn't sign you in. Check your email and password, then try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border"
      >
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Login
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Welcome back! Let's continue.
        </p>

        {/* Email Input */}
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative mb-4">
          <Lock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 pl-10 pr-24 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

        {/* Forgot Password Link */}
        <div className="text-right mb-4">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Keep me logged in */}
        <div className="flex items-center mb-6 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            className="accent-blue-600 mr-2 cursor-pointer"
          />
          Keep me logged in
        </div>

        {/* Log In Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 transition-all shadow"
        >
          Log In
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Register Options */}
        <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">
          Register
        </h3>

        <div className="flex flex-col gap-3">
          <Link
            to="/signup"
            className="w-full text-center py-2 rounded-md border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            Candidate
          </Link>
          <Link
            to="/register-company"
            className="w-full text-center py-2 rounded-md border border-green-600 text-green-600 font-medium hover:bg-green-50 transition"
          >
            Company
          </Link>
          <Link
            to="/freelancers/register"
            className="w-full text-center py-2 rounded-md border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition"
          >
            Freelancer
          </Link>
        </div>

        {/* Footer */}
        {/* <p className="mt-6 text-xs text-center text-gray-500">
          Trouble signing in?{" "}
          <span className="text-blue-600 font-medium cursor-pointer hover:underline">
            Get help
          </span>
        </p> */}
      </form>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default Login;


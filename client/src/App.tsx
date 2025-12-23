import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public pages
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Companies from "./pages/Companies";
import CompanyDetails from "./pages/CompanyDetails";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Communities from "./pages/Communities";
import CommunityDetails from "./pages/CommunityDetails";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import AdminApplications from "./pages/AdminApplications";

// Company Portal
import { CompanyProvider } from "./contexts/CompanyContext";
import CompanyLoginPage from "./pages/CompanyLoginPage";
import CompanyLayout from "./components/CompanyLayout";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyProtectedRoute from "./components/CompanyProtectedRoute";
import ManageJobsPage from "./pages/ManageJobsPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import CompanyEmployeesPage from "./pages/CompanyEmployeesPage";
import CompanyApplicantsPage from "./pages/CompanyApplicantsPage";
import CreateCompanyModal from "./components/CreateCompanyModal";
import CompanyRegister from "./pages/CompanyRegister";
import UserDashboard from "./pages/UserDashboard";
import AdminFeedbacks from "./pages/AdminFeedbacks";
import UserFeedbackPage from "./pages/UserFeedbackPage";
import CompanyFeedbackPage from "./pages/CompanyFeedbackPage";
import Settings from "./pages/Settings";
import FreelancerList from "./pages/FreelancerList";
import Freelancers from "./pages/Freelancers";
import AddFreelancer from "./pages/AddFreelancer";
import FreelancerRegister from "./pages/FreelancerRegister";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import MarketingDetail from "./pages/MarketingDetail";
import AboutUsPage from "./pages/About";
import Terms from "./pages/Terms";

export default function App() {
  return (
    <>
      <CompanyProvider>
        <div className="flex min-h-screen flex-col">
          <Toaster />
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* 🌍 Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/marketing/:id" element={<MarketingDetail />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetails />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/:id" element={<CommunityDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/terms" element={<Terms />} />
              <Route
                path="/dashboard/applications"
                element={<AdminApplications />}
              />

              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />

              <Route path="/dashboard/feedback" element={<UserFeedbackPage />} />
              <Route
                path="/company/feedback"
                element={
                  <CompanyProtectedRoute>
                    <CompanyFeedbackPage />
                  </CompanyProtectedRoute>
                }
              />
              <Route
                path="/dashboard/feedbacks"
                element={<AdminFeedbacks />}
              />

              <Route path="/settings" element={<Settings />} />




              {/* 🏢 Company Portal Routes */}
              <Route path="/company/login" element={<CompanyLoginPage />} />
              <Route
                path="/company"
                element={
                  <CompanyProtectedRoute>
                    <CompanyLayout />
                  </CompanyProtectedRoute>
                }
              >
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="profile" element={<CompanyProfilePage />} />
                <Route path="jobs" element={<ManageJobsPage />} />
                <Route path="employees" element={<CompanyEmployeesPage />} />
                <Route path="applicants" element={<CompanyApplicantsPage />} />
              </Route>

              {/* <Route
                path="/register-company"
                element={
                  <CreateCompanyModal
                    onClose={() => window.history.back()}
                    onCreated={() => window.history.back()}
                  />
                }
              /> */}

              <Route path="/register-company" element={<CompanyRegister />} />



              {/* Optional Admin Job Management */}
              <Route path="/admin/jobs" element={<ManageJobsPage />} />
              <Route path="/admin/freelancers" element={<FreelancerList />} />
              <Route path="/freelancers" element={<Freelancers />} />
              <Route path="/freelancers/register" element={<FreelancerRegister />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </CompanyProvider>
    </>
  );
}

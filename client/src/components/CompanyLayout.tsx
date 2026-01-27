import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCompany } from "../contexts/CompanyContext";
import {
    Menu,
    X,
    LayoutDashboard,
    Building2,
    BriefcaseBusiness,
    Users2,
    UserSearch,
    LogOut,
} from "lucide-react";

const navItems = [
    { path: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/company/applicants", label: "Applicants", icon: UserSearch },
    { path: "/company/jobs", label: "Jobs Postings", icon: BriefcaseBusiness },
    { path: "/company/employees", label: "Employees", icon: Users2 },
    { path: "/company/profile", label: "Profile", icon: Building2 },
];

const CompanyLayout: React.FC = () => {
    const { company, logout } = useCompany();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const doLogout = () => {
        logout();
        navigate("/company/login");
    };

    return (
        <div className="min-h-screen flex bg-gray-50 text-gray-800">
            {/* ===== SIDEBAR ===== */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-0
        `}
            >
                {/* Sidebar Header */}
                <div>
                    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            {company?.logo ? (
                                <img
                                    src={company.logo}
                                    alt={company.name || "Company Logo"}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {company?.name?.charAt(0).toUpperCase() || "C"}
                                </div>
                            )}
                            <div>
                                <div className="font-semibold text-gray-800 truncate w-32 sm:w-40">
                                    {company?.name}
                                </div>
                                <div className="text-xs text-gray-500">Company Admin</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-600 hover:text-gray-900 lg:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="mt-6 space-y-1 px-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`
                                    }
                                    onClick={() => setSidebarOpen(false)} // Close sidebar on nav click (mobile)
                                >
                                    <Icon
                                        size={18}
                                        className="text-gray-500 group-hover:text-blue-600 transition"
                                    />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout */}
                {/* <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={doLogout}
                        className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2 rounded-md transition"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div> */}
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Topbar for small screens */}
                <header className="bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3 lg:hidden">
                    <nav className="flex items-center gap-2 overflow-x-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${isActive
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    <Icon size={16} />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                    <h2 className="text-base font-semibold text-gray-800 truncate ml-2">
                        {company?.name || "Company Dashboard"}
                    </h2>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Overlay (mobile only) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default CompanyLayout;

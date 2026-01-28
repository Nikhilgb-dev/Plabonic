import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../api/api";
import logo from "../assets/logo.jpg";
import { Bell, User, LogOut, Settings, Briefcase, Users, LayoutDashboard, Menu, X, Copy, Check } from "lucide-react";
import Avatar from "./Avatar";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const supportEmail = " reachus@plabonic.com";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Fetch user details and notifications
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await API.get("/users/me");
        setUser(res.data);
        await fetchNotifications();
        if (res.data.role === "company_admin") {
          fetchCompanyRemarks();
        }
      } catch {
        setUser(null);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const clearedAt = Number(localStorage.getItem("notifications-cleared-at") || 0);
      // Base notifications (job-related)
      const [notifRes, remarksRes] = await Promise.allSettled([
        API.get("/notifications"),
        user?.role === "company_admin" ? API.get("/companies/me/remarks") : null,
      ]);

      let baseNotifications = [];
      if (notifRes.status === "fulfilled") {
        baseNotifications = (notifRes.value.data || []).filter((n: any) => {
          const createdAt = new Date(n.createdAt).getTime();
          return !clearedAt || createdAt > clearedAt;
        });
      }

      let remarkNotifications = [];
      if (
        user?.role === "company_admin" &&
        remarksRes.status === "fulfilled" &&
        remarksRes.value?.data?.remarksHistory
      ) {
        const remarks = remarksRes.value.data.remarksHistory;
        remarkNotifications = remarks.map((r: any) => ({
          _id: `remark-${r._id || Math.random().toString(36).substring(2)}`,
          message: `📝 Plabonic ${r.text}`,
          createdAt: r.date,
          isRead: false,
          type: "remark",
        })).filter((n: any) => {
          const createdAt = new Date(n.createdAt).getTime();
          return !clearedAt || createdAt > clearedAt;
        });
      }

      // Merge both (remarks first, then others)
      const merged = [...remarkNotifications, ...baseNotifications];

      // Deduplicate by message text
      const unique = Array.from(new Map(merged.map((n) => [n.message, n])).values());

      // Sort newest first
      unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotifications(unique);
    } catch (err) {
      console.error("Failed to fetch notifications or remarks", err);
    }
  };

  // 🔹 New: Fetch company remarks for company_admin users
  const fetchCompanyRemarks = async () => {
    try {
      const res = await API.get("/companies/me/remarks");
      const remarks = res.data.remarksHistory || [];

      const formattedRemarks = remarks.map((r: any) => ({
        _id: `remark-${r._id || Math.random().toString(36).substring(2)}`,
        message: `📝 Plabonic ${r.text}`,
        createdAt: r.date,
        isRead: false,
        type: "remark",
      }));

      // Merge remarks with other notifications and deduplicate
      setNotifications((prev) => {
        const merged = [...formattedRemarks, ...prev];
        const unique = Array.from(new Map(merged.map((n) => [n.message, n])).values());
        return unique.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (err) {
      console.error("Failed to fetch company remarks", err);
    }
  };

  const markAsRead = async (id: string) => {
    if (id.startsWith("remark-")) {
      // remarks are read-only, don't need API call
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      return;
    }
    await API.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const clearNotifications = async () => {
    try {
      await API.delete("/notifications");
      const clearedAt = Date.now();
      localStorage.setItem("notifications-cleared-at", String(clearedAt));
      setNotifications([]);
      toast.success("Notifications cleared");
    } catch (err) {
      console.error("Failed to clear notifications", err);
      toast.error("We couldn't clear notifications. Please try again.");
    }
  };

  const handleNotificationClick = async (n: any) => {
    setShowNotifications(false);
    try {
      await markAsRead(n._id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }

    // Redirect to origin if possible
    if (n.type === "remark") {
      navigate("/company/dashboard");
      return;
    }

    // For application-related notifications, redirect to user dashboard applications section
    navigate("/user/dashboard#applications");
  };

  // 🔹 Initial load
  useEffect(() => {
    fetchUser();
    window.addEventListener("auth-change", fetchUser);
    return () => window.removeEventListener("auth-change", fetchUser);
  }, []);

  // 🔹 Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (helpModalRef.current && !helpModalRef.current.contains(event.target as Node)) {
        setShowHelpModal(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Auto-refresh company remarks every 60s for live updates
  useEffect(() => {
    if (user?.role === "company_admin") {
      const interval = setInterval(fetchCompanyRemarks, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setShowUserMenu(false);
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
      ? "text-blue-600 bg-blue-50"
      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  const getDashboardLink = () => {
    if (user?.role === "admin") return { to: "/dashboard", label: "Admin Dashboard" };
    if (user?.role === "company_admin") return { to: "/company/dashboard", label: "Company Dashboard" };
    if (user?.role === "freelancer") return { to: "/freelancer/dashboard", label: "Freelancer Dashboard" };
    if (user?.role === "user") return { to: "/user/dashboard", label: "Dashboard" };
    return null;
  };

  const dashboardLink = getDashboardLink();

  const handleGmailCompose = () => {
    const subject = encodeURIComponent("Support request from Plabonic");
    const body = encodeURIComponent("Hi team,\n\nI need help with...");
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <header className="sticky p-1.5 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="relative mr-8">
                <img
                  src={logo}
                  alt="Plabonic"
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
                <span className="absolute -top-1 -right-6 sm:-right-8 bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-full">
                  Beta
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-2">
              <NavLink to="/jobs" className={navLinkClass}>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Jobs</span>
                </div>
              </NavLink>
              <NavLink to="/freelancers" className={navLinkClass}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Freelancers</span>
                </div>
              </NavLink>
            </nav>
          </div>

          {/* Mobile centered nav links */}
          <nav className="flex flex-1 items-center justify-center gap-2 lg:hidden">
            <NavLink to="/jobs" className={mobileNavLinkClass}>
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </NavLink>
            <NavLink to="/freelancers" className={mobileNavLinkClass}>
              <Users className="w-4 h-4" />
              <span>Freelancers</span>
            </NavLink>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
            {/* Get Help Button - Hidden on mobile */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="hidden lg:block px-3 xl:px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap"
            >
              Get Help
            </button>

            {user ? (
              <>
                {/* Dashboard Button - Hidden on smaller screens */}
                {dashboardLink && (
                  <Link
                    to={dashboardLink.to}
                    className="hidden xl:flex px-3 lg:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 items-center gap-2 whitespace-nowrap"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden xl:inline">Dashboard</span>
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-semibold min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center rounded-full px-1"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </motion.span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-800 flex items-center gap-2">
                              <span>Notifications</span>
                              {unreadCount > 0 && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                  {unreadCount} new
                                </span>
                              )}
                            </h3>
                            {notifications.length > 0 && (
                              <button
                                onClick={clearNotifications}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                aria-label="Clear notifications"
                                type="button"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 sm:p-8 text-center">
                              <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 text-xs sm:text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <motion.div
                                key={n._id}
                                whileHover={{ backgroundColor: "rgb(249, 250, 251)" }}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer transition-colors ${n.isRead ? "bg-white" : n.type === "remark"
                                  ? "bg-yellow-50/60"
                                  : "bg-blue-50/50"
                                  }`}
                              >
                                <div className="flex gap-2 sm:gap-3">
                                  <div
                                    className={`w-2 h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${n.isRead ? "bg-gray-300" : n.type === "remark"
                                      ? "bg-yellow-400"
                                      : "bg-blue-500"
                                      }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed break-words">
                                      {n.message}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                      {new Date(n.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu - Hidden on mobile, shown in mobile menu instead */}
                <div className="hidden sm:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Avatar
                      src={user.profilePhoto}
                      alt="profile"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-200 flex-shrink-0"
                    />
                    <span className="hidden md:block font-medium text-gray-800 text-xs sm:text-sm max-w-[80px] lg:max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                          <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-2">
                          <NavLink
                            to="/settings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </NavLink>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              // Mobile login button for logged out state
              location.pathname !== '/login' && (
                <Link
                  to="/login"
                  className="sm:hidden px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              )
            )}
          </div>
          {/* Login/Logout Button */}
          {location.pathname !== '/login' && (
            user ? (
              <button
                onClick={handleLogout}
                className="hidden sm:block px-3 lg:px-4 py-2 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden sm:block px-3 lg:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && user && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="px-3 sm:px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* User Profile Section - Mobile Only */}
              <div className="sm:hidden flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <Avatar
                  src={user.profilePhoto}
                  alt="profile"
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Mobile Nav Links */}
              {/* <nav className="space-y-1">
                <NavLink
                  to="/jobs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <Briefcase className="w-5 h-5 flex-shrink-0" />
                  <span>Jobs</span>
                </NavLink>
                <NavLink
                  to="/freelancers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  <span>Freelancers</span>
                </NavLink>
              </nav> */}

              {/* Mobile Actions */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                {dashboardLink && (
                  <NavLink
                    to={dashboardLink.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    <span>{dashboardLink.label}</span>
                  </NavLink>
                )}

                <NavLink
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span>Settings</span>
                </NavLink>

                <button
                  onClick={() => {
                    setShowHelpModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span>Get Help</span>
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black bg-opacity-60 flex items-center justify-center mt-40"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              ref={helpModalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[85vh] overflow-y-auto mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Get Help</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Tap the button below to compose an email in your mail app (Gmail on mobile will open if installed).
                </p>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={supportEmail}
                      readOnly
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(supportEmail);
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      }}
                      className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-700" />}
                      <span>{copiedEmail ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=Support%20request%20from%20Plabonic`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 text-xs sm:text-sm text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Gmail Web
                </a>
              </div>
              <div className="mt-4 sm:mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

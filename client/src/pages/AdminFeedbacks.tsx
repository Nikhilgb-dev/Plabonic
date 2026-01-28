import React, { useEffect, useState } from "react";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Star, Building2, Reply, X, Send } from "lucide-react";
import Avatar from "../components/Avatar";
import toast from "react-hot-toast";

interface Feedback {
  _id: string;
  message: string;
  rating?: number;
  reply?: string;
  subject?: string;
  repliedAt?: string;
  targetType: "platform" | "company";
  targetId?: { name?: string };
  submittedBy: "user" | "company";
  user?: { name: string; profilePhoto?: string };
  company?: { name: string };
  createdAt: string;
}

const AdminFeedbacks: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filtered, setFiltered] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<"all" | "platform" | "company">("all");
  const [loading, setLoading] = useState(true);

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  // ===== Fetch Feedbacks =====
  const fetchFeedbacks = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await API.get<Feedback[]>("/feedbacks/admin/all");
      setFeedbacks(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (filter === "all") setFiltered(feedbacks);
    else setFiltered(feedbacks.filter((f) => f.targetType === filter));
  }, [filter, feedbacks]);

  // ===== Reply Handling =====
  const openReplyModal = (id: string): void => {
    setSelectedFeedback(id);
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (): Promise<void> => {
    if (!replyText.trim()) {
      toast.error("Please write a reply before sending.");
      return;
    }
    try {
      await API.put(`/feedbacks/${selectedFeedback}/reply`, { reply: replyText });
      toast.success("Reply sent successfully!");
      setShowReplyModal(false);
      setReplyText("");
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
      toast.error("We couldn't send the reply. Please try again.");
    }
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback Center</h1>
              <p className="text-gray-600 text-sm">
                Manage all feedback from users and companies
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          {(["all"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${filter === type
                ? "bg-blue-600 text-white shadow-blue-200"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
            >
              {type === "all"
                ? "All Feedback"
                : type === "platform"
                  ? "Platform Feedback"
                  : "Company Feedback"}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{filtered.length}</span>
            <span>feedback{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading feedbacks...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No feedbacks found</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
              <div className="grid gap-4 p-4">
                <AnimatePresence>
                  {filtered.map((fb, index) => (
                    <motion.div
                      key={fb._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-gradient-to-br from-white to-blue-50/30 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Left: Author Info */}
                        <div className="flex items-start gap-3 min-w-fit">
                          {fb.submittedBy === "user" ? (
                            <Avatar
                              src={fb.user?.profilePhoto}
                              alt={fb.user?.name || "User"}
                              className="w-12 h-12 rounded-full ring-2 ring-blue-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                              <Building2 className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {fb.submittedBy === "user"
                                ? fb.user?.name
                                : fb.company?.name || "Company"}
                            </div>
                            <div className="text-xs text-gray-500 capitalize flex items-center gap-2 mt-0.5">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fb.submittedBy === "user"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-indigo-100 text-indigo-700"
                                }`}>
                                {fb.submittedBy}
                              </span>
                              <span>•</span>
                              <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Content */}
                        <div className="flex-1 min-w-0">
                          {/* Type & Target */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium capitalize">
                              {fb.targetType}
                            </span>
                            {fb.targetType === "company" && (
                              <span className="text-xs text-gray-600">
                                → {fb.targetId?.name || "Company"}
                              </span>
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-gray-700 text-sm leading-relaxed mb-3">
                            {fb.message}
                          </p>

                          {/* Subject */}
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Subject
                          </p>
                          <p className="text-sm text-blue-800">
                            {fb.subject}
                          </p>

                          {/* Rating */}
                          {fb.rating && (
                            <div className="flex items-center gap-1 mb-3">
                              {Array.from({ length: fb.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">
                                ({fb.rating}/5)
                              </span>
                            </div>
                          )}

                          {/* Reply */}
                          {fb.reply && (
                            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-3 mt-3">
                              <div className="flex items-start gap-2">
                                <Reply className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-blue-900 mb-1">
                                    Admin Reply
                                  </p>
                                  <p className="text-sm text-blue-800">
                                    {fb.reply}
                                  </p>
                                  {fb.repliedAt && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      {new Date(fb.repliedAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2">
                          {!fb.reply && (
                            <button
                              onClick={() => openReplyModal(fb._id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                            >
                              <Reply className="w-4 h-4" />
                              Reply
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Reply className="w-5 h-5 text-blue-600" />
                  Reply to Feedback
                </h2>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="w-full border border-gray-200 rounded-xl p-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Reply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFeedbacks;




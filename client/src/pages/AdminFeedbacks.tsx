import React, { useEffect, useState } from "react";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Star, Building2, Reply, X, Send, Trash2 } from "lucide-react";
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
  showOnHome?: boolean;
}

const AdminFeedbacks: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filtered, setFiltered] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<"all" | "platform" | "company">("all");
  const [loading, setLoading] = useState(true);

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  const notifyHomepageFeedbackUpdate = () => {
    const timestamp = Date.now().toString();
    localStorage.setItem("public-feedback-updated-at", timestamp);
    window.dispatchEvent(new Event("public-feedback-updated"));
  };

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
    if (filter === "all") {
      setFiltered(feedbacks);
      return;
    }
    setFiltered(feedbacks.filter((feedback) => feedback.targetType === filter));
  }, [filter, feedbacks]);

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

  const handleHomepageVisibility = async (
    id: string,
    showOnHome: boolean
  ): Promise<void> => {
    try {
      await API.put(`/feedbacks/${id}/homepage`, { showOnHome });
      toast.success(
        showOnHome
          ? "Feedback added to the home page."
          : "Feedback removed from the home page."
      );
      notifyHomepageFeedbackUpdate();
      setFeedbacks((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, showOnHome } : item
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("We couldn't update home page visibility. Please try again.");
    }
  };

  const handleDeleteFeedback = async (id: string): Promise<void> => {
    const confirmed = window.confirm(
      "Delete this feedback permanently? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/feedbacks/${id}`);
      toast.success("Feedback deleted successfully.");
      notifyHomepageFeedbackUpdate();
      setFeedbacks((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("We couldn't delete the feedback. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
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
                Review every feedback submission and choose what appears on the home page.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          {(["all", "platform", "company"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                filter === type
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
          <div className="ml-auto flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              {feedbacks.filter((item) => item.showOnHome).length} on home
            </span>
            <span className="font-medium">{filtered.length}</span>
            <span>feedback{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </motion.div>

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
                  {filtered.map((feedback, index) => {
                    const authorName =
                      feedback.submittedBy === "user"
                        ? feedback.user?.name
                        : feedback.company?.name || "Company";

                    return (
                      <motion.div
                        key={feedback._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-gradient-to-br from-white to-blue-50/30 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="flex items-start gap-3 min-w-fit">
                            {feedback.submittedBy === "user" ? (
                              <Avatar
                                src={feedback.user?.profilePhoto}
                                alt={feedback.user?.name || "User"}
                                className="w-12 h-12 rounded-full ring-2 ring-blue-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">
                                {authorName}
                              </div>
                              <div className="text-xs text-gray-500 capitalize flex items-center gap-2 mt-0.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    feedback.submittedBy === "user"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-indigo-100 text-indigo-700"
                                  }`}
                                >
                                  {feedback.submittedBy}
                                </span>
                                <span>&bull;</span>
                                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium capitalize">
                                {feedback.targetType}
                              </span>
                              {feedback.showOnHome ? (
                                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
                                  Showing on home
                                </span>
                              ) : null}
                              {feedback.targetType === "company" ? (
                                <span className="text-xs text-gray-600">
                                  for {feedback.targetId?.name || "Company"}
                                </span>
                              ) : null}
                            </div>

                            <p className="text-gray-700 text-sm leading-relaxed mb-3">
                              {feedback.message}
                            </p>

                            {feedback.subject ? (
                              <>
                                <p className="text-sm font-medium text-blue-900 mb-1">
                                  Subject
                                </p>
                                <p className="text-sm text-blue-800 mb-3">
                                  {feedback.subject}
                                </p>
                              </>
                            ) : null}

                            {feedback.rating ? (
                              <div className="flex items-center gap-1 mb-3">
                                {Array.from({ length: feedback.rating }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">
                                  ({feedback.rating}/5)
                                </span>
                              </div>
                            ) : null}

                            {feedback.reply ? (
                              <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-3 mt-3">
                                <div className="flex items-start gap-2">
                                  <Reply className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-blue-900 mb-1">
                                      Admin Reply
                                    </p>
                                    <p className="text-sm text-blue-800">
                                      {feedback.reply}
                                    </p>
                                    {feedback.repliedAt ? (
                                      <div className="text-xs text-blue-600 mt-1">
                                        {new Date(feedback.repliedAt).toLocaleDateString()}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end gap-2">
                            <button
                              onClick={() =>
                                handleHomepageVisibility(
                                  feedback._id,
                                  !feedback.showOnHome
                                )
                              }
                              className={`px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md text-sm font-medium whitespace-nowrap ${
                                feedback.showOnHome
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {feedback.showOnHome ? "Remove from Home" : "Show on Home"}
                            </button>
                            <button
                              onClick={() => handleDeleteFeedback(feedback._id)}
                              className="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all shadow-sm hover:shadow-md text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                            {!feedback.reply ? (
                              <button
                                onClick={() => openReplyModal(feedback._id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                              >
                                <Reply className="w-4 h-4" />
                                Reply
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showReplyModal ? (
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
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default AdminFeedbacks;

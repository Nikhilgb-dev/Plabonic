import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import API from "../api/api";
import FeedbackModal from "../components/FeedbackModal";

interface Feedback {
    _id: string;
    message: string;
    subject?: string;
    rating?: number;
    reply?: string;
    repliedAt?: string;
    createdAt: string;
}

const FreelancerFeedbackPage: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = async () => {
        try {
            const res = await API.get("/feedbacks/my");
            setFeedbacks(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch freelancer feedback", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Freelancer Feedback</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Share product feedback, issues, and suggestions directly from your freelancer account.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            to="/freelancer/dashboard"
                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Back to Dashboard
                        </Link>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            Share Feedback
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="py-10 text-center text-gray-500">Loading feedback...</p>
                ) : feedbacks.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
                        <p className="text-lg font-semibold text-gray-800">No feedback shared yet.</p>
                        <p className="mt-2 text-sm text-gray-500">
                            Use the button above to send platform feedback from your freelancer account.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedbacks.map((feedback) => (
                            <motion.div
                                key={feedback._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {feedback.subject?.trim() || "Platform feedback"}
                                        </h2>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {new Date(feedback.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {feedback.rating ? (
                                        <div className="flex gap-1 text-yellow-500">
                                            {Array.from({ length: feedback.rating }).map((_, index) => (
                                                <Star key={index} className="h-4 w-4 fill-yellow-400" />
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                    {feedback.message}
                                </p>

                                {feedback.reply ? (
                                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                                        <div className="font-semibold">Plabonic Reply</div>
                                        <p className="mt-1 whitespace-pre-wrap">{feedback.reply}</p>
                                        {feedback.repliedAt ? (
                                            <div className="mt-2 text-xs text-blue-600/80">
                                                Replied on {new Date(feedback.repliedAt).toLocaleDateString()}
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {showModal ? (
                <FeedbackModal
                    onClose={() => setShowModal(false)}
                    onSubmitted={fetchFeedbacks}
                    targetType="platform"
                />
            ) : null}
        </div>
    );
};

export default FreelancerFeedbackPage;

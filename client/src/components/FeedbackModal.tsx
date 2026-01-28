import { useState } from "react";
import { Star, X, MessageSquare } from "lucide-react";
import API from "@/api/api";
import toast from "react-hot-toast";

interface FeedbackModalProps {
    onClose: () => void;
    targetType: "platform" | "company";
    targetId?: string;
    subject?: string;
    onSubmitted?: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, targetType, targetId, subject, onSubmitted }) => {
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState<number | null>(null);
    const [subjectValue, setSubjectValue] = useState(subject || "");
    const [loading, setLoading] = useState(false);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.success("Please write your feedback");
            return;
        }
        setLoading(true);
        try {
            // Simulating API call since we don't have the actual API
            await new Promise(resolve => setTimeout(resolve, 1000));
            await API.post("/feedbacks", {
                targetType,
                targetId,
                message,
                subject: subjectValue,
                rating,
            });
            toast.success("Feedback submitted successfully!");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("We couldn't send feedback. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const displayRating = hoveredRating || rating;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Your Feedback
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Tell us about your {targetType === "company" ? "company" : "platform"} experience
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Rating Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Rate your experience
                        </label>
                        <div className="flex items-center gap-2 justify-center py-3">
                            {[1, 2, 3, 4, 5].map((r) => (
                                <button
                                    type="button"
                                    key={r}
                                    onClick={() => setRating(r)}
                                    onMouseEnter={() => setHoveredRating(r)}
                                    onMouseLeave={() => setHoveredRating(null)}
                                    className="group transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-all ${displayRating && displayRating >= r
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300 hover:text-yellow-300"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating && (
                            <p className="text-center text-sm text-gray-600">
                                {rating === 5 && "Excellent! 🎉"}
                                {rating === 4 && "Great! 👍"}
                                {rating === 3 && "Good 😊"}
                                {rating === 2 && "Could be better 😐"}
                                {rating === 1 && "Needs improvement 😔"}
                            </p>
                        )}
                    </div>

                    {/* Message Section */}
                    <div className="space-y-3">
                        <label htmlFor="feedback-message" className="block text-sm font-semibold text-gray-700">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subjectValue}
                            onChange={(e) => setSubjectValue(e.target.value)}
                            placeholder="Enter feedback subject..."
                            className="px-4 py-2 border-2 border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                        />
                        <label htmlFor="feedback-message" className="block text-sm font-semibold text-gray-700">
                            Your feedback
                        </label>
                        <textarea
                            id="feedback-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Share your thoughts with us..."
                            className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-500">
                            {message.length} characters
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                "Submit Feedback"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;

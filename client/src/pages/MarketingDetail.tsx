import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { MarketingCard } from "@/types/marketing";
import API from "@/api/api";

const badgeMap: Record<
  keyof MarketingCard["badges"],
  { label: string; icon: React.ReactNode }
> = {
  trusted: { label: "Trusted", icon: <ThumbsUp className="w-4 h-4" /> },
  verified: { label: "Verified", icon: <ShieldCheck className="w-4 h-4" /> },
  recommended: { label: "Recommended", icon: <CheckCircle2 className="w-4 h-4" /> },
};

const MarketingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [card, setCard] = useState<MarketingCard | null>(null);
  const [active, setActive] = useState(0);

  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);

  // ✅ Ensure page always opens at top
  useEffect(() => {
    // works even when coming from a scrolled list page
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [id]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/users/me");
          setUser(res.data);
          // Prefill form with user data
          setBuyerName(res.data.name || "");
          setEmail(res.data.email || "");
          setMobile(res.data.phone || "");
          setWhatsappNumber(res.data.phone || "");
        } catch {
          setUser(null);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCard = async () => {
      if (!id) return;
      setLoading(true);
      setNotFound(false);
      try {
        const { data } = await API.get<MarketingCard>(`/marketing/cards/${id}`);
        setCard(data);
        setActive(0);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [id]);

  const gallery = useMemo(
    () => (card?.gallery || []).filter((item) => typeof item === "string" && item.trim().length > 0),
    [card]
  );

  useEffect(() => {
    if (!gallery.length) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % gallery.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [gallery.length]);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !id) return;

    if (!buyerName || !email || !mobile) {
      toast.error("Please enter your name, email, and mobile number.");
      return;
    }

    try {
      await API.post(`/marketing/cards/${id}/enquiries`, {
        buyerName,
        email,
        mobile,
        whatsappNumber,
        quantity,
      });
      toast.success("Payment request submitted successfully");
      setBuyerName(user?.name || "");
      setEmail(user?.email || "");
      setMobile(user?.phone || "");
      setShowPaymentForm(false);
    } catch (err) {
      console.error(err);
      const message =
        (err as any)?.response?.data?.message ||
        (err as Error)?.message ||
        "We couldn't submit the enquiry. Please try again.";
      toast.error(message);
    }
  };

  const handlePayNow = () => {
    if (user) {
      setShowPaymentForm(true);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!card || notFound) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-700 text-lg text-center">Marketing card not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const enabledBadges = Object.entries(card.badges || {}).filter(([, v]) => v);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* LEFT: Gallery */}
          <div className="relative rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-gray-100">
              {gallery.length > 0 ? (
                <img
                  src={gallery[active]}
                  alt={`${card.title} shot ${active + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                  No images
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 shadow hover:bg-white"
                  onClick={() => setActive((prev) => (prev - 1 + gallery.length) % gallery.length)}
                  aria-label="Previous image"
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>

                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 shadow hover:bg-white"
                  onClick={() => setActive((prev) => (prev + 1) % gallery.length)}
                  aria-label="Next image"
                  type="button"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {gallery.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full ${
                        idx === active ? "bg-blue-600" : "bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Details */}
          <div className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3">
              <img
                src={card.logo}
                alt={card.name}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border bg-white shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">{card.name}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                  {card.title}
                </h1>
              </div>
            </div>

            {/* Price + CTA row (nice on mobile) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                {card.originalPrice && card.originalPrice > card.price && (
                  <>
                    <span className="text-xl sm:text-2xl text-gray-500 line-through">
                      Rs. {Number(card.originalPrice || 0).toLocaleString()}
                    </span>
                    <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      {Math.round(((card.originalPrice - card.price) / card.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Rs. {Number(card.price || 0).toLocaleString()}
                </div>
              </div>

              {/* Desktop CTA button to show form - only show if logged in */}
              {user && (
                <button
                  type="button"
                  onClick={handlePayNow}
                  className="hidden sm:inline-flex px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {card.description}
            </p>

            {/* Badges */}
            {enabledBadges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {enabledBadges.map(([key]) => {
                  const badgeClasses = {
                    trusted: "bg-[#0080ff] text-white border-[#0080ff]",
                    verified: "bg-[#80ff00] text-black border-[#80ff00]",
                    recommended: "bg-black text-white border-black",
                  }[key] || "bg-emerald-50 text-emerald-700 border-emerald-100";
                  return (
                    <span
                      key={key}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${badgeClasses}`}
                    >
                      {badgeMap[key as keyof MarketingCard["badges"]]?.icon}
                      {badgeMap[key as keyof MarketingCard["badges"]]?.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Payment Form or Login Message */}
            {user ? (
              showPaymentForm && (
                <form
                  ref={formRef}
                  onSubmit={handleEnquiry}
                  className="space-y-3 p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Form</h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-gray-600">Name</span>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm text-gray-600">Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-sm text-gray-600">Mobile Number</span>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-sm text-gray-600">Preferred WhatsApp Number</span>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm text-gray-600">Quantity</span>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </label>

                  <div className="text-lg font-semibold text-gray-900">
                    Total: Rs. {Number(card.price * quantity || 0).toLocaleString()}
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  >
                    Submit Enquiry
                  </button>
                </form>
              )
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white shadow-sm text-center">
                <p className="text-lg font-semibold text-gray-900">Please sign in first</p>
                <p className="text-sm text-gray-600 mt-2">You need to be logged in to make a payment.</p>
              </div>
            )}

            {/* little bottom spacing for mobile sticky CTA - only when form is shown */}
            {showPaymentForm && <div className="h-16 sm:hidden" />}
          </div>
        </div>
      </div>

      {/* ✅ Mobile sticky CTA (so the form doesn’t "dominate" at first glance) */}
      {user && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Price</p>
              <div className="flex items-center gap-2">
                {card.originalPrice && card.originalPrice > card.price && (
                  <span className="text-sm text-gray-500 line-through">
                    Rs. {Number(card.originalPrice || 0).toLocaleString()}
                  </span>
                )}
                <p className="text-base font-bold text-gray-900 truncate">
                  Rs. {Number(card.price || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePayNow}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Submit Enquiry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingDetail;



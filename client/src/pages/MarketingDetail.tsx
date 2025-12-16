import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, CheckCircle2, ShieldCheck, ThumbsUp } from "lucide-react";
import toast from "react-hot-toast";
import { MarketingCard } from "@/types/marketing";
import API from "@/api/api";

const badgeMap: Record<keyof MarketingCard["badges"], { label: string; icon: React.ReactNode }> = {
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
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      if (!id) return;
      setLoading(true);
      setNotFound(false);
      try {
        const { data } = await API.get<MarketingCard>(`/marketing/cards/${id}`);
        setCard(data);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [id]);

  const gallery = useMemo(() => card?.gallery || [], [card]);

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
      toast.error("Please fill in your name, email, and mobile number.");
      return;
    }
    try {
      await API.post(`/marketing/cards/${id}/enquiries`, {
        buyerName,
        email,
        mobile,
      });
      toast.success("Enquiry submitted to admin");
      setBuyerName("");
      setEmail("");
      setMobile("");
    } catch (err) {
      console.error(err);
      const message =
        (err as any)?.response?.data?.message ||
        (err as Error)?.message ||
        "Failed to submit enquiry";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!card || notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-700 text-lg">Marketing card not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="relative rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-[4/3] w-full overflow-hidden">
              {gallery.length > 0 && (
                <img
                  src={gallery[active]}
                  alt={`${card.title} shot ${active + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {gallery.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow hover:bg-white"
                  onClick={() => setActive((prev) => (prev - 1 + gallery.length) % gallery.length)}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow hover:bg-white"
                  onClick={() => setActive((prev) => (prev + 1) % gallery.length)}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {gallery.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full ${idx === active ? "bg-blue-600" : "bg-white/70"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={card.logo} alt={card.name} className="w-12 h-12 rounded-full object-cover border" />
              <div>
                <p className="text-sm text-gray-500">{card.name}</p>
                <h1 className="text-2xl font-bold text-gray-900">{card.title}</h1>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{card.description}</p>

            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(card.badges || {})
                .filter(([, value]) => value)
                .map(([key]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    {badgeMap[key as keyof MarketingCard["badges"]]?.icon}
                    {badgeMap[key as keyof MarketingCard["badges"]]?.label}
                  </span>
                ))}
            </div>

            <div className="text-3xl font-bold text-gray-900">Rs. {Number(card.price || 0).toLocaleString()}</div>

            <form onSubmit={handleEnquiry} className="space-y-3 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Buy now</h3>
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
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Buy Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDetail;

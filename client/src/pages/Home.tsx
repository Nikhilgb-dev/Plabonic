import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from '../api/api';
import { Link } from 'react-router-dom';
import { MarketingCard } from '@/types/marketing';
import Avatar from '@/components/Avatar';
import { Star } from 'lucide-react';

export default function EduleLanding() {
  const [companyLogos, setCompanyLogos] = useState<string[]>([]);
  const [loadingLogos, setLoadingLogos] = useState(true);
  const [marketingCards, setMarketingCards] = useState<MarketingCard[]>([]);
  const [marketingLoading, setMarketingLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchCompanies = async () => {
      try {
        const res = await API.get("/companies");
        if (cancelled) return;

        const companies = Array.isArray(res.data) ? res.data : [];
        const uniqueLogos = Array.from(
          new Set(
            companies
              .map((company: { logo?: string | null }) => company.logo ?? "")
              .filter((logo): logo is string => Boolean(logo))
          )
        );

        setCompanyLogos(uniqueLogos);
      } catch (error) {
        console.error("Error fetching company logos:", error);
      } finally {
        if (!cancelled) setLoadingLogos(false);
      }
    };

    fetchCompanies();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await API.get("/marketing/cards");
        setMarketingCards(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching marketing cards", err);
      } finally {
        setMarketingLoading(false);
      }
    };
    fetchCards();
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await API.get("/feedbacks/public?limit=6");
        setFeedbacks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching feedbacks", err);
      } finally {
        setFeedbackLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const marqueeLogos: string[] = companyLogos.length
    ? [...companyLogos, ...companyLogos, ...companyLogos]
    : [];

  // const categories = [
  //   "UI/UX Design",
  //   "Development",
  //   "Data Science",
  //   "Business",
  //   "Financial",
  //   "Marketing"
  // ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden  p-10">
        <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
            </div>

            <p className="text-gray-600 mb-2">Take your first step towards a successful career </p>
            <h1 className="text-5xl font-bold leading-tight mb-4">
              Build Your Career<br />
              <span className="text-green-600 relative">
                Right here
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                  <path d="M0 4 Q 100 8 200 4" stroke="#10b981" strokeWidth="2" fill="none" />
                </svg>
              </span>.
            </h1>

            <p className="text-gray-600 mb-6">
              Job search made simple Apply easily and connect directly with top job providers on our platform.<br />

            </p>

            <Link to="/jobs" className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">
              Search Jobs
            </Link>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop"
              alt="Student with laptop"
              className="w-full h-auto relative z-10"
            />
            {/* Arrow */}
            <svg className="absolute top-16 right-1/4 w-24 h-24 text-yellow-400" viewBox="0 0 100 100">
              <path d="M10 50 Q 50 10 90 50" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
                </marker>
              </defs>
            </svg>

            {/* Green Arrow */}
            <svg className="absolute bottom-32 right-0 w-32 h-32 text-green-500" viewBox="0 0 100 100">
              <path d="M90 10 Q 50 50 10 90" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>

            {/* Decorative dots */}
            <div className="absolute bottom-8 left-8">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos Marquee */}
      <section className="bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
                Trusted by teams
              </p>
              <h3 className="text-2xl font-bold text-gray-900">Companies hiring with us</h3>
            </div>
            {loadingLogos && (
              <p className="text-sm text-gray-500">Loading logos...</p>
            )}
          </div>

          {companyLogos.length > 0 ? (
            <div className="relative mt-6 overflow-hidden">
              <motion.div
                className="flex w-max items-center gap-8 py-4"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              >
                {marqueeLogos.map((logo: string, idx: number) => (
                  <div
                    key={`${logo}-${idx}`}
                    className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl"
                  >
                    <img
                      src={logo}
                      alt={`Company logo ${idx + 1}`}
                      className="h-16 w-16 object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          ) : (
            !loadingLogos && (
              <p className="mt-6 text-sm text-gray-500">
                Logos will appear here once companies start uploading them.
              </p>
            )
          )}
        </div>
      </section>

      {/* Courses Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-2">
          Discover <span className="text-green-600 relative">
            Products
            <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 120 6">
              <path d="M0 3 Q 60 6 120 3" stroke="#10b981" strokeWidth="2" fill="none" />
            </svg>
          </span>
        </h2>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mt-8 mb-12">
          {/* <div className="relative">
            <input
              type="text"
              placeholder="Search your course"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-2 rounded">
              <Search className="w-5 h-5" />
            </button>
          </div> */}
        </div>

        {/* Category Pills */}
        {/* <div className="flex gap-3 mb-12 overflow-x-auto pb-4 justify-center flex-wrap">
          <button className="px-2 py-1 text-2xl">&lt;</button>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${idx === 0 ? 'bg-green-600 text-white' : 'border border-gray-300 hover:border-green-600'
                }`}
            >
              {cat}
            </button>
          ))}
          <button className="px-2 py-1 text-2xl">&gt;</button>
        </div> */}

        {/* Course Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-8">
          {marketingLoading && (
            <p className="text-sm text-gray-500">Loading marketing courses...</p>
          )}
          {!marketingLoading && marketingCards.length === 0 && (
            <p className="text-sm text-gray-500">No marketing courses yet.</p>
          )}
          {marketingCards.map((card) => (
            <Link
              to={`/marketing/${card._id || card.id}`}
              key={card._id || card.id}
              className="border border-gray-100 rounded-lg overflow-hidden shadow-sm bg-gradient-to-b from-gray-50 to-white hover:shadow-lg transition"
            >
              <div className="relative h-36 overflow-hidden">
                <img src={card.coverImage} alt={card.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <img
                    src={card.logo}
                    alt={card.name}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <div>
                    <p className="text-white text-sm font-semibold">{card.name}</p>
                    <p className="text-xs text-white/80">{card.title}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {card.originalPrice && card.originalPrice > card.price && (
                      <span className="text-sm text-gray-500 line-through">
                        Rs. {Number(card.originalPrice || 0).toLocaleString()}
                      </span>
                    )}
                    <span className="text-lg font-semibold text-gray-900">
                      Rs. {Number(card.price || 0).toLocaleString()}
                    </span>
                    {card.originalPrice && card.originalPrice > card.price && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        {Math.round(((card.originalPrice - card.price) / card.originalPrice) * 100)}% off
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 mb-2">
                  {card.badges?.trusted && (
                    <span className="px-2 py-1 text-xs rounded-full border bg-[#0080ff] text-white border-[#0080ff]">
                      Trusted
                    </span>
                  )}
                  {card.badges?.verified && (
                    <span className="px-2 py-1 text-xs rounded-full border bg-[#80ff00] text-black border-[#80ff00]">
                      Verified
                    </span>
                  )}
                  {card.badges?.recommended && (
                    <span className="px-2 py-1 text-xs rounded-full border bg-black text-white border-black">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* <div className="text-center">
          <button className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition">
            Other Course
          </button>
        </div> */}
      </section>

      {/* Feedback Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-t border-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Feedback</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What people say about Plabonic</h2>
            <p className="text-sm text-gray-600 mt-3 max-w-2xl">
              Real feedback from users and companies using the platform.
            </p>
          </div>

          {feedbackLoading && (
            <p className="text-sm text-gray-500 text-center">Loading feedback...</p>
          )}
          {!feedbackLoading && feedbacks.length === 0 && (
            <p className="text-sm text-gray-500 text-center">No feedback yet.</p>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map((f) => {
              const authorName = f.submittedBy === "company" ? f.company?.name : f.user?.name;
              const avatarSrc = f.submittedBy === "company" ? f.company?.logo : f.user?.profilePhoto;
              const rating = Number(f.rating || 0);
              return (
                <div
                  key={f._id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={avatarSrc}
                      alt={authorName || "Feedback author"}
                      className="w-11 h-11 rounded-full border border-gray-200"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {authorName || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {f.submittedBy === "company" ? "Company" : "User"}
                      </p>
                    </div>
                  </div>

                  {rating > 0 && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${idx < rating ? "fill-yellow-400" : "fill-transparent text-gray-300"}`}
                        />
                      ))}
                    </div>
                  )}

                  {f.subject && (
                    <p className="text-sm font-semibold text-gray-900">{f.subject}</p>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{f.message}</p>
                  {f.reply && (
                    <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                      <p className="text-xs font-semibold text-blue-700">Admin reply</p>
                      <p className="text-xs text-blue-700/80 mt-1 line-clamp-3">{f.reply}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Instructor CTA */}
      {/* <section className="bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl">
            <p className="text-green-600 mb-2">Become A Instructor</p>
            <h2 className="text-3xl font-bold mb-4">
              You can join with Edule<br />
              as a <span className="text-green-600 relative">
                instructor
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 150 6">
                  <path d="M0 3 Q 75 6 150 3" stroke="#10b981" strokeWidth="2" fill="none" />
                </svg>
              </span>?
            </h2>
            <button className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">
              Drop Information
            </button>
          </div>

          <div className="absolute bottom-8 right-8">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}

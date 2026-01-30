import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Sparkles,
    Users,
    Briefcase,
    MessageSquareText,
    ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const supportEmail = "Plabonic.hq@gmail.com";

const ABOUT = {
    title: "About Plabonic",
    subtitle:
        "A technology-driven platform that bridges candidates, companies, and freelancers — simply, transparently, and effectively.",
    paragraphs: [
        `Plabonic is built on the vision of making job search and hiring simple, transparent, and effective. We are a technology-driven platform that bridges the gap between candidates, companies, and freelancers by creating a seamless space where opportunities and talent meet directly. Our focus is on empowering individuals to find meaningful work while enabling organizations to connect with the right people faster and more efficiently.`,
        `At Plabonic, we believe that recruitment should not be complicated. By combining smart tools with an intuitive interface, we make it easy for candidates to apply for jobs and for employers to discover talent that matches their needs. Our platform is designed to eliminate unnecessary barriers, ensuring that every interaction is authentic, trustworthy, and geared toward growth.`,
        `We are committed to building a community where careers are nurtured, businesses thrive, and freelancers find projects that align with their skills. With verified listings, direct communication channels, and a strong emphasis on trust, Plabonic stands as a reliable partner in the journey of professional development. Our mission is to redefine the hiring experience by prioritizing clarity, accessibility, and impact.`,
        `Driven by innovation and guided by integrity, Plabonic is more than just a job portal. It is a career ecosystem that supports students, professionals, and enterprises across industries. We aspire to become India’s most trusted platform for career building and hiring, where opportunities are accessible, connections are meaningful, and growth is limitless.`,
    ],
    mission:
        "To redefine the hiring experience by prioritizing clarity, accessibility, and impact — helping people find meaningful work and enabling organizations to hire faster with trust.",
    vision:
        "To become India’s most trusted platform for career building and hiring, where opportunities are accessible, connections are meaningful, and growth is limitless.",
    values: [
        {
            icon: ShieldCheck,
            title: "Trust & Verification",
            desc: "Verified listings and reliable profiles to keep interactions authentic and safe.",
        },
        {
            icon: Sparkles,
            title: "Simplicity",
            desc: "An intuitive experience for candidates and employers — without unnecessary barriers.",
        },
        {
            icon: MessageSquareText,
            title: "Direct Communication",
            desc: "Clear channels that help talent and employers connect quickly and confidently.",
        },
        {
            icon: Users,
            title: "Community & Growth",
            desc: "A career ecosystem supporting students, professionals, freelancers, and enterprises.",
        },
    ],
    // stats: [
    //     { label: "Candidates", value: "10K+" },
    //     { label: "Companies", value: "1K+" },
    //     { label: "Freelancers", value: "5K+" },
    //     { label: "Verified Listings", value: "Trusted" },
    // ],
};

function PrimaryButton({ children }: { children: React.ReactNode }) {
    return (
        <Link to={"/jobs"} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]">
            {children}
        </Link>
    );
}

function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
            {children}
        </button>
    );
}

function Tile({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {children}
        </div>
    );
}

export default function AboutUsPage() {
    const [showContactModal, setShowContactModal] = useState(false);
    const contactModalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contactModalRef.current && !contactModalRef.current.contains(event.target as Node)) {
                setShowContactModal(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-slate-200">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/5 via-transparent to-transparent" />
                <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
                            <Briefcase className="h-4 w-4" />
                            Career ecosystem for India
                        </div>

                        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                            {ABOUT.title}
                        </h1>
                        <p className="mt-4 text-lg text-slate-600">{ABOUT.subtitle}</p>

                    </motion.div>

                    {/* Stats */}
                    {/* <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {ABOUT.stats.map((s) => (
                            <Tile key={s.label}>
                                <div className="text-2xl font-semibold">{s.value}</div>
                                <div className="text-sm text-slate-600">{s.label}</div>
                            </Tile>
                        ))}
                    </div> */}
                </div>
            </section>

            {/* Body */}
            <section className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
                <div className="grid gap-10 lg:grid-cols-12">
                    {/* Main */}
                    <div className="lg:col-span-8 space-y-5">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-5"
                        >
                            {ABOUT.paragraphs.map((p, i) => (
                                <p key={i} className="text-base leading-7 text-slate-800">
                                    {p}
                                </p>
                            ))}
                        </motion.div>

                        {/* Mission + Vision */}
                        <div className="grid gap-4 sm:grid-cols-2 pt-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="text-lg font-semibold">Our Mission</div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {ABOUT.mission}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="text-lg font-semibold">Our Vision</div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {ABOUT.vision}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="text-lg font-semibold">What we stand for</div>

                            <div className="mt-4 space-y-4">
                                {ABOUT.values.map((v) => (
                                    <div key={v.title} className="flex gap-3">
                                        <div className="mt-0.5 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                                            <v.icon className="h-5 w-5 text-slate-900" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{v.title}</div>
                                            <div className="text-sm leading-6 text-slate-600">
                                                {v.desc}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-2">
                                    <OutlineButton onClick={() => setShowContactModal(true)}>
                                        Contact Plabonic <MessageSquareText className="h-4 w-4" />
                                    </OutlineButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="border-t border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-6xl px-4 py-12">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Let’s build careers together.
                            </h2>
                            <p className="mt-1 text-slate-600">
                                Verified listings • Direct communication • Faster hiring
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Plabonic Modal */}
            <AnimatePresence>
                {showContactModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center"
                        onClick={() => setShowContactModal(false)}
                    >
                        <motion.div
                            ref={contactModalRef}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[85vh] overflow-y-auto mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="space-y-3 sm:space-y-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Get Hello</h3>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Share your query and we will respond as soon as possible.
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
                                            onClick={() => navigator.clipboard.writeText(supportEmail)}
                                            className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                                            title="Copy email"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <a
                                    href={`mailto:${supportEmail}?subject=${encodeURIComponent("Support request from Plabonic")}`}
                                    className="block w-full px-4 py-2 text-xs sm:text-sm text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Open Mail App
                                </a>
                            </div>
                            <div className="mt-4 sm:mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

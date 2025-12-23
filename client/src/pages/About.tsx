import React from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    Sparkles,
    Users,
    Briefcase,
    MessageSquareText,
    ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

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

function OutlineButton({ children }: { children: React.ReactNode }) {
    return (
        <button className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]">
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
                                    <OutlineButton>
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
        </div>
    );
}

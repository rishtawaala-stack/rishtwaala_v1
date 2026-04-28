"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BadgeCheck,
  ArrowRight,
  Heart,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export default function Home() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem("token")));
  }, []);

  const joinHref = isAuthed ? "/dashboard" : "/register";

  const featuredProfiles = useMemo(
    () => [
      {
        id: 1,
        name: "Priya S.",
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        profession: "Data Analyst",
        location: "Mumbai",
      },
      {
        id: 2,
        name: "Rahul M.",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
        profession: "Entrepreneur",
        location: "Delhi",
      },
      {
        id: 3,
        name: "Sneha K.",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        profession: "Architect",
        location: "Bengaluru",
      },
      {
        id: 4,
        name: "Vikram P.",
        image:
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=200&auto=format&fit=crop",
        profession: "Doctor",
        location: "Pune",
      },
    ],
    []
  );

  return (
    <main className="relative isolate min-h-screen text-dark font-sans overflow-hidden">
      <div aria-hidden className="fixed inset-0 z-0 bg-[#120b0a]">
        <img
          src="/background.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_28%] opacity-92 scale-[0.94]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent blur-[80px]" />
        <div className="absolute -bottom-24 right-[-120px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-secondary/15 via-primary/10 to-transparent blur-[90px]" />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="rw-container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Rishtawaala"
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/20"
              />
              <span className="text-sm font-extrabold tracking-tight text-white">
                Rishtawaala
              </span>
            </Link>

            <nav className="hidden items-center gap-10 text-sm font-semibold text-white/70 md:flex">
              <Link href="#how" className="hover:text-white">
                How it works
              </Link>
              <Link href="#profiles" className="hover:text-white">
                Profiles
              </Link>
              <Link href="#join" className="hover:text-white">
                Join
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {!isAuthed ? (
                <Link href="/login" className="hidden md:inline-flex text-sm font-semibold text-white/85 hover:text-white">
                  Sign in
                </Link>
              ) : (
                <Link href="/dashboard" className="hidden md:inline-flex text-sm font-semibold text-white/85 hover:text-white">
                  Dashboard
                </Link>
              )}
              <Link href={joinHref} className="rounded-full bg-gradient-to-r from-[#ff6a76] to-[#a94bff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(255,106,118,0.28)] transition hover:scale-[1.02]">
                {isAuthed ? "Continue" : "Join free"}
              </Link>
            </div>
          </div>
        </header>

      <section className="rw-container pb-10 pt-16 md:pt-20">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-xl text-white">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-white/80"
            >
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[#ff8d93]" />
                Aadhar verified profiles.
              </span>
              <span>Serious intentions.</span>
              <span>Real connections.</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#fff8f5] md:text-[5.75rem]"
            >
              Find the one
              <span className="block">you&apos;ll actually</span>
              <span className="block text-[#ff9b94]">marry.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-lg text-base leading-8 text-white/78 md:text-lg"
            >
              We match you with people who value respect, family and lifelong
              commitment. No games. Just meaningful connections.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href={joinHref}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff6a76] to-[#9e4fff] px-7 py-4 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(255,106,118,0.3)] transition hover:scale-[1.02]"
              >
                {isAuthed ? "Open dashboard" : "Join free"}
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
              >
                See how it works
              </Link>
            </motion.div>

            <div className="mt-10 flex items-center gap-4 text-white/75">
              <div className="flex -space-x-3">
                {featuredProfiles.slice(0, 3).map((profile) => (
                  <img
                    key={profile.id}
                    src={profile.image}
                    alt={profile.name}
                    className="h-11 w-11 rounded-full border-2 border-black/25 object-cover shadow-lg"
                  />
                ))}
              </div>
              <div className="text-sm leading-6 text-white/78">
                <span className="font-semibold text-white">50,000+</span>{" "}
                people found meaningful connections
              </div>
              <Heart className="h-5 w-5 fill-[#ff8d93] text-[#ff8d93]" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-[42px] bg-gradient-to-br from-[#ff8d93]/15 via-[#9e4fff]/10 to-transparent blur-[40px]" />
            <div className="overflow-hidden rounded-[36px] border border-white/20 bg-[#43251f]/28 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
              <div className="relative min-h-[500px] p-4 md:p-6">
                <div className="relative z-10 flex items-center justify-between text-white">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                      Today&apos;s best match
                    </div>
                    <div className="mt-2 text-lg font-semibold tracking-tight text-white/95">
                      Top matches for your vibe
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#ff9b94]">
                    View all
                  </div>
                </div>

                <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { ...featuredProfiles[0], age: "28", match: "89%" },
                    { ...featuredProfiles[1], age: "30", match: "86%" },
                    { ...featuredProfiles[2], age: "27", match: "87%" },
                    { ...featuredProfiles[3], age: "29", match: "85%" },
                  ].map((profile) => (
                    <div
                      key={profile.id}
                      className="group relative rounded-[24px] border border-transparent bg-[rgba(84,49,42,0.42)] p-3.5 text-white shadow-[0_14px_32px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-y-1 hover:bg-[rgba(97,58,48,0.5)]"
                    >
                      <div className="absolute right-4 top-4 rounded-full border border-[#ffb1aa]/40 px-3 py-1 text-center text-[11px] leading-none text-[#ffb1aa]">
                        <div className="text-sm font-semibold">{profile.match}</div>
                        <div className="mt-1 text-[10px] text-white/60">match</div>
                      </div>
                      <div className="flex items-start gap-4 pr-16">
                        <img src={profile.image} alt={profile.name} className="h-12 w-12 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="text-lg font-extrabold tracking-tight">
                            {profile.name}
                          </div>
                          <div className="mt-1 text-xs text-white/72">
                            {profile.age} - {profile.profession}
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-white/65">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex items-center justify-between">
                        <Heart className="h-5 w-5 text-[#ff8d93]" />
                        <span className="text-xs font-medium text-white/55">
                          Ready to connect
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 mt-5">
                  <Link
                    href="/matches"
                    className="flex items-center justify-center gap-2 rounded-full border border-transparent bg-white/10 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/15"
                  >
                    <Users className="h-4 w-4" />
                    Browse more matches
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="relative py-16 md:py-24">
        <div className="rw-container">
          <div className="relative overflow-hidden rounded-[44px] border border-transparent bg-[rgba(10,7,6,0.58)] px-5 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl md:px-8 md:py-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="max-w-3xl text-white">
              <h2 className="font-serif text-4xl font-semibold tracking-[-0.04em] text-[#fff8f5] md:text-5xl">
                A calmer way to find your forever.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/74 md:text-lg">
                Designed for Gen Z and millennials who want commitment without
                the noise.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  title: "Build a real profile",
                  desc: "Show values, goals, and the life you want - beyond photos.",
                  icon: <Users className="h-5 w-5 text-white" />,
                  tone: "from-[#a95dff] via-[#8d46f5] to-[#7042ff]",
                },
                {
                  title: "Get curated compatibility",
                  desc: "Less scrolling, more quality. Intent-led suggestions.",
                  icon: <Sparkles className="h-5 w-5 text-white" />,
                  tone: "from-[#d37a63] via-[#c76656] to-[#b24945]",
                },
                {
                  title: "Talk with confidence",
                  desc: "Verified identity, privacy controls, and respectful interactions.",
                  icon: <ShieldCheck className="h-5 w-5 text-white" />,
                  tone: "from-[#ff5f92] via-[#ff4476] to-[#d92c68]",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-transparent bg-[rgba(30,19,17,0.55)] p-5 text-white shadow-[0_16px_36px_rgba(0,0,0,0.2)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-[rgba(38,24,21,0.68)]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${item.tone} shadow-[0_12px_24px_rgba(0,0,0,0.18)]`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-[#f9eee9]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-white/68">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="font-serif text-3xl font-semibold tracking-[-0.035em] text-[#fff8f5] md:text-4xl">
                  Featured profiles
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                  Curated examples - real matches live inside the app.
                </p>
              </div>
              <Link
                href="/matches"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-transparent bg-white/10 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/15"
              >
                Explore all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div id="profiles" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {featuredProfiles.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="group rounded-[28px] border border-transparent bg-[rgba(41,28,23,0.55)] p-5 text-white shadow-[0_16px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-[rgba(52,34,28,0.68)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={profile.image}
                        alt={profile.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[#2a1612] bg-[#33d17a]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xl font-semibold tracking-tight text-[#fff6f1]">
                        {profile.name}
                      </div>
                      <div className="mt-1 text-sm text-white/72">
                        {profile.id === 1 && "28"}
                        {profile.id === 2 && "30"}
                        {profile.id === 3 && "27"}
                        {profile.id === 4 && "29"} - {profile.profession}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 inline-flex rounded-full bg-black/20 px-4 py-2 text-sm font-medium text-white/78">
                    <MapPin className="mr-2 h-4 w-4 text-[#e4a07c]" />
                    {profile.location}
                  </div>

                  <p className="mt-6 min-h-[3.5rem] text-[15px] leading-8 text-white/68">
                    {profile.id === 1 && "Loves reading, coffee & weekend getaways."}
                    {profile.id === 2 && "Enjoys meaningful conversations and travel."}
                    {profile.id === 3 && "Passionate about design, art & mindful living."}
                    {profile.id === 4 && "Into fitness, music & spontaneous plans."}
                  </p>

                  <div className="mt-6 flex items-center justify-end">
                    <button
                      type="button"
                      className="grid h-10 w-10 place-items-center rounded-full border border-transparent bg-black/20 text-[#ff9b94] transition hover:bg-black/30"
                      aria-label={`Shortlist ${profile.name}`}
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div id="join" className="mt-10 rounded-[32px] border border-transparent bg-black/20 px-6 py-5 text-white/84 backdrop-blur-xl md:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/52">
                    Intent first
                  </div>
                  <div className="mt-2 text-lg font-semibold tracking-tight text-white">
                    Join people who are serious about commitment.
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={joinHref}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff6a76] to-[#9e4fff] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(255,106,118,0.22)] transition hover:scale-[1.02]"
                  >
                    {isAuthed ? "Open dashboard" : "Join free"}
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-transparent bg-white/10 px-6 py-3 text-sm font-semibold text-white/88 backdrop-blur transition hover:bg-white/15"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-transparent py-10 text-white/70">
        <div className="rw-container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Rishtawaala"
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-transparent"
            />
            <div className="text-sm font-extrabold tracking-tight text-white">
              Rishtawaala
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/60">
            <Link href="/matches" className="hover:text-white">
              Matches
            </Link>
            <Link href="/success-stories" className="hover:text-white">
              Success stories
            </Link>
            <Link href="/upgrade" className="hover:text-white">
              Upgrade
            </Link>
          </div>
          <div className="text-xs font-semibold text-white/50">
            (c) {new Date().getFullYear()} Rishtawaala
          </div>
        </div>
      </footer>
      </div>
    </main>
  );
}

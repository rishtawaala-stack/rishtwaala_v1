"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, Activity, ShieldCheck, Check, Sparkles, MessageCircle, Star, Diamond, Target, Quote, CheckCircle2, Search, User } from "lucide-react";
import api from "@/lib/axios";

const FloatingHeart = ({ delay, scale, x, y }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 0.6, 0], 
      scale: [0, scale, 0],
      y: [0, -100],
      x: [0, x]
    }}
    transition={{ 
      duration: 3, 
      repeat: Infinity, 
      delay,
      ease: "easeOut"
    }}
    className="absolute pointer-events-none"
    style={{ left: `calc(50% + ${y}px)`, top: `calc(50% + ${x}px)` }}
  >
    <Heart className="text-primary fill-primary w-4 h-4 opacity-40" />
  </motion.div>
);

export default function Home() {
  const [recentJoined, setRecentJoined] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const fetchUsers = () => {
      setRecentJoined([
         { id: 1, name: "Priya S.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200", profession: "Data Analyst", location: "Mumbai" },
         { id: 2, name: "Rahul M.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200", profession: "Entrepreneur", location: "Delhi" },
         { id: 3, name: "Sneha K.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200", profession: "Architect", location: "Bangalore" },
         { id: 4, name: "Vikram P.", image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=200", profession: "Doctor", location: "Pune" }
      ]);
    };
    fetchUsers();
  }, []);

  const testimonials = [
    { quote: "We met our soulmates here. The matching engine understood our family values perfectly.", names: "Anjali & Rohan", img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400" },
    { quote: "It’s so much more than a swiping app. It’s a genuine community for serious commitments.", names: "Priya & Amit", img: "https://images.unsplash.com/photo-1583939000140-5e7e17cd2bca?q=80&w=400" }
  ];

  return (
    <main className="min-h-screen bg-light text-dark flex flex-col font-sans overflow-hidden">
      
      {/* SECTION 1: HERO (With Thumping Heartbeat & Floating Hearts) */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden">
        
        {/* Floating Gradient Blobs */}
        <div className="absolute top-[10%] left-[10%] w-[30vh] h-[30vh] md:w-[50vh] md:h-[50vh] bg-primary/10 rounded-full blur-[100px] animate-blob z-0"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30vh] h-[30vh] md:w-[60vh] md:h-[60vh] bg-secondary/10 rounded-full blur-[120px] animate-blob z-0" style={{ animationDelay: '2s' }}></div>

        {/* Real-time Rhythmic Heartbeat */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
           <motion.div
             animate={{ 
               scale: [1, 1.15, 1.08, 1.25, 1],
               filter: ["brightness(1)", "brightness(1.2)", "brightness(1.1)", "brightness(1.3)", "brightness(1)"]
             }}
             transition={{ 
               duration: 1.8, 
               repeat: Infinity, 
               times: [0, 0.15, 0.25, 0.35, 1],
               ease: "easeInOut"
             }}
             className="relative"
           >
             <Heart className="w-[75vh] h-[75vh] text-primary fill-primary drop-shadow-[0_0_50px_rgba(255,59,92,0.3)]" />
             
             {/* Dynamic Pulsing Glow */}
             <motion.div 
               animate={{ opacity: [0, 0.4, 0] }}
               transition={{ duration: 1.8, repeat: Infinity, times: [0.2, 0.3, 0.5] }}
               className="absolute inset-0 bg-primary blur-[100px] rounded-full scale-110"
             />
           </motion.div>
        </div>

        {/* Floating Small Hearts Around Main Pulse */}
        <FloatingHeart delay={0} scale={1.2} x={200} y={150} />
        <FloatingHeart delay={0.5} scale={0.8} x={-250} y={-100} />
        <FloatingHeart delay={1.2} scale={1} x={300} y={-200} />
        <FloatingHeart delay={1.8} scale={1.5} x={-150} y={250} />

        {/* ECG Line Animation */}
        <div className="absolute bottom-[20%] left-0 w-full h-[150px] z-0 opacity-20 pointer-events-none overflow-hidden flex items-center flex-nowrap shrink-0">
            <div className="animate-ecg flex w-[300%] shrink-0">
               <svg className="h-[150px] w-full stroke-primary stroke-[4px] fill-none drop-shadow-[0_0_20px_rgba(255,59,92,0.4)]" viewBox="0 0 1000 150" preserveAspectRatio="none">
                  <path d="M0,75 L100,75 L110,10 L130,140 L150,30 L160,75 L300,75 L310,10 L330,140 L350,30 L360,75 L500,75 L510,10 L530,140 L550,30 L560,75 L700,75 L710,10 L730,140 L750,30 L760,75 L1000,75" />
                  <path d="M1000,75 L1100,75 L1110,10 L1130,140 L1150,30 L1160,75 L1300,75 L1310,10 L1330,140 L1350,30 L1360,75 L1500,75 L1510,10 L1530,140 L1550,30 L1560,75 L1700,75 L1710,10 L1730,140 L1750,30 L1760,75 L2000,75" />
                  <path d="M2000,75 L2100,75 L2110,10 L2130,140 L2150,30 L2160,75 L2300,75 L2310,10 L2330,140 L2350,30 L2360,75 L2500,75 L2510,10 L2530,140 L2550,30 L2560,75 L2700,75 L2710,10 L2730,140 L2750,30 L2760,75 L3000,75" />
               </svg>
            </div>
         </div>

        {/* Navigation */}
        <nav className="absolute top-0 w-full p-6 z-50 flex justify-between items-center bg-white/20 backdrop-blur-xl border-b border-white/40">
          <div className="flex items-center gap-3">
            <motion.img 
               animate={{ scale: [1, 1.05, 1], filter: ["drop-shadow(0 0 5px rgba(255,59,92,0.2))", "drop-shadow(0 0 15px rgba(255,59,92,0.4))", "drop-shadow(0 0 5px rgba(255,59,92,0.2))"] }} 
               transition={{ duration: 2, repeat: Infinity }} 
               src="/logo.jpg" alt="Logo" className="w-[50px] h-[50px] object-cover rounded-full border-2 border-primary shadow-lg" 
            />
            <div className="text-2xl font-extrabold text-dark tracking-tighter">Rishtawaala</div>
          </div>
          <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-widest text-gray-400">
            <Link href="#how-it-works" className="hover:text-primary transition-colors">Principles</Link>
            <Link href="#stats" className="hover:text-primary transition-colors">Success</Link>
            <Link href="#plans" className="hover:text-primary transition-colors">Tiers</Link>
          </div>
          <div className="flex gap-4">
            {typeof window !== 'undefined' && localStorage.getItem('token') ? (
              <>
                <Link href="/dashboard" className="btn-premium hidden sm:flex items-center py-2.5 px-8">Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-premium hidden sm:flex items-center py-2.5 px-8 bg-white/20 text-dark border-primary/20">Sign In</Link>
                <Link href="/register" className="btn-premium py-2.5 px-8">Join Now</Link>
              </>
            )}
          </div>
        </nav>

        {/* Center Content - UPDATED with Grounded Indian Context */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 mt-16">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-[5.5rem] font-extrabold leading-[1.1] mb-8 text-dark tracking-tighter"
          >
            Find Your Resonance <br/> <span className="text-primary drop-shadow-xl">Pavitra Rishta</span> ❤️
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-500 mb-12 font-bold max-w-4xl mx-auto leading-relaxed"
          >
            Fusing tradition with professional analytics to find your life partner. <br/>
            <span className="text-secondary font-black">A sacred union built on trust and professional resonance.</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href={typeof window !== 'undefined' && localStorage.getItem('token') ? "/dashboard" : "/register"} className="btn-premium w-full sm:w-auto text-xl py-5 px-12 shadow-[0_0_30px_rgba(255,59,92,0.2)] rounded-2xl">
              {typeof window !== 'undefined' && localStorage.getItem('token') ? "Open Dashboard" : "Begin Your Journey"}
            </Link>
            <Link href="#profiles" className="btn-premium w-full sm:w-auto text-xl py-5 px-12 bg-white text-dark border-gray-100 shadow-xl font-bold rounded-2xl">Explore Matches</Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: How It Works */}
      <section id="how-it-works" className="py-24 relative z-10">
         <div className="max-w-6xl mx-auto px-6">
             <div className="text-center mb-20">
                <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-dark tracking-tighter">OUR <span className="text-primary italic">DNA</span></h2>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Scientific precision meets sacred tradition.</p>
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { step: '01', title: "Profile Analysis", icon: <Target className="w-8 h-8 text-primary" />, desc: "AI-powered cultural and professional depth check." },
                  { step: '02', title: "Compatibility", icon: <Search className="w-8 h-8 text-secondary" />, desc: "Matrometer scans for 90%+ profile resonance." },
                  { step: '03', title: "Pulse Sync", icon: <User className="w-8 h-8 text-secondary" />, desc: "Securely express interest via Heartbeats." },
                  { step: '04', title: "Bonding", icon: <Heart className="w-8 h-8 text-primary" />, desc: "Lock your profile and begin your life together." },
               ].map((wk, i) => (
                  <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     key={i} className="glass-outer p-10 relative flex flex-col items-center text-center group hover:bg-white transition-all border-gray-100 bg-white shadow-xl rounded-[2.5rem]"
                  >
                     <div className="absolute top-6 left-6 text-5xl font-black text-gray-50">{wk.step}</div>
                     <div className="w-20 h-20 rounded-[30px] bg-gray-50 flex items-center justify-center mb-8 shadow-sm border border-gray-100">
                        {wk.icon}
                     </div>
                     <h3 className="text-xl font-extrabold mb-4 text-dark tracking-tight">{wk.title}</h3>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-loose">{wk.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* SECTION 3: Featured Profiles */}
      <section id="profiles" className="py-24 relative z-10">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-16">
               <div>
                  <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-dark tracking-tighter">FEATURED <span className="text-secondary italic">PULSE</span></h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] max-w-xl">Curated profiles with high compatibility scores.</p>
               </div>
               <Link href="/matches" className="hidden md:inline-flex btn-premium py-4 px-10 text-xs font-bold rounded-xl shadow-xl shadow-primary/20">Discover All</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
               {recentJoined.map((profile, i) => (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     key={i} className="glass-outer p-8 group hover:-translate-y-3 transition-all duration-700 relative overflow-hidden flex flex-col items-center text-center border-gray-100 bg-white shadow-xl rounded-[2.5rem]"
                  >
                     <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <img src={profile.image} className="w-28 h-28 rounded-full object-cover border-4 border-gray-50 shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-1000 grayscale hover:grayscale-0" alt="User" />
                     <h3 className="text-xl font-extrabold mb-1 text-dark relative z-10 tracking-tight">{profile.name}</h3>
                     <p className="text-primary font-bold text-[10px] uppercase mb-4 relative z-10 tracking-widest">{profile.profession}</p>
                     <div className="w-full flex justify-between items-center bg-gray-50 py-3 px-5 rounded-xl border border-gray-100 relative z-10">
                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">{profile.location}</span>
                        <Heart className="w-4 h-4 text-primary fill-primary opacity-20" />
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Other sections remain unchanged... */}
      <section className="py-24 relative z-10 bg-dark">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/50 pointer-events-none"></div>
         <div className="max-w-6xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
               <h2 className="text-4xl md:text-6xl font-extrabold mb-8 text-white tracking-tighter uppercase">Why <span className="text-primary italic">Rishtawaala</span>?</h2>
               <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">We fusion advanced AI compatibility with sacred matchmaking values to ensure your resonance is authentic.</p>
               <ul className="space-y-8">
                  <li className="flex gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20"><Activity className="w-7 h-7 text-primary" /></div>
                     <div><h4 className="font-extrabold text-xl mb-1 text-white uppercase tracking-tight">Sync Engine</h4><p className="text-sm text-gray-500 font-medium">Real-time profile depth analysis.</p></div>
                  </li>
                  <li className="flex gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20"><ShieldCheck className="w-7 h-7 text-secondary" /></div>
                     <div><h4 className="font-extrabold text-xl mb-1 text-white uppercase tracking-tight">Vetted Circles</h4><p className="text-sm text-gray-500 font-medium">100% ID-linked professional profiles.</p></div>
                  </li>
                  <li className="flex gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20"><Heart className="w-7 h-7 text-primary" /></div>
                     <div><h4 className="font-extrabold text-xl mb-1 text-white uppercase tracking-tight">Privacy First</h4><p className="text-sm text-gray-500 font-medium">Encrypted heartbeat exchanges.</p></div>
                  </li>
               </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
               <div className="glass-outer p-3 border border-white/5 shadow-2xl overflow-hidden rounded-[3rem] bg-white/5 backdrop-blur-2xl">
                  <img src="https://images.unsplash.com/photo-1515523110800-9415d13b84a8?q=80&w=800" alt="App interface" className="w-full rounded-[2.5rem] opacity-90 grayscale hover:grayscale-0 transition-all duration-1000" />
               </div>
            </motion.div>
         </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 relative z-10 overflow-hidden bg-light">
         <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-20 text-dark tracking-tighter uppercase">SUCCESS <span className="text-secondary italic">ALUMNI</span></h2>
            <AnimatePresence mode="wait">
               <motion.div key={currentTestimonial} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.8 }} className="glass-outer p-12 md:p-20 relative border-gray-100 shadow-2xl bg-white rounded-[4rem]">
                  <Quote className="absolute top-12 left-12 w-24 h-24 text-primary/5" />
                  <img src={testimonials[currentTestimonial].img} className="w-40 h-40 rounded-full mx-auto mb-10 object-cover border-8 border-gray-50 shadow-2xl" alt="Couple" />
                  <p className="text-2xl md:text-4xl font-extrabold italic leading-tight mb-10 text-dark tracking-tight">"{testimonials[currentTestimonial].quote}"</p>
                  <h4 className="text-xl font-bold text-primary uppercase tracking-widest">— {testimonials[currentTestimonial].names}</h4>
               </motion.div>
            </AnimatePresence>
            <div className="flex gap-4 justify-center mt-12">
               {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setCurrentTestimonial(i)} className={`h-2.5 rounded-full transition-all duration-500 ${i === currentTestimonial ? 'bg-primary w-16' : 'bg-gray-100 w-4'}`} />
               ))}
            </div>
         </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-32 relative z-10 border-y border-gray-100 bg-white">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-12 border-b-4 border-primary"><h3 className="text-7xl font-black text-dark mb-4 tracking-tighter">50K+</h3><p className="text-[10px] font-bold uppercase text-primary tracking-[0.4em]">Professionals Joined</p></div>
            <div className="p-12 border-b-4 border-secondary"><h3 className="text-7xl font-black text-dark mb-4 tracking-tighter">10K+</h3><p className="text-[10px] font-bold uppercase text-secondary tracking-[0.4em]">Verified Resonance</p></div>
            <div className="p-12 border-b-4 border-primary"><h3 className="text-7xl font-black text-dark mb-4 tracking-tighter">5K+</h3><p className="text-[10px] font-bold uppercase text-primary tracking-[0.4em]">Bonded Marriages</p></div>
         </div>
      </section>

      <footer className="py-24 bg-dark relative z-10 w-full overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-4 mb-8">
                  <img src="/logo.jpg" className="w-12 h-12 rounded-full border border-white/10 shadow-sm" alt="Logo"/>
                  <span className="font-extrabold text-white tracking-tighter text-3xl">Rishtawaala</span>
               </div>
               <p className="text-gray-400 text-base max-w-sm leading-relaxed mb-10 font-medium">Elevating the sanctity of Indian marriage through precision data and professional vetted circles.</p>
            </div>
            <div>
               <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Ecosystem</h4>
               <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <li><Link href="/matches" className="hover:text-primary transition-colors">Pulse Search</Link></li>
                  <li><Link href="/success-stories" className="hover:text-primary transition-colors">Testimonials</Link></li>
                  <li><Link href="#plans" className="hover:text-primary transition-colors">Premium Tiers</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Ambassador Program</Link></li>
               </ul>
            </div>
            <div>
               <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Protocols</h4>
               <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <li><Link href="#" className="hover:text-primary transition-colors">Privacy Directive</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Safety Standard</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Service Terms</Link></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-white/5 text-center text-[10px] font-bold uppercase tracking-[0.5em] text-gray-600 relative z-10 w-full">
            <p>© 2026 Rishtawaala Global • Verified professional network.</p>
         </div>
      </footer>

    </main>
  );
}

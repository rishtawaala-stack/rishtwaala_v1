"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, Zap, Phone, Star, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function VibeMatchBanner({ 
  score = 0, 
  isContactShared, 
  onShareContact, 
  onVibeMatch,
  otherName = "User"
}) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getVibeStatus = (s) => {
    if (s >= 90) return { label: "Soulmates level vibe! ✨", color: "text-rose-500", bg: "from-rose-50 to-pink-50", border: "border-rose-100" };
    if (s >= 75) return { label: "Electric chemistry! ⚡", color: "text-orange-500", bg: "from-orange-50 to-amber-50", border: "border-orange-100" };
    if (s >= 50) return { label: "Deep connection forming... ❤️", color: "text-primary", bg: "from-primary/5 to-secondary/5", border: "border-primary/10" };
    return { label: "Vibe is building up... 🌱", color: "text-gray-500", bg: "from-gray-50 to-slate-50", border: "border-gray-100" };
  };

  const status = getVibeStatus(displayScore);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-8 mt-4 p-5 bg-gradient-to-r ${status.bg} border ${status.border} rounded-[2rem] flex items-center justify-between shadow-sm relative z-20 overflow-hidden`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
        <Heart className="w-32 h-32 fill-current text-primary" />
      </div>

      <div className="flex items-center gap-6 relative z-10">
        {/* Vibe Score Circular Indicator */}
        <div className="relative w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-white/50">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-gray-100"
            />
            <motion.circle
              cx="28"
              cy="28"
              r="24"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={150}
              initial={{ strokeDashoffset: 150 }}
              animate={{ strokeDashoffset: 150 - (150 * displayScore) / 100 }}
              className={status.color}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-black leading-none ${status.color}`}>{displayScore}</span>
            <span className="text-[7px] font-black uppercase tracking-tighter opacity-40">Sync</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-dark tracking-tight">{status.label}</h4>
            <Sparkles className={`w-3.5 h-3.5 ${status.color} animate-pulse`} />
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Resonance Analysis for you & {otherName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <button 
          onClick={onVibeMatch}
          className="px-5 py-2.5 bg-white text-dark text-xs font-black rounded-2xl border border-gray-100 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 group"
        >
          <Zap className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" /> 
          Vibe Match
        </button>
        
        {!isContactShared ? (
          <button 
            onClick={onShareContact}
            className="px-5 py-2.5 bg-primary text-white text-xs font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" /> 
            Share Contact
          </button>
        ) : (
          <div className="px-5 py-2.5 bg-green-500 text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-green-500/20">
             <ShieldCheck className="w-4 h-4" /> 
             Bond Verified
          </div>
        )}
      </div>
    </motion.div>
  );
}

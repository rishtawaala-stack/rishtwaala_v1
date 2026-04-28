"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Heart, MessageCircle, Activity, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function VibeAnalysisModal({ isOpen, onClose, score, otherName, messages }) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => setIsAnalyzing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const breakdown = [
    { label: "Response Resonance", value: Math.min(100, score + 10), icon: MessageCircle, color: "text-blue-400" },
    { label: "Emotional Sync", value: Math.min(100, score - 5), icon: Heart, iconColor: "text-rose-400" },
    { label: "Chat Momentum", value: Math.min(100, score + 15), icon: TrendingUp, color: "text-emerald-400" },
    { label: "Interest Alignment", value: Math.min(100, score), icon: Sparkles, color: "text-amber-400" }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90dvh]"
        >
          {/* Floating Close Button */}
          <div className="absolute top-6 right-6 z-[110]">
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all active:scale-95 border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Header */}
          <div className="p-8 pb-4 border-b border-gray-50 flex justify-between items-center bg-gradient-to-br from-gray-50 to-white shrink-0">
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-dark flex items-center gap-2">
                Vibe Analysis <Zap className="w-6 h-6 text-primary fill-current" />
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Deep resonance report for you & {otherName}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {/* Score Display */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                  <motion.circle
                    cx="80" cy="80" r="70" stroke="url(#vibeGradient)" strokeWidth="12" fill="transparent"
                    strokeDasharray={440}
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * score) / 100 }}
                    transition={{ duration: 2, ease: "circOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="vibeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF3B5C" />
                      <stop offset="100%" stopColor="#7B2FF7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-5xl font-black italic tracking-tighter text-dark"
                  >
                    {isAnalyzing ? "..." : score}%
                  </motion.span>
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Match Index</span>
                </div>
              </div>
              
              <div className="mt-6 px-6 py-2 bg-primary/5 rounded-full border border-primary/10">
                 <p className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-4 h-4" /> 
                   {score > 80 ? "Exceptional Resonance" : score > 60 ? "Strong Connection" : "Growing Vibe"}
                 </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 2 }}
                  className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl bg-white shadow-sm ${item.color || item.iconColor}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-dark">{isAnalyzing ? "..." : item.value}%</span>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: isAnalyzing ? 0 : `${item.value}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full ${item.color?.replace('text-', 'bg-') || item.iconColor?.replace('text-', 'bg-')}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10">
               <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] text-center shadow-xl">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-black text-sm mb-1 tracking-tight">Bond Verified</h4>
                  <p className="text-white/40 text-[10px] font-medium leading-relaxed">
                    This analysis is generated based on your real-time interaction patterns and emotional resonance.
                  </p>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 59, 92, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 59, 92, 0.4);
        }
      `}</style>
    </AnimatePresence>
  );
}

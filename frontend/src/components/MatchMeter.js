"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Zap, Activity, Info, Users, GraduationCap, Heart, Calendar, Search, ArrowRight, Loader2, Home, X, CheckCircle2 } from "lucide-react";

export default function MatchMeter({ 
  profileA, 
  profileB, 
  onSendRequest, 
  isProcessingRequest,
  status: connectionStatus,
  onClose
}) {
  const [isCalculating, setIsCalculating] = useState(true);
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const calculatedBreakdown = calculateDetailedMatch(profileA, profileB);
      setBreakdown(calculatedBreakdown);
      
      const totalScore = Math.floor(
        calculatedBreakdown.reduce((acc, item) => acc + item.score, 0) / calculatedBreakdown.length
      );
      
      let start = 0;
      const end = totalScore;
      const duration = 2500;
      const startTime = performance.now();
      
      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 5); // easeOutQuint
        const currentScore = Math.floor(easedProgress * end);
        setScore(currentScore);
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          setIsCalculating(false);
        }
      };
      requestAnimationFrame(updateCount);
    }, 1200);

    return () => clearTimeout(timer);
  }, [profileA, profileB]);

  const calculateDetailedMatch = (p1, p2) => {
    const p1Data = p1 || { full_name: 'You', age: 25, religion: 'Hindu', caste: 'Brahmin', education_level: 'Masters', interests: ['Music'] };
    const p2Data = p2 || { full_name: 'Them', age: 24, religion: 'Hindu', caste: 'Brahmin', education_level: 'Bachelors', interests: ['Cooking'] };

    const categories = [];

    // 1. Caste and Religion
    let crScore = 0;
    if (p1Data.religion === p2Data.religion) crScore += 60;
    if (p1Data.caste === p2Data.caste) crScore += 40;
    if (!p1Data.religion || !p2Data.religion) crScore = 70 + Math.floor(Math.random() * 10);
    categories.push({ 
      label: "Caste & Religion", 
      score: Math.min(100, crScore), 
      icon: Users, 
      color: "text-blue-400",
      comparison: `${p1Data.religion || 'Any'} x ${p2Data.religion || 'Any'}`
    });

    // 2. Age
    const a1 = p1Data.age || 25;
    const a2 = p2Data.age || 25;
    const ageDiff = Math.abs(a1 - a2);
    let ageScore = 100 - (ageDiff * 4);
    categories.push({ 
      label: "Age Compatibility", 
      score: Math.max(40, ageScore), 
      icon: Calendar, 
      color: "text-orange-400",
      comparison: `${a1}yr x ${a2}yr`
    });

    // 3. Partner Preferences
    let prefScore = 75 + Math.floor(Math.random() * 15);
    categories.push({ 
      label: "Partner Preferences", 
      score: Math.min(100, prefScore), 
      icon: Search, 
      color: "text-purple-400",
      comparison: `Syncing Desires`
    });

    // 4. Education and Family
    let eduScore = 65;
    if (p1Data.education_level === p2Data.education_level) eduScore += 20;
    eduScore += Math.floor(Math.random() * 10);
    categories.push({ 
      label: "Education & Family", 
      score: Math.min(100, eduScore), 
      icon: GraduationCap, 
      color: "text-emerald-400",
      comparison: `${p1Data.education_level?.substring(0,6) || 'Edu'} x ${p2Data.education_level?.substring(0,6) || 'Edu'}`
    });

    // 5. Interests and Hobbies
    const p1Int = (p1Data.interests || []).length;
    const p2Int = (p2Data.interests || []).length;
    let intScore = 70 + Math.min(25, (p1Int + p2Int) * 2);
    categories.push({ 
      label: "Interests & Hobbies", 
      score: Math.min(100, intScore), 
      icon: Heart, 
      color: "text-rose-400",
      comparison: `${p1Int} Hobbies x ${p2Int} Hobbies`
    });

    return categories;
  };

  const radius = 80;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const rotation = (score / 100) * 180 - 90;

  const getStatus = (val) => {
    if (val > 85) return { label: "Perfect Match", color: "#FF3B5C", bg: "from-primary to-secondary", subtext: "Exceptional harmony detected!" };
    if (val >= 75) return { label: "Awesome Match", color: "#7B2FF7", bg: "from-secondary to-primary", subtext: "Highly compatible profiles." };
    if (val >= 50) return { label: "Good Match", color: "#FF6A4D", bg: "from-orange-500 to-primary", subtext: "A promising connection." };
    return { label: "Potential Sync", color: "#4B4B4F", bg: "from-gray-500 to-gray-700", subtext: "Keep exploring to know more." };
  };

  const status = getStatus(score);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto relative px-4">
      {/* Fixed Sticky Header Pill */}
      <div className="sticky top-0 z-[120] w-full pt-2 pb-6 flex justify-center bg-transparent">
        <div className="flex items-center justify-between w-full bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 pl-8 pr-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-6 overflow-hidden">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Profile A</span>
              <span className="text-[11px] font-black text-white uppercase tracking-widest">You</span>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-primary/40 animate-ping" />
               <Zap className="w-5 h-5 text-primary animate-pulse" />
               <div className="w-1 h-1 rounded-full bg-primary/40 animate-ping" />
            </div>

            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Profile B</span>
              <span className="text-[11px] font-black text-primary uppercase tracking-widest truncate max-w-[120px]">
                {profileB?.full_name?.split(' ')[0] || 'Them'}
              </span>
            </div>
          </div>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5 hover:border-white/20 ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full max-w-[320px] aspect-[16/9] flex items-end justify-center mb-6">
        <div className="absolute inset-x-0 bottom-0 top-0 rounded-t-full bg-slate-950 border-t-4 border-x-4 border-white/5 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
           <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
        </div>

        <svg width="100%" height="100%" viewBox="0 0 220 120" className="relative z-10 overflow-visible">
          <path d="M 30 110 A 80 80 0 0 1 190 110" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="18" strokeLinecap="round" />
          {[...Array(21)].map((_, i) => {
            const angle = (i * 9) - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = 110 + 78 * Math.cos(rad);
            const y1 = 110 + 78 * Math.sin(rad);
            const x2 = 110 + (i % 5 === 0 ? 88 : 83) * Math.cos(rad);
            const y2 = 110 + (i % 5 === 0 ? 88 : 83) * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={score >= i * 5 ? "#FF3B5C" : "white"} strokeOpacity={score >= i * 5 ? "0.8" : "0.1"} strokeWidth="1.5" />;
          })}
          <motion.path
            d="M 30 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke="#FF3B5C"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: isCalculating ? circumference * 0.1 : dashOffset }}
            style={{ filter: "drop-shadow(0 0 12px #FF3B5C)" }}
            transition={{ duration: isCalculating ? 1.2 : 2, ease: "circOut", repeat: isCalculating ? Infinity : 0, repeatType: "reverse" }}
          />
        </svg>

        <motion.div 
          className="absolute bottom-[10px] w-1 h-24 bg-gradient-to-t from-transparent via-primary/60 to-white origin-bottom rounded-full z-20"
          initial={{ rotate: -90 }}
          animate={{ rotate: isCalculating ? [ -90, 80, -70, 50, -90 ] : rotation }}
          transition={{ duration: isCalculating ? 2.5 : 2, ease: "circOut", repeat: isCalculating ? Infinity : 0 }}
          style={{ filter: 'drop-shadow(0 0 15px #FF3B5C)', left: 'calc(50% - 0.5px)' }}
        />
        
        <div className="absolute bottom-0 w-10 h-10 rounded-full z-30 shadow-2xl flex items-center justify-center bg-slate-900 border-2 border-white/10" style={{ bottom: '-10px' }}>
            <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_#FF3B5C] animate-pulse"></div>
        </div>

        <div className="absolute bottom-4 flex flex-col items-center">
          <div className="text-6xl font-black italic tracking-tighter text-white font-mono drop-shadow-[0_0_30px_rgba(255,59,92,0.6)]">
            {isCalculating ? '--' : score}
          </div>
          <div className="text-[9px] font-black uppercase text-white/50 tracking-[0.3em] -mt-1">SYNC INDEX</div>
        </div>
      </div>

      <div className="mt-8 text-center space-y-3 w-full">
        <div className={`px-12 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(0,0,0,0.4)] bg-gradient-to-br ${status.bg} border border-white/20 text-white inline-block`}>
          {isCalculating ? "Calculating Resonance..." : status.label}
        </div>
        {!isCalculating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2">
             <CheckCircle2 className="w-4 h-4 text-green-400" />
             <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">{status.subtext}</p>
          </motion.div>
        )}
      </div>

      {/* Comparison Detail Matrix */}
      <div className="mt-10 w-full bg-slate-950 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col max-h-[300px] shadow-2xl">
        <div className="px-8 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Comparative Breakdown</h4>
          </div>
          <Activity className="w-4 h-4 text-primary" />
        </div>
        
        <div ref={scrollRef} className="overflow-y-auto p-5 space-y-3 custom-scrollbar flex-1 bg-slate-900/20">
          {breakdown.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/30 hover:bg-slate-800/50 transition-all rounded-[2rem] p-5 flex flex-col gap-4 border border-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl bg-slate-900/80 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{item.comparison}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className={`text-xs font-mono font-black ${item.score > 70 ? 'text-green-400' : 'text-orange-400'}`}>{item.score}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                  className={`h-full ${item.score > 85 ? 'bg-primary' : item.score > 70 ? 'bg-green-400' : 'bg-orange-400'}`}
                  style={{ boxShadow: item.score > 85 ? '0 0 10px #FF3B5C' : 'none' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8 w-full">
        <button 
          onClick={() => onSendRequest && onSendRequest()}
          disabled={isCalculating || isProcessingRequest || connectionStatus === 'connected' || connectionStatus === 'sent'}
          className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[11px] transition-all flex items-center justify-center gap-4 shadow-2xl ${
            isCalculating 
              ? 'bg-slate-800 text-white/10 cursor-not-allowed'
              : connectionStatus === 'connected'
                ? 'bg-green-500 text-white'
                : connectionStatus === 'sent'
                  ? 'bg-slate-800 text-white/40 cursor-default'
                  : 'bg-primary text-white hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(255,59,92,0.4)]'
          }`}
        >
          {isProcessingRequest ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : connectionStatus === 'connected' ? (
            'Mutual Resonance Established'
          ) : connectionStatus === 'sent' ? (
            'Pulse Request Pending'
          ) : (
            <>
              Connect Now <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 59, 92, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 59, 92, 0.5);
        }
      `}</style>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Zap, Activity, Info } from "lucide-react";

export default function MatchMeter({ score: initialScore, size = "md", animate = true }) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [score, setScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (animate) {
      setIsCalculating(true);
      setScore(0);
    } else {
      setIsCalculating(false);
      // Animate the number count up to initialScore
      let start = 0;
      const end = initialScore;
      const duration = 1000;
      const startTime = performance.now();
      
      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentScore = Math.floor(progress * end);
        setScore(currentScore);
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };
      requestAnimationFrame(updateCount);
    }
  }, [initialScore, animate]);

  // Semicircle parameters
  const radius = 80;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  
  // Needle rotation calculation (-90deg to 90deg)
  const rotation = (score / 100) * 180 - 90;

  const getStatus = (val) => {
    if (val >= 75) return { label: "Perfect Resonance", color: "#FF3B5C", bg: "from-primary to-secondary" };
    if (val >= 60) return { label: "High Compatibility", color: "#7B2FF7", bg: "from-secondary to-primary" };
    if (val >= 50) return { label: "Strong Match", color: "#FF6A4D", bg: "from-tertiary to-primary" };
    if (val >= 40) return { label: "Potential Match", color: "#4B4B4F", bg: "from-gray-400 to-gray-500" };
    return { label: "Low Sync", color: "#1C1C1E", bg: "from-gray-600 to-gray-700" };
  };

  const status = getStatus(score || initialScore);

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative w-80 h-48 flex items-end justify-center">
        {/* Speedometer Background */}
        <div className="absolute inset-x-0 bottom-0 top-0 rounded-t-full bg-dark shadow-2xl border-t-8 border-x-8 border-white/5 overflow-hidden">
           {/* Inner glow */}
           <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
        </div>

        {/* The Gauge SVG */}
        <svg width="280" height="150" viewBox="0 0 220 120" className="relative z-10">
          {/* Background Track */}
          <path
            d="M 30 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke="white"
            strokeOpacity="0.05"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Tick Marks */}
          {[...Array(11)].map((_, i) => {
            const angle = (i * 18) - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = 110 + 75 * Math.cos(rad);
            const y1 = 110 + 75 * Math.sin(rad);
            const x2 = 110 + (i % 2 === 0 ? 85 : 80) * Math.cos(rad);
            const y2 = 110 + (i % 2 === 0 ? 85 : 80) * Math.sin(rad);
            return (
              <line 
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={score >= i * 10 ? "#FF3B5C" : "white"}
                strokeOpacity={score >= i * 10 ? "1" : "0.2"}
                strokeWidth={i % 2 === 0 ? "2" : "1"}
              />
            );
          })}

          {/* Glowing Numbers */}
          {[0, 25, 50, 75, 100].map((val, i) => {
             const angle = (val * 1.8) - 180;
             const rad = (angle * Math.PI) / 180;
             const x = 110 + 60 * Math.cos(rad);
             const y = 110 + 60 * Math.sin(rad);
             return (
               <text 
                key={i} 
                x={x} y={y} 
                fill="white" 
                fillOpacity="0.3" 
                fontSize="8" 
                fontWeight="black"
                textAnchor="middle" 
                className="font-mono italic"
               >
                 {val}
               </text>
             )
          })}

          {/* Main Progress Path (Neon) */}
          <motion.path
            d="M 30 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke="#FF3B5C"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: isCalculating ? circumference * 0.1 : dashOffset }}
            style={{ filter: "drop-shadow(0 0 12px #FF3B5C) drop-shadow(0 0 25px rgba(255, 59, 92, 0.4))" }}
            transition={{ 
                duration: isCalculating ? 1 : 1.5, 
                ease: "circOut",
                repeat: isCalculating ? Infinity : 0,
                repeatType: "reverse"
            }}
          />
        </svg>

        {/* Speed Markers */}
        <div className="absolute top-12 left-12 text-[7px] text-white/20 font-black italic tracking-widest uppercase rotate-[-30deg]">Safety</div>
        <div className="absolute top-4 right-12 text-[7px] text-primary/40 font-black italic tracking-widest uppercase rotate-[30deg]">Resonance</div>

        {/* Needle */}
        <motion.div 
          className="absolute bottom-4 w-1.5 h-24 bg-gradient-to-t from-transparent via-primary to-white origin-bottom rounded-full z-20"
          initial={{ rotate: -90 }}
          animate={{ rotate: isCalculating ? [ -90, 85, -60, 45, -90 ] : rotation }}
          transition={{ 
            duration: isCalculating ? 2 : 1.5, 
            ease: "circOut",
            repeat: isCalculating ? Infinity : 0
          }}
          style={{ 
            filter: 'drop-shadow(0 0 15px #FF3B5C)',
            bottom: '12px'
          }}
        >
           <div className="w-full h-1/2 bg-white/60 rounded-full blur-[1px]"></div>
        </motion.div>
        
        {/* Center hub */}
        <div className="absolute bottom-0 w-12 h-12 rounded-full z-30 shadow-2xl flex items-center justify-center bg-dark border-4 border-white/10" style={{ bottom: '-12px' }}>
            <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_#FF3B5C]"></div>
        </div>

        {/* Center Digital Display */}
        <div className="absolute bottom-6 flex flex-col items-center">
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-5xl font-black italic tracking-tighter text-white font-mono bg-clip-text"
              style={{ textShadow: '0 0 20px rgba(255, 31, 113, 0.5)' }}
            >
              {isCalculating ? '--' : score}
            </motion.div>
          </AnimatePresence>
          <div className="text-[8px] font-black uppercase text-white/40 tracking-widest -mt-1">MATCH%</div>
        </div>

      </div>

      <div className="mt-8 text-center">
        <div 
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl bg-gradient-to-br ${status.bg} border border-white/10 text-white`}
        >
          {isCalculating ? "Syncing Gears..." : status.label}
        </div>
      </div>
    </div>
  );
}

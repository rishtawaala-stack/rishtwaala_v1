"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Calendar, Clock, MapPin, Sparkles, Heart, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function KundaliMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { profileA, profileB } = params;

  const [formData, setFormData] = useState({
    dob: "",
    time: "",
    place: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/horoscope/calculate", {
        profile_a: profileA,
        profile_b: profileB,
        ...formData
      });
      setResult(res.data?.data || res.data);
      toast.success("Matching complete! ✨");
    } catch (err) {
      toast.error("Failed to calculate matching score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pl-0 md:pl-56 bg-light text-dark pb-20">
      <div className="hidden md:block"><Navigation /></div>
      
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[32px] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-orange-200"
          >
            <Sparkles className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter mb-4">Kundali Matching</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Astro-compatibility for a perfect union</p>
        </header>

        {!result ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="date" 
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="input-premium pl-14 py-4 rounded-3xl w-full" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Time of Birth</label>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="time" 
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="input-premium pl-14 py-4 rounded-3xl w-full" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Place of Birth</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    placeholder="Enter city, state"
                    value={formData.place}
                    onChange={(e) => setFormData({...formData, place: e.target.value})}
                    className="input-premium pl-14 py-4 rounded-3xl w-full" 
                  />
                </div>
              </div>

              <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100/50 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-orange-500 mt-1" />
                <p className="text-xs font-bold text-orange-800/70 leading-relaxed">
                  Your birth details are used strictly for astrological calculations and are not shared with the other profile.
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Calculating..." : "Calculate Match Score"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-white rounded-[50px] p-12 shadow-2xl shadow-primary/10 border border-primary/10 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
               
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                   <Star className="w-3 h-3 fill-current" /> Guna Milan Result
                 </div>
                 
                 <div className="text-8xl font-black text-dark tracking-tighter mb-4 flex justify-center items-baseline gap-2">
                   {result.total_score} <span className="text-2xl text-gray-300">/ 36</span>
                 </div>
                 
                 <p className="text-xl font-bold text-rw-text mb-8">
                   {result.total_score >= 18 ? "A Harmonious Match! ❤️" : "Consult an Astrologer for deeper insight."}
                 </p>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                   {[
                     { label: 'Varna', score: result.varna || 1, max: 1 },
                     { label: 'Vashya', score: result.vashya || 2, max: 2 },
                     { label: 'Tara', score: result.tara || 3, max: 3 },
                     { label: 'Yoni', score: result.yoni || 4, max: 4 },
                   ].map(item => (
                     <div key={item.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                       <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                       <p className="text-sm font-black">{item.score} / {item.max}</p>
                     </div>
                   ))}
                 </div>

                 <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => router.back()}
                      className="px-8 py-4 bg-gray-50 text-dark font-black rounded-2xl hover:bg-gray-100 transition-all text-sm"
                    >
                      Back to Chat
                    </button>
                    <button 
                      className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm flex items-center justify-center gap-3"
                    >
                      Download PDF Report <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

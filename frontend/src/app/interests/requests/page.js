"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Bell, User, Clock, Check, X, Zap, MapPin, Loader2, HeartPulse } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import MatchMeter from "@/components/MatchMeter";
import FloatingHearts from "@/components/FloatingHearts";

/**
 * HEARTBEATS PAGE (Interests/Requests)
 */

export default function HeartbeatsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("inbound");
  const [inbound, setInbound] = useState([]);
  const [outbound, setOutbound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [inRes, outRes] = await Promise.all([
        api.get('/interests/incoming'),
        api.get('/interests/outgoing')
      ]);

      const inData = (inRes.data?.data?.interests || inRes.data?.interests || []).filter(i => i.from_profile);
      const outData = (outRes.data?.data?.interests || outRes.data?.interests || []).filter(i => i.type === 'like' && i.to_profile);

      setInbound(inData);
      setOutbound(outData);
    } catch (err) {
      console.error("Fetch Pulse Error:", err);
      toast.error("Failed to sync pulses.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const tid = toast.loading(action === 'accepted' ? "Harmonizing souls..." : "Quietly declining...");
      await api.patch(`/interests/${id}`, { action });
      
      if (action === 'accepted') {
        toast.success("🎉 resonance established! Check Bonds section.", { id: tid });
      } else {
        toast("Pulse declined.", { icon: '👋', id: tid });
      }
      
      fetchRequests();
    } catch (err) {
      toast.error("Process failed.");
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-light" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <Loader2 className="w-12 h-12 text-primary animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-0 md:pl-56 bg-light relative overflow-x-hidden">
      <Navigation />
      
      <main className="p-6 md:p-12 max-w-7xl mx-auto pb-32 relative z-10">
        <header className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <h1 className="text-5xl font-extrabold text-dark tracking-tighter flex items-center gap-5">
              <Bell className="w-12 h-12 text-primary" /> 
              Heartbeats
            </h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] mt-3">Where interest meets professional resonance</p>
          </div>

          <div className="flex glass-outer p-2 w-full md:w-96 bg-white border-gray-100 shadow-xl rounded-[2rem]">
            <button
              onClick={() => setActiveTab("inbound")}
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'inbound' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.03]' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              Incoming ({inbound.length})
            </button>
            <button
              onClick={() => setActiveTab("outbound")}
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'outbound' ? 'bg-secondary text-white shadow-lg shadow-secondary/20 scale-[1.03]' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              Sent ({outbound.length})
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'inbound' ? (
            <motion.div 
               key="inbound-view" 
               initial={{ opacity: 0, x: -20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: 20 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
            >
               {inbound.length === 0 ? (
                 <div className="col-span-full"><EmptyState icon={Bell} title="The requests are quiet" subtitle="New connection requests will appear here when others reach out." /></div>
               ) : (
                 inbound.map((req) => (
                   <RequestCard 
                    key={req.id} 
                    request={req} 
                    onAction={handleAction} 
                    onViewMeter={() => setSelectedMatch(req)} 
                   />
                 ))
               )}
            </motion.div>
          ) : (
            <motion.div 
               key="outbound-view" 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -20 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
            >
               {outbound.length === 0 ? (
                 <div className="col-span-full"><EmptyState icon={Zap} title="No outgoing requests" subtitle="Your connection pulses will wait here for the other heart to beat back." /></div>
               ) : (
                 outbound.map((req) => (
                   <SentCard key={req.id} request={req} />
                 ))
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matrometer Modal Integration */}
        <AnimatePresence>
          {selectedMatch && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/80 backdrop-blur-xl">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 30 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 30 }}
                 className="relative w-full max-w-lg glass-outer border-gray-100 bg-white p-12 rounded-[3.5rem] shadow-2xl overflow-hidden"
               >
                 <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
                 <div className="relative z-10 flex flex-col items-center">
                    <header className="w-full flex justify-between items-center mb-12">
                       <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Resonance Analysis</h2>
                       <button onClick={() => setSelectedMatch(null)} className="p-3 hover:bg-gray-50 rounded-full text-gray-400 hover:text-dark transition-all">
                          <X className="w-7 h-7" />
                       </button>
                    </header>

                    <MatchMeter score={selectedMatch.match_score || 85} size="lg" animate={false} />

                    <div className="mt-12 p-8 rounded-[2rem] bg-gray-50 border border-gray-100 text-center w-full">
                       <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
                          Detailed Sync Report: {selectedMatch.from_profile?.full_name}
                       </p>
                    </div>
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function RequestCard({ request, onAction, onViewMeter }) {
  const profile = request.from_profile;
  return (
    <motion.div
      layout
      whileHover={{ y: -10 }}
      className="glass-outer group p-0 relative overflow-hidden bg-white border-gray-100 flex flex-col shadow-xl rounded-[2.5rem]"
      style={{ aspectRatio: '1/1.3' }}
    >
      <div className="relative h-64 overflow-hidden border-b border-gray-50">
        <img src={profile.profile_photo_url || "/placeholder-user.png"} alt={profile.full_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute inset-x-8 bottom-8 text-white border-l-4 border-primary pl-6 py-1 drop-shadow-xl">
          <h3 className="text-2xl font-black tracking-tighter mb-1">{profile.full_name}, {profile.age}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {profile.current_city}</p>
        </div>
        <Link href={`/profile/${profile.id}`} className="absolute inset-0 flex items-center justify-center bg-dark/30 opacity-0 group-hover:opacity-100 transition-all duration-300">
           <span className="btn-premium px-8 py-3 rounded-full text-[10px] font-bold shadow-2xl">View Profile</span>
        </Link>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center items-center bg-white gap-6">
          <button 
             onClick={onViewMeter}
             className="flex flex-col items-center gap-3 group/btn"
          >
             <div className="w-16 h-16 rounded-3xl bg-dark flex items-center justify-center border-4 border-white group-hover/btn:border-primary/50 transition-all duration-500 shadow-xl">
                <Zap className="w-7 h-7 text-primary" />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover/btn:text-primary">Match Score</span>
          </button>
      </div>

      <div className="p-5 bg-gray-50 flex gap-4">
        <button onClick={() => onAction(request.id, 'accepted')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
          Accept
        </button>
        <button onClick={() => onAction(request.id, 'declined')} className="px-6 bg-white border border-gray-200 text-gray-400 hover:text-red-500 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center transition-all active:scale-95">
          Pass
        </button>
      </div>
    </motion.div>
  );
}

function SentCard({ request }) {
  const profile = request.to_profile;
  return (
    <motion.div
      layout
      whileHover={{ y: -10 }}
      className="glass-outer p-0 relative overflow-hidden bg-white border-gray-100 flex flex-col shadow-xl rounded-[2.5rem]"
      style={{ aspectRatio: '1/1.3' }}
    >
      <div className="relative h-64 overflow-hidden border-b border-gray-100">
        <img src={profile.profile_photo_url || "/placeholder-user.png"} alt={profile.full_name} className="w-full h-full object-cover transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent" />
        <div className="absolute inset-x-8 bottom-8 text-white border-l-4 border-secondary pl-6 py-1">
          <h3 className="text-2xl font-black tracking-tighter mb-1">{profile.full_name}, {profile.age}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {profile.current_city}</p>
        </div>
      </div>
      
      <div className="p-10 bg-white flex flex-col justify-center gap-5 flex-1">
         <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-3">
               <Clock className="w-5 h-5" /> Pending Pulse
            </span>
         </div>
         <div className="w-full h-2 bg-secondary/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: "0%" }} animate={{ width: "75%" }} transition={{ duration: 1.5 }} className="h-full bg-secondary" />
         </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="glass-outer p-32 text-center rounded-[3.5rem] border-gray-100 bg-white shadow-xl flex flex-col items-center">
      <div className="w-28 h-28 rounded-[40px] bg-gray-50 flex items-center justify-center mb-10 border border-gray-100 relative group transition-all">
         <Icon className="w-12 h-12 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
         <div className="absolute inset-0 bg-primary/5 rounded-[40px] animate-ping" />
      </div>
      <h3 className="text-3xl font-extrabold mb-4 text-dark tracking-tighter leading-none">{title}</h3>
      <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest mb-12">{subtitle}</p>
      <Link href="/matches" className="btn-premium px-16 py-5 text-[11px] font-extrabold uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20">Find Matches</Link>
    </div>
  );
}

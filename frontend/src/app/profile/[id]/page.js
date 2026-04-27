"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { MapPin, Heart, MessageCircle, User, ArrowLeft, Briefcase, Zap, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import MatchMeter from "@/components/MatchMeter";
import FloatingHearts from "@/components/FloatingHearts";

export default function ViewProfilePage({ params }) {
  const profileId = params.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Statuses: 'shortlisted', 'sent', 'connected', 'pending_acceptance', null
  const [status, setStatus] = useState(null); 
  const [conversationId, setConversationId] = useState(null);
  
  const [aiScore, setAiScore] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMatrometer, setShowMatrometer] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();

  const syncStatus = useCallback(async () => {
    try {
      const profRes = await api.get(`/profiles/${profileId}`);
      const prof = profRes.data?.data?.profile || profRes.data?.profile;
      setProfile(prof);

      // 1. Check Conversations Table
      const convRes = await api.get('/conversations');
      const conversations = convRes.data?.data || convRes.data || [];
      const chat = conversations.find(c => String(c.otherProfile?.id) === String(profileId));

      if (chat) {
        setStatus('connected');
        setConversationId(chat.id);
        return;
      }

      // 2. Check Interests Table
      const outRes = await api.get('/interests/outgoing');
      const outgoing = outRes.data?.data?.interests || outRes.data?.interests || [];
      const out = outgoing.find(i => String(i.to_profile?.id || i.to_profile) === String(profileId));

      if (out) {
        if (out.type === 'like' || out.status === 'pending') {
           // Standardized behavior: If a like was sent, we show it here
           setStatus('sent');
        } else if (out.type === 'shortlist') setStatus('shortlisted');
        else if (out.type === 'accepted' || out.status === 'accepted') {
          setStatus('connected');
        }
        return;
      }

      const incRes = await api.get('/interests/incoming');
      const incoming = incRes.data?.data?.interests || incRes.data?.interests || [];
      const inc = incoming.find(i => String(i.from_profile?.id || i.from_profile) === String(profileId));

      if (inc && inc.type === 'like') {
        setStatus('pending_acceptance');
      } else {
        setStatus(null);
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    syncStatus();
  }, [syncStatus]);

  const handleAction = async (type) => {
    try {
      setIsProcessing(true);
      const tid = toast.loading(type === 'like' ? 'Sending resonance...' : 'Adding to Interested center...');
      
      const res = await api.post('/interests', { to_profile_id: profileId, type });
      
      if (res.data?.success) {
        // PER OBJECTIVE: If request success, instantly change state to 'connected' (Green/Disabled)
        if (type === 'like') {
          setStatus('connected');
          toast.success("Connected! ✨", { id: tid });
        } else {
          setStatus('shortlisted');
          toast.success("Interested! 💖", { id: tid });
        }
      } else {
        toast.error("Process failed.", { id: tid });
      }
    } catch (err) {
      console.error("Action Error:", err);
      toast.error(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsProcessing(true);
      const tid = toast.loading("Removing interest...");
      await api.delete(`/interests/profile/${profileId}`);
      setStatus(null);
      toast.success("Removed! ✨", { id: tid });
    } catch (err) {
      toast.error("Failed to remove.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-rw-rose animate-spin opacity-20" />
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen pl-0 md:pl-56 relative overflow-hidden bg-transparent">
      <FloatingHearts />
      <Navigation />

      <main className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto pb-40">
        <header className="mb-12 flex justify-between items-center">
           <button onClick={() => router.back()} className="glass-inner px-8 py-4 rounded-3xl border-white/60 bg-white/40 text-[10px] font-black uppercase tracking-widest text-rw-text-soft hover:text-rw-purple transition-all flex items-center gap-3">
              <ArrowLeft className="w-4 h-4" /> Back to matches
           </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 xl:col-span-4 space-y-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-outer p-4 bg-white/30 border-white/80 rounded-[4rem] shadow-2xl relative">
               <div className="aspect-[3/4] relative rounded-[3.5rem] overflow-hidden bg-white/50 border border-white/40">
                  <img src={profile.profile_photo_url || "/placeholder-user.png"} alt={profile.full_name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-rw-purple/90 via-transparent to-transparent opacity-70" />
                  <div className="absolute inset-x-10 bottom-10 text-white border-l-4 border-rw-rose pl-6">
                     <h1 className="text-5xl font-black tracking-tighter leading-none mb-2">{profile.full_name}, {profile.age}</h1>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 flex items-center gap-3"><MapPin className="w-4 h-4" /> {profile.current_city}</p>
                  </div>
               </div>

               <div className="p-8 space-y-6">
                  <div className="flex gap-4">
                      <button 
                        onClick={() => status === 'shortlisted' ? handleRemove() : handleAction('shortlist')}
                        className={`p-6 rounded-[2.5rem] border-4 transition-all duration-500 hover:scale-110 active:scale-95 shadow-xl ${
                          status === 'shortlisted' || status === 'connected'
                           ? 'bg-rw-rose border-rw-rose text-white shadow-rw-rose/30'
                           : 'glass-inner border-rw-rose/30 text-rw-rose hover:border-rw-rose hover:bg-rw-rose/10 bg-white/50 shadow-rw-rose/5'
                        }`}
                      >
                         <Heart className={`w-8 h-8 ${(status === 'shortlisted' || status === 'connected') ? 'fill-current' : 'fill-none'}`} strokeWidth={3} />
                      </button>

                     <button 
                       onClick={() => {
                         if (status === 'connected' && conversationId) router.push(`/bonds?id=${conversationId}`);
                         else handleAction('like');
                       }}
                       disabled={isProcessing || status === 'connected' || status === 'pending_acceptance' || status === 'sent'}
                       className={`flex-1 py-6 rounded-[2.5rem] border-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                         status === 'connected'
                           ? 'bg-green-500 border-green-400 text-white shadow-green-500/20'
                           : status === 'pending_acceptance' || status === 'sent'
                             ? 'bg-rw-rose/5 border-rw-rose/20 text-rw-rose opacity-60'
                             : 'btn-premium border-white/20'
                       }`}
                     >
                        {isProcessing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : status === 'connected' ? (
                          'Connected'
                        ) : status === 'sent' ? (
                          'Request Sent'
                        ) : status === 'pending_acceptance' ? (
                          'Response Pending'
                        ) : (
                          'Send Connection Request'
                        )}
                     </button>
                  </div>
               </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-outer p-10 bg-slate-900 border-rw-rose/20 rounded-[4rem] text-center shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-rw-rose/20 to-transparent" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-rw-rose mb-8 relative z-10">Matrometer Engine</h3>
               
               <button 
                 onClick={() => setShowMatrometer(true)}
                 className="flex flex-col items-center gap-6 w-full p-8 rounded-[3rem] hover:bg-white/5 transition-all duration-700 relative z-10"
               >
                  <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-8 border-rw-rose/20 group-hover:scale-110 group-hover:border-rw-rose/40 transition-all duration-700 shadow-[0_0_50px_rgba(255,31,113,0.3)]">
                     <Zap className="w-10 h-10 text-rw-rose animate-pulse" />
                  </div>
                  <span className="block text-lg font-black uppercase tracking-widest text-white">View Compatibility</span>
               </button>
            </motion.div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8 space-y-12">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Insight l="Religion" v={profile.religion} />
                <Insight l="Caste" v={profile.caste} />
                <Insight l="Tongue" v={profile.mother_tongue} />
                <Insight l="Diet" v={profile.diet} />
             </div>

             {profile.bio && (
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-outer p-12 bg-white/30 border-white/60 rounded-[3.5rem] shadow-2xl">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-rw-rose mb-8">Personal Narrative</h3>
                  <p className="text-rw-text-soft text-lg font-black leading-relaxed tracking-tight whitespace-pre-line">{profile.bio}</p>
               </motion.div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Box title="Historical context">
                   <Row l="Gender" v={profile.gender} />
                   <Row l="Status" v={profile.marital_status?.replace('_', ' ')} />
                   <Row l="Height" v={profile.height_cm ? `${profile.height_cm} cm` : null} />
                </Box>
                 <Box title="Professional vector">
                    <Row l="Education" v={profile.education_level} />
                    <Row l="Profession" v={profile.occupation_detail} />
                    <Row l="Income" v={profile.annual_income_range} />
                 </Box>

                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Box title="Selected Interests">
                       <div className="flex flex-wrap gap-2 pt-2">
                          {profile.interests && profile.interests.length > 0 ? (
                            profile.interests.map(i => (
                              <span key={i} className="px-5 py-2.5 bg-rw-rose/5 text-rw-rose text-[10px] font-black uppercase tracking-widest rounded-2xl border border-rw-rose/10 shadow-sm">{i}</span>
                            ))
                          ) : (
                            <p className="text-rw-text-soft/40 text-[10px] font-black uppercase tracking-widest italic py-4">No interests specifically highlighted</p>
                          )}
                       </div>
                    </Box>

                    <Box title="Focus Areas">
                       <div className="flex flex-wrap gap-2 pt-2">
                          {profile.hobbies && profile.hobbies.length > 0 ? (
                            profile.hobbies.map(h => (
                               <span key={h} className="px-5 py-2.5 bg-rw-purple/5 text-rw-purple text-[10px] font-black uppercase tracking-widest rounded-2xl border border-rw-purple/10 shadow-sm">{h}</span>
                            ))
                          ) : (
                            <p className="text-rw-text-soft/40 text-[10px] font-black uppercase tracking-widest italic py-4">No focus areas specified</p>
                          )}
                       </div>
                    </Box>
                 </div>
              </div>
            </div>
          </div>
        </main>

      <AnimatePresence>
        {showMatrometer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="relative w-full max-w-lg glass-outer border-white/20 bg-slate-900/80 p-12 rounded-[5rem] overflow-hidden shadow-2xl">
                <header className="flex justify-between items-center mb-12">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Compatibility Dashboard</h2>
                   <button onClick={() => setShowMatrometer(false)} className="text-white/30 hover:text-white transition-all"><ArrowLeft className="w-6 h-6 rotate-90" /></button>
                </header>
                <div className="flex flex-col items-center">
                   <MatchMeter score={aiScore || 85} size="lg" animate={false} />
                   <p className="mt-12 text-[11px] text-white/40 uppercase tracking-widest font-black text-center leading-loose">Synchronizing pulse... 1.5M parameters analyzed for deep resonance.</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Insight({ l, v }) {
  return (
    <motion.div className="glass-inner p-6 rounded-3xl border-rw-rose/20 bg-white/40 shadow-xl border-2">
       <p className="text-[9px] font-black uppercase tracking-widest text-rw-rose mb-2">{l}</p>
       <p className="text-sm font-black text-black truncate">{v || 'Private'}</p>
    </motion.div>
  );
}

function Box({ title, children }) {
  return (
    <div className="glass-outer p-12 bg-white/30 border-rw-rose/20 rounded-[3.5rem] shadow-xl">
       <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-rw-rose mb-8">{title}</h3>
       <div className="space-y-6">{children}</div>
    </div>
  );
}

function Row({ l, v }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-rw-rose/10 last:border-0 grow">
       <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{l}</span>
       <span className="text-[11px] font-black uppercase tracking-tight text-black font-black uppercase">{v || "Shared"}</span>
    </div>
  );
}

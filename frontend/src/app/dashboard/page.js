"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { 
  Bell, Heart, User, Search, MapPin, Star, Settings, ChevronRight, 
  Clock, Shield, LayoutGrid, Zap, Briefcase, Activity, Check
} from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedMatches, setRecommendedMatches] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authRes, matchRes, interestRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/matches'),
          api.get('/interests/incoming')
        ]);
        
        const user = authRes.data?.data?.user || authRes.data?.user;
        setUserData(user);
        
        const matches = matchRes.data?.data || matchRes.data || [];
        setRecommendedMatches(matches.slice(0, 3)); // Show top 3

        const incoming = interestRes.data?.data?.interests || interestRes.data?.interests || [];
        // Only count requests where type is 'like' (meaning it's a pending request)
        setUnreadCount(incoming.filter(i => i.type === 'like').length);

        // Dummy activity for visual
        setRecentActivity([
          { user: "Priya S.", action: "shortlisted your profile", time: "2 hours ago", highlight: true },
          { user: "Rahul K.", action: "sent a connection request", time: "5 hours ago", highlight: false }
        ]);

      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConnect = async (profileId) => {
    try {
      await api.post('/interests', { to_profile_id: profileId, type: 'like' });
      toast.success("Connection request sent! 💕");
      setRecommendedMatches(prev => prev.map(m => m.id === profileId ? { ...m, connected: true } : m));
    } catch (err) {
      toast.error("Failed to send request");
    }
  };

  if (loading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="w-12 h-12 border-4 border-rw-rose/30 border-t-rw-rose rounded-full animate-spin"></div>
      </div>
    );
  }

  const profileCompletion = userData.profile_complete_pct || 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (profileCompletion / 100) * circumference;

  const missingFields = [
    !userData.occupation_detail && "Job Details",
    !userData.religion && "Religion",
    !userData.height && "Height",
    !userData.education_level && "Education"
  ].filter(Boolean);

  return (
    <div className="min-h-screen pl-0 md:pl-56 bg-transparent text-rw-text-deep">
      <Navigation />
      
      <main className="p-5 md:p-10 max-w-7xl mx-auto pb-32">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold mb-2 text-dark tracking-tighter">Welcome back, {userData.full_name?.split(' ')[0]}</h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 justify-center md:justify-start">
               Account verified <Shield className="w-3.5 h-3.5 text-green-500" fill="currentColor" />
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-4 glass-outer px-4 py-2 border-gray-200 bg-white/50 hover:bg-white/80 transition-all shadow-md">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold uppercase text-dark tracking-tight">{userData.full_name}</p>
                  <p className="text-[8px] font-bold uppercase text-primary tracking-widest">Premium Member</p>
               </div>
               <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white">
                {userData.profile_photo_url ? (
                  <img src={userData.profile_photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-300" />
                  </div>
                )}
               </div>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Completion */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-outer p-8 flex flex-col sm:flex-row items-center gap-10 relative overflow-hidden bg-white/60 border-gray-100 rounded-[2.5rem] shadow-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none" />
              <div className="relative w-36 h-36 flex shrink-0 items-center justify-center bg-white rounded-full shadow-lg p-2 border border-gray-50">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r={radius} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="12" />
                  <circle 
                    cx="72" cy="72" r={radius} fill="none" stroke="url(#gradientDash)" strokeWidth="12" 
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradientDash" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF3B5C" />
                      <stop offset="100%" stopColor="#7B2FF7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-3xl font-black text-primary">{profileCompletion}%</span>
              </div>
              <div className="relative z-10 text-center sm:text-left flex-1">
                <h3 className="text-2xl font-black mb-1 text-dark uppercase tracking-tighter">
                  {profileCompletion === 100 ? 'Verification Complete' : 'Polish Your Profile'}
                </h3>
                <p className="text-gray-500 mb-6 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                  {profileCompletion === 100 
                    ? 'Your profile is ready for maximum visibility!'
                    : missingFields.length > 0 
                      ? `${missingFields.join(' • ')} missing`
                      : 'Complete profiles receive 4x more interests and connections.'}
                </p>
                {profileCompletion < 100 && (
                  <Link href="/profile" className="btn-premium text-[11px] py-4 px-12 inline-block">Complete Your Story</Link>
                )}
              </div>
            </motion.div>

            {/* Recommended Matches */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3 text-dark uppercase tracking-tighter">
                  <Star className="text-secondary w-7 h-7" fill="currentColor" /> Premium Picks
                </h2>
                <Link href="/matches" className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all flex items-center gap-2">View All <ChevronRight className="w-4 h-4" /></Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedMatches.length === 0 ? (
                  <div className="col-span-full glass-outer p-16 text-center bg-white/20 border-white/60 flex flex-col items-center">
                    <Search className="w-12 h-12 text-rw-text-soft/20 mb-6" />
                    <p className="text-rw-text-soft/60 font-black text-[10px] uppercase tracking-widest leading-loose">
                      Complete your profile to unlock matches.
                    </p>
                  </div>
                ) : (
                  recommendedMatches.map((match, i) => (
                    <motion.div 
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -8 }}
                      className="glass-outer group p-0 relative overflow-hidden border-gray-100 bg-white shadow-lg flex flex-col"
                      style={{ aspectRatio: '1/1.1' }}
                    >
                      <div className="relative flex-1 overflow-hidden">
                        <div className="w-full h-full group-hover:blur-[1px] transition-all duration-500">
                          {match.image ? (
                            <img src={match.image} alt={match.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <User className="w-16 h-16 text-gray-200" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-60" />
                          
                          <div className="absolute inset-x-6 bottom-6 text-white pointer-events-none">
                             <h3 className="text-lg font-black leading-none truncate mb-1">{match.name}, {match.age}</h3>
                             <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary" /> {match.location}</p>
                          </div>
                        </div>

                        <Link href={`/profile/${match.id}`} className="absolute inset-0 flex items-center justify-center bg-dark/40 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                           <span className="btn-premium px-8 py-2.5 rounded-full text-[10px] transform scale-50 group-hover:scale-100 transition-transform">Profile</span>
                        </Link>
                      </div>

                      <div className="bg-white p-5 flex justify-between items-center">
                         <div className="flex flex-col gap-0.5 overflow-hidden">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter truncate opacity-80 flex items-center gap-1.5">
                               <Briefcase className="w-3 h-3 text-secondary" /> {match.profession}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter truncate opacity-80 flex items-center gap-1.5">
                               <Zap className="w-3 h-3 text-primary" fill="currentColor" /> {match.compatibility || 85}% Resonance
                            </p>
                         </div>
                         <button 
                            onClick={() => handleConnect(match.id)}
                            disabled={match.connected}
                            className={`p-3.5 rounded-full transition-all hover:scale-110 ${
                              match.connected 
                                ? 'bg-green-50 text-green-600' 
                                : 'bg-gray-50 text-gray-300 hover:text-primary hover:bg-primary/5 shadow-sm'
                            }`}
                         >
                            {match.connected ? <Check className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                         </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-outer p-8 bg-white border-gray-100 rounded-[2.5rem] shadow-xl"
            >
              <h3 className="text-[10px] font-black mb-8 flex items-center gap-3 text-secondary uppercase tracking-[0.3em] border-b border-gray-50 pb-5">
                <Activity className="text-secondary w-5 h-5" /> Live Pulse
              </h3>
              <div className="space-y-8">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center py-6">No interactions yet.</p>
                ) : (
                  recentActivity.map((act, i) => (
                    <div key={i} className="flex items-start gap-5">
                      <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${act.highlight ? 'bg-primary shadow-[0_0_15px_rgba(255,59,92,0.4)] animate-pulse' : 'bg-gray-200'}`} />
                      <div>
                        <p className="text-sm font-bold text-dark leading-relaxed">
                          <span className="text-secondary">{act.user}</span> {act.action}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-[0.2em]">{act.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Gold Status Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-outer p-8 bg-gradient-to-br from-[#BF953F]/10 to-transparent border-[#BF953F]/20 rounded-[2.5rem] relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Star className="w-20 h-20 text-[#BF953F]" fill="currentColor" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-dark uppercase tracking-tighter mb-2">Gold Status</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
                  Get seen by 10x more potential matches with premium visibility features.
                </p>
                <button className="w-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-dark py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all">
                   Upgrade Now
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

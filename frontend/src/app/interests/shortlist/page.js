"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Heart, User, MapPin, Briefcase, Trash2, Zap, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import FloatingHearts from "@/components/FloatingHearts";

/**
 * SHORTLIST PAGE (Interest Library)
 */

export default function ShortlistPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchShortlist();
  }, []);

  const fetchShortlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interests/outgoing');
      const allOutgoing = res.data?.data?.interests || res.data?.interests || [];
      
      // Filter for 'shortlist' type (Heart clicked)
      const filtered = allOutgoing.filter(i => i.type === 'shortlist' && i.to_profile);
      setItems(filtered);
    } catch (err) {
      console.error("Fetch Shortlist Error:", err);
      toast.error("Failed to sync your interested library.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (profileId, itemId) => {
    try {
      const tid = toast.loading("Removing from library...");
      await api.delete(`/interests/profile/${profileId}`);
      setItems(prev => prev.filter(i => i.id !== itemId));
      toast.success("Removed! ✨", { id: tid });
    } catch (err) {
      toast.error("Failed to remove.");
    }
  };

  const handleSendRequest = async (profileId, itemId) => {
    try {
      const tid = toast.loading("Sending connection request...");
      await api.post('/interests', { to_profile_id: profileId, type: 'like' });
      toast.success("Request sent! Moving to Requests tab. 💕", { id: tid });
      
      // Remove from here since it's now an active request
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      toast.error("Action failed.");
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
        <div className="mb-16">
          <h1 className="text-5xl font-extrabold text-dark tracking-tighter flex items-center gap-5">
            <Heart className="w-12 h-12 text-primary" /> 
            Interest Library
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] mt-3">Profiles you've saved for potential resonance</p>
        </div>

        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="glass-outer p-24 text-center rounded-[3.5rem] border-gray-100 bg-white shadow-xl"
            >
              <div className="w-24 h-24 rounded-[30px] bg-gray-50 flex items-center justify-center mx-auto mb-8 border border-gray-100">
                <Heart className="w-10 h-10 text-primary opacity-20" />
              </div>
              <h3 className="text-2xl font-extrabold text-dark tracking-tight mb-4">Your Library Is Empty</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-10 leading-loose">Explore matches and click the heart to save profiles here.</p>
              <Link href="/matches" className="btn-premium px-12 py-4 rounded-xl text-[10px] font-bold shadow-xl shadow-primary/20 inline-block">Discover Profiles</Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {items.map((item) => (
                <ShortlistCard 
                  key={item.id} 
                  item={item} 
                  onRemove={() => handleRemove(item.to_profile.id, item.id)}
                  onSend={() => handleSendRequest(item.to_profile.id, item.id)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ShortlistCard({ item, onRemove, onSend }) {
  const profile = item.to_profile;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      className="glass-outer group p-0 relative overflow-hidden bg-white border-gray-100 flex flex-col shadow-xl rounded-[2.5rem]"
      style={{ aspectRatio: '1/1.25' }}
    >
      <div className="relative h-64 overflow-hidden border-b border-gray-100">
        <img 
          src={profile.profile_photo_url || "/placeholder-user.png"} 
          alt={profile.full_name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
        
        <div className="absolute inset-x-8 bottom-8 text-white border-l-4 border-primary pl-6 py-1">
          <h3 className="text-2xl font-black tracking-tighter leading-none mb-1">{profile.full_name}, {profile.age}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> {profile.current_city}
          </p>
        </div>

        <Link href={`/profile/${profile.id}`} className="absolute inset-0 flex items-center justify-center bg-dark/30 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
           <span className="btn-premium px-8 py-3 rounded-full text-[10px] font-bold shadow-2xl">View Profile</span>
        </Link>
      </div>

      <div className="p-6 flex-1 bg-white flex flex-col justify-between">
         <div className="space-y-3">
            <p className="text-[10px] font-bold text-dark uppercase tracking-widest flex items-center gap-2 opacity-50">
               <Briefcase className="w-4 h-4" /> {profile.occupation_detail || "Professional"}
            </p>
         </div>

         <div className="flex gap-3 mt-8">
            <button 
              onClick={onSend}
              className="flex-1 bg-primary text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
               Send Pulse
            </button>
            <button 
              onClick={onRemove}
              className="w-12 h-12 bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center rounded-xl transition-all border border-gray-100 text-gray-400"
            >
               <Trash2 className="w-5 h-5" />
            </button>
         </div>
      </div>
    </motion.div>
  );
}

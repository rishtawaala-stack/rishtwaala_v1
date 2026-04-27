"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Heart, Check, X, Clock, Mail, User, MapPin, Briefcase } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function InterestsPage() {
  const [activeTab, setActiveTab] = useState("received");
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [sentInterests, setSentInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const [inRes, outRes] = await Promise.all([
        api.get('/interests/incoming'),
        api.get('/interests/outgoing')
      ]);

      const incoming = inRes.data?.data?.interests || [];
      const outgoing = outRes.data?.data?.interests || [];

      setReceivedInterests(incoming.map(i => ({
        id: i.id,
        name: i.from_profile?.full_name || "Unknown",
        age: i.from_profile?.age,
        location: i.from_profile?.current_city,
        image: i.from_profile?.profile_photo_url,
        profession: i.from_profile?.occupation_detail || i.from_profile?.education_level,
        profileId: i.from_profile?.id,
        time: getTimeAgo(i.created_at),
        type: i.type,
        religion: i.from_profile?.religion
      })));

      setSentInterests(outgoing.map(i => ({
        id: i.id,
        name: i.to_profile?.full_name || "Unknown",
        age: i.to_profile?.age,
        location: i.to_profile?.current_city,
        image: i.to_profile?.profile_photo_url,
        profession: i.to_profile?.occupation_detail,
        profileId: i.to_profile?.id,
        time: getTimeAgo(i.created_at),
        type: i.type,
        religion: i.to_profile?.religion
      })));
    } catch (err) {
      console.error("Interests fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/interests/${id}`, { action });
      if (action === 'accepted') {
        toast.success("🎉 You got a match! You can now chat with them.");
      } else {
        toast("Interest declined", { icon: '👋' });
      }
      setReceivedInterests(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      toast.error("Failed to process request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-0 md:pl-56 flex flex-col bg-light text-dark">
      <Navigation />
      
      <main className="flex-1 p-5 md:p-10 max-w-7xl mx-auto w-full">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-1 flex items-center justify-center md:justify-start gap-4 text-dark tracking-tighter">
            <Heart className="text-primary w-9 h-9" fill="currentColor" /> Heartbeats
          </h1>
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Global connection analytics</p>
        </header>

        {/* Tabs */}
        <div className="flex glass-outer p-2 mb-12 w-full max-w-md mx-auto md:mx-0 border-gray-100 bg-white shadow-xl">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'received' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-gray-400 hover:text-primary'}`}
          >
            Inbound ({receivedInterests.length})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'sent' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-gray-400 hover:text-primary'}`}
          >
            Outbound ({sentInterests.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          <AnimatePresence mode="wait">
            {activeTab === 'received' ? (
              receivedInterests.length === 0 ? (
                <div className="col-span-full glass-outer p-16 text-center flex flex-col items-center justify-center min-h-[300px] border-gray-100 bg-white rounded-[3rem] shadow-xl">
                  <div className="w-20 h-20 rounded-[32px] bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                    <Mail className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-extrabold mb-2 text-dark tracking-tight">Quiet For Now</h3>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">New requests will appear here as they arrive.</p>
                </div>
              ) : (
                receivedInterests.map((interest) => (
                  <motion.div
                    key={interest.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -8 }}
                    className="glass-outer group p-0 relative overflow-hidden border-gray-100 bg-white flex flex-col shadow-xl rounded-[2rem]"
                    style={{ aspectRatio: '1/1.15' }}
                  >
                    {/* Top: Image Section */}
                    <div className="relative flex-1 overflow-hidden">
                       <div className="w-full h-full group-hover:blur-[2px] transition-all duration-500">
                           <img src={interest.image || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400"} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent opacity-60"></div>
                          <div className="absolute inset-x-4 bottom-4 text-white">
                             <h3 className="text-base font-bold truncate">{interest.name}, {interest.age}</h3>
                             <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest opacity-80">
                                <MapPin className="w-2.5 h-2.5" /> {interest.location}
                             </div>
                          </div>
                       </div>

                       <Link href={`/profile/${interest.profileId}`} className="absolute inset-0 flex items-center justify-center bg-dark/50 opacity-0 group-hover:opacity-100 transition-all">
                          <span className="btn-premium px-6 py-2 rounded-full text-[9px] font-bold transform scale-50 group-hover:scale-100 transition-transform shadow-2xl">Profile</span>
                       </Link>
                    </div>

                    {/* Bottom: Action Section */}
                    <div className="p-4 bg-gray-50 flex flex-col gap-3">
                       <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest opacity-60">
                          <span className="flex items-center gap-1"><Briefcase className="w-2.5 h-2.5" /> {interest.profession || "Professional"}</span>
                          <span>{interest.time}</span>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => handleAction(interest.id, 'accepted')}
                            className="flex-1 py-3 text-[8px] font-bold uppercase tracking-widest rounded-xl bg-green-500 text-white shadow-lg active:scale-95 transition-all"
                          >
                             Accept
                          </button>
                          <button 
                            onClick={() => handleAction(interest.id, 'declined')}
                            className="flex-1 py-3 text-[8px] font-bold uppercase tracking-widest rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-600 transition-all active:scale-95"
                          >
                             Pass
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))
              )
            ) : (
              sentInterests.length === 0 ? (
                <div className="col-span-full glass-outer p-16 text-center flex flex-col items-center justify-center min-h-[300px] border-gray-100 bg-white rounded-[3rem] shadow-xl">
                  <Heart className="w-16 h-16 text-gray-100 mb-6" />
                  <h3 className="text-xl font-extrabold mb-2 text-dark tracking-tight">Heart On Sleeve</h3>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Connect with more professionals to see updates here.</p>
                </div>
              ) : (
                sentInterests.map((interest) => (
                  <motion.div
                    key={interest.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -8 }}
                    className="glass-outer group p-0 relative overflow-hidden border-gray-100 bg-white flex flex-col shadow-xl rounded-[2rem]"
                    style={{ aspectRatio: '1/1.15' }}
                  >
                    <div className="relative flex-1 overflow-hidden">
                       <div className="w-full h-full group-hover:blur-[2px] transition-all duration-500">
                          <img src={interest.image || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400"} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent opacity-60"></div>
                          <div className="absolute inset-x-4 bottom-4 text-white">
                             <h3 className="text-base font-bold truncate">{interest.name}, {interest.age}</h3>
                             <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest opacity-80">
                                <MapPin className="w-2.5 h-2.5" /> {interest.location}
                             </div>
                          </div>
                       </div>
                       
                       <Link href={`/profile/${interest.profileId}`} className="absolute inset-0 flex items-center justify-center bg-dark/50 opacity-0 group-hover:opacity-100 transition-all">
                          <span className="btn-premium px-6 py-2 rounded-full text-[9px] font-bold transform scale-50 group-hover:scale-100 transition-transform shadow-2xl">Profile</span>
                       </Link>
                    </div>

                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                       <div className="flex flex-col gap-1 overflow-hidden">
                          <p className="text-[9px] font-bold text-dark uppercase tracking-tighter truncate opacity-60 flex items-center gap-1">
                             <Briefcase className="w-2.5 h-2.5" /> {interest.profession || "Professional"}
                          </p>
                          <p className="text-[7px] text-gray-400 uppercase font-bold tracking-widest">Sent {interest.time}</p>
                       </div>
                       <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-100 text-[8px] font-bold uppercase tracking-widest">
                          {interest.type === 'accepted' ? (
                             <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Matched</span>
                          ) : interest.type === 'declined' ? (
                             <span className="text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> Passed</span>
                          ) : (
                             <span className="text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                          )}
                       </div>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function getTimeAgo(dateStr) {
  if (!dateStr) return "Just now";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

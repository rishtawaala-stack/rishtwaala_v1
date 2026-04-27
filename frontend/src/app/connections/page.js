"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { MessageCircle, User, MapPin, CheckCircle2, ShieldCheck, ArrowRight, Heart } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";
import FloatingHearts from "@/components/FloatingHearts";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await api.get('/conversations');
      const data = res.data?.data || res.data;
      setConnections(data || []);
    } catch (err) {
      console.error("Connections fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="w-10 h-10 border-4 border-rw-purple/20 border-t-rw-purple rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-0 md:pl-56 text-rw-text-soft bg-transparent relative overflow-x-hidden">
      <FloatingHearts />
      <Navigation />
      
      <main className="relative z-10 p-5 md:p-10 max-w-7xl mx-auto w-full pb-32">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black mb-2 flex items-center justify-center md:justify-start gap-4 text-rw-text-deep uppercase tracking-tighter">
            <MessageCircle className="text-rw-rose w-9 h-9" /> 
            Accepted Bonds
          </h1>
          <p className="text-rw-text-soft/60 font-black text-[10px] uppercase tracking-[0.2em]">Your circle of meaningful connections</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {connections.length === 0 ? (
              <div className="col-span-full">
                <div className="glass-outer p-24 text-center rounded-[4rem] border-white/60 bg-white/20 shadow-2xl relative overflow-hidden flex flex-col items-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-rw-purple/5 to-transparent"></div>
                  <div className="w-28 h-28 rounded-[40px] bg-white shadow-2xl flex items-center justify-center mx-auto mb-10 border border-white relative z-10">
                    <Heart className="w-12 h-12 text-rw-rose/30" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-rw-text-deep uppercase tracking-[0.2em] relative z-10">No Bonds Yet</h3>
                  <p className="text-rw-text-soft/60 text-xs max-w-xs mx-auto leading-loose font-black uppercase tracking-widest relative z-10">
                    The most beautiful stories start with a single pulse. Keep exploring and sending requests!
                  </p>
                  <Link href="/matches" className="mt-10 btn-premium px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest relative z-10 shadow-xl hover:scale-105 transition-transform flex items-center gap-3">
                    Discover Matches <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              connections.map((conn) => (
                <ConnectionCard key={conn.id} connection={conn} />
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function ConnectionCard({ connection }) {
  const profile = connection.otherProfile;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10 }}
      className="glass-outer group p-0 relative overflow-hidden border-white/60 bg-white/30 flex flex-col shadow-xl rounded-[2.5rem]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {profile?.profile_photo_url ? (
          <img 
            src={profile.profile_photo_url} 
            alt={profile.full_name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/50 text-rw-purple/20">
            <User className="w-16 h-16" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-6 pt-20 bg-gradient-to-t from-rw-purple/80 via-rw-purple/20 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight mb-0.5 flex items-center gap-2">
                {profile?.full_name}, {profile?.age}
                {profile?.is_verified && (
                  <div className="bg-green-500 rounded-full p-0.5 scale-90" title="Verified Member">
                    <CheckCircle2 className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
              </h3>
              <p className="text-white/70 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 flex gap-3">
        <Link 
          href={`/profile/${profile?.id}`}
          className="flex-1 glass-inner py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-rw-text-soft/60 hover:text-rw-purple hover:bg-white/50 transition-all text-center border-white/40"
        >
          View Profile
        </Link>
        <Link 
          href={`/chat?id=${connection.id}`}
          className="flex-[1.5] btn-premium py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg hover:scale-105 transition-all text-center flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" /> Chat Now
        </Link>
      </div>
    </motion.div>
  );
}

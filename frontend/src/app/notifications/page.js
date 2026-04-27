"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Bell, Heart, Eye, MessageCircle, Star, Check, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import useNotificationStore from "@/store/useNotificationStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      await fetchNotifications();
      setLoading(false);
    };
    init();
  }, [fetchNotifications, router]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const getIcon = (type) => {
    switch (type) {
      case 'match': return <Heart className="w-4 h-4 text-[#FF2E63]" fill="currentColor" />;
      case 'new_interest': return <Heart className="w-4 h-4 text-[#FF7A18]" />;
      case 'profile_view': return <Eye className="w-4 h-4 text-[#6A00F4]" />;
      case 'message': return <MessageCircle className="w-4 h-4 text-green-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBg = (type, isRead) => {
    if (isRead) return 'bg-[#1A1025]/40';
    switch (type) {
      case 'match': return 'bg-[#FF2E63]/5 border-[#FF2E63]/20';
      case 'new_interest': return 'bg-[#FF7A18]/5 border-[#FF7A18]/20';
      default: return 'bg-[#1A1025]/80 border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B12]">
        <div className="w-10 h-10 border-4 border-[#FF2E63]/30 border-t-[#FF2E63] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-0 md:pl-56 bg-[#0B0B12] text-white">
      <Navigation />

      <main className="p-5 md:p-8 max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Bell className="text-[#FF2E63] w-5 h-5" /> Notifications
            </h1>
            <p className="text-gray-500 text-xs font-medium mt-1">Stay updated with your matches and connections</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button onClick={handleMarkAllRead} className="text-xs font-bold text-[#6A00F4] hover:text-[#FF2E63] transition-colors">
              Mark all read
            </button>
          )}
        </header>

        {notifications.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2 text-gray-400">No notifications yet</h3>
            <p className="text-gray-500 text-sm">When someone sends you a request or views your profile, you'll see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:border-[#FF2E63]/30 ${getBg(notif.type, notif.is_read)}`}
                  onClick={() => {
                    markAsRead(notif.id);
                    setSelectedNotif(selectedNotif?.id === notif.id ? null : notif);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className={`text-sm font-bold ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h3>
                        {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[#FF2E63] shrink-0 mt-1.5 animate-pulse"></div>}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{notif.body}</p>
                      <p className="text-[10px] text-gray-600 mt-1 font-semibold">{getTimeAgo(notif.created_at)}</p>
                    </div>
                  </div>

                  {/* Expanded view - full profile info for match notifications */}
                  {selectedNotif?.id === notif.id && notif.refProfile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#1A1025]">
                          {notif.refProfile.profile_photo_url ? (
                            <img src={notif.refProfile.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-gray-600" /></div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <h4 className="font-black text-sm">{notif.refProfile.full_name}{notif.refProfile.age ? `, ${notif.refProfile.age}` : ''}</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                            {notif.refProfile.gender && <MiniInfo label="Gender" value={notif.refProfile.gender} />}
                            {notif.refProfile.current_city && notif.refProfile.current_city !== "Not specified" && <MiniInfo label="Location" value={notif.refProfile.current_city} />}
                            {notif.refProfile.education_level && notif.refProfile.education_level !== "Not specified" && <MiniInfo label="Education" value={notif.refProfile.education_level} />}
                            {notif.refProfile.occupation_detail && <MiniInfo label="Occupation" value={notif.refProfile.occupation_detail} />}
                            {notif.refProfile.annual_income_range && notif.refProfile.annual_income_range !== "Not specified" && <MiniInfo label="Income" value={notif.refProfile.annual_income_range} />}
                            {notif.refProfile.religion && notif.refProfile.religion !== "Not specified" && <MiniInfo label="Religion" value={notif.refProfile.religion} />}
                            {notif.refProfile.height_cm && <MiniInfo label="Height" value={`${notif.refProfile.height_cm} cm`} />}
                            {notif.refProfile.marital_status && <MiniInfo label="Status" value={notif.refProfile.marital_status.replace('_', ' ')} />}
                            {notif.refProfile.mother_tongue && notif.refProfile.mother_tongue !== "Not specified" && <MiniInfo label="Language" value={notif.refProfile.mother_tongue} />}
                            {notif.refProfile.complexion && <MiniInfo label="Complexion" value={notif.refProfile.complexion} />}
                          </div>
                          {notif.refProfile.bio && (
                            <p className="text-[10px] text-gray-400 mt-1 italic">"{notif.refProfile.bio}"</p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Link href={`/profile/${notif.refProfile.id}`} className="btn-primary py-1.5 px-4 text-[10px] rounded-lg">
                              View Full Profile
                            </Link>
                            {notif.type === 'match' && (
                              <Link href="/chat" className="btn-secondary py-1.5 px-4 text-[10px] rounded-lg flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" /> Chat Now
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div>
      <span className="text-gray-600">{label}: </span>
      <span className="text-gray-300 font-bold capitalize">{value}</span>
    </div>
  );
}

function getTimeAgo(dateStr) {
  if (!dateStr) return "Just now";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

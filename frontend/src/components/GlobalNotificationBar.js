"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageCircle, User, Check, Trash2, X, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import useNotificationStore from "@/store/useNotificationStore";
import useAuthStore from "@/store/useAuthStore";

// Sub-component that uses client-side hooks
function NotificationBarContent() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Only run on client
    setCurrentPath(window.location.pathname);
    const interval = setInterval(() => {
      if (window.location.pathname !== currentPath) setCurrentPath(window.location.pathname);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPath]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  if (!user) return null;
  if (currentPath.includes('/bonds') || currentPath.includes('/chat')) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'new_interest': return <Heart className="w-4 h-4 text-primary" fill="currentColor" />;
      case 'message': return <MessageCircle className="w-4 h-4 text-secondary" fill="currentColor" />;
      case 'REQUEST_ACCEPTED': return <Check className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 pointer-events-none md:pl-60">
      <div className="max-w-7xl mx-auto flex justify-end pointer-events-auto">
        <div className="relative" ref={dropdownRef}>
          {/* Main Bell Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-3 glass-outer px-4 py-2.5 border-white/50 shadow-xl transition-all hover:scale-105 active:scale-95 ${isOpen ? 'bg-white' : 'bg-white/60'}`}
          >
            <div className="relative">
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-primary' : 'text-dark'}`} />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[10px] font-black text-dark uppercase tracking-tight leading-none">Notifications</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{unreadCount} New Alerts</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-4 w-[320px] sm:w-[400px] glass-outer bg-white/95 border-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
              >
                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                   <div>
                     <h3 className="text-sm font-black text-dark uppercase tracking-tighter flex items-center gap-2">
                       Pulse Feed <Sparkles className="w-3.5 h-3.5 text-secondary" />
                     </h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recent interactions</p>
                   </div>
                   {unreadCount > 0 && (
                     <button 
                       onClick={markAllAsRead}
                       className="text-[10px] text-secondary font-black uppercase tracking-widest hover:text-primary transition-colors"
                     >
                       Mark all read
                     </button>
                   )}
                </div>

                <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-4">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                         <Bell className="w-6 h-6 text-gray-200" />
                       </div>
                       <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                         Silence is golden.<br/>No new notifications.
                       </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`group p-5 flex gap-4 transition-all hover:bg-primary/5 relative ${!notif.is_read ? 'bg-primary/[0.02]' : ''}`}
                          onClick={() => !notif.is_read && markAsRead(notif.id)}
                        >
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 bg-white">
                              {notif.refProfile?.profile_photo_url ? (
                                <img src={notif.refProfile.profile_photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-gray-200" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
                              {getIcon(notif.type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start gap-2 mb-1">
                               <h4 className={`text-xs font-black truncate ${!notif.is_read ? 'text-dark' : 'text-gray-600'}`}>
                                 {notif.title || (notif.refProfile?.full_name || 'System Alert')}
                               </h4>
                               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap">{getTimeAgo(notif.created_at)}</span>
                             </div>
                             <p className={`text-[11px] leading-relaxed line-clamp-2 ${!notif.is_read ? 'text-gray-500 font-semibold' : 'text-gray-400 font-medium'}`}>
                               {notif.body}
                             </p>
                             
                             {!notif.is_read && (
                               <div className="mt-3 flex items-center gap-3">
                                 <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                   View now <ChevronRight className="w-3 h-3" />
                                 </button>
                               </div>
                             )}
                          </div>

                          {!notif.is_read && (
                            <div className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(255,59,92,0.5)]" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link 
                  href="/notifications" 
                  className="block p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors border-t border-gray-100 text-[10px] font-black text-dark uppercase tracking-[0.2em]"
                >
                  View Activity History
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Main component with SSR guard
export default function GlobalNotificationBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <NotificationBarContent />;
}

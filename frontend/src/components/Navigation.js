"use client";

import Link from "next/link";
import { Home, Users, Heart, MessageCircle, User, LogOut, Bell } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "@/store/useAuthStore";
import useNotificationStore from "@/store/useNotificationStore";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

/**
 * NAVIGATION COMPONENT
 * Lateral sidebar for desktop / Bottom bar for mobile
 */

function NavContent() {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
    const interval = setInterval(() => {
      if (window.location.pathname !== pathname) setPathname(window.location.pathname);
    }, 1000);
    return () => clearInterval(interval);
  }, [pathname]);
  const logout = useAuthStore(state => state.logout);
  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Matches", href: "/matches", icon: Users },
    { name: "Bond Section", href: "/bonds", icon: MessageCircle },
    { name: "Interested", href: "/interests/shortlist", icon: Heart },
    { name: "Requests", href: "/interests/requests", icon: Bell, badge: unreadCount },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar - Compact */}
      <aside className="hidden md:flex flex-col w-56 h-screen fixed left-0 top-0 border-r border-gray-200 bg-white/80 backdrop-blur-3xl z-40 p-5 shadow-sm">
        <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2 mb-10 group">
          <Heart className="text-primary w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" /> 
          <span className="text-primary-gradient font-black tracking-tighter">RishtaWaala</span>
        </Link>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative text-sm font-bold ${isActive ? 'text-dark bg-primary/5' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavDesktop" 
                    className="absolute inset-0 bg-primary/10 border-l-4 border-primary rounded-2xl" 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                <span className="relative z-10">{item.name}</span>
                {item.badge > 0 && (
                  <span className="relative z-10 ml-auto bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">{item.badge > 9 ? '9+' : item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all text-sm font-bold mt-auto">
          <LogOut className="w-5 h-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-gray-100 z-50 px-4 py-3 flex justify-between rounded-[28px] shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center gap-1 relative py-1 px-3 rounded-2xl transition-all ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNavMobile" 
                  className="absolute inset-0 bg-primary/10 rounded-2xl" 
                />
              )}
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-lg' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">{item.badge > 9 ? '9+' : item.badge}</span>
                )}
              </div>
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default function Navigation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <NavContent />;
}

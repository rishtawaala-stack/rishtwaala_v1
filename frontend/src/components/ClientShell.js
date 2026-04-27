"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";

// SSR-disabled imports
const FloatingHearts = dynamic(() => import("./FloatingHearts"), { ssr: false });
const NotificationEngine = dynamic(() => import("./NotificationEngine"), { ssr: false });
const GlobalNotificationBar = dynamic(() => import("./GlobalNotificationBar"), { ssr: false });

export default function ClientShell({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On server, we render a minimal skeleton or just the children if safe
  // But we want to ensure client-only hooks never fire on server.
  if (!mounted) {
    return (
       <div className="min-h-screen bg-light">
         {children}
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-light text-dark selection:bg-rw-rose/30 selection:text-rw-text-deep relative overflow-x-hidden">
      <FloatingHearts opacity={0.1} />
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'rgba(255, 255, 255, 0.8)',
          color: '#3A1828',
          padding: '16px',
          borderRadius: '20px',
          border: '1.5px solid rgba(176, 56, 120, 0.2)',
          boxShadow: '0 8px 32px rgba(200, 128, 208, 0.1)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999
        }
      }} />
      <NotificationEngine />
      <GlobalNotificationBar />
      
      <Suspense fallback={<div className="min-h-screen bg-light" />}>
        {children}
      </Suspense>
    </div>
  );
}

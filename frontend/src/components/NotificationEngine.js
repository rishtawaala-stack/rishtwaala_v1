"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function NotificationEngine() {
  useEffect(() => {
    // Welcome toasts...
    const t1 = setTimeout(() => {
      toast("The universe is conspiring to find your perfect match!", { icon: '✨', id: 'welcome-1' });
    }, 3000);

    return () => {
      clearTimeout(t1);
    };
  }, []);

  return null;
}

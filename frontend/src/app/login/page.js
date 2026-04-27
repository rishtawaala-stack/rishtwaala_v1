"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Heart, ArrowRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import useAuthStore from "@/store/useAuthStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const saveUser = useAuthStore(state => state.saveUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data?.data || res.data;

      if (data?.token) {
        localStorage.setItem('token', data.token);
        saveUser(data.user);
        toast.success("Welcome back! 💕");
        router.push("/dashboard");
      } else {
        toast.error("Invalid credentials.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-outer w-full max-w-md p-8 md:p-12 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary animate-heart-pulse" fill="currentColor" />
            <span className="text-3xl font-black text-primary-gradient">RishtaWaala</span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-center mb-2 text-dark">Welcome Back</h1>
        <p className="text-gray-500 text-center text-sm mb-10 font-medium">Sign in to find your perfect match.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-premium pl-12 text-sm"
              id="email"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium pl-12 pr-12 text-sm"
              id="password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-premium flex items-center justify-center gap-3 text-base mt-2"
            id="login-submit"
          >
            {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Sign In</>}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-500 text-sm">Don't have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">Register now</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, Mail, Phone as PhoneIcon, Lock, Calendar, Eye, EyeOff, ArrowRight, Loader, Check, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import useAuthStore from "@/store/useAuthStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    gender: ""
  });
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const router = useRouter();
  const saveUser = useAuthStore(state => state.saveUser);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (!form.dob || !form.gender) {
      toast.error("Date of birth and gender are required.");
      return;
    }
    setStep(3);
  };

  const handleSendOtp = async () => {
    try {
      const res = await api.post('/auth/send-otp', { phone: form.phone || form.email });
      const data = res.data?.data || res.data;
      if (data?.otp) {
        setDevOtp(data.otp);
        toast.success(`OTP: ${data.otp} (DEV MODE)`, { duration: 10000, icon: '🔑' });
      }
    } catch (e) {
      toast.error("Failed to send OTP");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', form);
      const data = res.data?.data || res.data;

      if (data?.token) {
        localStorage.setItem('token', data.token);
        saveUser(data.user);
        toast.success("Registration successful! 🎉 Welcome to RishtaWaala.");
        router.push("/dashboard");
      } else {
        toast.error("Registration completed but token missing. Please log in.");
        router.push("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[150px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-lg p-7 md:p-10 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary animate-heart-pulse" fill="currentColor" />
            <span className="text-2xl font-extrabold text-white tracking-tighter">Rishtawaala</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-2 text-white">Join the Community</h1>
        <p className="text-gray-400 text-center text-xs mb-8 font-medium">Find your resonance through professional connections.</p>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all border ${step >= s ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-10 h-0.5 ${step > s ? 'bg-primary' : 'bg-white/5'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} onSubmit={handleStep1} className="space-y-3.5">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Full Name" value={form.name} onChange={e => update('name', e.target.value)} className="input-premium-dark pl-14 text-xs" required id="register-name" />
              </div>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" placeholder="Email Address" value={form.email} onChange={e => update('email', e.target.value)} className="input-premium-dark pl-14 text-xs" required id="register-email" />
              </div>
              <div className="relative">
                <PhoneIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="tel" placeholder="Phone Number (optional)" value={form.phone} onChange={e => update('phone', e.target.value)} className="input-premium-dark pl-14 text-xs" id="register-phone" />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPassword ? "text" : "password"} placeholder="Password (min 6 chars)" value={form.password} onChange={e => update('password', e.target.value)} className="input-premium-dark pl-14 pr-14 text-xs" required minLength={6} id="register-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" className="w-full btn-premium py-4 text-xs font-bold flex justify-center items-center gap-2 rounded-xl">Continue <ArrowRight className="w-4 h-4" /></button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="step2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} onSubmit={handleStep2} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="date" value={form.dob} onChange={e => update('dob', e.target.value)} className="input-premium-dark pl-14 text-xs" required id="register-dob" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {['male', 'female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => update('gender', g)}
                      className={`py-4 rounded-xl text-xs capitalize font-bold transition-all border ${form.gender === g ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-400 border-white/10 hover:border-primary/30'}`}
                    >
                      {g === 'male' ? '👨 Male' : '👩 Female'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white/5 text-gray-400 py-3.5 rounded-xl font-bold text-xs hover:bg-white/10 transition-all">Back</button>
                <button type="submit" className="flex-1 btn-premium py-3.5 rounded-xl text-xs font-bold flex justify-center items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form key="step3" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} onSubmit={handleRegister} className="space-y-4">
              <div className="text-center">
                <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-extrabold text-base mb-1 text-white">Trust Check</h3>
                <p className="text-gray-400 text-[10px] font-medium">Verify your identity to proceed.</p>
              </div>
              <div className="flex gap-2 items-center">
                <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} className="input-neon text-sm flex-1" id="register-otp" />
                <button type="button" onClick={handleSendOtp} className="btn-outline py-3.5 px-4 text-xs shrink-0">Send OTP</button>
              </div>
              {devOtp && <p className="text-xs text-green-400 text-center font-bold">DEV OTP: {devOtp}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-white/5 text-gray-400 py-4 rounded-xl font-bold text-xs hover:bg-white/10 transition-all">Back</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-premium py-4 rounded-xl text-xs font-bold flex justify-center items-center gap-2">
                  {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <><Heart className="w-4 h-4" /> Create Heart</>}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs font-medium">Joining back?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

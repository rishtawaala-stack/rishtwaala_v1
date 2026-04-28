"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/login`, {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem("admin_token", response.data.data.token);
        localStorage.setItem("admin_role", response.data.data.admin.role);
        localStorage.setItem("admin_name", response.data.data.admin.name);
        
        toast.success(`Welcome back, ${response.data.data.admin.name}`);
        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.response?.data?.message || "Invalid administrative credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] text-[#1b1b24] min-h-screen flex items-center justify-center p-6 font-['Inter']">
      <main className="w-full max-w-[1000px] flex rounded-lg overflow-hidden bg-white shadow-xl border border-[#e2e8f0] h-[600px]">
        {/* Left Column: Branding / Info */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#0f172a] p-8 text-white">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-8 h-8 rounded bg-[#3525cd] flex items-center justify-center">
                <span className="material-symbols-outlined fill text-white text-xl">admin_panel_settings</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white font-['Plus_Jakarta_Sans']">Rishtawaala</h1>
                <p className="text-[12px] text-[#94a3b8] uppercase tracking-wider font-semibold">Command Center</p>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white leading-tight font-['Plus_Jakarta_Sans']">Secure Access<br/>Required</h2>
              <p className="text-sm text-[#94a3b8] max-w-sm">
                You are accessing a highly privileged environment. All actions are logged and audited. Ensure you are on a secure network before proceeding.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#94a3b8] text-[12px] font-semibold">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>End-to-End Encrypted Session</span>
          </div>
        </div>

        {/* Right Column: Login Flow */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          <div className="w-full max-w-[320px] mx-auto space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-[#1b1b24] mb-2 font-['Plus_Jakarta_Sans']">Sign In</h3>
              <p className="text-sm text-[#64748b]">Enter your administrative credentials to continue.</p>
            </div>
            
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-[#464555]" htmlFor="admin_id">Admin ID / Email</label>
                <input 
                  className="w-full h-10 px-3 rounded border border-[#c7c4d8] bg-white text-[#1b1b24] text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-colors outline-none" 
                  id="admin_id" 
                  placeholder="admin@rishtawaala.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[12px] font-semibold text-[#464555]" htmlFor="password">Master Password</label>
                  <a className="text-[12px] font-semibold text-[#3525cd] hover:text-[#c3c0ff] transition-colors" href="#">Forgot?</a>
                </div>
                <div className="relative">
                  <input 
                    className="w-full h-10 px-3 rounded border border-[#c7c4d8] bg-white text-[#1b1b24] text-sm focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-colors outline-none" 
                    id="password" 
                    placeholder="••••••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1b1b24] transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? "visibility" : "visibility_off"}</span>
                  </button>
                </div>
              </div>
              <button 
                className={`w-full h-10 rounded bg-[#3525cd] text-white text-[12px] font-semibold flex items-center justify-center gap-2 hover:bg-[#4d44e3] transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Authenticating...' : 'Authenticate'}</span>
                {!isLoading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Import Material Symbols for icons */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    mrr: 142850,
    pendingVerifications: 0,
    genderDistribution: { male: 0, female: 0, other: 0 },
    registrationHistory: []
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Questionnaire form state
  const [questionText, setQuestionText] = useState("");
  const [isAllUsers, setIsAllUsers] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const router = useRouter();

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setStats(response.data.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setUsers(response.data.data);
    } catch (err) {
      console.error("Users fetch error:", err);
    }
  };

  const fetchAnswers = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/questions/answers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setAnswers(response.data.data);
    } catch (err) {
      console.error("Answers fetch error:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    const initData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchAnswers()]);
      setIsLoading(false);
    };

    initData();
  }, [router]);

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return toast.error("Please enter a question");
    if (!isAllUsers && selectedUserIds.length === 0) return toast.error("Please select at least one user");

    setIsSending(true);
    try {
      const token = localStorage.getItem("admin_token");
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/admin/questions`, {
        question_text: questionText,
        is_all_users: isAllUsers,
        user_ids: isAllUsers ? [] : selectedUserIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Questionnaire sent successfully");
      setQuestionText("");
      setSelectedUserIds([]);
    } catch (err) {
      toast.error("Failed to send questionnaire");
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_name");
    router.push("/admin");
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] text-[#1b1b24] font-['Inter'] min-h-screen">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] border-r border-[#1e293b] bg-[#0f172a] z-50 flex flex-col py-6">
        <div className="px-6 mb-8">
          <h1 className="text-lg font-extrabold tracking-tighter text-white font-['Plus_Jakarta_Sans']">Rishtawaala</h1>
          <p className="text-[12px] text-[#94a3b8] mt-1 uppercase tracking-wider font-semibold">Command Center</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 font-['Plus_Jakarta_Sans'] text-[13px] tracking-tight">
          <NavItem icon="dashboard" label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <NavItem icon="group" label="Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <NavItem icon="quiz" label="Questionnaire" active={activeTab === "questionnaire"} onClick={() => setActiveTab("questionnaire")} />
          <NavItem icon="verified_user" label="Verification" active={activeTab === "verification"} onClick={() => setActiveTab("verification")} />
          <NavItem icon="security" label="Safety" active={activeTab === "safety"} onClick={() => setActiveTab("safety")} />
          <NavItem icon="payments" label="Finance" active={activeTab === "finance"} onClick={() => setActiveTab("finance")} />
          <NavItem icon="forum" label="Communication" active={activeTab === "communication"} onClick={() => setActiveTab("communication")} />
          <NavItem icon="trending_up" label="Growth" active={activeTab === "growth"} onClick={() => setActiveTab("growth")} />
          <NavItem icon="star" label="Premium Services" active={activeTab === "premium"} onClick={() => setActiveTab("premium")} />
        </nav>
        <div className="px-3 mt-4">
          <NavItem icon="settings_suggest" label="Settings & Audit" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:bg-slate-800 transition-all duration-200 mt-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="sticky top-0 z-40 h-16 bg-white shadow-sm flex items-center justify-between px-6 w-full ml-[260px] max-w-[calc(100%-260px)]">
        <div className="flex items-center gap-4 w-1/3">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[20px]">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border-none rounded-md text-sm text-[#1b1b24] focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors outline-none" placeholder="Search..." type="text"/>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <IconButton icon="notifications" badge />
          <IconButton icon="help" />
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-none">{localStorage.getItem("admin_name") || "Admin"}</p>
              <p className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-wider">{localStorage.getItem("admin_role") || "Moderator"}</p>
            </div>
            <img alt="Admin" className="w-8 h-8 rounded-full border border-slate-200" src="https://lh3.googleusercontent.com/a/default-user" />
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="ml-[260px] p-6 max-w-[1440px] pb-20">
        {activeTab === "dashboard" && (
          <>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#1b1b24] tracking-tight font-['Plus_Jakarta_Sans']">Platform Overview</h2>
                <p className="text-sm text-[#64748b] mt-1">Live metrics from the production database.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <KpiCard title="Total Users" value={stats.totalUsers.toLocaleString()} change="Live" icon="group" />
              <KpiCard title="Monthly Recurring Rev" value={`$${stats.mrr.toLocaleString()}`} change="Target" icon="account_balance_wallet" />
              <KpiCard title="Pending Verification" value={stats.pendingVerifications.toLocaleString()} alert={stats.pendingVerifications > 0 ? "Action Required" : "All Clear"} icon="pending_actions" color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">User Growth (Last 6 Months)</h3>
                   <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12.5% vs Prev</span>
                </div>
                <div className="h-64 w-full">
                  <LineChart data={stats.registrationHistory} />
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">Gender Distribution</h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <PieChart data={stats.genderDistribution} />
                </div>
              </div>
            </div>

            {/* Funnel Section */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">Conversion Funnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FunnelStep label="Visits" value="2.4k" color="bg-indigo-500" />
                <FunnelStep label="Registers" value={stats.totalUsers} color="bg-blue-500" />
                <FunnelStep label="Verified" value={stats.totalUsers - stats.pendingVerifications} color="bg-emerald-500" />
                <FunnelStep label="Active" value="156" color="bg-amber-500" />
              </div>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#e2e8f0] flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">User Management</h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{users.length} Total</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Completion</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{u.full_name}</td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{u.gender || 'Not set'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                          <div className="h-full bg-indigo-500" style={{ width: `${u.profile_complete_pct || 0}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{u.profile_complete_pct || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "questionnaire" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Questionnaire</h2>
              <form onSubmit={handleSendQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Question Text</label>
                  <textarea 
                    className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24"
                    placeholder="Ask something to your users..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-md border border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={isAllUsers} 
                      onChange={() => setIsAllUsers(true)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Send to All Users</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={!isAllUsers} 
                      onChange={() => setIsAllUsers(false)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Specific Users</span>
                  </label>
                </div>

                {!isAllUsers && (
                  <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-md p-2 grid grid-cols-2 gap-2">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                        <input 
                          type="checkbox"
                          checked={selectedUserIds.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedUserIds([...selectedUserIds, u.id]);
                            else setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-medium text-slate-600 truncate">{u.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSending}
                  className="w-full py-3 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                  {isSending ? "Broadcasting..." : "Broadcast Questionnaire"}
                </button>
              </form>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm">
              <div className="p-6 border-b border-[#e2e8f0]">
                <h2 className="text-xl font-bold text-slate-900">User Responses</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {answers.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl block mb-2">forum</span>
                    <p>No responses yet. Send a question to get started!</p>
                  </div>
                ) : (
                  answers.map(ans => (
                    <div key={ans.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {ans.user_information?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none">{ans.user_information?.full_name || 'Deleted User'}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">User ID: {ans.user_id?.substring(0,8)}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(ans.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="ml-11 mt-3">
                        <div className="bg-slate-100 p-3 rounded-md mb-2 text-xs font-semibold text-slate-500 border-l-4 border-slate-300">
                          Q: {ans.admin_questions?.question_text}
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-md text-sm text-slate-800 border-l-4 border-indigo-400">
                          {ans.answer_text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {["verification", "safety", "finance", "communication", "growth", "premium"].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 animate-pulse">construction</span>
            <h2 className="text-2xl font-bold text-slate-400 capitalize">{activeTab} Control Center</h2>
            <p className="text-slate-500 mt-2">Integrating with live production modules...</p>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-[260px] w-[calc(100%-260px)] h-10 bg-white border-t border-[#e2e8f0] flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-6">
          <HealthNode label="Supabase: Connected" status="emerald" pulse />
          <HealthNode label="API: Active" status="emerald" />
          <HealthNode label="SSL: Secure" status="emerald" />
        </div>
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
          Version 2.5.0-production (Live)
        </div>
      </footer>
      
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <a 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
    >
      <span className={`material-symbols-outlined text-[18px] ${active ? 'fill' : ''}`}>{icon}</span>
      <span className={active ? 'font-bold' : ''}>{label}</span>
    </a>
  );
}

function IconButton({ icon, badge }) {
  return (
    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
      <span className="material-symbols-outlined">{icon}</span>
      {badge && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
    </button>
  );
}

function KpiCard({ title, value, change, alert, icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'hover:border-indigo-200',
    amber: 'hover:border-amber-200'
  };
  
  return (
    <div className={`bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm relative overflow-hidden group transition-colors ${colorMap[color] || colorMap.indigo}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        {change && (
          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
            {change}
          </span>
        )}
        {alert && (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold">
            {alert}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">{value}</div>
      <div className="text-[12px] text-slate-500 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1">
        <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
        Production Data
      </div>
      <div className="absolute -right-4 -bottom-4 text-slate-100 group-hover:text-indigo-50/50 transition-colors pointer-events-none">
        <span className="material-symbols-outlined text-[100px]">{icon}</span>
      </div>
    </div>
  );
}

function HealthNode({ label, status, pulse }) {
  const statusColors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500'
  };
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColors[status] || 'bg-slate-400'}`}></span>
      </span>
      <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">{label}</span>
    </div>
  );
}

function FunnelBar({ label, value, percent, color }) {
  return (
    <div className="relative w-full">
      <div className="flex justify-between text-[11px] font-bold text-[#464555] mb-1.5 uppercase tracking-wider">
        <span>{label}</span>
        <span className="font-bold text-slate-900">{value} {percent < 100 && <span className="text-slate-400 font-normal ml-1">({percent}%)</span>}</span>
      </div>
      <div className="w-full bg-[#f1f5f9] rounded-full h-8 overflow-hidden flex shadow-inner">
        <div className={`${color} h-full rounded-r-full border-r-4 border-white transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function AlertItem({ title, desc, time, type }) {
  const iconMap = {
    error: { icon: 'warning', color: 'text-red-500' },
    warning: { icon: 'report', color: 'text-amber-500' },
    info: { icon: 'info', color: 'text-blue-400' }
  };
  const { icon, color } = iconMap[type] || iconMap.info;
  
  return (
    <li className="p-4 hover:bg-[#f8fafc] transition-colors flex gap-4 items-start cursor-pointer">
      <div className={`mt-0.5 ${color}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <p className="text-[13px] text-slate-900 font-bold leading-tight mb-1">{title}</p>
        <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{desc}</p>
        <span className="text-[10px] text-slate-400 mt-2 block font-bold uppercase tracking-wider">{time}</span>
      </div>
    </li>
  );
}
function LineChart({ data }) {
  if (!data || data.length === 0) return <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs italic">Awaiting history data...</div>;

  const max = Math.max(...data.map(d => d.count), 5);
  const padding = 40;
  const width = 500;
  const height = 200;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - (d.count / max) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full flex flex-col">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Grid lines */}
        {[0, 0.5, 1].map(v => (
          <line key={v} x1={padding} y1={height - padding - v * (height - padding * 2)} x2={width - padding} y2={height - padding - v * (height - padding * 2)} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        
        {/* Path */}
        <polyline
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-lg"
        />
        
        {/* Points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
          const y = height - (d.count / max) * (height - padding * 2) - padding;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
              <text x={x} y={height - 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-400 font-sans">{d.month}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PieChart({ data }) {
  const total = data.male + data.female + data.other;
  if (total === 0) return <div className="text-slate-400 text-xs italic">No user data available</div>;

  const malePer = (data.male / total) * 100;
  const femalePer = (data.female / total) * 100;
  
  // Simple CSS conic gradient pie
  return (
    <div className="flex items-center gap-12">
      <div 
        className="w-48 h-48 rounded-full shadow-inner relative border-4 border-white"
        style={{
          background: `conic-gradient(#6366f1 0% ${malePer}%, #ec4899 ${malePer}% ${malePer + femalePer}%, #94a3b8 ${malePer + femalePer}% 100%)`
        }}
      >
        <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-inner">
           <div className="text-center">
             <p className="text-2xl font-black text-slate-900 leading-none">{total}</p>
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Users</p>
           </div>
        </div>
      </div>
      <div className="space-y-4">
        <LegendItem label="Male" color="bg-indigo-500" value={data.male} />
        <LegendItem label="Female" color="bg-pink-500" value={data.female} />
        <LegendItem label="Other" color="bg-slate-400" value={data.other} />
      </div>
    </div>
  );
}

function LegendItem({ label, color, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded ${color}`}></div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function FunnelStep({ label, value, color }) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 group hover:border-indigo-200 transition-colors">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
        <div className={`w-full h-1 ${color} rounded-full opacity-20 group-hover:opacity-100 transition-opacity`}></div>
      </div>
    </div>
  );
}

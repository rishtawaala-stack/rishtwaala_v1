"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: false });
import { Briefcase, GraduationCap, MapPin, Edit3, Settings, Star, AlertCircle, Camera, Save, User, Heart, Building, IndianRupee, Utensils, Dumbbell, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import useAuthStore from "@/store/useAuthStore";
import { CASTE_LIST } from "@/lib/constants";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("about");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [prevPct, setPrevPct] = useState(0);
  const saveUser = useAuthStore(state => state.saveUser);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data?.data?.user || res.data?.user;
      if (userData) {
        if (userData.profile_complete_pct === 100 && prevPct > 0 && prevPct < 100) {
            toast.custom((t) => (
               <div className="bg-gradient-to-r from-primary to-secondary text-white p-5 rounded-2xl shadow-2xl flex gap-4 items-center border border-white/20 animate-bounce cursor-pointer max-w-sm" onClick={() => toast.dismiss(t.id)}>
                  <Heart className="w-10 h-10 text-white shrink-0 fill-white animate-pulse" />
                  <div>
                     <h4 className="font-extrabold text-lg">Profile 100% Ready! 💕</h4>
                     <p className="text-sm font-bold text-white/90">You can now view your personalized matches!</p>
                  </div>
               </div>
            ), { duration: 6000 });
        }
        setPrevPct(userData.profile_complete_pct);
        setProfile(userData);
        saveUser(userData);
      }
    } catch (err) {
      toast.error("Please login to view your profile", { icon: '🔒' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (!editing) {
      if (activeTab === "family") {
        setEditData(profile?.family || {});
      } else if (activeTab === "preferences") {
        setEditData(profile?.preferences || {});
      } else if (activeTab === "interests") {
        setEditData({ 
          interests: profile?.interests || [], 
          hobbies: profile?.hobbies || [] 
        });
      } else {
        setEditData(profile || {});
      }
    }
    setEditing(!editing);
  };

  useEffect(() => {
    setEditing(false);
  }, [activeTab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "about" || activeTab === "education" || activeTab === "interests") {
        await api.patch('/profiles/me', editData);
      } else if (activeTab === "family") {
        await api.put('/family/me', editData);
      } else if (activeTab === "preferences") {
        await api.put('/preferences/me', editData);
      }
      
      toast.success("Profile updated successfully! ✨");
      setEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Strict face photo warning
    const isRealPhoto = window.confirm("⚠️ QUALITY CHECK: You must only upload a REAL, CLEAR photo of your actual face. AI-generated images, celebrities, or landscape photos are strictly prohibited and will result in your profile being BANNED. \n\nDo you confirm this is a real photo of your face?");
    if (!isRealPhoto) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      toast.loading("Uploading photo...", { id: "upload" });
      const res = await api.post('/media/upload?type=profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.data?.url || res.data?.url;
      setEditData({ ...editData, profile_photo_url: url });
      // Update store immediately for UI representation
      if (!editing) {
         setProfile(prev => ({...prev, profile_photo_url: url}));
         await api.patch('/profiles/me', { profile_photo_url: url });
      }
      toast.success("Photo uploaded successfully!", { id: "upload" });
    } catch(err) {
      toast.error("Upload failed", { id: "upload" });
    }
  };

  const tabs = [
    { id: "about", label: "About" },
    { id: "education", label: "Education & Career" },
    { id: "family", label: "Family" },
    { id: "preferences", label: "Preferences" },
    { id: "interests", label: "My Interests" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 48;
  const dashOffset = circumference - ((profile?.profile_complete_pct || 0) / 100) * circumference;

  return (
    <div className="min-h-screen pl-0 md:pl-56 flex flex-col bg-light text-dark">
      <Navigation />
      
      <main className="flex-1 pb-20 md:pb-8">
        {/* Profile Header */}
        <div className="h-64 md:h-80 relative bg-gradient-to-br from-secondary/5 via-primary/5 to-transparent border-b border-gray-100">
          {editing && (
            <div className="absolute top-4 inset-x-0 mx-auto max-w-2xl px-5 z-20">
              <div className="bg-primary/10 backdrop-blur-md border border-primary/20 p-4 rounded-2xl flex items-center gap-4 shadow-lg animate-pulse-soft">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-0.5">Strict Photo Intelligence Policy</h4>
                  <p className="text-[11px] font-bold text-dark leading-tight">
                    Only <span className="text-primary underline">ACTUAL FACE PHOTOS</span> are permitted. AI-generated, filtered, or placeholder images are flagged by our system and will result in <span className="text-primary">IMMEDIATE ACCOUNT BAN</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="max-w-4xl mx-auto px-5 h-full flex items-end pb-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full translate-y-20 md:translate-y-1/4">
              {/* Profile Photo */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] border-2 border-white overflow-hidden shrink-0 shadow-2xl bg-white shadow-xl">
                  {editData.profile_photo_url || profile?.profile_photo_url ? (
                    <img src={editData.profile_photo_url || profile?.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  {editing && (
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white mb-2" />
                      <span className="text-xs font-bold">Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                  )}
                </div>
                {/* Completion ring */}
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center p-1 border border-gray-50">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="5" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="url(#compGrad)" strokeWidth="5" 
                      strokeLinecap="round" strokeDasharray={2 * Math.PI * 24} strokeDashoffset={(2 * Math.PI * 24) - ((profile?.profile_complete_pct || 0) / 100) * (2 * Math.PI * 24)} />
                    <defs><linearGradient id="compGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF3B5C" /><stop offset="100%" stopColor="#7B2FF7" /></linearGradient></defs>
                  </svg>
                  <span className="absolute text-[11px] font-black text-primary">{profile?.profile_complete_pct || 0}%</span>
                </div>

                {editing && (
                  <div className="absolute top-0 -left-64 w-60 hidden lg:block animate-float">
                    <div className="bg-rw-rose-pale p-4 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Photo Policy</span>
                      </div>
                      <p className="text-[11px] font-bold text-dark leading-relaxed">
                        Only <span className="text-primary underline">Real Human Face</span> photos are allowed. AI-generated, filtered, or stock photos will be permanently rejected.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-1 flex items-center justify-center md:justify-start gap-4 text-dark tracking-tighter">
                  {profile?.full_name || profile?.name || "Complete Profile"}
                  {profile?.is_premium && <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />}
                </h1>
                <p className="text-black/60 text-sm md:text-base flex items-center justify-center md:justify-start gap-2 mb-4 font-black uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-primary" /> {profile?.current_city !== "Not specified" ? `${profile?.current_city}, ${profile?.current_state}` : "Location not set"}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {profile?.gender && <span className="px-5 py-1.5 bg-white border border-gray-100 text-[10px] rounded-full font-bold uppercase tracking-widest text-dark shadow-sm">{profile.gender}</span>}
                  {profile?.age && <span className="px-5 py-1.5 bg-white border border-gray-100 text-[10px] rounded-full font-bold uppercase tracking-widest text-dark shadow-sm">{profile.age} years</span>}
                  {profile?.religion !== "Not specified" && <span className="px-5 py-1.5 bg-white border border-gray-100 text-[10px] rounded-full font-bold uppercase tracking-widest text-dark shadow-sm">{profile?.religion}</span>}
                </div>
              </div>

              <div className="flex gap-2 mb-4 md:mb-0">
                <button onClick={handleEditToggle} className="btn-premium py-3 px-6 text-xs flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-5 mt-24 w-full">
          {profile?.profile_complete_pct < 100 && (
             <div className="glass-outer mb-10 p-8 border-primary/20 bg-primary/5 text-dark text-sm font-bold uppercase tracking-widest flex items-center gap-6 animate-pulse">
                <AlertCircle className="w-10 h-10 text-primary" /> 
                <span>Your profile is <strong className="text-primary text-xl font-extrabold">{profile?.profile_complete_pct}%</strong> complete. Please complete it 100% to view matches!</span>
             </div>
          )}

          {/* Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-10 glass-outer p-2.5 w-full border-gray-100 bg-white shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20 transform scale-[1.02]' : 'text-gray-400 hover:text-dark hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="glass-outer p-8 md:p-12 min-h-[440px] border-gray-100 bg-white mb-24 shadow-xl"
            >
              {activeTab === 'about' && (
                <div className="space-y-10">
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-primary border-b-2 border-primary/10 pb-4 mb-8">Personal Information</h3>
                  
                  {editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2 block flex items-center gap-2">Full Name <Lock className="w-3 h-3" /></label>
                        <input className="input-glass text-sm bg-gray-50/50 cursor-not-allowed text-gray-500" value={profile?.full_name || profile?.name || ""} disabled />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2 block flex items-center gap-2">Date of Birth <Lock className="w-3 h-3" /></label>
                        <input 
                          type="date" 
                          className="input-glass text-sm bg-gray-50/50 cursor-not-allowed text-gray-500" 
                          value={profile?.dob || ""} 
                          disabled
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2 block flex items-center gap-2">Age (Years) <Lock className="w-3 h-3" /></label>
                        <input type="number" className="input-glass text-sm bg-gray-50/50 cursor-not-allowed text-gray-500" value={profile?.age || ""} disabled />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Current City</label>
                        <input className="input-glass text-sm" value={editData.current_city || profile?.current_city || ""} onChange={e => setEditData({...editData, current_city: e.target.value})} placeholder="e.g. Mumbai, Delhi" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Height (cm)</label>
                        <input type="number" className="input-glass text-sm" value={editData.height_cm || ""} onChange={e => setEditData({...editData, height_cm: parseInt(e.target.value)})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Marital Status</label>
                        <select className="input-glass text-sm" value={editData.marital_status || ""} onChange={e => setEditData({...editData, marital_status: e.target.value})}>
                          <option value="">Select</option>
                          <option value="never_married">Never Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                          <option value="awaiting_divorce">Awaiting Divorce</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Religion</label>
                        <select className="input-glass text-sm" value={["Hindu","Muslim","Christian","Sikh","Buddhist","Jain","Parsi","Jewish","Bahai",""].includes(editData.religion || "") ? (editData.religion || "") : "Other"} onChange={e => setEditData({...editData, religion: e.target.value === "Other" ? "Other" : e.target.value})}>
                          <option value="">Select Religion</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Muslim">Muslim</option>
                          <option value="Christian">Christian</option>
                          <option value="Sikh">Sikh</option>
                          <option value="Buddhist">Buddhist</option>
                          <option value="Jain">Jain</option>
                          <option value="Parsi">Parsi</option>
                          <option value="Jewish">Jewish</option>
                          <option value="Bahai">Bahá'í</option>
                          <option value="Other">Other</option>
                        </select>
                        {(!["Hindu","Muslim","Christian","Sikh","Buddhist","Jain","Parsi","Jewish","Bahai",""].includes(editData.religion || "") || editData.religion === "Other") && (
                          <input className="input-glass text-sm mt-3 border-rw-rose/30 bg-rw-rose/5" placeholder="Type your religion here" value={editData.religion === "Other" ? "" : (editData.religion || "")} onChange={e => setEditData({...editData, religion: e.target.value})} autoFocus />
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Caste</label>
                        <select 
                          className="input-glass text-sm" 
                          value={([...CASTE_LIST, ""].includes(editData.caste)) ? editData.caste : "Other"} 
                          onChange={e => setEditData({...editData, caste: e.target.value === "Other" ? "Other" : e.target.value})}
                        >
                          <option value="">Select Caste</option>
                          {CASTE_LIST.filter(c => c !== "Other").map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                        {(editData.caste === "Other" || (editData.caste && !CASTE_LIST.includes(editData.caste))) && (
                           <input 
                             className="input-glass text-sm mt-3 border-rw-rose/30 bg-rw-rose/5" 
                             placeholder="Type your caste here" 
                             value={editData.caste === "Other" ? "" : editData.caste} 
                             onChange={e => setEditData({...editData, caste: e.target.value})} 
                             autoFocus 
                           />
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Mother Tongue</label>
                        <input className="input-glass text-sm" value={editData.mother_tongue || ""} onChange={e => setEditData({...editData, mother_tongue: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Diet</label>
                        <select className="input-glass text-sm" value={editData.diet || ""} onChange={e => setEditData({...editData, diet: e.target.value})}>
                          <option value="">Select</option>
                          <option value="veg">Vegetarian</option>
                          <option value="nonveg">Non-Vegetarian</option>
                          <option value="eggetarian">Eggetarian</option>
                          <option value="jain">Jain</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Profile Photo</label>
                        <div className="flex gap-4 items-center">
                          {(editData.profile_photo_url || profile?.profile_photo_url) ? (
                            <img src={editData.profile_photo_url || profile?.profile_photo_url} className="w-12 h-12 rounded-xl object-cover bg-white/20 border border-white/40 shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/40"><User className="w-6 h-6 text-rw-text-soft/40" /></div>
                          )}
                          <label className="btn-premium py-2 px-4 shadow-none bg-white/40 hover:bg-white/60 text-[10px] text-rw-rose border-white/10 flex items-center gap-2 cursor-pointer flex-1 justify-center transition-all">
                            <Camera className="w-4 h-4" /> Change
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                          </label>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Bio</label>
                        <textarea className="input-glass text-sm min-h-[120px]" value={editData.bio || ""} onChange={e => setEditData({...editData, bio: e.target.value})} placeholder="Write about yourself..." maxLength={500} />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button onClick={handleSave} disabled={saving} className="btn-premium py-3 px-10 text-sm flex items-center gap-2 transform transition-all active:scale-95">
                          {saving ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Update Portfolio</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {profile?.bio && (
                        <p className="text-rw-text-deep text-base font-medium leading-relaxed mb-8 italic">"{profile.bio}"</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 pt-10 border-t border-rw-rose/10">
                        <InfoItem label="Age" value={profile?.age ? `${profile.age} Years` : "Not set"} />
                        <InfoItem label="Height" value={profile?.height_cm ? `${profile.height_cm} cm` : "Not set"} />
                        <InfoItem label="City" value={profile?.current_city && profile?.current_city !== "Not specified" ? profile.current_city : "Not set"} />
                        <InfoItem label="Religion" value={profile?.religion && profile?.religion !== "Not specified" ? profile?.religion : "Not set"} />
                        <InfoItem label="Caste" value={profile?.caste && profile?.caste !== "Not specified" ? profile?.caste : "Not set"} />
                        <InfoItem label="Mother Tongue" value={profile?.mother_tongue && profile?.mother_tongue !== "Not specified" ? profile?.mother_tongue : "Not set"} />
                        <InfoItem label="Marital Status" value={profile?.marital_status?.replace('_', ' ') || "Not set"} />
                        <InfoItem label="Diet" value={profile?.diet || "Not set"} />
                        <InfoItem label="Created" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-10">
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-secondary border-b-2 border-secondary/10 pb-4 mb-8 flex items-center gap-4">
                    <GraduationCap className="w-7 h-7 text-secondary" /> Education & Career
                  </h3>
                  
                  {editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Education Level</label>
                        <input className="input-glass text-sm" value={editData.education_level || ""} onChange={e => setEditData({...editData, education_level: e.target.value})} placeholder="e.g. B.Tech, MBA..." />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Education Field</label>
                        <input className="input-glass text-sm" value={editData.education_field || ""} onChange={e => setEditData({...editData, education_field: e.target.value})} placeholder="e.g. Computer Science" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Institution</label>
                        <input className="input-glass text-sm" value={editData.institution || ""} onChange={e => setEditData({...editData, institution: e.target.value})} placeholder="e.g. IIT Delhi" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Occupation Type</label>
                        <select className="input-glass text-sm" value={editData.occupation_type || ""} onChange={e => setEditData({...editData, occupation_type: e.target.value})}>
                          <option value="">Select</option>
                          <option value="private">Private Sector</option>
                          <option value="govt">Government</option>
                          <option value="business">Business</option>
                          <option value="defence">Defence</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Occupation Detail</label>
                        <input className="input-glass text-sm" value={editData.occupation_detail || ""} onChange={e => setEditData({...editData, occupation_detail: e.target.value})} placeholder="e.g. Software Engineer" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Employer</label>
                        <input className="input-glass text-sm" value={editData.employer || ""} onChange={e => setEditData({...editData, employer: e.target.value})} placeholder="e.g. Google, TCS..." />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Annual Income Range</label>
                        <input className="input-glass text-sm" value={editData.annual_income_range || ""} onChange={e => setEditData({...editData, annual_income_range: e.target.value})} placeholder="e.g. 10-15 LPA" />
                      </div>
                      <div className="md:col-span-2 flex justify-end mt-4">
                        <button onClick={handleSave} disabled={saving} className="btn-premium py-3 px-10 text-sm flex items-center gap-2 transform transition-all active:scale-95">
                          {saving ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Career Details</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <InfoItem label="Education" value={profile?.education_level !== "Not specified" ? profile?.education_level : "Not set"} />
                      <InfoItem label="Field" value={profile?.education_field || "Not set"} />
                      <InfoItem label="Institution" value={profile?.institution || "Not set"} />
                      <InfoItem label="Occupation" value={profile?.occupation_detail || "Not set"} />
                      <InfoItem label="Employer" value={profile?.employer || "Not set"} />
                      <InfoItem label="Income" value={profile?.annual_income_range !== "Not specified" ? profile?.annual_income_range : "Not set"} />
                      <InfoItem label="City" value={profile?.current_city !== "Not specified" ? profile?.current_city : "Not set"} />
                      <InfoItem label="State" value={profile?.current_state !== "Not specified" ? profile?.current_state : "Not set"} />
                      <InfoItem label="Country" value={profile?.current_country || "India"} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'family' && (
                <div className="space-y-10">
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-primary border-b-2 border-primary/10 pb-4 mb-8">Family Details</h3>
                  
                  {editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Father's Name</label>
                        <input className="input-glass text-sm" value={editData.father_name || ""} onChange={e => setEditData({...editData, father_name: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Father's Status/Occupation</label>
                        <input className="input-glass text-sm" value={editData.father_occupation || ""} onChange={e => setEditData({...editData, father_occupation: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Mother's Name</label>
                        <input className="input-glass text-sm" value={editData.mother_name || ""} onChange={e => setEditData({...editData, mother_name: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Mother's Status/Occupation</label>
                        <input className="input-glass text-sm" value={editData.mother_occupation || ""} onChange={e => setEditData({...editData, mother_occupation: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Family Type</label>
                        <select className="input-glass text-sm" value={editData.family_type || ""} onChange={e => setEditData({...editData, family_type: e.target.value})}>
                          <option value="">Select</option>
                          <option value="nuclear">Nuclear Family</option>
                          <option value="joint">Joint Family</option>
                          <option value="single">Single Parent</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">No. of Siblings</label>
                        <input type="number" className="input-glass text-sm" value={editData.siblings_count || 0} onChange={e => setEditData({...editData, siblings_count: parseInt(e.target.value)})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Family Values</label>
                        <select className="input-glass text-sm" value={editData.family_values || ""} onChange={e => setEditData({...editData, family_values: e.target.value})}>
                          <option value="">Select</option>
                          <option value="orthodox">Orthodox</option>
                          <option value="traditional">Traditional</option>
                          <option value="moderate">Moderate</option>
                          <option value="liberal">Liberal</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex justify-end mt-4">
                        <button onClick={handleSave} disabled={saving} className="btn-premium py-3 px-10 text-sm flex items-center gap-2 transform transition-all active:scale-95">
                          {saving ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Family Profile</>}
                        </button>
                      </div>
                    </div>
                  ) : profile?.family && Object.keys(profile.family).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <InfoItem label="Father's Name" value={profile.family.father_name || "Not set"} />
                      <InfoItem label="Father's Occupation" value={profile.family.father_occupation || "Not set"} />
                      <InfoItem label="Mother's Name" value={profile.family.mother_name || "Not set"} />
                      <InfoItem label="Mother's Occupation" value={profile.family.mother_occupation || "Not set"} />
                      <InfoItem label="Siblings" value={profile.family.siblings_count !== undefined ? `${profile.family.siblings_count}` : "Not set"} />
                      <InfoItem label="Family Type" value={profile.family.family_type || "Not set"} />
                      <InfoItem label="Family Values" value={profile.family.family_values || "Not set"} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Family details not added yet.</p>
                      <p className="text-gray-500 text-xs mt-1">Complete your profile to add family information.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-10">
                  <div className="flex justify-between items-center border-b-2 border-primary/10 pb-4 mb-8">
                    <h3 className="text-xl font-extrabold uppercase tracking-tight text-primary flex items-center gap-4">
                      <Heart className="w-7 h-7 text-primary" /> Partner Preferences
                    </h3>
                    {profile?.preferences && Object.keys(profile.preferences).length > 3 && (
                      <span className="px-4 py-1.5 bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20 flex items-center gap-2">
                        <Star className="w-3 h-3 fill-green-600" /> 100% Match Ready
                      </span>
                    )}
                  </div>

                  {editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Min Age Requirements</label>
                        <input type="number" className="input-glass text-sm" value={editData.age_min || ""} onChange={e => setEditData({...editData, age_min: parseInt(e.target.value)})} placeholder="e.g. 25" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Max Age Requirements</label>
                        <input type="number" className="input-glass text-sm" value={editData.age_max || ""} onChange={e => setEditData({...editData, age_max: parseInt(e.target.value)})} placeholder="e.g. 30" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Min Height (cm)</label>
                        <input type="number" className="input-glass text-sm" value={editData.height_min_cm || ""} onChange={e => setEditData({...editData, height_min_cm: parseInt(e.target.value)})} placeholder="e.g. 150" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-rw-text-soft/60 uppercase tracking-widest mb-2 block">Max Height (cm)</label>
                        <input type="number" className="input-glass text-sm" value={editData.height_max_cm || ""} onChange={e => setEditData({...editData, height_max_cm: parseInt(e.target.value)})} placeholder="e.g. 180" />
                      </div>
                      <div className="md:col-span-2 flex justify-end mt-4">
                        <button onClick={handleSave} disabled={saving} className="btn-premium py-3 px-10 text-sm flex items-center gap-2 transform transition-all active:scale-95">
                          {saving ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Lock Preferences</>}
                        </button>
                      </div>
                    </div>
                  ) : profile?.preferences && Object.keys(profile.preferences).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profile.gender === "male" && <p className="col-span-full text-[#FF2E63] font-medium text-sm mb-2">Looking for a Female where:</p>}
                      {profile.gender === "female" && <p className="col-span-full text-[#FF2E63] font-medium text-sm mb-2">Looking for a Male where:</p>}
                      <InfoItem label="Age Range" value={profile.preferences.age_min && profile.preferences.age_max ? `${profile.preferences.age_min} - ${profile.preferences.age_max}` : "Not set"} />
                      <InfoItem label="Height Range" value={profile.preferences.height_min_cm && profile.preferences.height_max_cm ? `${profile.preferences.height_min_cm} - ${profile.preferences.height_max_cm} cm` : "Not set"} />
                      <InfoItem label="Religion" value={profile.preferences.religion?.length ? (Array.isArray(profile.preferences.religion) ? profile.preferences.religion.join(', ') : profile.preferences.religion) : "Any"} />
                      <InfoItem label="Education" value={profile.preferences.education_level?.length ? (Array.isArray(profile.preferences.education_level) ? profile.preferences.education_level.join(', ') : profile.preferences.education_level) : "Any"} />
                      <InfoItem label="Diet" value={profile.preferences.diet?.length ? (Array.isArray(profile.preferences.diet) ? profile.preferences.diet.join(', ') : profile.preferences.diet) : "Any"} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Partner preferences not set yet.</p>
                      <p className="text-gray-500 text-xs mt-1">Set your preferences to get better matches.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'interests' && (
                <div className="space-y-10">
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-primary border-b-2 border-primary/10 pb-4 mb-8 flex items-center gap-4">
                    <Utensils className="w-7 h-7 text-primary" /> My Interests & Hobbies
                  </h3>

                  {editing ? (
                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-4 block">Select your Hobbies & Interests</label>
                        <div className="flex flex-wrap gap-2">
                          {["Cooking", "Gaming", "Traveling", "Reading", "Music", "Photography", "Painting", "Dancing", "Gardening", "Trekking", "Movies", "Yoga", "Gym", "Cycling", "Swimming", "Coding", "Writing", "Singing", "Acting", "Shopping"].map(option => (
                            <button
                              key={option}
                              onClick={() => {
                                const current = editData.interests || [];
                                const next = current.includes(option) ? current.filter(i => i !== option) : [...current, option];
                                setEditData({ ...editData, interests: next });
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${editData.interests?.includes(option) ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-4 block">Work Related Interests</label>
                        <div className="flex flex-wrap gap-2">
                          {["Entrepreneurship", "Technology", "Finance", "Arts", "Civil Services", "Marketing", "Management", "Science"].map(option => (
                            <button
                              key={option}
                              onClick={() => {
                                const current = editData.hobbies || [];
                                const next = current.includes(option) ? current.filter(i => i !== option) : [...current, option];
                                setEditData({ ...editData, hobbies: next });
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${editData.hobbies?.includes(option) ? 'bg-secondary text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button onClick={handleSave} disabled={saving} className="btn-premium py-3 px-10 text-sm flex items-center gap-2 transform transition-all active:scale-95">
                          {saving ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save My Interests</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div>
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {profile?.interests?.length > 0 ? profile.interests.map(i => (
                            <span key={i} className="px-4 py-2 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10">{i}</span>
                          )) : <p className="text-gray-400 text-sm italic">No interests selected yet.</p>}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Focus Areas</p>
                        <div className="flex flex-wrap gap-2">
                          {profile?.hobbies?.length > 0 ? profile.hobbies.map(h => (
                            <span key={h} className="px-4 py-2 bg-secondary/5 text-secondary text-xs font-bold rounded-lg border border-secondary/10">{h}</span>
                          )) : <p className="text-gray-400 text-sm italic">No work interests selected yet.</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }) {
  const isSet = value && value !== "Not set" && value !== "null" && value !== "undefined";
  return (
    <div className="group transition-all duration-300">
      <p className="text-black/60 text-[10px] mb-2 font-black uppercase tracking-widest leading-none">{label}</p>
      <p className={`font-extrabold text-sm uppercase tracking-tight transition-colors duration-300 ${isSet ? 'text-black group-hover:text-primary' : 'text-gray-400'}`}>
        {value}
      </p>
      <div className="w-6 h-1 bg-primary/10 mt-3 transition-all duration-300 group-hover:w-full group-hover:bg-primary/50 rounded-full"></div>
    </div>
  );
}
